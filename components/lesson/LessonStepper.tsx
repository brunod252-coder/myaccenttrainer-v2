import type { LessonSection } from "@/lib/lessons";

type LessonStepperProps = {
  sections: LessonSection[];
  currentSectionId?: string;
};

export default function LessonStepper({
  sections,
  currentSectionId = "practice",
}: LessonStepperProps) {
  const currentIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === currentSectionId),
  );
  const progress =
    sections.length > 1 ? (currentIndex / (sections.length - 1)) * 100 : 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#20ad68] to-[#52719f] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {sections.map((section, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={section.id} className="flex items-center gap-3">
              <div
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
                  isComplete
                    ? "bg-[#20ad68] text-white"
                    : isCurrent
                      ? "bg-[#20ad68] text-white ring-4 ring-[#20ad68]/15"
                      : "bg-gray-100 text-gray-400",
                ].join(" ")}
              >
                {isComplete ? "✓" : index + 1}
              </div>

              <div className="min-w-0">
                <p
                  className={[
                    "truncate text-sm font-semibold",
                    isCurrent ? "text-[#20ad68]" : isComplete ? "text-[#17223b]" : "text-gray-400",
                  ].join(" ")}
                >
                  {section.title}
                </p>
                <p className="text-xs capitalize text-gray-400">{section.type}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
