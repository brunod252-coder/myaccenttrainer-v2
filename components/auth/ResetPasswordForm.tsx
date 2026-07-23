"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasSuccessful, setWasSuccessful] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);

    if (!token) {
      setIsError(true);
      setMessage(
        "This password reset link is missing its security token. Please request a new link."
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(
      formData.get("confirmPassword") || ""
    );

    if (password.length < 8) {
      setIsError(true);
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(
          data.message || "Unable to reset your password."
        );
        return;
      }

      setWasSuccessful(true);
      setMessage(
        data.message ||
          "Your password has been reset successfully."
      );

      event.currentTarget.reset();
    } catch {
      setIsError(true);
      setMessage(
        "Unable to reset your password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (wasSuccessful) {
    return (
      <div className="mx-auto max-w-md border bg-white p-8 text-center shadow-sm">
        <div className="border border-[#20ad68] bg-[#e9f8f3] p-4 text-sm text-[#168c56]">
          {message}
        </div>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-8 w-full rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357]"
        >
          Continue to Login
        </button>
      </div>
    );
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

      {!token && (
        <div className="mb-6 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This reset link is incomplete. Please request a new one.
        </div>
      )}

      <label className="block text-sm font-semibold text-gray-700">
        New Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={!token}
          className="mt-2 w-full border px-4 py-3 text-sm font-normal outline-none focus:border-[#20ad68] disabled:bg-gray-100"
          placeholder="At least 8 characters"
        />
      </label>

      <label className="mt-6 block text-sm font-semibold text-gray-700">
        Confirm New Password
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={!token}
          className="mt-2 w-full border px-4 py-3 text-sm font-normal outline-none focus:border-[#20ad68] disabled:bg-gray-100"
          placeholder="Enter the password again"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting || !token}
        className="mt-8 w-full rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Resetting Password..." : "Reset Password"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        Need a new link?{" "}
        <Link
          href="/forgot-password"
          className="font-semibold text-[#168c56] hover:underline"
        >
          Request another
        </Link>
      </p>
    </form>
  );
}
