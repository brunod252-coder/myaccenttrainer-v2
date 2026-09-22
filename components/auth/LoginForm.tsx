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

    if (data.user?.role === "ADMIN") {
      router.push("/admin");
      router.refresh();
      return;
    }

    try {
      const statusResponse = await fetch("/api/onboarding/status", {
        method: "GET",
        cache: "no-store",
      });

      const status = await statusResponse.json();

      if (!statusResponse.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      switch (status.enrollmentState) {
        case "EMAIL_VERIFICATION_REQUIRED":
          router.push("/verify-email");
          break;

        case "LEARNING_PROFILE_REQUIRED":
          router.push("/onboarding/assessment");
          break;

        case "PLAN_SELECTION_REQUIRED":
          router.push("/onboarding/plan");
          break;

        case "PAYMENT_METHOD_REQUIRED":
          router.push("/onboarding/payment");
          break;

        case "PAST_DUE":
        case "CANCELED":
        case "EXPIRED":
          router.push("/dashboard/billing");
          break;

        case "TRIALING":
        case "ACTIVE":
        case "CANCEL_SCHEDULED":
        default:
          router.push("/dashboard");
          break;
      }

      router.refresh();
    } catch {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message ? (
        <div
          role="alert"
          className="rounded-xl border border-[#efcccc] bg-[var(--mat-red-soft)] px-4 py-3 text-sm leading-6 text-[var(--mat-red)]"
        >
          {message}
        </div>
      ) : null}

      <label className="mat-label">
        Email address

        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mat-input mt-2"
          placeholder="you@example.com"
        />
      </label>

      <label className="mat-label">
        Password

        <div className="relative mt-2">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="mat-input pr-12"
            placeholder="Enter your password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--mat-muted)] transition hover:bg-[var(--mat-green-50)] hover:text-[var(--mat-green-700)] focus-visible:outline-none"
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 text-sm text-[var(--mat-muted)]">
          <input
            name="rememberMe"
            type="checkbox"
            className="h-4 w-4 rounded border-[var(--mat-border-strong)] accent-[var(--mat-green-600)]"
          />
          Remember me
        </label>

        <Link
          href="/forgot-password"
          className="text-sm font-bold text-[var(--mat-green-700)] transition hover:text-[var(--mat-green-800)]"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mat-button mat-button-primary mt-2 w-full"
      >
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
