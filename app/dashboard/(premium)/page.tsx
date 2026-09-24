import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import VerifyBanner from "@/components/app/VerifyBanner";
import ClarityGauge from "@/components/app/ClarityGauge";
import { Flame, Book, Mic, Arrow, Sparkle } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import {
  getLearningPath,
  getLearningProfile,
  getMissionLessonRecommendations,
} from "@/lib/learning";
import { prisma } from "@/lib/prisma";
import { getMergedLessons, type Lesson } from "@/lib/lessons";
import { getClarityStats } from "@/lib/pronunciation/attempts";
import { getAnalytics } from "@/lib/analytics/insights";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

async function getCompletedSlugs(userId: string): Promise<Set<string>> {
  try {
    const rows = await prisma.lessonProgress.findMany({
      where: { userId, status: "COMPLETED" },
      include: { lesson: { select: { slug: true } } },
    });
    return new Set(rows.map((r) => r.lesson.slug));
  } catch {
    return new Set();
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");

  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  // Guarded read of email-verified state (safe before migration).
  let emailVerified = true;
  try {
    const v = await (prisma as unknown as {
      user: { findUnique: (a: unknown) => Promise<{ emailVerified: boolean } | null> };
    }).user.findUnique({ where: { id: payload.userId }, select: { emailVerified: true } });
    emailVerified = v?.emailVerified ?? true;
  } catch {
    emailVerified = true;
  }

  const [
    stats,
    completedSlugs,
    allLessons,
    learningProfile,
    learningPath,
    analytics,
  ] = await Promise.all([
    getClarityStats(payload.userId),
    getCompletedSlugs(payload.userId),
    getMergedLessons(),
    getLearningProfile(payload.userId),
    getLearningPath(payload.userId),
    getAnalytics(payload.userId),
  ]);

  const bySlug = new Map(
    allLessons.map((lesson) => [lesson.slug, lesson]),
  );

  const missionRecommendations = getMissionLessonRecommendations(
    learningProfile.mission,
    3,
  );

  const missionRecommendedLessons = missionRecommendations
    .map((recommendation) => bySlug.get(recommendation.slug))
    .filter((lesson): lesson is Lesson => Boolean(lesson));

  const missionNextLesson = missionRecommendedLessons.find(
    (lesson) => !completedSlugs.has(lesson.slug),
  );


  const nextLesson = learningPath.nextLesson;

  const nextLessonIsMissionRecommended =
    Boolean(
      missionNextLesson &&
        nextLesson?.slug === missionNextLesson.slug,
    );

  const lastSevenDays = analytics.calendar.slice(-7);
  const maxDailyAttempts = Math.max(
    1,
    ...lastSevenDays.map((day) => day.count),
  );

  const allDone =
    completedSlugs.size >= allLessons.length &&
    allLessons.length > 0;

  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const firstName = user.firstName || "there";

  return (
    <AppLayout userName={userName} role={user.role}>
      <VerifyBanner verified={emailVerified} />
      <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="mat-eyebrow">
              Your learning plan
            </p>

            <h1 className="mt-3 font-display text-3xl leading-tight text-[var(--mat-ink)] sm:text-4xl">
              Welcome back, {firstName}.
            </h1>

            <p className="mt-3 text-sm font-semibold text-[var(--mat-blue)] sm:text-base">
              {learningProfile.level} · {learningProfile.mission.label}
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--mat-muted)]">
              {learningProfile.mission.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {nextLesson ? (
                <Link
                  href={`/dashboard/lesson/${nextLesson.slug}`}
                  className="mat-button mat-button-primary"
                >
                  <Mic className="h-4 w-4" />
                  Continue learning
                </Link>
              ) : (
                <Link
                  href="/dashboard/courses"
                  className="mat-button mat-button-primary"
                >
                  <Book className="h-4 w-4" />
                  View my learning
                </Link>
              )}

              <Link
                href="/dashboard/nina"
                className="mat-button mat-button-secondary"
              >
                <Sparkle className="h-4 w-4 text-[var(--mat-green-700)]" />
                Nina&apos;s guidance
              </Link>
            </div>
          </div>

          <div className="border-t border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted)]">
              Learning path
            </p>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-display text-4xl text-[var(--mat-ink)]">
                  {learningPath.percentComplete}%
                </p>

                <p className="mt-1 text-sm text-[var(--mat-muted)]">
                  {learningPath.completedLessons} of{" "}
                  {learningPath.totalLessons} lessons complete
                </p>
              </div>

              <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
                {learningPath.totalLessons === 0
                  ? "Getting started"
                  : learningPath.completedLessons === learningPath.totalLessons
                    ? "Path complete"
                    : "In progress"}
              </span>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-[var(--mat-green-700)]"
                style={{
                  width: `${learningPath.percentComplete}%`,
                }}
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[var(--mat-border)] bg-white p-3">
                <div className="flex items-center gap-1.5 text-[var(--mat-gold)]">
                  <Flame className="h-4 w-4" />
                  <strong className="text-sm text-[var(--mat-ink)]">
                    {stats.streakDays}
                  </strong>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-[var(--mat-muted)]">
                  day streak
                </p>
              </div>

              <div className="rounded-xl border border-[var(--mat-border)] bg-white p-3">
                <strong className="text-sm text-[var(--mat-ink)]">
                  {learningPath.completedLessons}
                </strong>
                <p className="mt-1 text-[11px] leading-4 text-[var(--mat-muted)]">
                  lessons done
                </p>
              </div>

              <div className="rounded-xl border border-[var(--mat-border)] bg-white p-3">
                <strong className="text-sm text-[var(--mat-ink)]">
                  {learningPath.courses.length}
                </strong>
                <p className="mt-1 text-[11px] leading-4 text-[var(--mat-muted)]">
                  courses
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mat-eyebrow">
                  Up next
                </p>

                <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
                  {nextLesson
                    ? nextLesson.title
                    : allDone
                      ? "You&apos;re caught up"
                      : "Your learning path"}
                </h2>
              </div>

              {nextLesson ? (
                <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
                  {allDone
                    ? "Available to revisit"
                    : nextLessonIsMissionRecommended
                      ? "Nina recommends"
                      : "Recommended next"}
                </span>
              ) : null}
            </div>

            {nextLesson ? (
              <>
                <p className="mt-3 text-sm font-semibold text-[var(--mat-blue)]">
                  {nextLesson.courseTitle} · {nextLesson.moduleTitle}
                </p>

                {nextLesson.description ? (
                  <p className="mt-3 text-sm leading-7 text-[var(--mat-muted)]">
                    {nextLesson.description}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  {nextLesson.difficulty ? (
                    <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
                      {nextLesson.difficulty}
                    </span>
                  ) : null}

                  {nextLesson.estimatedMinutes !== null ? (
                    <span className="mat-pill bg-[var(--mat-blue-soft)] text-[var(--mat-blue)]">
                      about {nextLesson.estimatedMinutes} min
                    </span>
                  ) : null}
                </div>

                <Link
                  href={`/dashboard/lesson/${nextLesson.slug}`}
                  className="mat-button mat-button-primary mt-6"
                >
                  <Mic className="h-4 w-4" />
                  {allDone ? "Practice again" : "Practice with Nina"}
                  <Arrow className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--mat-muted)]">
                  {allDone
                    ? "You have completed every lesson currently available. You can revisit your learning path whenever you want more practice."
                    : "There is no published next lesson available yet. Your learning path will update as curriculum becomes available."}
                </p>

                <Link
                  href="/dashboard/courses"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--mat-green-800)]"
                >
                  View my learning
                  <Arrow className="h-4 w-4" />
                </Link>
              </>
            )}
          </section>

          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted)]">
                  Practice rhythm
                </p>

                <h2 className="mt-2 font-display text-xl text-[var(--mat-ink)]">
                  Last seven days
                </h2>

                <p className="mt-1 text-sm text-[var(--mat-muted)]">
                  {analytics.hasData
                    ? "Your actual recording activity with Nina."
                    : "Your practice activity will appear here after your first recording."}
                </p>
              </div>

              <Link
                href="/dashboard/progress"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--mat-green-800)]"
              >
                Full progress
                <Arrow className="h-4 w-4" />
              </Link>
            </div>

            <div
              className="mt-6 flex items-end gap-3"
              style={{ height: 128 }}
            >
              {lastSevenDays.map((day, i) => {
                const height =
                  day.count > 0
                    ? Math.max(
                        18,
                        Math.round(
                          (day.count / maxDailyAttempts) * 100,
                        ),
                      )
                    : 4;

                return (
                  <div
                    key={day.date}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-[11px] font-semibold text-[var(--mat-muted)]">
                      {day.count > 0 ? day.count : ""}
                    </span>

                    <div
                      title={`${day.date}: ${day.count} ${
                        day.count === 1 ? "recording" : "recordings"
                      }`}
                      className={
                        day.count > 0
                          ? "w-full max-w-[30px] rounded-t-lg bg-[var(--mat-green-700)]"
                          : "w-full max-w-[30px] rounded-t-lg bg-[var(--mat-border)]"
                      }
                      style={{ height: `${height}%` }}
                    />

                    <span className="text-[11px] font-bold text-[var(--mat-muted)]">
                      {DAYS[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted)]">
                  Speaking clarity
                </p>
                <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
                  Your clarity score
                </h2>
              </div>

              <span className="mat-pill bg-[var(--mat-blue-soft)] text-[var(--mat-blue)]">
                {stats.clarity !== null ? "Improving" : "Getting started"}
              </span>
            </div>

            <div className="mt-3">
              <ClarityGauge value={stats.clarity} />
            </div>

            <p className="mt-2 text-center text-sm leading-6 text-[var(--mat-muted)]">
              {stats.clarity !== null
                ? `Based on your last ${Math.min(5, stats.attempts)} attempts. Keep practicing to improve it.`
                : "Record your first practice with Nina to unlock your clarity score."}
            </p>

            <Link
              href="/dashboard/practice"
              className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-[var(--mat-green-800)]"
            >
              Practice pronunciation
              <Arrow className="h-4 w-4" />
            </Link>
          </section>

          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
            <p className="mat-eyebrow">
              Personalized priorities
            </p>

            <h2 className="mt-2 font-display text-xl text-[var(--mat-ink)]">
              Focused on your {learningProfile.mission.shortLabel} goal
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
              Nina is prioritizing these lessons from your existing curriculum.
            </p>

            <div className="mt-5 space-y-2">
              {missionRecommendedLessons.map((lesson, index) => (
                <Link
                  key={lesson.slug}
                  href={`/dashboard/lesson/${lesson.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-3 transition hover:border-[var(--mat-border-green)] hover:bg-[var(--mat-green-50)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--mat-green-100)] text-sm font-bold text-[var(--mat-green-700)]">
                    {index + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--mat-ink)]">
                      {lesson.subtitle}
                    </span>

                    <span className="mt-0.5 block text-xs text-[var(--mat-muted)]">
                      {completedSlugs.has(lesson.slug)
                        ? "Completed"
                        : nextLesson?.slug === lesson.slug &&
                            nextLessonIsMissionRecommended
                          ? "Recommended next"
                          : "In your learning plan"}
                    </span>
                  </span>

                  <Arrow className="h-4 w-4 shrink-0 text-[var(--mat-green-700)]" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <Link
        href="/dashboard/nina"
        className="mt-6 flex items-center gap-4 rounded-[var(--mat-radius-xl)] border border-[var(--mat-green-700)] bg-[var(--mat-green-800)] p-6 text-white shadow-[var(--mat-shadow-sm)] transition hover:bg-[var(--mat-green-900)]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[var(--mat-green-200)]">
          <Sparkle className="h-6 w-6" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-green-200)]">
            Nina&apos;s memory
          </span>

          <span className="mt-1 block text-sm leading-6 text-white/75">
            {stats.attempts > 0
              ? "See what Nina remembers about your practice and, once measured, the speech patterns that can guide what to work on next."
              : "Once you record, Nina starts building your personal speaking history and coaching context."}
          </span>
        </span>

        <Arrow className="h-5 w-5 shrink-0 text-[var(--mat-green-200)]" />
      </Link>
    </AppLayout>
  );
}
