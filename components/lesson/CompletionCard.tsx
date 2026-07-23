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
    <section className="overflow-hidden rounded-2xl border border-[#cdeee1] bg-gradient-to-br from-[#f0faf6] to-white p-8 shadow-sm">
      <div className="flex items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#20ad68] text-2xl text-white">
          🎉
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-[#20ad68]">Lesson complete</p>
          <h2 className="mt-2 font-display text-2xl text-[#17223b]">{title}</h2>
          <p className="mt-4 leading-7 text-gray-600">{message}</p>

          <Link
            href={nextHref}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357]"
          >
            {nextLessonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
