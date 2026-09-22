import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AssessmentForm from "./AssessmentForm";
import { Mic } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export default async function OnboardingAssessmentPage() {
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
      firstName: true,
      emailVerified: true,
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

  if (!user.emailVerified) {
    redirect("/verify-email");
  }

  const profileComplete =
    Boolean(user.profile?.englishGoal?.trim()) &&
    Boolean(user.profile?.proficiencyLevel?.trim());

  if (profileComplete) {
    redirect("/onboarding/plan");
  }

  const firstName = user.firstName?.trim() || "there";

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
            Step 3 of 6
          </span>
        </div>

        <section className="rounded-[28px] border border-[var(--mat-border-green)] bg-white p-6 shadow-[var(--mat-shadow-lg)] sm:p-8 md:p-10">
          <div className="max-w-3xl">
            <p className="mat-eyebrow">
              Your learning assessment
            </p>

            <h1 className="mat-page-title">
              Tell Nina what you want English to do for you, {firstName}.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--mat-muted)]">
              Your learning path starts with your goal and your current
              starting point. These two questions give Nina the context she
              needs to make your learning experience more relevant from the
              beginning.
            </p>
          </div>

          <div className="mt-8 grid gap-2 rounded-2xl border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 text-xs sm:grid-cols-3 md:grid-cols-6">
            <span className="font-bold text-[var(--mat-green-700)]">
              ✓ Account
            </span>
            <span className="font-bold text-[var(--mat-green-700)]">
              ✓ Email
            </span>
            <span className="font-bold text-[var(--mat-ink)]">
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

          <div className="mt-10">
            <AssessmentForm
              initialGoal={user.profile?.englishGoal}
              initialLevel={user.profile?.proficiencyLevel}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
