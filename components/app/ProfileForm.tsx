"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LEARNING_MISSIONS } from "@/lib/learning/mission";

type Initial = {
  firstName: string;
  lastName: string;
  countryOfResidence: string;
  nativeLanguage: string;
  englishGoal: string;
  proficiencyLevel: string;
};

const LANGUAGES = [
  "French",
  "Spanish",
  "Mandarin",
  "Hindi",
  "Arabic",
  "Portuguese",
  "Korean",
  "Vietnamese",
  "Other",
];

const GOALS = [
  LEARNING_MISSIONS.INTERVIEWS,
  LEARNING_MISSIONS.PRESENTATIONS,
  LEARNING_MISSIONS.ACADEMIC,
  LEARNING_MISSIONS.TOEFL_IELTS,
  LEARNING_MISSIONS.PROFESSIONAL,
  LEARNING_MISSIONS.EVERYDAY_CONVERSATION,
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function ProfileForm({
  initial,
}: {
  initial: Initial;
}) {
  const router = useRouter();

  const [form, setForm] = useState<Initial>(initial);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  function update<K extends keyof Initial>(
    key: K,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setStatus("idle");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (status === "saving") return;

    setStatus("saving");

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error();
      }

      setStatus("saved");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  const fieldClass =
    "mat-input mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60";

  const saving = status === "saving";

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="profile-first-name"
            className="text-sm font-semibold text-[var(--mat-ink)]"
          >
            First name
          </label>

          <input
            id="profile-first-name"
            type="text"
            autoComplete="given-name"
            maxLength={80}
            disabled={saving}
            className={fieldClass}
            value={form.firstName}
            onChange={(event) =>
              update("firstName", event.target.value)
            }
          />
        </div>

        <div>
          <label
            htmlFor="profile-last-name"
            className="text-sm font-semibold text-[var(--mat-ink)]"
          >
            Last name
          </label>

          <input
            id="profile-last-name"
            type="text"
            autoComplete="family-name"
            maxLength={80}
            disabled={saving}
            className={fieldClass}
            value={form.lastName}
            onChange={(event) =>
              update("lastName", event.target.value)
            }
          />
        </div>

        <div>
          <label
            htmlFor="profile-country"
            className="text-sm font-semibold text-[var(--mat-ink)]"
          >
            Country of residence
          </label>

          <input
            id="profile-country"
            type="text"
            autoComplete="country-name"
            maxLength={80}
            disabled={saving}
            className={fieldClass}
            value={form.countryOfResidence}
            placeholder="e.g. Canada"
            onChange={(event) =>
              update("countryOfResidence", event.target.value)
            }
          />
        </div>

        <div>
          <label
            htmlFor="profile-native-language"
            className="text-sm font-semibold text-[var(--mat-ink)]"
          >
            Native language
          </label>

          <select
            id="profile-native-language"
            disabled={saving}
            className={fieldClass}
            value={form.nativeLanguage}
            onChange={(event) =>
              update("nativeLanguage", event.target.value)
            }
          >
            <option value="">Select…</option>

            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="profile-english-goal"
            className="text-sm font-semibold text-[var(--mat-ink)]"
          >
            English goal
          </label>

          <select
            id="profile-english-goal"
            disabled={saving}
            className={fieldClass}
            value={form.englishGoal}
            onChange={(event) =>
              update("englishGoal", event.target.value)
            }
          >
            <option value="">Select…</option>

            {GOALS.map((goal) => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="profile-proficiency"
            className="text-sm font-semibold text-[var(--mat-ink)]"
          >
            Proficiency
          </label>

          <select
            id="profile-proficiency"
            disabled={saving}
            className={fieldClass}
            value={form.proficiencyLevel}
            onChange={(event) =>
              update("proficiencyLevel", event.target.value)
            }
          >
            <option value="">Select…</option>

            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--mat-border)] pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="mat-button mat-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>

          {status === "saved" ? (
            <div
              role="status"
              className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] px-4 py-2.5 text-sm font-medium text-[var(--mat-green-800)]"
            >
              Profile changes saved.
            </div>
          ) : null}

          {status === "error" ? (
            <div
              role="alert"
              className="rounded-[var(--mat-radius-lg)] border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900"
            >
              Couldn&apos;t save your changes. Please try again.
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
}
