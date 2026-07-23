import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import StatTile from "@/components/app/StatTile";
import VerifyBanner from "@/components/app/VerifyBanner";
import ClarityGauge from "@/components/app/ClarityGauge";
import { CheckCircle, Flame, Book, Clock, Mic, Arrow, Sparkle } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getMergedLessons } from "@/lib/lessons";
import { getClarityStats } from "@/lib/pronunciation/attempts";

const WEEK = [30, 55, 0, 40, 70, 25, 50];
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

  const [completedLessons, enrolledCourses, publishedCourses, stats, completedSlugs] =
    await Promise.all([
      prisma.lessonProgress.count({ where: { userId: payload.userId, status: "COMPLETED" } }),
      prisma.enrollment.count({ where: { userId: payload.userId } }),
      prisma.course.count({ where: { isPublished: true } }),
      getClarityStats(payload.userId),
      getCompletedSlugs(payload.userId),
    ]);

  const allLessons = await getMergedLessons();
  const nextLesson =
    allLessons.find((l) => !completedSlugs.has(l.slug)) ?? allLessons[allLessons.length - 1];
  const allDone = completedSlugs.size >= allLessons.length && allLessons.length > 0;

  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const firstName = user.firstName || "there";
  const coursesValue = enrolledCourses > 0 ? enrolledCourses : publishedCourses;

  return (
    <AppLayout userName={userName} role={user.role}>
      <VerifyBanner verified={emailVerified} />
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">Your workspace</p>
        <h1 className="mt-1 font-display text-3xl text-[#17223b]">Welcome back, {firstName} 👋</h1>
        <p className="mt-1 text-sm text-gray-500">
          Practice a little every day — Nina will help you sound clearer with each session.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Clarity score"
          value={stats.clarity !== null ? String(stats.clarity) : "New"}
          hint={stats.clarity !== null ? "Improving" : undefined}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatTile
          label="Day streak"
          value={`${stats.streakDays} ${stats.streakDays === 1 ? "day" : "days"}`}
          hint={stats.streakDays > 0 ? "Keep it going" : "Start today"}
          icon={<Flame className="h-5 w-5" />}
          iconBg="#fbefd9"
          iconColor="#c98a2b"
        />
        <StatTile
          label="Lessons completed"
          value={String(completedLessons)}
          icon={<Book className="h-5 w-5" />}
          iconBg="#e9f1f6"
          iconColor="#52719f"
        />
        <StatTile
          label={enrolledCourses > 0 ? "Courses enrolled" : "Courses available"}
          value={String(coursesValue)}
          icon={<Clock className="h-5 w-5" />}
          iconBg="#e5f3ec"
          iconColor="#2e7d5b"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-[#17223b]">Continue your path</h2>
            <span className="rounded-full bg-[#e9f8f3] px-2.5 py-1 text-xs font-semibold text-[#168c56]">
              {allDone ? "All caught up" : "Recommended"}
            </span>
          </div>

          <Link
            href={`/dashboard/lesson/${nextLesson.slug}`}
            className="mt-4 flex items-center gap-4 rounded-xl border border-transparent p-3 transition hover:border-[#d7f2e7] hover:bg-[#f6faf8]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e9f8f3] text-2xl">
              🗣️
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#17223b]">
                {nextLesson.title} — {nextLesson.subtitle}
              </p>
              <p className="text-sm text-gray-500">
                {allDone ? "Revisit any time" : `${nextLesson.difficulty} · about ${nextLesson.estimatedMinutes} min`}
              </p>
            </div>
            <Arrow className="h-5 w-5 text-[#20ad68]" />
          </Link>

          <Link
            href={`/dashboard/lesson/${nextLesson.slug}`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#20ad68] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357]"
          >
            <Mic className="h-[18px] w-[18px]" /> {allDone ? "Practice again" : "Practice with Nina"}
          </Link>

          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-[#52719f]">This week</p>
            <div className="mt-3 flex items-end gap-3" style={{ height: 120 }}>
              {WEEK.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2" style={{ height: "100%" }}>
                  <div
                    className="w-full max-w-[26px] rounded-t-md bg-gradient-to-b from-[#20ad68] to-[#178a57]"
                    style={{ height: `${v}%` }}
                  />
                  <span className="text-[11px] font-semibold text-gray-400">{DAYS[i]}</span>
                </div>
              ))}
            </div>
            {stats.attempts === 0 && (
              <p className="mt-3 text-xs text-gray-400">
                Sample activity — your real practice will show here as you record with Nina.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-[#17223b]">Clarity</h2>
              <span className="rounded-full bg-[#e9f1f6] px-2.5 py-1 text-xs font-semibold text-[#52719f]">
                {stats.clarity !== null ? "Improving" : "Getting started"}
              </span>
            </div>
            <div className="mt-2">
              <ClarityGauge value={stats.clarity} />
            </div>
            <p className="mt-2 text-center text-sm text-gray-500">
              {stats.clarity !== null
                ? `Based on your last ${Math.min(5, stats.attempts)} attempts. Keep practicing to raise it.`
                : "Record your first practice with Nina to unlock your clarity score."}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-[#17223b]">Focus sounds</h2>
            <p className="mt-1 text-sm text-gray-500">The sounds we&apos;ll work on first.</p>
            <div className="mt-4 space-y-3">
              {[
                { sym: "r", word: "red, around", color: "#d1495b" },
                { sym: "l", word: "light, really", color: "#c98a2b" },
                { sym: "θ", word: "think, three", color: "#20ad68" },
              ].map((s) => (
                <div key={s.sym} className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-11 items-center justify-center rounded-lg font-semibold"
                    style={{ background: `${s.color}18`, color: s.color }}
                  >
                    {s.sym}
                  </div>
                  <div className="text-sm text-gray-600">{s.word}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/dashboard/nina"
        className="mt-6 flex items-center gap-4 rounded-2xl border border-[#d7f2e7] bg-gradient-to-br from-[#0f2a20] to-[#17223b] p-6 text-white shadow-sm transition hover:brightness-110"
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">🤖</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#7fe3ac]">
            <Sparkle className="h-4 w-4" /> Nina&apos;s memory
          </div>
          <p className="mt-1 text-sm text-white/80">
            {stats.attempts > 0
              ? "See what Nina remembers about your voice — personal bests, your weakest sounds, and what to practice next."
              : "Once you record, Nina starts remembering your voice and coaching you personally. Take a look at what she'll track."}
          </p>
        </div>
        <Arrow className="h-5 w-5 flex-shrink-0 text-[#7fe3ac]" />
      </Link>
    </AppLayout>
  );
}
