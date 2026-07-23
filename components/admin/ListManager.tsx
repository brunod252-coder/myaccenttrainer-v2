"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Field = { name: string; label: string; textarea?: boolean };
type Item = { id: string; published?: boolean } & Record<string, string | boolean>;

type Props = {
  endpoint: string;
  heading: string;
  blurb: string;
  fields: Field[];
  items: Item[];
  publishKey?: "published" | "isPublished";
};

export default function ListManager({ endpoint, heading, blurb, fields, items, publishKey = "published" }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      router.refresh();
    } catch { /* ignore */ }
    setBusy(false);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = { action: "create" };
    for (const f of fields) payload[f.name] = values[f.name] || "";
    await post(payload);
    setValues({});
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg text-[#17223b]">{heading}</h2>
      <p className="mt-1 text-sm text-gray-500">{blurb}</p>

      <div className="mt-4 divide-y divide-gray-100">
        {items.length === 0 && <p className="py-4 text-sm text-gray-400">Nothing yet — add your first below.</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#17223b]">{String(it[fields[0].name] ?? "")}</p>
              {fields.slice(1).map((f) => (
                <p key={f.name} className="mt-0.5 truncate text-sm text-gray-500">{String(it[f.name] ?? "")}</p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => post({ action: "toggle", id: it.id, [publishKey]: !it.published })}
              disabled={busy}
              className={"shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold " + (it.published ? "bg-[#e5f3ec] text-[#2e7d5b]" : "bg-[#eef4f9] text-[#52719f]")}
            >
              {it.published ? "Published" : "Hidden"}
            </button>
            <button
              type="button"
              onClick={() => post({ action: "delete", id: it.id })}
              disabled={busy}
              className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-[#c0473f] transition hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="text-xs font-semibold text-gray-600">{f.label}</label>
            {f.textarea ? (
              <textarea
                value={values[f.name] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#20ad68]"
                rows={2}
              />
            ) : (
              <input
                value={values[f.name] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#20ad68]"
              />
            )}
          </div>
        ))}
        <button type="submit" disabled={busy} className="rounded-lg bg-[#20ad68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:opacity-60">
          {busy ? "Saving…" : "Add"}
        </button>
      </form>
    </section>
  );
}
