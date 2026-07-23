"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  learnerId: string;
  displayName: string;
  wordsPracticed: number;
};

export default function PracticeSessionCard({
  learnerId,
  displayName,
  wordsPracticed,
}: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  async function completePracticeSession() {
    setIsSaving(true);

    try {
      const response = await fetch("/api/learner-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: learnerId,
          displayName,
          wordsPracticed,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
        setCompleted(true);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded border bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold text-[#20ad68]">
        Simulated Practice
      </p>

      <h2 className="mt-2 text-2xl font-bold text-[#52719f]">
        American TH practice
      </h2>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
        This session represents practicing {wordsPracticed} pronunciation words.
        When you complete it, Nina will update your learner profile.
      </p>

      <div className="mt-6 rounded bg-[#f8fbfa] p-5">
        <p className="text-sm font-semibold text-gray-700">
          Practice words
        </p>

        <p className="mt-2 text-sm text-gray-600">
          think · three · through · bath · bathe · breathe · brother · mother ·
          there · those
        </p>
      </div>

      <button
        type="button"
        onClick={completePracticeSession}
        disabled={isSaving || completed}
        className="mt-8 rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:opacity-60"
      >
        {isSaving
          ? "Saving Progress..."
          : completed
            ? "Practice Completed"
            : "Complete Practice Session"}
      </button>

      {completed && profile && (
        <div className="mt-8 rounded border bg-[#eef8f2] p-6">
          <p className="font-semibold text-[#20ad68]">
            ✓ Nina remembered this practice session
          </p>

          <p className="mt-3 text-sm text-gray-700">
            Words practiced: {profile.wordsPracticed}
          </p>

          <p className="text-sm text-gray-700">
            Confidence: {profile.confidenceScore}%
          </p>

          <Link
            href="/dashboard"
            className="mt-5 inline-block rounded border border-[#20ad68] px-4 py-2 text-sm font-semibold text-[#20ad68] transition hover:bg-[#e9f8f3]"
          >
            View updated dashboard
          </Link>
        </div>
      )}
    </section>
  );
}
