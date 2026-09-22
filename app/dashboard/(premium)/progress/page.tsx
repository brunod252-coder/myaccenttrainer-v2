import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getProgressData } from "@/lib/pronunciation/attempts";
import { getAnalytics } from "@/lib/analytics/insights";


function barColor(score: number): string {
  if (score >= 75) return "#20ad68";
  if (score >= 60) return "#c98a2b";
  return "#d1495b";
}

export default async function ProgressPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");
  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  const [completedLessons, progress, analytics] = await Promise.all([
    prisma.lessonProgress.count({ where: { userId: payload.userId, status: "COMPLETED" } }),
    getProgressData(payload.userId),
    getAnalytics(payload.userId),
  ]);

  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const hasTrend = progress.trend.length >= 2;
  const hasSounds = progress.soundMastery.length > 0;
  const trend = progress.trend;
  const sounds = progress.soundMastery;

  const thScore = progress.soundMastery.find((s) => s.label === "TH")?.score ?? 0;
  const achievements: [string, string, boolean][] = [
    ["🔥", "First practice", progress.attempts >= 1],
    ["🎯", "10 recordings", progress.attempts >= 10],
    ["📈", "Clarity 70+", progress.clarity !== null && progress.clarity >= 70],
    ["🗣️", "TH mastered", thScore >= 80],
    ["🏅", "7-day streak", progress.streakDays >= 7],
    ["🎓", "Course graduate", completedLessons >= 10],
  ];

  const w = 520, h = 200, x0 = 40, x1 = 510;
  const step = trend.length > 1 ? (x1 - x0) / (trend.length - 1) : 0;
  const y = (v: number) => 170 - (v / 100) * 150;
  const points = trend.map((v, i) => `${x0 + i * step},${y(v)}`).join(" ");
  const maxMonth = Math.max(1, ...analytics.months.map((m) => m.attempts));

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-6">
        <header className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mat-eyebrow">
                Progress
              </p>

              <h1 className="mt-2 font-display text-3xl text-[var(--mat-ink)] md:text-4xl">
                See what your practice is producing
              </h1>

              <p className="mt-3 text-sm leading-7 text-[var(--mat-muted)] sm:text-base">
                Follow your clarity, consistency, completed lessons, and the
                sounds you&apos;re strengthening through scored practice.
              </p>
            </div>

            {analytics.hasData && (
              <a
                href="/api/progress/export"
                className="mat-button mat-button-secondary"
              >
                Export progress
              </a>
            )}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5">
              <p className="text-sm font-semibold text-[var(--mat-green-800)]">
                Clarity
              </p>

              <p className="mt-2 font-display text-3xl text-[var(--mat-green-700)]">
                {progress.clarity === null ? "—" : `${progress.clarity}%`}
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                {progress.clarity === null
                  ? "Complete scored practice to establish your clarity."
                  : "Average across your scored attempts."}
              </p>
            </div>

            <div className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5">
              <p className="text-sm font-semibold text-[var(--mat-ink)]">
                Scored attempts
              </p>

              <p className="mt-2 font-display text-3xl text-[var(--mat-ink)]">
                {progress.attempts}
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                Practice recordings with a score.
              </p>
            </div>

            <div className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5">
              <p className="text-sm font-semibold text-[var(--mat-ink)]">
                Current streak
              </p>

              <p className="mt-2 font-display text-3xl text-[var(--mat-ink)]">
                {progress.streakDays}
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                {progress.streakDays === 1 ? "day" : "days"} of practice
                consistency.
              </p>
            </div>

            <div className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5">
              <p className="text-sm font-semibold text-[var(--mat-ink)]">
                Lessons complete
              </p>

              <p className="mt-2 font-display text-3xl text-[var(--mat-ink)]">
                {completedLessons}
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                Lessons you&apos;ve reached the end of.
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-[var(--mat-muted)]">
            {progress.attempts > 0
              ? `You've recorded ${progress.attempts} ${progress.attempts === 1 ? "attempt" : "attempts"} so far. Keep going!`
              : "Your progress will appear here as you complete scored practice attempts with Nina."}
          </p>
        </header>

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mat-eyebrow">
                Practice consistency
              </p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Your last 12 weeks
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                Each square reflects the number of scored attempts recorded on
                that day.
              </p>
            </div>

            <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
              {progress.streakDays} {progress.streakDays === 1 ? "day" : "days"} current streak
            </span>
          </div>

          <div className="mt-6 overflow-x-auto pb-1">
            <div className="grid min-w-[700px] grid-flow-col grid-rows-7 gap-1">
              {analytics.calendar.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} ${day.count === 1 ? "attempt" : "attempts"}`}
                  className={
                    "h-3.5 w-3.5 rounded-[3px] " +
                    (day.count === 0
                      ? "bg-[var(--mat-surface-soft)]"
                      : day.count === 1
                        ? "bg-[var(--mat-green-100)]"
                        : day.count === 2
                          ? "bg-[var(--mat-green-300)]"
                          : "bg-[var(--mat-green-700)]")
                  }
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--mat-muted)]">
            <span>84 days of practice history</span>

            <div className="flex items-center gap-2">
              <span>Less</span>
              <span className="h-3 w-3 rounded-[3px] bg-[var(--mat-surface-soft)]" />
              <span className="h-3 w-3 rounded-[3px] bg-[var(--mat-green-100)]" />
              <span className="h-3 w-3 rounded-[3px] bg-[var(--mat-green-300)]" />
              <span className="h-3 w-3 rounded-[3px] bg-[var(--mat-green-700)]" />
              <span>More</span>
            </div>
          </div>
        </section>

<div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg text-[#17223b]">
                Clarity over time
              </h2>

              {hasTrend && (
                <span className="rounded-full bg-[#e5f3ec] px-2.5 py-1 text-xs font-semibold text-[#2e7d5b]">
                  Your attempts
                </span>
              )}
            </div>

            {hasTrend ? (
              <svg
                viewBox={`0 0 ${w} ${h}`}
                className="mt-4 h-auto w-full"
                role="img"
                aria-label="Clarity scores across your recent scored attempts"
              >
                {[0, 25, 50, 75, 100].map((g) => (
                  <g key={g}>
                    <line
                      x1={x0}
                      x2={x1}
                      y1={y(g)}
                      y2={y(g)}
                      stroke="#eef2f7"
                    />
                    <text
                      x="10"
                      y={y(g) + 4}
                      fontSize="11"
                      fill="#9aa9ba"
                    >
                      {g}
                    </text>
                  </g>
                ))}

                <polyline
                  fill="none"
                  stroke="#20ad68"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />

                {trend.map((v, i) => (
                  <circle
                    key={i}
                    cx={x0 + i * step}
                    cy={y(v)}
                    r="4"
                    fill="#fff"
                    stroke="#20ad68"
                    strokeWidth="2.5"
                  />
                ))}
              </svg>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-[#f8fbfa] p-6">
                <p className="font-semibold text-[#17223b]">
                  Your clarity trend will appear here
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Complete at least two scored practice attempts so we can show
                  how your clarity changes over time.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg text-[#17223b]">
                Sound mastery
              </h2>

              {hasSounds && (
                <span className="rounded-full bg-[#e5f3ec] px-2.5 py-1 text-xs font-semibold text-[#2e7d5b]">
                  {sounds.length} {sounds.length === 1 ? "sound" : "sounds"}
                </span>
              )}
            </div>

            {hasSounds ? (
              <div className="mt-4 space-y-4">
                {sounds.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-28 text-sm font-medium text-gray-600">
                      {s.label}
                    </div>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${s.score}%`,
                          backgroundColor: barColor(s.score),
                        }}
                      />
                    </div>

                    <div
                      className="w-8 text-right text-sm font-semibold"
                      style={{ color: barColor(s.score) }}
                    >
                      {s.score}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-[#f8fbfa] p-6">
                <p className="font-semibold text-[#17223b]">
                  Sound mastery starts with scored practice
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Practice focused sounds and Nina will show which ones are
                  becoming clearer and which ones need more attention.
                </p>
              </div>
            )}
          </div>
        </div>

      {/* Monthly progress + recent activity */}
        {analytics.hasData && (
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
              <div>
                <p className="mat-eyebrow">
                  Longer view
                </p>

                <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  Monthly progress
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                  Scored recordings and average clarity across recent months.
                </p>
              </div>

              <div
                className="mt-7 flex items-end gap-3 sm:gap-4"
                style={{ height: 170 }}
              >
                {analytics.months.map((m) => (
                  <div
                    key={m.label}
                    className="flex flex-1 flex-col items-center justify-end gap-2"
                    style={{ height: "100%" }}
                  >
                    <span className="text-xs font-bold text-[var(--mat-ink)]">
                      {m.avg}
                    </span>

                    <div
                      className="w-full max-w-[46px] rounded-t-lg bg-gradient-to-b from-[var(--mat-green-500)] to-[var(--mat-green-700)]"
                      style={{
                        height: `${(m.attempts / maxMonth) * 100}%`,
                        minHeight: 6,
                      }}
                      title={`${m.attempts} recordings · avg clarity ${m.avg}`}
                    />

                    <span className="text-[11px] font-semibold text-[var(--mat-muted-light)]">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-5 text-[var(--mat-muted)]">
                Bar height reflects the number of scored recordings. The number
                above each bar is average clarity.
              </p>
            </div>

            <div className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
              <div>
                <p className="mat-eyebrow">
                  Latest practice
                </p>

                <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  Recent activity
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                  Your newest scored practice attempts.
                </p>
              </div>

              <div className="mt-5 divide-y divide-[var(--mat-border)]">
                {analytics.timeline.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="w-16 shrink-0 text-xs font-semibold text-[var(--mat-muted-light)]">
                      {t.date}
                    </div>

                    <div className="min-w-0 flex-1 text-sm font-medium text-[var(--mat-ink)]">
                      {t.label}
                    </div>

                    <div
                      className="shrink-0 rounded-lg bg-[var(--mat-surface-soft)] px-2.5 py-1 text-sm font-bold"
                      style={{ color: barColor(t.overall) }}
                    >
                      {t.overall}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mat-eyebrow">
                Milestones
              </p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Achievements
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                Milestones unlock from your actual practice, clarity, streak,
                sound scores, and completed lessons.
              </p>
            </div>

            <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
              {achievements.filter(([, , unlocked]) => unlocked).length} of{" "}
              {achievements.length} unlocked
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {achievements.map(([emoji, name, unlocked]) => (
              <div
                key={name}
                className={
                  "flex min-h-32 flex-col items-center justify-center gap-3 rounded-[var(--mat-radius-lg)] border p-4 text-center transition " +
                  (unlocked
                    ? "border-[var(--mat-border-green)] bg-[var(--mat-green-50)]"
                    : "border-[var(--mat-border)] bg-[var(--mat-surface-soft)] opacity-55")
                }
              >
                <div
                  className={
                    "flex h-12 w-12 items-center justify-center rounded-full text-2xl " +
                    (unlocked
                      ? "bg-white shadow-[var(--mat-shadow-sm)]"
                      : "bg-white")
                  }
                  aria-hidden="true"
                >
                  {emoji}
                </div>

                <p className="text-xs font-bold leading-5 text-[var(--mat-ink)]">
                  {name}
                </p>

                <span
                  className={
                    "text-[11px] font-semibold " +
                    (unlocked
                      ? "text-[var(--mat-green-700)]"
                      : "text-[var(--mat-muted-light)]")
                  }
                >
                  {unlocked ? "Unlocked" : "In progress"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
