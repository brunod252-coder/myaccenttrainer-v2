"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GOALS = [
  {
    value: "Everyday conversation",
    title: "Everyday Conversation",
    description:
      "Speak more naturally and confidently in daily life, family conversations, errands, and social situations.",
  },
  {
    value: "IELTS / TOEFL speaking",
    title: "TOEFL / IELTS Speaking",
    description:
      "Build the clarity, fluency, and speaking confidence needed for an English proficiency exam.",
  },
  {
    value: "University interviews",
    title: "Job & University Interviews",
    description:
      "Prepare to answer questions clearly, confidently, and professionally in high-stakes interviews.",
  },
  {
    value: "Career & professional",
    title: "Career & Professional English",
    description:
      "Communicate more effectively at work, in meetings, with customers, and with colleagues.",
  },
  {
    value: "Seminars & presentations",
    title: "Presentations & Public Speaking",
    description:
      "Speak with greater clarity and confidence when presenting ideas to groups.",
  },
  {
    value: "Class participation",
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

  const [englishGoal, setEnglishGoal] =
    useState(initialGoal ?? "");

  const [proficiencyLevel, setProficiencyLevel] =
    useState(initialLevel ?? "");

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#20ad68]">
          Your learning goal
        </p>

        <h2 className="mt-3 font-display text-3xl text-[#17223b]">
          What would you most like English to help you do?
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
          Choose the reason that matters most right now. Nina will
          use this to shape your learning experience.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {GOALS.map((goal) => {
            const selected =
              englishGoal === goal.value;

            return (
              <button
                key={goal.value}
                type="button"
                onClick={() =>
                  setEnglishGoal(goal.value)
                }
                className={[
                  "rounded-2xl border p-5 text-left transition",
                  selected
                    ? "border-[#20ad68] bg-[#eefaf4] ring-2 ring-[#20ad68]/15"
                    : "border-gray-200 bg-white hover:border-[#20ad68]/50 hover:bg-[#fbfdfc]",
                ].join(" ")}
                aria-pressed={selected}
              >
                <span className="flex items-start gap-3">
                  <span
                    className={[
                      "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-[#20ad68] bg-[#20ad68] text-white"
                        : "border-gray-300 bg-white",
                    ].join(" ")}
                  >
                    {selected ? "✓" : ""}
                  </span>

                  <span>
                    <span className="block font-semibold text-[#17223b]">
                      {goal.title}
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-gray-500">
                      {goal.description}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10 border-t border-gray-100 pt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#20ad68]">
          Your starting point
        </p>

        <h2 className="mt-3 font-display text-3xl text-[#17223b]">
          Where would you place your English today?
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
          This is only a starting point. Your practice results will
          help Nina refine what you need over time.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {LEVELS.map((level) => {
            const selected =
              proficiencyLevel === level.value;

            return (
              <button
                key={level.value}
                type="button"
                onClick={() =>
                  setProficiencyLevel(level.value)
                }
                className={[
                  "rounded-2xl border p-5 text-left transition",
                  selected
                    ? "border-[#20ad68] bg-[#eefaf4] ring-2 ring-[#20ad68]/15"
                    : "border-gray-200 bg-white hover:border-[#20ad68]/50 hover:bg-[#fbfdfc]",
                ].join(" ")}
                aria-pressed={selected}
              >
                <span className="flex items-start gap-3">
                  <span
                    className={[
                      "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-[#20ad68] bg-[#20ad68] text-white"
                        : "border-gray-300 bg-white",
                    ].join(" ")}
                  >
                    {selected ? "✓" : ""}
                  </span>

                  <span>
                    <span className="block font-semibold text-[#17223b]">
                      {level.title}
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-gray-500">
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
          className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
        >
          {message}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-gray-100 pt-7 sm:flex-row sm:items-center">
        <p className="max-w-xl text-sm leading-6 text-gray-500">
          You can update these preferences later in Settings.
        </p>

        <button
          type="submit"
          disabled={!canContinue}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#20ad68] px-7 py-3 font-semibold text-white transition hover:bg-[#168c56] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSubmitting
            ? "Saving..."
            : "See my recommendation"}
        </button>
      </div>
    </form>
  );
}
