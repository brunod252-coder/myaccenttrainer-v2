"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingForm({ headline, subtitle }: { headline: string; subtitle: string }) {
  const router = useRouter();
  const [h, setH] = useState(headline);
  const [s, setS] = useState(subtitle);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    try {
      await fetch("/api/admin/content/setting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "pricing_headline", value: h }) });
      await fetch("/api/admin/content/setting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "pricing_subtitle", value: s }) });
      setState("saved");
      router.refresh();
    } catch {
      setState("idle");
    }
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg text-[#17223b]">Pricing page copy</h2>
      <p className="mt-1 text-sm text-gray-500">Edit the headline and subtitle shown on the public pricing page. (Plan prices live in code.)</p>
      <form onSubmit={save} className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-600">Headline</label>
          <input value={h} onChange={(e) => setH(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#20ad68]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">Subtitle</label>
          <textarea value={s} onChange={(e) => setS(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#20ad68]" />
        </div>
        <button type="submit" disabled={state === "saving"} className="rounded-lg bg-[#20ad68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:opacity-60">
          {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : "Save"}
        </button>
      </form>
    </section>
  );
}
