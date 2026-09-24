import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import GoalSetter from "@/components/app/GoalSetter";
import { Sparkle, Flame, Mic, Arrow, CheckCircle } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getCoachingPlan } from "@/lib/nina/coaching";

export default async function CoachingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");
  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  const plan = await getCoachingPlan(payload.userId);
  const firstName = user.firstName || "there";
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const goalPct = Math.min(100, Math.round((plan.daysThisWeek / plan.goal.weeklyTarget) * 100));

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-6">
        <header className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mat-eyebrow">
                Nina coaching
              </p>

              <h1 className="mt-2 font-display text-3xl text-[var(--mat-ink)] md:text-4xl">
                Your coaching plan
              </h1>

              <p className="mt-3 text-sm leading-7 text-[var(--mat-muted)] sm:text-base">
                Nina combines your learning goal, recent practice, and measured
                speaking evidence to recommend what to work on next.
              </p>
            </div>

            <Link
              href="/dashboard/nina"
              className="mat-button mat-button-secondary"
            >
              View Nina&apos;s memory
            </Link>
          </div>
        </header>

        {/* Today's session */}
        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] shadow-[var(--mat-shadow-sm)]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--mat-green-800)]">
                  <Sparkle className="h-4 w-4" />
                  Today&apos;s coaching session
                </div>

                <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)] sm:text-3xl">
                  {plan.headline}
                </h2>

                <p className="mt-3 text-sm leading-7 text-[var(--mat-muted)] sm:text-base">
                  {firstName}, {plan.motivation}
                </p>
              </div>

              <div className="rounded-full border border-[var(--mat-border-green)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--mat-green-800)]">
                {plan.exercises.length}{" "}
                {plan.exercises.length === 1 ? "exercise" : "exercises"}
              </div>
            </div>

            {plan.exercises.length > 0 ? (
              <div className="mt-7 grid gap-4 lg:grid-cols-3">
                {plan.exercises.map((ex, i) => (
                  <Link
                    key={ex.slug + i}
                    href={`/dashboard/lesson/${ex.slug}`}
                    className="group rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--mat-shadow-sm)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-green-700)]">
                        Exercise {i + 1}
                      </span>

                      <Arrow className="h-4 w-4 text-[var(--mat-muted)] transition group-hover:translate-x-1" />
                    </div>

                    <h3 className="mt-3 font-display text-xl text-[var(--mat-ink)]">
                      {ex.label}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                      {ex.why}
                    </p>

                    <div className="mt-5 text-sm font-bold text-[var(--mat-green-700)]">
                      Open exercise
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-[var(--mat-radius-lg)] border border-dashed border-[var(--mat-border-green)] bg-white p-5">
                <p className="text-sm font-semibold text-[var(--mat-ink)]">
                  No coaching exercises are available right now
                </p>

                <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
                  You can continue pronunciation practice while Nina builds
                  your next coaching recommendations.
                </p>

                <Link
                  href="/dashboard/practice"
                  className="mat-button mat-button-secondary mt-4"
                >
                  <Mic className="h-4 w-4" />
                  Open Practice
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Goal + streak */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mat-eyebrow">
                  Weekly commitment
                </p>

                <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  Build a practice rhythm
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--mat-muted)]">
                  Choose a weekly practice target and compare it with the days
                  you actually practice.
                </p>
              </div>

              <div className="rounded-[var(--mat-radius-lg)] bg-[var(--mat-surface-soft)] px-4 py-3 text-right">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--mat-muted-light)]">
                  This week
                </p>

                <p className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  {plan.daysThisWeek}
                  <span className="text-base text-[var(--mat-muted)]">
                    {" "}
                    / {plan.goal.weeklyTarget} days
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div
                className="h-2.5 overflow-hidden rounded-full bg-[var(--mat-surface-soft)]"
                aria-label={`${plan.daysThisWeek} of ${plan.goal.weeklyTarget} weekly practice days completed`}
              >
                <div
                  className="h-full rounded-full bg-[var(--mat-green-600)]"
                  style={{ width: `${goalPct}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p
                  className={
                    "text-sm font-semibold " +
                    (plan.goalMet
                      ? "text-[var(--mat-green-700)]"
                      : "text-[var(--mat-muted)]")
                  }
                >
                  {plan.goalMet
                    ? "Weekly commitment reached."
                    : `${Math.max(
                        0,
                        plan.goal.weeklyTarget - plan.daysThisWeek,
                      )} ${
                        Math.max(
                          0,
                          plan.goal.weeklyTarget - plan.daysThisWeek,
                        ) === 1
                          ? "more practice day"
                          : "more practice days"
                      } to reach your weekly commitment.`}
                </p>

                <span className="text-xs font-semibold text-[var(--mat-muted-light)]">
                  {goalPct}% complete
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--mat-border)] pt-6">
              <p className="text-sm font-bold text-[var(--mat-ink)]">
                Set your target
              </p>

              <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
                Choose between 3 and 7 practice days per week.
              </p>

              <div className="mt-4">
                <GoalSetter weeklyTarget={plan.goal.weeklyTarget} />
              </div>
            </div>
          </section>

          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <div>
              <p className="mat-eyebrow">
                Momentum
              </p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Your current practice signals
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                A snapshot of your recent consistency and measured clarity.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[var(--mat-radius-lg)] bg-[var(--mat-surface-soft)] p-4">
                <div className="flex items-center gap-2 text-[var(--mat-muted)]">
                  <Flame className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-[0.1em]">
                    Streak
                  </span>
                </div>

                <p className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
                  {plan.streakDays}
                  <span className="ml-1 text-sm text-[var(--mat-muted)]">
                    {plan.streakDays === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>

              <div className="rounded-[var(--mat-radius-lg)] bg-[var(--mat-surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted)]">
                  Today
                </p>

                <p
                  className={
                    "mt-2 text-sm font-bold " +
                    (plan.practicedToday
                      ? "text-[var(--mat-green-700)]"
                      : "text-[var(--mat-muted)]")
                  }
                >
                  {plan.practicedToday
                    ? "Practice recorded"
                    : "No practice recorded yet"}
                </p>
              </div>

              <div className="rounded-[var(--mat-radius-lg)] bg-[var(--mat-surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted)]">
                  Current clarity
                </p>

                <p className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
                  {plan.clarityNow !== null ? plan.clarityNow : "—"}
                </p>

                <p className="mt-1 text-xs text-[var(--mat-muted-light)]">
                  {plan.clarityNow !== null
                    ? "From your measured practice"
                    : "Not measured yet"}
                </p>
              </div>
            </div>

            {plan.goal.clarityTarget &&
              plan.clarityTargetProgress !== null && (
                <div className="mt-6 border-t border-[var(--mat-border)] pt-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--mat-ink)]">
                        Clarity target
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
                        Current measured clarity compared with your saved target
                        of {plan.goal.clarityTarget}.
                      </p>
                    </div>

                    <span className="text-sm font-bold text-[var(--mat-green-700)]">
                      {plan.clarityTargetProgress}%
                    </span>
                  </div>

                  <div
                    className="mt-4 h-2.5 overflow-hidden rounded-full bg-[var(--mat-surface-soft)]"
                    aria-label={`${plan.clarityTargetProgress}% progress toward clarity target ${plan.goal.clarityTarget}`}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--mat-green-600)]"
                      style={{ width: `${plan.clarityTargetProgress}%` }}
                    />
                  </div>
                </div>
              )}
          </section>
      </div>

      {/* Reviews */}
        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mat-eyebrow">
                Practice review
              </p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Put this week in context
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mat-muted)]">
                Compare your recent practice activity with the previous period
                and review the monthly data available so far.
              </p>
            </div>

            <Link
              href="/dashboard/progress"
              className="mat-button mat-button-secondary"
            >
              See full progress
              <Arrow className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[var(--mat-green-700)]" />

                <h3 className="font-display text-xl text-[var(--mat-ink)]">
                  This week
                </h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
                {plan.weekReview.summary}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-[var(--mat-radius-lg)] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted-light)]">
                    This week
                  </p>

                  <p className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                    {plan.weekReview.attemptsThisPeriod}
                  </p>

                  <p className="mt-1 text-xs text-[var(--mat-muted)]">
                    practice attempts
                  </p>
                </div>

                <div className="rounded-[var(--mat-radius-lg)] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted-light)]">
                    Last week
                  </p>

                  <p className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                    {plan.weekReview.attemptsLastPeriod}
                  </p>

                  <p className="mt-1 text-xs text-[var(--mat-muted)]">
                    practice attempts
                  </p>
                </div>

                {plan.weekReview.deltaPct !== null && (
                  <div className="col-span-2 rounded-[var(--mat-radius-lg)] bg-white p-4 sm:col-span-1">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted-light)]">
                      Change
                    </p>

                    <p
                      className={
                        "mt-1 font-display text-2xl " +
                        (plan.weekReview.deltaPct >= 0
                          ? "text-[var(--mat-green-700)]"
                          : "text-amber-700")
                      }
                    >
                      {plan.weekReview.deltaPct >= 0 ? "+" : ""}
                      {plan.weekReview.deltaPct}%
                    </p>

                    <p className="mt-1 text-xs text-[var(--mat-muted)]">
                      versus last week
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--mat-muted-light)]">
                Monthly view
              </p>

              <h3 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
                This month
              </h3>

              {plan.monthReview ? (
                <div className="mt-4">
                  <p className="text-sm leading-6 text-[var(--mat-muted)]">
                    In {plan.monthReview.thisMonth}, your recorded practice
                    includes the activity summarized below.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[var(--mat-radius-lg)] bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted-light)]">
                        Attempts
                      </p>

                      <p className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                        {plan.monthReview.attempts}
                      </p>
                    </div>

                    <div className="rounded-[var(--mat-radius-lg)] bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted-light)]">
                        Avg. clarity
                      </p>

                      <p className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                        {plan.monthReview.avg !== null
                          ? plan.monthReview.avg
                          : "Not measured yet"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[var(--mat-radius-lg)] border border-dashed border-[var(--mat-border-strong)] bg-white p-5">
                  <p className="text-sm font-semibold text-[var(--mat-ink)]">
                    No monthly review yet
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
                    Monthly practice data will appear here after recorded
                    practice is available for the period.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mat-eyebrow">
                Continue practicing
              </p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Put your coaching plan into practice
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mat-muted)]">
                Open Practice for the full pronunciation library, or return to
                today&apos;s recommended exercises above.
              </p>
            </div>

            <Link
              href="/dashboard/practice"
              className="mat-button mat-button-primary shrink-0"
            >
              <Mic className="h-4 w-4" />
              Open Practice
            </Link>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
