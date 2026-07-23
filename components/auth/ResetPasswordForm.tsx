"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm text-gray-600">This reset link is missing its code. Please request a new one from the
          {" "}<Link href="/forgot-password" className="font-semibold text-[#20ad68]">forgot password</Link> page.</p>
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
      const data = (await res.json()) as { message?: string };
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
      <div className="rounded-2xl border border-[#cdeee1] bg-[#f0faf6] p-8 text-center shadow-sm">
        <p className="text-2xl">✅</p>
        <p className="mt-2 text-sm font-semibold text-[#168c56]">{message}</p>
        <p className="mt-1 text-sm text-gray-500">Taking you to the login page…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <label className="block text-sm font-semibold text-gray-700">
        New password
        <input name="password" type="password" required minLength={8}
          className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-normal outline-none transition focus:border-[#20ad68] focus:ring-2 focus:ring-[#20ad68]/20"
          placeholder="At least 8 characters" />
      </label>
      <label className="mt-5 block text-sm font-semibold text-gray-700">
        Confirm password
        <input name="confirm" type="password" required minLength={8}
          className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-normal outline-none transition focus:border-[#20ad68] focus:ring-2 focus:ring-[#20ad68]/20"
          placeholder="Re-enter your new password" />
      </label>
      <button disabled={state === "loading"}
        className="mt-8 w-full rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357] disabled:opacity-60">
        {state === "loading" ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}
