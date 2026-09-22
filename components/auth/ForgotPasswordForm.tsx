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
        body: JSON.stringify({
          email: String(formData.get("email") || ""),
        }),
      });

      const data = (await res.json()) as {
        message?: string;
        devLink?: string;
      };

      setMessage(
        data.message ||
          "If an account exists, a reset link is on its way.",
      );

      if (data.devLink) {
        setDevLink(data.devLink);
      }

      setState("done");
    } catch {
      setMessage("Something went wrong. Please try again.");
      setState("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message ? (
        <div
          role="status"
          className="rounded-xl border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] px-4 py-3 text-sm leading-6 text-[var(--mat-green-700)]"
        >
          {message}

          {devLink ? (
            <>
              {" "}
              <a
                href={devLink}
                className="font-bold underline"
              >
                Open reset link (dev)
              </a>
            </>
          ) : null}
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

      <button
        type="submit"
        disabled={state === "loading"}
        className="mat-button mat-button-primary mt-2 w-full"
      >
        {state === "loading" ? "Sending…" : "Send reset link"}
      </button>

      {state === "done" ? (
        <p className="text-center text-xs leading-5 text-[var(--mat-muted)]">
          Check your inbox and follow the link to choose a new password.
        </p>
      ) : null}
    </form>
  );
}
