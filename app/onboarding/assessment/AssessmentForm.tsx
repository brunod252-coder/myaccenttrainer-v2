"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LEARNING_MISSIONS } from "@/lib/learning/mission";

const GOALS = [
  {
    value: LEARNING_MISSIONS.EVERYDAY_CONVERSATION,
    title: "Everyday Conversation",
    description:
      "Speak more naturally and confidently in daily life, family conversations, errands, and social situations.",
  },
  {
    value: LEARNING_MISSIONS.TOEFL_IELTS,
    title: "TOEFL / IELTS Speaking",
    description:
      "Build the clarity, fluency, and speaking confidence needed for an English proficiency exam.",
  },
  {
    value: LEARNING_MISSIONS.INTERVIEWS,
    title: "Job & University Interviews",
    description:
      "Prepare to answer questions clearly, confidently, and professionally in high-stakes interviews.",
  },
  {
    value: LEARNING_MISSIONS.PROFESSIONAL,
    title: "Career & Professional English",
    description:
      "Communicate more effectively at work, in meetings, with customers, and with colleagues.",
  },
  {
    value: LEARNING_MISSIONS.PRESENTATIONS,
    title: "Presentations & Public Speaking",
    description:
      "Speak with greater clarity and confidence when presenting ideas to groups.",
  },
  {
    value: LEARNING_MISSIONS.ACADEMIC,
    title: "Academic / Classroom English",
    description:
      "Participate more comfortably in classes, discussions, seminars, and academic conversations.",
  },
];

const LEVELS = [
  {
    value: "Beginner",
    title: "Beginner",
    description:
      "I understand and use some English, but speaking is still difficult.",
  },
  {
    value: "Intermediate",
    title: "Intermediate",
    description:
      "I can communicate in many situations, but I still hesitate or make frequent mistakes.",
  },
  {
    value: "Advanced",
    title: "Advanced",
    description:
      "I communicate well and want greater clarity, precision, confidence, or natural speech.",
  },
];

type AssessmentFormProps = {
  initialGoal?: string | null;
  initialLevel?: string | null;
};

export default function AssessmentForm({
  initialGoal,
  initialLevel,
}: AssessmentFormProps) {
  const router = useRouter();

  const [englishGoal, setEnglishGoal] = useState(initialGoal ?? "");
  const [proficiencyLevel, setProficiencyLevel] = useState(initialLevel ?? "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canContinue =
    Boolean(englishGoal) &&
    Boolean(proficiencyLevel) &&
    !isSubmitting;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!englishGoal || !proficiencyLevel) {
      setMessage(
        "Please choose your main goal and current English level.",
      );
      return;
    }

    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          englishGoal,
          proficiencyLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "We could not save your learning profile. Please try again.",
        );
        setIsSubmitting(false);
        return;
      }

      router.push("/onboarding/recommendation");
      router.refresh();
    } catch {
      setMessage(
        "We could not save your learning profile. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <section>
        <p className="mat-eyebrow">
          Your learning goal
        </p>

        <h2 className="mt-3 font-display text-3xl leading-tight text-[var(--mat-ink)]">
          What would you most like English to help you do?
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mat-muted)]">
          Choose the reason that matters most right now. Nina will use this
          to shape your learning experience.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {GOALS.map((goal) => {
            const selected = englishGoal === goal.value;

            return (
              <button
                key={goal.value}
                type="button"
                onClick={() => setEnglishGoal(goal.value)}
                aria-pressed={selected}
                className={[
                  "group rounded-2xl border p-5 text-left transition",
                  selected
                    ? "border-[var(--mat-green-500)] bg-[var(--mat-green-50)] shadow-[var(--mat-shadow-sm)] ring-2 ring-[var(--mat-focus)]"
                    : "border-[var(--mat-border)] bg-white hover:border-[var(--mat-border-green)] hover:bg-[var(--mat-surface-soft)]",
                ].join(" ")}
              >
                <span className="flex items-start gap-3.5">
                  <span
                    className={[
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition",
                      selected
                        ? "border-[var(--mat-green-600)] bg-[var(--mat-green-600)] text-white"
                        : "border-[var(--mat-border-strong)] bg-white text-transparent group-hover:border-[var(--mat-green-400)]",
                    ].join(" ")}
                  >
                    ✓
                  </span>

                  <span>
                    <span className="block font-bold text-[var(--mat-ink)]">
                      {goal.title}
                    </span>

                    <span className="mt-1.5 block text-sm leading-6 text-[var(--mat-muted)]">
                      {goal.description}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10 border-t border-[var(--mat-border)] pt-10">
        <p className="mat-eyebrow">
          Your starting point
        </p>

        <h2 className="mt-3 font-display text-3xl leading-tight text-[var(--mat-ink)]">
          Where would you place your English today?
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mat-muted)]">
          This is only a starting point. Your practice results will help Nina
          refine what you need over time.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {LEVELS.map((level) => {
            const selected = proficiencyLevel === level.value;

            return (
              <button
                key={level.value}
                type="button"
                onClick={() => setProficiencyLevel(level.value)}
                aria-pressed={selected}
                className={[
                  "group rounded-2xl border p-5 text-left transition",
                  selected
                    ? "border-[var(--mat-green-500)] bg-[var(--mat-green-50)] shadow-[var(--mat-shadow-sm)] ring-2 ring-[var(--mat-focus)]"
                    : "border-[var(--mat-border)] bg-white hover:border-[var(--mat-border-green)] hover:bg-[var(--mat-surface-soft)]",
                ].join(" ")}
              >
                <span className="flex items-start gap-3.5">
                  <span
                    className={[
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition",
                      selected
                        ? "border-[var(--mat-green-600)] bg-[var(--mat-green-600)] text-white"
                        : "border-[var(--mat-border-strong)] bg-white text-transparent group-hover:border-[var(--mat-green-400)]",
                    ].join(" ")}
                  >
                    ✓
                  </span>

                  <span>
                    <span className="block font-bold text-[var(--mat-ink)]">
                      {level.title}
                    </span>

                    <span className="mt-1.5 block text-sm leading-6 text-[var(--mat-muted)]">
                      {level.description}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {message ? (
        <div
          role="alert"
          className="mt-7 rounded-xl border border-[#ead8ad] bg-[var(--mat-gold-soft)] px-5 py-4 text-sm leading-6 text-[#805c25]"
        >
          {message}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-[var(--mat-border)] pt-7 sm:flex-row sm:items-center">
        <p className="max-w-xl text-sm leading-6 text-[var(--mat-muted)]">
          You can update these preferences later in Settings.
        </p>

        <button
          type="submit"
          disabled={!canContinue}
          className="mat-button mat-button-primary w-full sm:w-auto"
        >
          {isSubmitting
            ? "Saving…"
            : "See my recommendation"}
        </button>
      </div>
    </form>
  );
}
