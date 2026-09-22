import Link from "next/link";

type CompletionCardProps = {
  title: string;
  message: string;
  nextLessonLabel?: string;
  nextHref?: string;
};

export default function CompletionCard({
  title,
  message,
  nextLessonLabel = "Continue",
  nextHref = "/dashboard/courses",
}: CompletionCardProps) {
  return (
    <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-white shadow-[var(--mat-shadow-sm)]">
      <div className="bg-[var(--mat-green-50)] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--mat-green-700)] text-white">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <p className="mat-eyebrow">
              Lesson complete
            </p>

            <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
              {title}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--mat-muted)] sm:text-base">
              {message}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--mat-border-green)] p-6 sm:px-8">
        <p className="text-sm leading-6 text-[var(--mat-muted)]">
          You&apos;ve reached the end of this lesson.
        </p>

        <Link
          href={nextHref}
          className="mat-button mat-button-primary"
        >
          {nextLessonLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
