"use client";

import { useState } from "react";

type CheckoutButtonProps = {
  children: React.ReactNode;
  className?: string;
  planId?: string;
};

export default function CheckoutButton({ children, className, planId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  async function start() {
    setLoading(true);
    setNote("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json()) as { url?: string; message?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setNote(data.message || "Payments aren't set up yet.");
    } catch {
      setNote("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div>
      <button type="button" onClick={start} disabled={loading} className={className}>
        {loading ? "Starting…" : children}
      </button>
      {note && <p className="mt-3 text-center text-xs text-gray-400">{note}</p>}
    </div>
  );
}
