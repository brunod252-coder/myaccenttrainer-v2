type FeedbackCardProps = {
  score: number;
  title: string;
  message: string;
};

export default function FeedbackCard({
  score,
  title,
  message,
}: FeedbackCardProps) {
  return (
    <section className="rounded border bg-white p-8 shadow-sm">
      <div className="flex items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f8f3] text-2xl">
          🤖
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-[#20ad68]">
            Nina's Feedback
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#52719f]">
            {title}
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            {message}
          </p>

          <div className="mt-8 rounded border bg-[#f8fbfa] p-5">
            <p className="text-sm text-gray-500">
              Pronunciation Score
            </p>

            <p className="mt-2 text-4xl font-bold text-[#20ad68]">
              {score}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}