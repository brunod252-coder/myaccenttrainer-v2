import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import PlanSelectionForm from "./PlanSelectionForm";
import { Mic } from "@/components/ui/icons";
import {
  canChoosePlan,
  getEnrollmentRedirect,
  getEnrollmentState,
} from "@/lib/auth/enrollment";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPlanPage() {
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
    where: { id: payload.userId },
    select: {
      email: true,
      firstName: true,
      emailVerified: true,
      selectedPlanId: true,
      subscriptionStatus: true,
      profile: {
        select: {
          englishGoal: true,
          proficiencyLevel: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const enrollmentState = getEnrollmentState({
    emailVerified: user.emailVerified,
    englishGoal: user.profile?.englishGoal,
    proficiencyLevel: user.profile?.proficiencyLevel,
    subscriptionStatus: user.subscriptionStatus,
  });

  if (!canChoosePlan(enrollmentState)) {
    const destination = getEnrollmentRedirect(enrollmentState);

    redirect(destination ?? "/dashboard");
  }

  const name = user.firstName || "there";

  return (
    <main className="min-h-screen bg-[var(--mat-green-50)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
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
            Step 4 of 6
          </span>
        </div>

        <section className="rounded-[28px] border border-[var(--mat-border-green)] bg-white p-6 shadow-[var(--mat-shadow-lg)] sm:p-8 md:p-10">
          <div className="max-w-2xl">
            <p className="mat-eyebrow">
              Membership
            </p>

            <h1 className="mat-page-title">
              {name}, choose how you would like to continue.
            </h1>

            <p className="mt-5 text-sm leading-7 text-[var(--mat-muted)]">
              Your learning profile is ready. Choose Monthly or Annual,
              then add a valid payment method to begin your two-day
              Premium trial.
            </p>
          </div>

          <div className="mt-8 grid gap-2 rounded-2xl border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 text-xs sm:grid-cols-3 md:grid-cols-6">
            <span className="font-bold text-[var(--mat-green-700)]">
              ✓ Account
            </span>
            <span className="font-bold text-[var(--mat-green-700)]">
              ✓ Email
            </span>
            <span className="font-bold text-[var(--mat-green-700)]">
              ✓ Assessment
            </span>
            <span className="font-bold text-[var(--mat-ink)]">
              4. Membership
            </span>
            <span className="text-[var(--mat-muted)]">
              5. Payment
            </span>
            <span className="text-[var(--mat-muted)]">
              6. Trial
            </span>
          </div>

          <div className="mt-10">
            <PlanSelectionForm initialPlanId={user.selectedPlanId} />
          </div>
        </section>
      </div>
    </main>
  );
}
