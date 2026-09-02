import Image from "next/image";
import Link from "next/link";

type CourseCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
};

export default function CourseCard({
  title,
  description,
  imageSrc,
  imageAlt,
  href,
}: CourseCardProps) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20ad68] focus-visible:ring-offset-2"
    >
      <div className="relative h-40 overflow-hidden bg-[#edf9f4]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5" />
      </div>

      <div className="p-6">
        <h3 className="font-display text-lg text-[#168c56]">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {description}
        </p>

        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#20ad68] transition group-hover:gap-2">
          Explore
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
