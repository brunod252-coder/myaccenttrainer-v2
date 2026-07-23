"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: String(formData.get("email") || ""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(
          data.message || "Unable to request a password reset."
        );
        return;
      }

      setMessage(
        data.message ||
          "If an account exists for that email, a password reset link has been sent."
      );

      event.currentTarget.reset();
    } catch {
      setIsError(true);
      setMessage(
        "Unable to request a password reset. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md border bg-white p-8 shadow-sm"
    >
      {message && (
        <div
          className={`mb-6 border p-4 text-sm ${
            isError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#20ad68] bg-[#e9f8f3] text-[#168c56]"
          }`}
        >
          {message}
        </div>
      )}

      <p className="mb-6 text-sm leading-6 text-gray-600">
        Enter the email address connected to your account. We will
        send you instructions for choosing a new password.
      </p>

      <label className="block text-sm font-semibold text-gray-700">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full border px-4 py-3 text-sm font-normal outline-none focus:border-[#20ad68]"
          placeholder="you@example.com"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#168c56] hover:underline"
        >
          Return to login
        </Link>
      </p>
    </form>
  );
}
