import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
};

export default function ButtonLink({
  href,
  children,
  variant = "primary",
}: ButtonLinkProps) {
  const classes =
    variant === "outline"
      ? "inline-flex items-center justify-center gap-2 rounded-lg border border-[#20ad68] px-6 py-3 text-sm font-semibold text-[#20ad68] transition hover:bg-[#e9f8f3]"
      : "inline-flex items-center justify-center gap-2 rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#169357] hover:shadow";

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
