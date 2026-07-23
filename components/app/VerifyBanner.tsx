"use client";

import { useState } from "react";

export default function VerifyBanner({ verified }: { verified: boolean }) {
  const [hidden, setHidden] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [devLink, setDevLink] = useState<string | null>(null);

  if (verified || hidden) return null;

  async function resend() {
    setState("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = (await res.json()) as { devLink?: string };
      if (data.devLink) setDevLink(data.devLink);
      setState("sent");
    } catch {
      setState("idle");
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-[#eddcc0] bg-[#fdf6ea] p-4">
      <span className="text-xl">✉️</span>
      <p className="flex-1 text-sm text-[#8a5a17]">
        {state === "sent"
          ? "Verification email sent — check your inbox."
          : "Please verify your email to secure your account."}
        {devLink && (
          <>
            {" "}
            <a href={devLink} className="font-semibold underline">Verify now (dev link)</a>
          </>
        )}
      </p>
      {state !== "sent" && (
        <button
          type="button"
          onClick={resend}
          disabled={state === "sending"}
          className="rounded-lg bg-[#20ad68] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Resend email"}
        </button>
      )}
      <button type="button" onClick={() => setHidden(true)} aria-label="Dismiss" className="text-[#8a5a17]/60 hover:text-[#8a5a17]">✕</button>
    </div>
  );
}
