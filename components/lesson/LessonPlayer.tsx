"use client";

import { useEffect, useRef, useState } from "react";

import LessonSectionRenderer from "@/components/lesson/LessonSectionRenderer";
import LessonStepper from "@/components/lesson/LessonStepper";
import type { Lesson, LessonSection } from "@/lib/lessons";
import type { PronunciationResult } from "@/lib/pronunciation/types";

type LessonPlayerProps = {
  lesson: Lesson;
};

export default function LessonPlayer({ lesson }: LessonPlayerProps) {
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
        body: JSON.stringify({ slug: lesson.slug }),
      }).catch(() => {});
    }
  }, [currentSection?.type, lesson.slug]);

  function advanceLesson() {
    if (currentIndex < lesson.sections.length - 1) {
      setCurrentIndex((index) => index + 1);
    }
  }

  return (
    <div className="space-y-6">
      <LessonStepper sections={lesson.sections} currentSectionId={currentSection?.id} />

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
    </div>
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
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={
            "flex h-10 w-10 items-center justify-center rounded-full text-lg " +
            (isCompleted ? "bg-[#20ad68] text-white" : "bg-[#e9f8f3] text-gray-400")
          }
        >
          {isCompleted ? "✓" : isLocked ? "🔒" : "•"}
        </div>

        <div>
          <h3 className="font-semibold text-[#17223b]">{section.title}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isCompleted
              ? "Completed"
              : isLocked
                ? "Complete the previous step to unlock."
                : section.description}
          </p>
        </div>
      </div>
    </div>
  );
}
