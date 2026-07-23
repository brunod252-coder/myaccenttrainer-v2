"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Initial = {
  firstName: string;
  lastName: string;
  countryOfResidence: string;
  nativeLanguage: string;
  englishGoal: string;
  proficiencyLevel: string;
};

const LANGUAGES = ["French", "Spanish", "Mandarin", "Hindi", "Arabic", "Portuguese", "Korean", "Vietnamese", "Other"];
const GOALS = [
  "University interviews",
  "Seminars & presentations",
  "Class participation",
  "IELTS / TOEFL speaking",
  "Career & professional",
  "Everyday conversation",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update<K extends keyof Initial>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#20ad68] focus:ring-2 focus:ring-[#20ad68]/20";

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700">
          First name
          <input className={inputClass} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Last name
          <input className={inputClass} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Country
          <input className={inputClass} value={form.countryOfResidence} placeholder="e.g. Canada" onChange={(e) => update("countryOfResidence", e.target.value)} />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Native language
          <select className={inputClass} value={form.nativeLanguage} onChange={(e) => update("nativeLanguage", e.target.value)}>
            <option value="">Select…</option>
            {LANGUAGES.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          English goal
          <select className={inputClass} value={form.englishGoal} onChange={(e) => update("englishGoal", e.target.value)}>
            <option value="">Select…</option>
            {GOALS.map((g) => (<option key={g} value={g}>{g}</option>))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Proficiency
          <select className={inputClass} value={form.proficiencyLevel} onChange={(e) => update("proficiencyLevel", e.target.value)}>
            <option value="">Select…</option>
            {LEVELS.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-lg bg-[#20ad68] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357] disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && <span className="text-sm font-medium text-[#2e7d5b]">Saved ✓</span>}
        {status === "error" && <span className="text-sm font-medium text-[#d1495b]">Couldn&apos;t save — try again.</span>}
      </div>
    </form>
  );
}
