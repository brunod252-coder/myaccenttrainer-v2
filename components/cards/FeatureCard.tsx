import Link from "next/link";
import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  visual: ReactNode;
  href: string;
};

export default function FeatureCard({
  title,
  description,
  visual,
  href,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20ad68] focus-visible:ring-offset-2"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e9f8f3] to-[#d9efe7] text-[#168c56] transition group-hover:scale-105">
        {visual}
      </div>

      <h3 className="mt-5 font-display text-xl text-[#17223b] transition group-hover:text-[#168c56]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-gray-600">
        {description}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#20ad68] transition group-hover:gap-2">
        Learn more
        <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
