type CourseCardProps = {
  title: string;
  description: string;
};

export default function CourseCard({ title, description }: CourseCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-[#e9f8f3] to-[#d7f2e7] text-5xl">
        📘
      </div>

      <div className="p-6">
        <h3 className="font-display text-lg text-[#168c56]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#20ad68] transition group-hover:gap-2">
          Explore
          <span aria-hidden>→</span>
        </span>
      </div>
    </article>
  );
}
