import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import StatTile from "@/components/app/StatTile";
import { CheckCircle, Flame, Book, Clock } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getProgressData } from "@/lib/pronunciation/attempts";
import { getAnalytics } from "@/lib/analytics/insights";

const SAMPLE_TREND = [58, 61, 60, 64, 67, 69, 72, 74];
const SAMPLE_SOUNDS: { label: string; score: number }[] = [
  { label: "R / L", score: 62 }, { label: "TH", score: 54 }, { label: "V / W", score: 70 },
  { label: "Final sounds", score: 66 }, { label: "Word stress", score: 78 },
];
const LEVEL_COLORS = ["#eef2f7", "#d7f2e7", "#8fdcb6", "#4cc088", "#20ad68"];

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
  const trend = hasTrend ? progress.trend : SAMPLE_TREND;
  const sounds = hasSounds ? progress.soundMastery : SAMPLE_SOUNDS;

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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">Your progress</p>
          <h1 className="mt-1 font-display text-3xl text-[#17223b]">Track your clarity over time</h1>
          <p className="mt-1 text-sm text-gray-500">
            {progress.attempts > 0
              ? `You've recorded ${progress.attempts} ${progress.attempts === 1 ? "attempt" : "attempts"} so far. Keep going!`
              : "Your numbers grow as you practice with Nina. Charts below are samples until you record."}
          </p>
        </div>
        {analytics.hasData && (
          <a
            href="/api/progress/export"
            className="hidden shrink-0 items-center gap-2 rounded-lg border border-[#20ad68] px-4 py-2.5 text-sm font-semibold text-[#168c56] transition hover:bg-[#e9f8f3] sm:inline-flex"
          >
            ⬇ Export report
          </a>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Clarity score" value={progress.clarity !== null ? String(progress.clarity) : "New"} icon={<CheckCircle className="h-5 w-5" />} />
        <StatTile label="Day streak" value={`${progress.streakDays} ${progress.streakDays === 1 ? "day" : "days"}`} icon={<Flame className="h-5 w-5" />} iconBg="#fbefd9" iconColor="#c98a2b" />
        <StatTile label="Lessons completed" value={String(completedLessons)} icon={<Book className="h-5 w-5" />} iconBg="#e9f1f6" iconColor="#52719f" />
        <StatTile label="Speaking time" value={`${analytics.speakingMinutes} min`} icon={<Clock className="h-5 w-5" />} iconBg="#e5f3ec" iconColor="#2e7d5b" />
      </div>

      {/* Practice calendar */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-[#17223b]">Practice calendar</h2>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            Less
            {LEVEL_COLORS.map((c) => (
              <span key={c} className="h-3 w-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            More
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">Your last 12 weeks. Small, steady practice beats cramming.</p>
        <div className="mt-4 overflow-x-auto">
          <div
            className="grid w-max gap-1"
            style={{ gridTemplateRows: "repeat(7, 13px)", gridAutoFlow: "column", gridAutoColumns: "13px" }}
          >
            {analytics.calendar.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} ${d.count === 1 ? "recording" : "recordings"}`}
                className="rounded-sm"
                style={{ backgroundColor: LEVEL_COLORS[d.level] }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-[#17223b]">Clarity over time</h2>
            <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + (hasTrend ? "bg-[#e5f3ec] text-[#2e7d5b]" : "bg-[#e9f1f6] text-[#52719f]")}>
              {hasTrend ? "Your attempts" : "Sample"}
            </span>
          </div>
          <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-auto w-full">
            {[0, 25, 50, 75, 100].map((g) => (
              <g key={g}>
                <line x1={x0} x2={x1} y1={y(g)} y2={y(g)} stroke="#eef2f7" />
                <text x="10" y={y(g) + 4} fontSize="11" fill="#9aa9ba">{g}</text>
              </g>
            ))}
            <polyline fill="none" stroke="#20ad68" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
            {trend.map((v, i) => (
              <circle key={i} cx={x0 + i * step} cy={y(v)} r="4" fill="#fff" stroke="#20ad68" strokeWidth="2.5" />
            ))}
          </svg>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-[#17223b]">Sound mastery</h2>
            {!hasSounds && <span className="rounded-full bg-[#e9f1f6] px-2.5 py-1 text-xs font-semibold text-[#52719f]">Sample</span>}
          </div>
          <div className="mt-4 space-y-4">
            {sounds.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-28 text-sm font-medium text-gray-600">{s.label}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: barColor(s.score) }} />
                </div>
                <div className="w-8 text-right text-sm font-semibold" style={{ color: barColor(s.score) }}>{s.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly progress + recent activity */}
      {analytics.hasData && (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-[#17223b]">Monthly progress</h2>
            <p className="mt-1 text-sm text-gray-500">Recordings and average clarity by month.</p>
            <div className="mt-5 flex items-end gap-4" style={{ height: 150 }}>
              {analytics.months.map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center justify-end gap-2" style={{ height: "100%" }}>
                  <span className="text-xs font-semibold text-[#17223b]">{m.avg}</span>
                  <div
                    className="w-full max-w-[46px] rounded-t-lg bg-gradient-to-b from-[#20ad68] to-[#178a57]"
                    style={{ height: `${(m.attempts / maxMonth) * 100}%`, minHeight: 6 }}
                    title={`${m.attempts} recordings · avg clarity ${m.avg}`}
                  />
                  <span className="text-[11px] font-medium text-gray-400">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-[#17223b]">Recent activity</h2>
            <div className="mt-4 space-y-1">
              {analytics.timeline.map((t, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-gray-50 py-2.5 last:border-none">
                  <div className="w-14 text-xs font-medium text-gray-400">{t.date}</div>
                  <div className="flex-1 text-sm text-[#17223b]">{t.label}</div>
                  <div className="text-sm font-semibold" style={{ color: barColor(t.overall) }}>{t.overall}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg text-[#17223b]">Achievements</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {achievements.map(([emoji, name, unlocked]) => (
            <div key={name} className={"flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center " + (unlocked ? "" : "opacity-45 grayscale")}>
              <div className={"flex h-12 w-12 items-center justify-center rounded-full text-2xl " + (unlocked ? "bg-[#e9f8f3]" : "bg-gray-100")}>{emoji}</div>
              <p className="text-xs font-semibold text-[#17223b]">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
