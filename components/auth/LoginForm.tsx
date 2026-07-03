"use client";

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
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md border bg-white p-8 shadow-sm">
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
          className="mt-2 w-full border px-4 py-3 text-sm font-normal outline-none focus:border-[#20ad68]"
          placeholder="you@example.com"
        />
      </label>

      <label className="mt-6 block text-sm font-semibold text-gray-700">
        Password
        <input
          name="password"
          type="password"
          required
          className="mt-2 w-full border px-4 py-3 text-sm font-normal outline-none focus:border-[#20ad68]"
          placeholder="••••••••"
        />
      </label>

      <button
        disabled={isSubmitting}
        className="mt-8 w-full rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        New to My Accent Trainer? Create an account on the register page.
      </p>
    </form>
  );
}