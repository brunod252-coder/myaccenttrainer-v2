"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RedeemPromo() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setState("loading");
    setMessage("");
    try {
      const res = await fetch("/api/wallet/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as { ok: boolean; note?: string; error?: string };
      if (data.ok) {
        setState("ok");
        setMessage(data.note || "Credit added to your wallet.");
        setCode("");
        router.refresh();
      } else {
        setState("error");
        setMessage(data.error || "That code didn't work.");
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg text-[#17223b]">Have a promo code?</h2>
      <p className="mt-1 text-sm text-gray-500">Redeem it for wallet credit toward your plan.</p>
      <form onSubmit={submit} className="mt-4 flex flex-wrap gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="min-w-[180px] flex-1 rounded-lg border border-gray-200 bg-[#f8fbfa] px-4 py-2.5 text-sm uppercase tracking-wide text-[#17223b] outline-none focus:border-[#20ad68]"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-lg bg-[#20ad68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:opacity-60"
        >
          {state === "loading" ? "Redeeming…" : "Redeem"}
        </button>
      </form>
      {message && (
        <p
          className={
            "mt-3 rounded-lg p-3 text-sm " +
            (state === "ok"
              ? "bg-[#f0faf6] text-[#168c56]"
              : "bg-amber-50 text-amber-800")
          }
        >
          {state === "ok" ? "🎉 " : ""}
          {message}
        </p>
      )}
    </div>
  );
}
