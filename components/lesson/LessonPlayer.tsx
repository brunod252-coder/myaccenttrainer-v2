"use client";

import { useEffect, useRef, useState } from "react";

import LessonSectionRenderer from "@/components/lesson/LessonSectionRenderer";
import LessonStepper from "@/components/lesson/LessonStepper";
import type { Lesson, LessonSection } from "@/lib/lessons";
import type { PronunciationResult } from "@/lib/pronunciation/types";

type LessonPlayerProps = {
  lesson: Lesson;
  lessonId: string;
};

export default function LessonPlayer({
  lesson,
  lessonId,
}: LessonPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const completedRef = useRef(false);

  const currentSection = lesson.sections[currentIndex];
  const nextHref = lesson.nextLessonSlug
    ? `/dashboard/lesson/${lesson.nextLessonSlug}`
    : "/dashboard/practice";

  // Record completion once the learner reaches the final step.
  useEffect(() => {
    if (currentSection?.type === "complete" && !completedRef.current) {
      completedRef.current = true;
      fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      }).catch(() => {});
    }
  }, [currentSection?.type, lessonId]);

  function advanceLesson() {
    if (currentIndex < lesson.sections.length - 1) {
      setCurrentIndex((index) => index + 1);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-5 shadow-[var(--mat-shadow-sm)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mat-eyebrow">
              Lesson journey
            </p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              Follow each step in order
            </h2>
          </div>

          <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
            Step {Math.min(currentIndex + 1, lesson.sections.length)} of{" "}
            {lesson.sections.length}
          </span>
        </div>

        <LessonStepper
          sections={lesson.sections}
          currentSectionId={currentSection?.id}
        />
      </div>

      <div className="space-y-4">
        {lesson.sections.map((section, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isLocked = index > currentIndex;

          if (isActive) {
            return (
              <div key={section.id}>
                <LessonSectionRenderer
                  section={section}
                  lessonSlug={lesson.slug}
                  onSectionComplete={advanceLesson}
                  onResult={setResult}
                  result={result}
                  nextHref={nextHref}
                />
              </div>
            );
          }

          return (
            <LessonSectionPreview
              key={section.id}
              section={section}
              isCompleted={isCompleted}
              isLocked={isLocked}
            />
          );
        })}
      </div>
    </section>
  );
}

function LessonSectionPreview({
  section,
  isCompleted,
  isLocked,
}: {
  section: LessonSection;
  isCompleted: boolean;
  isLocked: boolean;
}) {
  return (
    <div
      className={
        "rounded-[var(--mat-radius-lg)] border p-5 transition " +
        (isCompleted
          ? "border-[var(--mat-border-green)] bg-[var(--mat-green-50)]"
          : "border-[var(--mat-border)] bg-[var(--mat-surface-soft)]")
      }
    >
      <div className="flex items-center gap-4">
        <span
          className={
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold " +
            (isCompleted
              ? "bg-[var(--mat-green-700)] text-white"
              : "bg-white text-[var(--mat-muted-light)]")
          }
        >
          {isCompleted ? "✓" : isLocked ? "🔒" : "•"}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-[var(--mat-ink)]">
              {section.title}
            </h3>

            <span
              className={
                "mat-pill " +
                (isCompleted
                  ? "bg-white text-[var(--mat-green-800)]"
                  : "bg-white text-[var(--mat-muted)]")
              }
            >
              {isCompleted ? "Completed" : isLocked ? "Locked" : "Up next"}
            </span>
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
            {isCompleted
              ? "You completed this step."
              : isLocked
                ? "Complete the previous step to unlock."
                : section.description}
          </p>
        </div>
      </div>
    </div>
  );
}
