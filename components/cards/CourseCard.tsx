type CourseCardProps = {
  title: string;
  description: string;
};

export default function CourseCard({ title, description }: CourseCardProps) {
  return (
    <article className="border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-36 items-center justify-center bg-[#eef6f3] text-5xl">
        📘
      </div>

      <div className="p-5">
        <h3 className="font-bold text-[#168c56]">{title}</h3>
        <p className="mt-3 text-xs leading-5">{description}</p>
      </div>
    </article>
  );
}