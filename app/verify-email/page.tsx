import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ResendVerificationButton from "./ResendVerificationButton";
import { Mic } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export default async function VerifyEmailPage() {
  const token = (await cookies()).get("mat_session")?.value;

  if (!token) {
    redirect("/login");
  }

  let payload;

  try {
    payload = verifyAuthToken(token);
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      email: true,
      firstName: true,
      emailVerified: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.emailVerified) {
    redirect("/dashboard");
  }

  const firstName = user.firstName || "there";

  return (
    <main className="min-h-screen bg-[var(--mat-green-50)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4 px-1">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="MyAccentTrainer home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--mat-green-600)] text-white">
              <Mic className="h-[18px] w-[18px]" />
            </span>

            <span className="text-sm font-extrabold tracking-[-0.02em] text-[var(--mat-ink)]">
              MyAccentTrainer
            </span>
          </Link>

          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted-light)]">
            Step 2 of 6
          </span>
        </div>

        <section className="rounded-[28px] border border-[var(--mat-border-green)] bg-white p-6 shadow-[var(--mat-shadow-lg)] sm:p-8 md:p-10">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mat-green-100)] text-2xl">
              ✉️
            </div>

            <p className="mat-eyebrow mt-7">
              Verify your email
            </p>

            <h1 className="mat-page-title">
              Check your inbox, {firstName}.
            </h1>

            <p className="mt-5 text-sm leading-7 text-[var(--mat-muted)]">
              We sent a verification link to:
            </p>

            <p className="mt-2 break-all font-bold text-[var(--mat-ink)]">
              {user.email}
            </p>

            <p className="mt-5 text-sm leading-6 text-[var(--mat-muted)]">
              Open the message and confirm your email. Next, you&apos;ll tell
              Nina what you want English to help you accomplish and where
              you&apos;re starting today.
            </p>
          </div>

          <div className="mt-8 grid gap-2 rounded-2xl border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 text-xs sm:grid-cols-3 md:grid-cols-6">
            <span className="font-bold text-[var(--mat-green-700)]">
              ✓ Account
            </span>
            <span className="font-bold text-[var(--mat-ink)]">
              2. Email
            </span>
            <span className="text-[var(--mat-muted)]">
              3. Assessment
            </span>
            <span className="text-[var(--mat-muted)]">
              4. Membership
            </span>
            <span className="text-[var(--mat-muted)]">
              5. Payment
            </span>
            <span className="text-[var(--mat-muted)]">
              6. Trial
            </span>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            <ResendVerificationButton />

            <div className="mat-card-soft mt-6 p-5 text-sm leading-6 text-[var(--mat-muted)]">
              <p className="font-bold text-[var(--mat-ink)]">
                Cannot find the email?
              </p>

              <p className="mt-2">
                Check your Spam, Junk, Promotions, and Updates folders. Make
                sure the email address shown above is correct.
              </p>
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row">
              <Link
                href="/login"
                className="font-bold text-[var(--mat-green-700)] transition hover:text-[var(--mat-green-800)]"
              >
                Return to login
              </Link>

              <span className="hidden text-[var(--mat-border-strong)] sm:inline">
                •
              </span>

              <Link
                href="/"
                className="font-semibold text-[var(--mat-muted)] transition hover:text-[var(--mat-ink)]"
              >
                Return to homepage
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
