import Link from "next/link";
import type { ReactNode } from "react";

import { CheckCircle } from "@/components/ui/icons";

type AuthShellProps = {
  heading: string;
  sub: string;
  children: ReactNode;
  altText: string;
  altHref: string;
  altLabel: string;
};

const highlights = [
  "Instant, sound-by-sound feedback from Nina",
  "Lessons tuned to your native language",
  "Practice any time — 5 minutes or 50",
];

export default function AuthShell({
  heading,
  sub,
  children,
  altText,
  altHref,
  altLabel,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#20ad68] via-[#178a57] to-[#142b4c] p-12 text-white md:flex md:flex-col">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-white/5" />

        <Link href="/" className="relative text-lg font-bold">
          <span className="text-[#bff3dd]">my</span>
          <span className="mx-1 rounded-md bg-white/20 px-1.5 text-white">ACCENT</span>
          <span className="text-white/80">trainer</span>
        </Link>

        <div className="relative my-auto max-w-md">
          <h2 className="font-display text-4xl leading-tight">
            Speak English clearly. Keep your own voice.
          </h2>
          <p className="mt-4 leading-7 text-white/80">
            Join learners from around the world building clearer, more confident
            English — one sound at a time.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                <CheckCircle className="h-5 w-5 text-[#bff3dd]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60">© 2026 myACCENTtrainer</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-[#f6faf8] p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 block text-lg font-bold md:hidden">
            <span className="text-[#20ad68]">my</span>
            <span className="mx-1 rounded-md bg-[#20ad68] px-1.5 text-white">ACCENT</span>
            <span className="text-[#52719f]">trainer</span>
          </Link>

          <h1 className="font-display text-3xl text-[#17223b]">{heading}</h1>
          <p className="mt-2 text-sm text-gray-500">{sub}</p>

          <div className="mt-6">{children}</div>

          <p className="mt-6 text-center text-sm text-gray-500">
            {altText}{" "}
            <Link href={altHref} className="font-semibold text-[#20ad68] hover:text-[#169357]">
              {altLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
