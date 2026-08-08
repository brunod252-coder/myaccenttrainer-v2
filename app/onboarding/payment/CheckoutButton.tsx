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
        message?: string;
        configured?: boolean;
      };

      if (!response.ok || !data.url) {
        setMessage(
          data.message ||
            "We could not start secure checkout. Please try again.",
        );
        return;
      }

      window.location.assign(data.url);
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
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      ) : null}

      <button
        type="button"
        onClick={beginCheckout}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-[#20ad68] px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Opening secure checkout..."
          : "Continue to Secure Checkout"}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-gray-500">
        Secure payment processing is provided by Stripe. MyAccentTrainer does
        not store your complete card number.
      </p>
    </div>
  );
}
