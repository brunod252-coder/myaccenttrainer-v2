"use client";

import { useState } from "react";

export default function ForgotPasswordForm() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    setDevLink(null);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(formData.get("email") || "") }),
      });
      const data = (await res.json()) as { message?: string; devLink?: string };
      setMessage(data.message || "If an account exists, a reset link is on its way.");
      if (data.devLink) setDevLink(data.devLink);
      setState("done");
    } catch {
      setMessage("Something went wrong. Please try again.");
      setState("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      {message && (
        <div className="mb-6 rounded-lg border border-[#cdeee1] bg-[#f0faf6] p-3 text-sm text-[#168c56]">
          {message}
          {devLink && (
            <>
              {" "}
              <a href={devLink} className="font-semibold underline">Open reset link (dev)</a>
            </>
          )}
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
      <button
        disabled={state === "loading"}
        className="mt-8 w-full rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357] disabled:opacity-60"
      >
        {state === "loading" ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
