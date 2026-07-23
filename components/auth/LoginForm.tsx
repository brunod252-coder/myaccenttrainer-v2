"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setMessage("Unable to log in. Please try again.");
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
        <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {message}
        </div>
      )}

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

      <div className="mt-6 flex items-center justify-between gap-4">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-gray-700"
        >
          Password
        </label>

        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-[#168c56] hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="mt-2 w-full border px-4 py-3 text-sm font-normal outline-none focus:border-[#20ad68]"
        placeholder="••••••••"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        New to My Accent Trainer?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#168c56] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
