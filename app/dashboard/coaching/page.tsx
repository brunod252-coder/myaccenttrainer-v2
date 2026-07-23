import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import GoalSetter from "@/components/app/GoalSetter";
import { Sparkle, Target, Flame, Mic, Arrow, CheckCircle } from "@/components/ui/icons";
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
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e9f8f3] text-2xl">🧭</div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">Coaching</p>
          <h1 className="mt-1 font-display text-3xl text-[#17223b]">Nina&apos;s plan for you</h1>
          <p className="mt-1 text-sm text-gray-500">A fresh, personalized session every day — built from everything Nina remembers.</p>
        </div>
      </div>

      {/* Today's session */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2a20] to-[#17223b] p-7 text-white shadow-md">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-2 text-sm font-semibold text-[#7fe3ac]">
          <Sparkle className="h-4 w-4" /> Today&apos;s session
        </div>
        <h2 className="relative mt-2 font-display text-2xl">{plan.headline}</h2>
        <p className="relative mt-2 max-w-2xl text-white/85">{firstName}, {plan.motivation}</p>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          {plan.exercises.map((ex, i) => (
            <Link
              key={ex.slug + i}
              href={`/dashboard/lesson/${ex.slug}`}
              className="group rounded-xl bg-white/10 p-4 backdrop-blur transition hover:bg-white/15"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#7fe3ac]">Exercise {i + 1}</span>
                <Arrow className="h-4 w-4 text-white/70 transition group-hover:translate-x-1" />
              </div>
              <p className="mt-2 font-display text-lg">{ex.label}</p>
              <p className="mt-1 text-xs leading-5 text-white/70">{ex.why}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Goal + streak */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#20ad68]" />
            <h2 className="font-display text-lg text-[#17223b]">Your weekly goal</h2>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <p className="text-sm text-gray-500">Practice days this week</p>
            <p className="font-display text-2xl text-[#17223b]">{plan.daysThisWeek}<span className="text-base text-gray-400"> / {plan.goal.weeklyTarget}</span></p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gradient-to-r from-[#20ad68] to-[#5bc79a]" style={{ width: `${goalPct}%` }} />
          </div>
          <p className="mt-3 text-sm font-medium" style={{ color: plan.goalMet ? "#168c56" : "#8592a3" }}>
            {plan.goalMet ? "🎉 Goal reached this week — wonderful consistency!" : `${plan.goal.weeklyTarget - plan.daysThisWeek} more day(s) to hit your goal.`}
          </p>
          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="mb-2 text-sm font-semibold text-gray-600">Set your target</p>
            <GoalSetter weeklyTarget={plan.goal.weeklyTarget} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#c98a2b]" />
            <h2 className="font-display text-lg text-[#17223b]">Momentum</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Row label="Current streak" value={`${plan.streakDays} day${plan.streakDays === 1 ? "" : "s"}`} />
            <Row label="Practiced today" value={plan.practicedToday ? "Yes ✓" : "Not yet"} />
            <Row label="Clarity now" value={plan.clarityNow !== null ? String(plan.clarityNow) : "New"} />
            {plan.goal.clarityTarget && plan.clarityTargetProgress !== null && (
              <div>
                <div className="flex justify-between text-sm text-gray-500"><span>Toward clarity {plan.goal.clarityTarget}</span><span className="font-semibold text-[#17223b]">{plan.clarityTargetProgress}%</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#20ad68]" style={{ width: `${plan.clarityTargetProgress}%` }} /></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-lg text-[#17223b]"><CheckCircle className="h-5 w-5 text-[#20ad68]" /> This week in review</h2>
          <p className="mt-3 leading-7 text-gray-600">{plan.weekReview.summary}</p>
          <div className="mt-4 flex gap-6 text-sm">
            <div><span className="font-display text-2xl text-[#17223b]">{plan.weekReview.attemptsThisPeriod}</span><p className="text-gray-400">this week</p></div>
            <div><span className="font-display text-2xl text-[#52719f]">{plan.weekReview.attemptsLastPeriod}</span><p className="text-gray-400">last week</p></div>
            {plan.weekReview.deltaPct !== null && (
              <div><span className="font-display text-2xl" style={{ color: plan.weekReview.deltaPct >= 0 ? "#2e7d5b" : "#c0473f" }}>{plan.weekReview.deltaPct >= 0 ? "+" : ""}{plan.weekReview.deltaPct}%</span><p className="text-gray-400">change</p></div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-lg text-[#17223b]">📅 This month</h2>
          {plan.monthReview ? (
            <div className="mt-3">
              <p className="text-sm text-gray-600">In {plan.monthReview.thisMonth}, you recorded <span className="font-semibold text-[#17223b]">{plan.monthReview.attempts}</span> time(s) with an average clarity of <span className="font-semibold text-[#17223b]">{plan.monthReview.avg}</span>.</p>
              <Link href="/dashboard/progress" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#168c56] hover:underline">See full progress <Arrow className="h-4 w-4" /></Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Your monthly review appears once you&apos;ve practiced. Start today and watch it fill in.</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Link href="/dashboard/practice" className="inline-flex items-center gap-2 rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357]">
          <Mic className="h-4 w-4" /> Start today&apos;s session
        </Link>
      </div>
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-[#17223b]">{value}</span>
    </div>
  );
}
