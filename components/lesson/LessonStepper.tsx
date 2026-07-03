import type { LessonSection } from "@/lib/lessons";

type LessonStepperProps = {
  sections: LessonSection[];
  currentSectionId?: string;
};

export default function LessonStepper({
  sections,
  currentSectionId = "practice",
}: LessonStepperProps) {
  const currentIndex = sections.findIndex(
    (section) => section.id === currentSectionId
  );

  return (
    <div className="rounded border bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-4">
        {sections.map((section, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={section.id} className="flex items-center gap-3">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                  isComplete || isCurrent
                    ? "bg-[#20ad68] text-white"
                    : "bg-gray-200 text-gray-500",
                ].join(" ")}
              >
                {index + 1}
              </div>

              <div>
                <p
                  className={[
                    "text-sm font-semibold",
                    isCurrent ? "text-[#20ad68]" : "text-gray-700",
                  ].join(" ")}
                >
                  {section.title}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {section.type}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}