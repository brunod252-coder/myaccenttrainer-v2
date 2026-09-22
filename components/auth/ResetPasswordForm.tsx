"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm({
  token,
}: {
  token: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="mat-empty-state">
        <p className="font-semibold text-[var(--mat-ink)]">
          This reset link is missing its code.
        </p>

        <p className="mt-2 text-sm leading-6">
          Please request a new link from the{" "}
          <Link
            href="/forgot-password"
            className="font-bold text-[var(--mat-green-700)]"
          >
            forgot password
          </Link>{" "}
          page.
        </p>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");

    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setState("loading");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = (await res.json()) as {
        message?: string;
      };

      if (!res.ok) {
        setError(data.message || "Could not reset your password.");
        setState("idle");
        return;
      }

      setMessage(data.message || "Password reset. You can now log in.");
      setState("done");

      setTimeout(() => router.push("/login"), 1800);
    } catch {
      setError("Something went wrong. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6 text-center"
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mat-green-600)] text-lg font-bold text-white">
          ✓
        </div>

        <p className="mt-4 font-semibold text-[var(--mat-green-700)]">
          {message}
        </p>

        <p className="mt-2 text-sm text-[var(--mat-muted)]">
          Taking you to the login page…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-[#efcccc] bg-[var(--mat-red-soft)] px-4 py-3 text-sm leading-6 text-[var(--mat-red)]"
        >
          {error}
        </div>
      ) : null}

      <label className="mat-label">
        New password

        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mat-input mt-2"
          placeholder="At least 8 characters"
        />
      </label>

      <label className="mat-label">
        Confirm password

        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mat-input mt-2"
          placeholder="Re-enter your new password"
        />
      </label>

      <button
        type="submit"
        disabled={state === "loading"}
        className="mat-button mat-button-primary mt-2 w-full"
      >
        {state === "loading" ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}
