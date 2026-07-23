"use client";

import { useEffect, useRef, useState } from "react";

import LessonSectionRenderer from "@/components/lesson/LessonSectionRenderer";
import LessonStepper from "@/components/lesson/LessonStepper";
import type { Lesson, LessonSection } from "@/lib/lessons";

type LessonPlayerProps = {
  lesson: Lesson;
};

export default function LessonPlayer({ lesson }: LessonPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeSectionRef = useRef<HTMLDivElement | null>(null);

  const currentSection = lesson.sections[currentIndex];

  function advanceLesson() {
    if (currentIndex < lesson.sections.length - 1) {
      setCurrentIndex((index) => index + 1);
    }
  }

  useEffect(() => {
    activeSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [currentIndex]);

  return (
    <div className="space-y-8">
      <LessonStepper
        sections={lesson.sections}
        currentSectionId={currentSection?.id}
      />

      <div className="space-y-4">
        {lesson.sections.map((section, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isLocked = index > currentIndex;

          if (isActive) {
            return (
              <div key={section.id} ref={activeSectionRef}>
                <LessonSectionRenderer
                  section={section}
                  onComplete={advanceLesson}
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
    <div className="rounded border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9f8f3] text-lg">
          {isCompleted ? "✓" : isLocked ? "🔒" : "•"}
        </div>

        <div>
          <h3 className="font-bold text-[#52719f]">{section.title}</h3>
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

