"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
        rememberMe: formData.get("rememberMe") === "on",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Login failed.");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
    >
      {message && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {message}
        </div>
      )}

      <label className="block text-sm font-semibold text-gray-700">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-normal outline-none transition focus:border-[#20ad68] focus:ring-2 focus:ring-[#20ad68]/20"
          placeholder="you@example.com"
        />
      </label>

      <label className="mt-5 block text-sm font-semibold text-gray-700">
        Password
        <div className="relative mt-2">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 text-sm font-normal outline-none transition focus:border-[#20ad68] focus:ring-2 focus:ring-[#20ad68]/20"
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:text-[#20ad68] focus:outline-none focus:ring-2 focus:ring-[#20ad68]/20"
          >
            {showPassword ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5.5 0 9 6 9 8a10.6 10.6 0 0 1-2.1 3.4" />
                <path d="M6.6 6.6C4.4 8.1 3 10.7 3 12c0 2 3.5 8 9 8a9.8 9.8 0 0 0 4.1-.9" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            )}
          </button>
        </div>
      </label>

      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            name="rememberMe"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-[#20ad68] focus:ring-[#20ad68]"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-[#20ad68] hover:text-[#169357]"
        >
          Forgot password?
        </Link>
      </div>

      <button
        disabled={isSubmitting}
        className="mt-8 w-full rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357] disabled:opacity-60"
      >
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
