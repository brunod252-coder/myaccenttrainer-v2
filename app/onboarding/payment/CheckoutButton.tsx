"use client";

import { useState } from "react";

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function beginCheckout() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = (await response.json()) as {
        url?: string;
        href?: string;
        message?: string;
        configured?: boolean;
      };

      const destination =
        data.url || data.href;

      if (!response.ok || !destination) {
        setMessage(
          data.message ||
            "We could not start secure checkout. Please try again.",
        );
        return;
      }

      window.location.assign(destination);
    } catch {
      setMessage(
        "We could not reach the payment service. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {message ? (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-[#efcccc] bg-[var(--mat-red-soft)] px-4 py-3 text-sm leading-6 text-[var(--mat-red)]"
        >
          {message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={beginCheckout}
        disabled={loading}
        className="mat-button w-full border border-[var(--mat-green-500)] bg-[var(--mat-green-500)] text-white hover:border-[var(--mat-green-400)] hover:bg-[var(--mat-green-400)]"
      >
        {loading
          ? "Opening secure checkout…"
          : "Continue to secure checkout"}
      </button>

      <div className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-white/60">
        <span aria-hidden="true">🔒</span>

        <p>
          Secure payment processing is provided by Stripe. MyAccentTrainer
          does not store your complete card number.
        </p>
      </div>
    </div>
  );
}
