"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string; subtitle: string; referenceText: string; focus: string; description: string; published: boolean; hasAudio: boolean;
};

const ENDPOINT = "/api/admin/content/lesson";

export default function LessonManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function post(body: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    setNote("");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        setNote("The lesson change could not be saved. Please try again.");
        return false;
      }

      router.refresh();
      return true;
    } catch {
      setNote("The lesson change could not be saved. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!v.subtitle || !v.referenceText) { setNote("A lesson needs a name and a phrase."); return; }
    setNote("");
    const saved = await post({
      action: "create",
      subtitle: v.subtitle,
      referenceText: v.referenceText,
      focus: v.focus || "r",
      description: v.description || "",
    });

    if (saved) setV({});
  }

  async function removeLesson(id: string, subtitle: string) {
    const confirmed = window.confirm(
      `Delete "${subtitle}"? This removes the custom lesson itself. Historical learner activity that refers to its lesson slug may remain in stored records.`,
    );

    if (!confirmed) return;

    await post({ action: "delete", id });
  }

  async function uploadAudio(id: string, file: File) {
    if (file.size > 1_500_000) { setNote("Audio file must be under ~1.5 MB."); return; }
    setNote("");
    const dataUrl: string = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    const base64 = dataUrl.split(",")[1] || "";
    await post({ action: "setAudio", id, audioBase64: base64, audioMime: file.type || "audio/mpeg" });
  }

  const inp = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#20ad68]";

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg text-[#17223b]">Lessons</h2>
      <p className="mt-1 text-sm text-gray-500">
        Create practice lessons — they appear for learners instantly, alongside the built-in ones. Focus is the target sound
        (r, th, v, w, sh, ee, stress, endings, linking). Upload an optional audio clip, or leave it and Nina reads the phrase aloud.
      </p>

      <div className="mt-4 divide-y divide-gray-100">
        {items.length === 0 && <p className="py-4 text-sm text-gray-400">No custom lessons yet — add your first below.</p>}
        {items.map((it, i) => (
          <div key={it.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#17223b]">{it.subtitle} <span className="ml-1 rounded bg-[#eef4f9] px-1.5 py-0.5 text-[11px] font-medium text-[#52719f]">{it.focus}</span></p>
              <p className="truncate text-sm text-gray-500">“{it.referenceText}”{it.hasAudio ? " · 🔊 audio" : ""}</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" disabled={busy || i === 0} onClick={() => post({ action: "reorder", id: it.id, direction: "up" })} className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50">↑</button>
              <button type="button" disabled={busy || i === items.length - 1} onClick={() => post({ action: "reorder", id: it.id, direction: "down" })} className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50">↓</button>
            </div>
            <label className="cursor-pointer rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-[#52719f] hover:bg-gray-50">
              {it.hasAudio ? "Replace audio" : "Upload audio"}
              <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAudio(it.id, f); }} />
            </label>
            <button type="button" onClick={() => post({ action: "toggle", id: it.id, published: !it.published })} disabled={busy} className={"rounded-full px-2.5 py-1 text-xs font-semibold " + (it.published ? "bg-[#e5f3ec] text-[#2e7d5b]" : "bg-[#eef4f9] text-[#52719f]")}>{it.published ? "Published" : "Hidden"}</button>
            <button type="button" onClick={() => removeLesson(it.id, it.subtitle)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-[#c0473f] hover:bg-red-50">Delete</button>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="mt-4 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2">
        <input className={inp} placeholder="Lesson name (e.g. The American R)" value={v.subtitle || ""} onChange={(e) => setV((s) => ({ ...s, subtitle: e.target.value }))} />
        <input className={inp} placeholder="Focus sound (e.g. r, th, v)" value={v.focus || ""} onChange={(e) => setV((s) => ({ ...s, focus: e.target.value }))} />
        <input className={inp + " sm:col-span-2"} placeholder="Phrase to practice" value={v.referenceText || ""} onChange={(e) => setV((s) => ({ ...s, referenceText: e.target.value }))} />
        <textarea className={inp + " sm:col-span-2"} rows={2} placeholder="Short description" value={v.description || ""} onChange={(e) => setV((s) => ({ ...s, description: e.target.value }))} />
        <div className="sm:col-span-2 flex items-center gap-3">
          <button type="submit" disabled={busy} className="rounded-lg bg-[#20ad68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:opacity-60">{busy ? "Saving…" : "Add lesson"}</button>
          {note && <span className="text-sm text-[#c0473f]">{note}</span>}
        </div>
      </form>
    </section>
  );
}
