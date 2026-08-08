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
        <p
          className={[
            "mb-5 rounded-xl px-4 py-3 text-sm",
            success
              ? "bg-[#e9f8f3] text-[#168c56]"
              : "bg-red-50 text-red-700",
          ].join(" ")}
        >
          {message}
        </p>
      ) : null}

      <button
        type="button"
        onClick={resendVerification}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-[#20ad68] px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending verification email..." : "Resend verification email"}
      </button>
    </div>
  );
}
