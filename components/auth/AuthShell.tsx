import Link from "next/link";
import type { ReactNode } from "react";

import { CheckCircle, Mic, Sparkle } from "@/components/ui/icons";

type AuthShellProps = {
  heading: string;
  sub: string;
  children: ReactNode;
  altText: string;
  altHref: string;
  altLabel: string;
};

const highlights = [
  "Personalized learning based on your language and goals",
  "Practice speaking and keep track of your progress",
  "Guidance from Nina on what to practice next",
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
    <main className="relative min-h-screen overflow-hidden bg-[var(--mat-green-50)]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/65 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[var(--mat-green-200)]/45 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid w-full max-w-[1060px] overflow-hidden rounded-[28px] border border-[var(--mat-border-green)] bg-white shadow-[var(--mat-shadow-lg)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="relative hidden overflow-hidden bg-[var(--mat-green-700)] p-10 text-white lg:flex lg:flex-col xl:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/[0.04]" />

            <Link
              href="/"
              className="relative flex w-fit items-center gap-2"
              aria-label="MyAccentTrainer home"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--mat-green-700)] shadow-sm">
                <Mic className="h-5 w-5" />
              </span>

              <span>
                <span className="block text-base font-extrabold tracking-[-0.02em]">
                  MyAccentTrainer
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  Learn with Nina
                </span>
              </span>
            </Link>

            <div className="relative my-auto max-w-md py-12">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Sparkle className="h-6 w-6 text-[var(--mat-green-200)]" />
              </div>

              <h2 className="font-display text-[2.5rem] leading-[1.08] tracking-[-0.025em]">
                Speak more clearly.
                <br />
                Keep your own voice.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/72">
                Build confident English through focused lessons, speaking
                practice, progress tracking, and personalized guidance.
              </p>

              <ul className="mt-8 space-y-4">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-white/85"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mat-green-200)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative text-xs text-white/45">
              © 2026 MyAccentTrainer
            </p>
          </section>

          <section className="flex min-h-[640px] items-center justify-center bg-white px-5 py-8 sm:px-10 sm:py-12 lg:px-14 xl:px-16">
            <div className="w-full max-w-[440px]">
              <Link
                href="/"
                className="mb-10 flex w-fit items-center gap-2 lg:hidden"
                aria-label="MyAccentTrainer home"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mat-green-600)] text-white">
                  <Mic className="h-5 w-5" />
                </span>

                <span>
                  <span className="block text-base font-extrabold tracking-[-0.02em] text-[var(--mat-ink)]">
                    MyAccentTrainer
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--mat-muted-light)]">
                    Learn with Nina
                  </span>
                </span>
              </Link>

              <div>
                <p className="mat-eyebrow">Welcome</p>

                <h1 className="mat-page-title">
                  {heading}
                </h1>

                <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
                  {sub}
                </p>
              </div>

              <div className="mt-7">
                {children}
              </div>

              <p className="mt-7 text-center text-sm text-[var(--mat-muted)]">
                {altText}{" "}
                <Link
                  href={altHref}
                  className="font-bold text-[var(--mat-green-700)] transition hover:text-[var(--mat-green-800)]"
                >
                  {altLabel}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
