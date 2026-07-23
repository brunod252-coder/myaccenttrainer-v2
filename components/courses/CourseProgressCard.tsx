import Link from "next/link";

type CourseProgressCardProps = {
  title: string;
  description: string;
  progress: number;
  lessons: string;
};

export default function CourseProgressCard({
  title,
  description,
  progress,
  lessons,
}: CourseProgressCardProps) {
  return (
    <article className="rounded border bg-white shadow-sm transition hover:shadow-md">
      <div className="flex h-40 items-center justify-center bg-[#eef6f3] text-5xl">
        📘
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-[#20ad68]">{title}</h3>

        <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>

        <div className="mt-6">
          <div className="flex justify-between text-sm font-semibold">
            <span>{lessons}</span>
            <span>{progress}%</span>
          </div>

          <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#20ad68]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Link
          href="/dashboard/lesson/american-r"
          className="mt-8 flex w-full items-center justify-center rounded bg-[#20ad68] py-3 font-semibold text-white transition hover:bg-[#169357]"
        >
          Continue Learning
        </Link>
      </div>
    </article>
  );
}
