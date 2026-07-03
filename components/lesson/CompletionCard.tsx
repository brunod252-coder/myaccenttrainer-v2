type CompletionCardProps = {
  title: string;
  message: string;
  nextLessonLabel?: string;
};

export default function CompletionCard({
  title,
  message,
  nextLessonLabel = "Continue",
}: CompletionCardProps) {
  return (
    <section className="rounded border bg-white p-8 shadow-sm">
      <div className="flex items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f8f3] text-2xl">
          🎉
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-[#20ad68]">
            Lesson Complete
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#52719f]">
            {title}
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            {message}
          </p>

          <button className="mt-8 rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357]">
            {nextLessonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}