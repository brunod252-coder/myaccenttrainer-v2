import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Mic, Sparkle } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getLearningRecommendation } from "@/lib/onboarding/recommendation";

export default async function RecommendationPage() {
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

  const englishGoal = user.profile?.englishGoal?.trim();
  const proficiencyLevel = user.profile?.proficiencyLevel?.trim();

  if (!englishGoal || !proficiencyLevel) {
    redirect("/onboarding/assessment");
  }

  const recommendation = getLearningRecommendation(
    englishGoal,
    proficiencyLevel,
  );

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
            Your recommendation
          </span>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-[var(--mat-border-green)] bg-white shadow-[var(--mat-shadow-lg)]">
          <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
            <div className="p-6 sm:p-8 md:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--mat-green-100)] text-[var(--mat-green-700)]">
                <Sparkle className="h-6 w-6" />
              </div>

              <p className="mat-eyebrow mt-6">
                {recommendation.eyebrow}
              </p>

              <h1 className="mat-page-title">
                {firstName}, here is where Nina recommends you begin.
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--mat-muted)]">
                {recommendation.summary}
              </p>

              <div className="mt-8 rounded-2xl border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--mat-green-700)]">
                  Your starting point
                </p>

                <p className="mt-3 text-base leading-7 text-[var(--mat-ink-soft)]">
                  {recommendation.firstFocus}
                </p>
              </div>

              <div className="mt-8">
                <p className="font-bold text-[var(--mat-ink)]">
                  Nina will prioritize
                </p>

                <div className="mt-4 space-y-3">
                  {recommendation.priorities.map((priority) => (
                    <div
                      key={priority}
                      className="flex items-start gap-3 rounded-2xl border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] px-5 py-4"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--mat-green-100)] text-xs font-bold text-[var(--mat-green-700)]">
                        ✓
                      </span>

                      <span className="text-sm leading-6 text-[var(--mat-muted)]">
                        {priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="flex flex-col bg-[var(--mat-green-800)] p-6 text-white sm:p-8 md:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--mat-green-200)]">
                Your learning profile
              </p>

              <div className="mt-7 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                    Main goal
                  </p>

                  <p className="mt-2 font-display text-2xl leading-tight">
                    {recommendation.eyebrow}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                    Starting level
                  </p>

                  <p className="mt-2 font-display text-2xl">
                    {proficiencyLevel}
                  </p>
                </div>
              </div>

              <p className="mt-7 text-sm leading-6 text-white/70">
                This is your starting recommendation. As you practice, Nina
                can use your performance to make your coaching more specific
                over time.
              </p>

              <div className="mt-auto pt-8">
                <Link
                  href="/onboarding/plan"
                  className="mat-button w-full border border-[var(--mat-green-500)] bg-[var(--mat-green-500)] text-white hover:border-[var(--mat-green-400)] hover:bg-[var(--mat-green-400)]"
                >
                  Continue to membership
                </Link>

                <Link
                  href="/dashboard/settings"
                  className="mt-4 flex min-h-10 items-center justify-center text-sm font-semibold text-white/70 transition hover:text-white"
                >
                  Update my learning profile
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
