import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import { Sparkle, CheckCircle, Mic } from "@/components/ui/icons";
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
      <header className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mat-eyebrow">
                Nina&apos;s memory
              </p>

              <h1 className="mt-2 font-display text-3xl text-[var(--mat-ink)] md:text-4xl">
                What Nina has learned from your voice
              </h1>

              <p className="mt-3 text-sm leading-7 text-[var(--mat-muted)] sm:text-base">
                Nina uses your scored speaking attempts to track patterns in
                your clarity, sounds, consistency, and progress over time.
              </p>
            </div>

            {brain.hasData && (
              <Link
                href="/dashboard/coaching"
                className="mat-button mat-button-secondary"
              >
                Open my coaching plan
              </Link>
            )}
          </div>
        </header>

        {!brain.hasData ? (
        <div className="mat-empty-state mt-6">
          <p className="mat-eyebrow">
            Your speaking history starts here
          </p>

          <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
            Nina hasn&apos;t heard you yet
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--mat-muted)]">
            Record your first scored practice attempt and Nina can begin
            identifying your clarity, sound patterns, progress, and useful
            areas to practice next.
          </p>

          <Link
            href="/dashboard/practice"
            className="mat-button mat-button-primary mt-6"
          >
            <Mic className="h-4 w-4" />
            Start practicing
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Nina's read — narrative + headline stats */}
          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6 sm:p-7">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--mat-green-800)]">
                <Sparkle className="h-4 w-4" />
                Nina&apos;s read on your practice
              </div>

              <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--mat-ink)]">
                {firstName}, {brain.longTerm}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  value={brain.clarity !== null ? String(brain.clarity) : "—"}
                  label="Clarity now"
                />

                <Stat
                  value={brain.personalBest ? String(brain.personalBest.overall) : "—"}
                  label="Personal best"
                />

                <Stat
                  value={`${brain.totalAttempts}`}
                  label="Scored recordings"
                />

                <Stat
                  value={`${brain.streakDays}d`}
                  label="Current streak"
                />
              </div>
            </section>

            {/* Latest evidence + next practice */}
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
                <p className="mat-eyebrow">
                  Latest evidence
                </p>

                <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  Your last scored attempt
                </h2>

                {brain.latest ? (
                  <div className="mt-5">
                    <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                      <span className="font-display text-4xl text-[var(--mat-ink)]">
                        {brain.latest.overall}
                      </span>

                      <span className="pb-1 text-sm text-[var(--mat-muted)]">
                        on {brain.latest.label}
                      </span>
                    </div>

                    {brain.comparison ? (
                      <div
                        className={
                          "mt-4 rounded-[var(--mat-radius-lg)] border p-4 " +
                          (brain.comparison.direction === "up"
                            ? "border-[var(--mat-border-green)] bg-[var(--mat-green-50)]"
                            : brain.comparison.direction === "down"
                              ? "border-amber-200 bg-amber-50"
                              : "border-[var(--mat-border)] bg-[var(--mat-surface-soft)]")
                        }
                      >
                        <p
                          className={
                            "text-sm font-bold " +
                            (brain.comparison.direction === "up"
                              ? "text-[var(--mat-green-800)]"
                              : brain.comparison.direction === "down"
                                ? "text-amber-800"
                                : "text-[var(--mat-blue)]")
                          }
                        >
                          {brain.comparison.direction === "up"
                            ? "Improved"
                            : brain.comparison.direction === "down"
                              ? "Lower than last time"
                              : "Holding steady"}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
                          {brain.comparison.delta > 0 ? "+" : ""}
                          {brain.comparison.delta} points compared with your
                          previous {brain.latest.label} attempt, which scored{" "}
                          {brain.comparison.previous}.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4">
                        <p className="text-sm font-semibold text-[var(--mat-ink)]">
                          First scored attempt on this sound
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
                          Nina can compare it after you record this sound again.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-6 text-[var(--mat-muted)]">
                    Your latest scored attempt will appear here after you
                    practice.
                  </p>
                )}
              </section>

              {brain.plan ? (
                <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6 shadow-[var(--mat-shadow-sm)]">
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--mat-green-800)]">
                    <Sparkle className="h-4 w-4" />
                    Nina&apos;s next practice focus
                  </div>

                  <h2 className="mt-3 font-display text-2xl text-[var(--mat-ink)]">
                    Focus on {brain.plan.label}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-[var(--mat-muted)]">
                    {brain.plan.reason}
                  </p>

                  <div className="mt-5 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted-light)]">
                      Practice phrase
                    </p>

                    <p className="mt-2 font-display text-lg leading-7 text-[var(--mat-blue)]">
                      “{brain.plan.phrase}”
                    </p>
                  </div>

                  <Link
                    href="/dashboard/practice"
                    className="mat-button mat-button-primary mt-5"
                  >
                    <Mic className="h-4 w-4" />
                    Practice this now
                  </Link>
                </section>
              ) : (
                <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
                  <p className="mat-eyebrow">
                    Next practice
                  </p>

                  <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                    Nina is still learning your patterns
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-[var(--mat-muted)]">
                    Keep practicing and Nina will use your scored attempts to
                    identify a useful sound to focus on next.
                  </p>

                  <Link
                    href="/dashboard/practice"
                    className="mat-button mat-button-secondary mt-5"
                  >
                    <Mic className="h-4 w-4" />
                    Keep practicing
                  </Link>
                </section>
              )}
            </div>

            {/* Sound intelligence */}
            <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mat-eyebrow">
                    Sound intelligence
                  </p>

                  <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                    Sound by sound
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mat-muted)]">
                    Nina groups your scored attempts by practice sound to show
                    current averages and recent direction.
                  </p>
                </div>

                <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
                  {brain.sounds.length} {brain.sounds.length === 1 ? "sound" : "sounds"} tracked
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {brain.sounds.map((s) => {
                  const pill = statusPill(s.status);

                  return (
                    <div
                      key={s.focus}
                      className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4"
                    >
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                        <div className="min-w-32 flex-1">
                          <p className="text-sm font-bold text-[var(--mat-ink)]">
                            {s.label}
                          </p>

                          <p className="mt-1 text-xs text-[var(--mat-muted)]">
                            {s.attempts} {s.attempts === 1 ? "scored attempt" : "scored attempts"}
                          </p>
                        </div>

                        <div className="flex min-w-[220px] flex-[2] items-center gap-3">
                          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${s.avg}%`,
                                backgroundColor: barColor(s.avg),
                              }}
                            />
                          </div>

                          <span
                            className="w-9 text-right text-sm font-bold"
                            style={{ color: barColor(s.avg) }}
                          >
                            {s.avg}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={
                              "text-xs font-bold " +
                              (s.delta > 0
                                ? "text-[var(--mat-green-700)]"
                                : s.delta < 0
                                  ? "text-amber-700"
                                  : "text-[var(--mat-muted)]")
                            }
                          >
                            {s.delta > 0 ? `+${s.delta}` : s.delta}
                          </span>

                          <span
                            className={
                              "rounded-full px-2.5 py-1 text-[11px] font-semibold " +
                              pill.cls
                            }
                          >
                            {pill.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-3">
              <InsightCard
                title="Strongest sound"
                emoji="🌟"
                value={brain.strongest?.label ?? "—"}
                detail={
                  brain.strongest
                    ? `${brain.strongest.avg} average — ${
                        brain.mastered.some(
                          (sound) => sound.focus === brain.strongest?.focus,
                        )
                          ? "mastered"
                          : "your highest current average"
                      }`
                    : "More scored practice will establish this."
                }
              />

              <InsightCard
                title="Needs most attention"
                emoji="🎯"
                value={brain.weakest?.label ?? "—"}
                detail={
                  brain.weakest
                    ? `${brain.weakest.avg} average across ${brain.weakest.attempts} ${
                        brain.weakest.attempts === 1 ? "attempt" : "attempts"
                      }`
                    : "More scored practice will establish this."
                }
              />

              <InsightCard
                title="Most practiced"
                emoji="🔁"
                value={brain.mostPracticed?.label ?? "—"}
                detail={
                  brain.mostPracticed
                    ? `${brain.mostPracticed.attempts} scored ${
                        brain.mostPracticed.attempts === 1
                          ? "attempt"
                          : "attempts"
                      } so far`
                    : "Your practice history will establish this."
                }
              />
            </div>

            {(brain.improving.length > 0 || brain.regressing.length > 0) && (
              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6">
                  <p className="mat-eyebrow">
                    Recent direction
                  </p>

                  <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
                    Getting stronger
                  </h2>

                  {brain.improving.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {brain.improving.map((s) => (
                        <div
                          key={s.focus}
                          className="flex items-center justify-between gap-4 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-white p-4"
                        >
                          <span className="text-sm font-semibold text-[var(--mat-ink)]">
                            {s.label}
                          </span>

                          <span className="text-sm font-bold text-[var(--mat-green-700)]">
                            +{s.delta} points
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-[var(--mat-muted)]">
                      Nina will show improving sounds here when recent scored
                      attempts move above their earlier average.
                    </p>
                  )}
                </section>

                <section className="rounded-[var(--mat-radius-xl)] border border-amber-200 bg-amber-50 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                    Worth revisiting
                  </p>

                  <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
                    Sounds trending lower
                  </h2>

                  {brain.regressing.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {brain.regressing.map((s) => (
                        <div
                          key={s.focus}
                          className="flex items-center justify-between gap-4 rounded-[var(--mat-radius-lg)] border border-amber-200 bg-white p-4"
                        >
                          <span className="text-sm font-semibold text-[var(--mat-ink)]">
                            {s.label}
                          </span>

                          <span className="text-sm font-bold text-amber-700">
                            {s.delta} points
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-[var(--mat-muted)]">
                      None of your tracked sounds currently meet Nina&apos;s
                      threshold for a meaningful downward trend.
                    </p>
                  )}
                </section>
              </div>
            )}

            {/* Voice history */}
            <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mat-eyebrow">
                    Voice history
                  </p>

                  <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                    Your recent recordings
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mat-muted)]">
                    Replay your available stored practice recordings alongside
                    the sound, date, and scored clarity attached to each take.
                  </p>
                </div>

                <span className="mat-pill bg-[var(--mat-surface-soft)] text-[var(--mat-muted)]">
                  {recordings.length}{" "}
                  {recordings.length === 1 ? "recording" : "recordings"}
                </span>
              </div>

              {recordings.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {recordings.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-[var(--mat-ink)]">
                              {recLabel(r.focus)}
                            </p>

                            {typeof r.overall === "number" && (
                              <span
                                className="rounded-full bg-white px-2.5 py-1 text-xs font-bold"
                                style={{ color: barColor(r.overall) }}
                              >
                                {r.overall}% clarity
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-[var(--mat-muted-light)]">
                            {new Date(r.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <audio
                          controls
                          preload="none"
                          src={`/api/recordings/${r.id}`}
                          className="h-10 w-full lg:max-w-md"
                        >
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[var(--mat-radius-lg)] border border-dashed border-[var(--mat-border-strong)] bg-[var(--mat-surface-soft)] p-5">
                  <p className="text-sm font-semibold text-[var(--mat-ink)]">
                    No stored recordings yet
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
                    Available saved practice recordings will appear here when
                    you have recordings that can be replayed.
                  </p>
                </div>
              )}
            </section>

            {/* Milestones */}
            <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mat-eyebrow">
                    Speaking milestones
                  </p>

                  <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                    Milestones from your practice
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mat-muted)]">
                    Nina tracks these milestones against your scored speaking
                    history and marks them as they are reached.
                  </p>
                </div>

                <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
                  {brain.milestones.filter((m) => m.reached).length} of{" "}
                  {brain.milestones.length} reached
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {brain.milestones.map((m) => (
                  <div
                    key={m.key}
                    className={
                      "rounded-[var(--mat-radius-lg)] border p-4 " +
                      (m.reached
                        ? "border-[var(--mat-border-green)] bg-[var(--mat-green-50)]"
                        : "border-[var(--mat-border)] bg-[var(--mat-surface-soft)]")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
                          (m.reached
                            ? "bg-white text-[var(--mat-green-700)] shadow-[var(--mat-shadow-sm)]"
                            : "bg-white text-[var(--mat-muted-light)]")
                        }
                      >
                        {m.reached ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span aria-hidden="true">🔒</span>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[var(--mat-ink)]">
                          {m.label}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                          {m.hint}
                        </p>

                        <p
                          className={
                            "mt-2 text-[11px] font-bold uppercase tracking-[0.12em] " +
                            (m.reached
                              ? "text-[var(--mat-green-700)]"
                              : "text-[var(--mat-muted-light)]")
                          }
                        >
                          {m.reached ? "Reached" : "In progress"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
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

