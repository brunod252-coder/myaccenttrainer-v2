"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GoalSetter({ weeklyTarget }: { weeklyTarget: number }) {
  const router = useRouter();
  const [value, setValue] = useState(weeklyTarget);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(next: number) {
    setValue(next);
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/coaching/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyTarget: next }),
      });
      setSaved(true);
      router.refresh();
    } catch {
      /* ignore */
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {[3, 4, 5, 6, 7].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => save(n)}
          disabled={saving}
          className={
            "h-9 w-9 rounded-lg text-sm font-semibold transition " +
            (value === n
              ? "bg-[#20ad68] text-white"
              : "border border-gray-200 bg-white text-gray-600 hover:border-[#20ad68] hover:text-[#168c56]")
          }
        >
          {n}
        </button>
      ))}
      <span className="text-sm text-gray-500">days / week{saved ? " · saved" : ""}</span>
    </div>
  );
}
