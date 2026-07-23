import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import { Sparkle, Flame, CheckCircle, Chart, Mic, Arrow } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getNinaBrain } from "@/lib/nina/brain";
import { listRecordings } from "@/lib/pronunciation/recordings";

const REC_LABELS: Record<string, string> = {
  r: "American R", l: "The L sound", th: "TH", v: "V and W", w: "V and W",
  sh: "SH", ee: "Vowels", stress: "Word stress", endings: "Final sounds", linking: "Linking",
};
function recLabel(focus: string | null): string {
  if (!focus) return "Practice";
  return REC_LABELS[focus] || focus;
}

function statusPill(status: string): { text: string; cls: string } {
  switch (status) {
    case "mastered": return { text: "Mastered", cls: "bg-[#e9f8f3] text-[#168c56]" };
    case "improving": return { text: "Improving", cls: "bg-[#e5f3ec] text-[#2e7d5b]" };
    case "needs-work": return { text: "Slipping", cls: "bg-[#fdecec] text-[#c0473f]" };
    case "weakest": return { text: "Focus here", cls: "bg-[#fbefd9] text-[#8a5a17]" };
    default: return { text: "Steady", cls: "bg-[#eef4f9] text-[#52719f]" };
  }
}
function barColor(score: number): string {
  if (score >= 85) return "#20ad68";
  if (score >= 70) return "#3ecb8a";
  if (score >= 60) return "#c98a2b";
  return "#d1495b";
}

export default async function NinaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");
  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  const [brain, recordings] = await Promise.all([
    getNinaBrain(payload.userId),
    listRecordings(payload.userId),
  ]);
  const firstName = user.firstName || "there";
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e9f8f3] text-2xl">🤖</div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">Nina&apos;s memory</p>
          <h1 className="mt-1 font-display text-3xl text-[#17223b]">What Nina knows about your voice</h1>
          <p className="mt-1 text-sm text-gray-500">Everything she remembers from your practice — and what she suggests next.</p>
        </div>
      </div>

      {!brain.hasData ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f8f3] text-3xl">🎙️</div>
          <h2 className="mt-4 font-display text-xl text-[#17223b]">Nina hasn&apos;t heard you yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{brain.longTerm}</p>
          <Link href="/dashboard/practice" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357]">
            <Mic className="h-4 w-4" /> Start practicing
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Nina's read — narrative + headline stats */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2a20] to-[#17223b] p-7 text-white shadow-md">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/5" />
            <div className="relative flex items-center gap-2 text-sm font-semibold text-[#7fe3ac]">
              <Sparkle className="h-4 w-4" /> Nina&apos;s read on you
            </div>
            <p className="relative mt-3 max-w-2xl font-display text-lg leading-relaxed text-white/90">
              {firstName}, {brain.longTerm}
            </p>
            <div className="relative mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat value={brain.clarity !== null ? String(brain.clarity) : "—"} label="Clarity now" />
              <Stat value={brain.personalBest ? String(brain.personalBest.overall) : "—"} label="Personal best" />
              <Stat value={`${brain.totalAttempts}`} label="Recordings" />
              <Stat value={`${brain.streakDays}d`} label="Streak" />
            </div>
          </div>

          {/* Comparison + plan */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg text-[#17223b]">Your last attempt</h2>
              {brain.latest && (
                <div className="mt-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-4xl text-[#17223b]">{brain.latest.overall}</span>
                    <span className="text-sm text-gray-500">on {brain.latest.label}</span>
                  </div>
                  {brain.comparison ? (
                    <p className={"mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold " +
                      (brain.comparison.direction === "up" ? "bg-[#e5f3ec] text-[#2e7d5b]"
                        : brain.comparison.direction === "down" ? "bg-[#fdecec] text-[#c0473f]"
                        : "bg-[#eef4f9] text-[#52719f]")}>
                      {brain.comparison.direction === "up" ? "▲" : brain.comparison.direction === "down" ? "▼" : "—"}
                      {brain.comparison.delta > 0 ? "+" : ""}{brain.comparison.delta} vs. your previous {brain.latest.label} attempt ({brain.comparison.previous})
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">First time on this sound — Nina will compare your next one.</p>
                  )}
                </div>
              )}
            </div>

            {brain.plan && (
              <div className="rounded-2xl border border-[#d7f2e7] bg-[#f6fdfa] p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#168c56]">
                  <Sparkle className="h-4 w-4" /> Nina&apos;s plan for tomorrow
                </div>
                <h2 className="mt-2 font-display text-lg text-[#17223b]">Focus on {brain.plan.label}</h2>
                <p className="mt-2 text-sm text-gray-600">{brain.plan.reason}</p>
                <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Warm-up phrase</p>
                  <p className="mt-1 font-display text-[#52719f]">“{brain.plan.phrase}”</p>
                </div>
                <Link href="/dashboard/practice" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#20ad68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#169357]">
                  <Mic className="h-4 w-4" /> Practice this now
                </Link>
              </div>
            )}
          </div>

          {/* Sound-by-sound intelligence */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Chart className="h-5 w-5 text-[#20ad68]" />
              <h2 className="font-display text-lg text-[#17223b]">Sound by sound</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">How each sound is trending across everything you&apos;ve recorded.</p>
            <div className="mt-5 space-y-3">
              {brain.sounds.map((s) => {
                const pill = statusPill(s.status);
                return (
                  <div key={s.focus} className="flex items-center gap-4">
                    <div className="w-32 flex-shrink-0 text-sm font-medium text-[#17223b]">{s.label}</div>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${s.avg}%`, backgroundColor: barColor(s.avg) }} />
                    </div>
                    <div className="w-9 text-right text-sm font-semibold" style={{ color: barColor(s.avg) }}>{s.avg}</div>
                    <div className="hidden w-24 text-right text-xs text-gray-400 sm:block">
                      {s.delta > 0 ? `+${s.delta}` : s.delta} trend
                    </div>
                    <span className={"w-24 flex-shrink-0 rounded-full px-2.5 py-1 text-center text-[11px] font-semibold " + pill.cls}>{pill.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insight cards row */}
          <div className="grid gap-5 sm:grid-cols-3">
            <InsightCard title="Strongest sound" emoji="🌟" value={brain.strongest?.label ?? "—"}
              detail={brain.strongest ? `${brain.strongest.avg} average — ${brain.mastered.length ? "mastered" : "your most reliable"}` : ""} />
            <InsightCard title="Biggest opportunity" emoji="🎯" value={brain.weakest?.label ?? "—"}
              detail={brain.weakest ? `${brain.weakest.avg} average — the fastest way to lift clarity` : ""} />
            <InsightCard title="Most practiced" emoji="🔁" value={brain.mostPracticed?.label ?? "—"}
              detail={brain.mostPracticed ? `${brain.mostPracticed.attempts} recordings so far` : ""} />
          </div>

          {/* Improvement & regression */}
          {(brain.improving.length > 0 || brain.regressing.length > 0) && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-display text-lg text-[#17223b]"><span>📈</span> Getting better</h2>
                {brain.improving.length ? (
                  <ul className="mt-3 space-y-2">
                    {brain.improving.map((s) => (
                      <li key={s.focus} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{s.label}</span>
                        <span className="font-semibold text-[#2e7d5b]">+{s.delta} points</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-sm text-gray-500">Keep going — improvements will show here.</p>}
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-display text-lg text-[#17223b]"><span>👀</span> Worth revisiting</h2>
                {brain.regressing.length ? (
                  <ul className="mt-3 space-y-2">
                    {brain.regressing.map((s) => (
                      <li key={s.focus} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{s.label}</span>
                        <span className="font-semibold text-[#c0473f]">{s.delta} points</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-sm text-gray-500">Nothing slipping — nicely consistent.</p>}
              </div>
            </div>
          )}

          {/* Voice history — replay past takes */}
          {recordings.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-display text-lg text-[#17223b]"><Mic className="h-5 w-5 text-[#20ad68]" /> Your recent recordings</h2>
              <p className="mt-1 text-sm text-gray-500">Listen back to your last few takes and hear yourself improve.</p>
              <div className="mt-4 space-y-3">
                {recordings.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-[#f8fbfa] p-4">
                    <div className="min-w-[140px]">
                      <p className="text-sm font-semibold text-[#17223b]">{recLabel(r.focus)}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                    {typeof r.overall === "number" && (
                      <span className="rounded-full bg-[#e9f8f3] px-2.5 py-1 text-xs font-semibold text-[#168c56]">{r.overall}% clarity</span>
                    )}
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <audio controls preload="none" src={`/api/recordings/${r.id}`} className="h-9 flex-1 min-w-[220px]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg text-[#17223b]"><CheckCircle className="h-5 w-5 text-[#20ad68]" /> Milestones</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {brain.milestones.map((m) => (
                <div key={m.key} className={"rounded-xl border border-gray-100 p-4 text-center " + (m.reached ? "" : "opacity-45")}>
                  <div className={"mx-auto flex h-11 w-11 items-center justify-center rounded-full text-xl " + (m.reached ? "bg-[#e9f8f3]" : "bg-gray-100")}>
                    {m.reached ? "🏅" : "🔒"}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#17223b]">{m.label}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{m.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl text-white">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

function InsightCard({ title, emoji, value, detail }: { title: string; emoji: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <span className="text-base">{emoji}</span> {title}
      </div>
      <p className="mt-2 font-display text-lg text-[#17223b]">{value}</p>
      {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
    </div>
  );
}
