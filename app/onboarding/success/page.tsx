import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import TrialConfirmation from "./TrialConfirmation";
import { Mic, Sparkle } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";

export default async function OnboardingSuccessPage() {
  const token = (await cookies()).get("mat_session")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    verifyAuthToken(token);
  } catch {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[var(--mat-green-50)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--mat-green-600)] text-white">
              <Mic className="h-[18px] w-[18px]" />
            </span>

            <span className="text-sm font-extrabold tracking-[-0.02em] text-[var(--mat-ink)]">
              MyAccentTrainer
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted-light)]">
            Step 6 of 6
          </span>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-[var(--mat-border-green)] bg-white shadow-[var(--mat-shadow-lg)]">
          <div className="border-b border-[var(--mat-border)] p-6 text-center sm:p-8 md:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--mat-green-100)] text-[var(--mat-green-700)]">
              <Sparkle className="h-7 w-7" />
            </div>

            <p className="mat-eyebrow mt-6">
              Welcome to Premium
            </p>

            <h1 className="mat-page-title">
              Your learning journey begins now.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[var(--mat-muted)]">
              We&apos;re confirming your enrollment and preparing your
              personalized MyAccentTrainer workspace.
            </p>
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            <div className="mb-8 grid gap-2 rounded-2xl border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 text-xs sm:grid-cols-3 md:grid-cols-6">
              <span className="font-bold text-[var(--mat-green-700)]">
                ✓ Account
              </span>
              <span className="font-bold text-[var(--mat-green-700)]">
                ✓ Email
              </span>
              <span className="font-bold text-[var(--mat-green-700)]">
                ✓ Assessment
              </span>
              <span className="font-bold text-[var(--mat-green-700)]">
                ✓ Membership
              </span>
              <span className="font-bold text-[var(--mat-green-700)]">
                ✓ Payment
              </span>
              <span className="font-bold text-[var(--mat-ink)]">
                6. Trial
              </span>
            </div>

            <TrialConfirmation />
          </div>
        </section>
      </div>
    </main>
  );
}
