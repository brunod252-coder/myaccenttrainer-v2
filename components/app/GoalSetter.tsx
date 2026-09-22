"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GoalSetter({
  weeklyTarget,
}: {
  weeklyTarget: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(weeklyTarget);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save(next: number) {
    if (saving || next === value) return;

    const previous = value;

    setValue(next);
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/coaching/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyTarget: next }),
      });

      if (!res.ok) {
        throw new Error("Unable to save weekly target.");
      }

      setSaved(true);
      router.refresh();
    } catch {
      setValue(previous);
      setError("We couldn't save your weekly target. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Weekly practice target"
      >
        {[3, 4, 5, 6, 7].map((n) => {
          const selected = value === n;

          return (
            <button
              key={n}
              type="button"
              onClick={() => save(n)}
              disabled={saving}
              aria-pressed={selected}
              aria-label={`${n} practice days per week`}
              className={
                "flex h-11 min-w-11 items-center justify-center rounded-[var(--mat-radius-lg)] border px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 " +
                (selected
                  ? "border-[var(--mat-green-600)] bg-[var(--mat-green-50)] text-[var(--mat-green-800)]"
                  : "border-[var(--mat-border)] bg-white text-[var(--mat-muted)] hover:border-[var(--mat-border-green)] hover:bg-[var(--mat-green-50)]")
              }
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="text-sm text-[var(--mat-muted)]">
          {saving
            ? `Saving ${value} days per week…`
            : `${value} ${value === 1 ? "day" : "days"} per week`}
        </p>

        {saved && !saving && (
          <span
            className="text-sm font-semibold text-[var(--mat-green-700)]"
            role="status"
          >
            Saved
          </span>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
