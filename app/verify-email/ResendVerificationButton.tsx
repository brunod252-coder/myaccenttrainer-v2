"use client";

import { useState } from "react";

export default function ResendVerificationButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function resendVerification() {
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      const data = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        setMessage(
          data.message ||
            "We could not resend the verification email. Please try again.",
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      setMessage(
        data.message ||
          "A new verification email has been sent. Please check your inbox.",
      );
    } catch {
      setMessage("We could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {message ? (
        <div
          role={success ? "status" : "alert"}
          className={[
            "mb-5 rounded-xl border px-4 py-3 text-sm leading-6",
            success
              ? "border-[var(--mat-border-green)] bg-[var(--mat-green-50)] text-[var(--mat-green-700)]"
              : "border-[#efcccc] bg-[var(--mat-red-soft)] text-[var(--mat-red)]",
          ].join(" ")}
        >
          {message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={resendVerification}
        disabled={loading}
        className="mat-button mat-button-primary w-full"
      >
        {loading ? "Sending verification email…" : "Resend verification email"}
      </button>

      <p className="mt-3 text-center text-xs leading-5 text-[var(--mat-muted)]">
        You can request another message if the first one did not arrive.
      </p>
    </div>
  );
}
