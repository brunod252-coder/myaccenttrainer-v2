import type { PhonemeScore, Difficulty, AttemptComparison } from "@/lib/pronunciation/types";

type FeedbackCardProps = {
  score?: number | null;
  title: string;
  message: string;
  rhythm?: number;
  confidence?: number;
  difficulty?: Difficulty;
  phonemes?: PhonemeScore[];
  strengths?: string[];
  improvements?: string[];
  tip?: { sound: string; text: string };
  comparison?: AttemptComparison | null;
  source?: "azure" | "practice-estimate";
};

function barColor(score: number): string {
  if (score >= 75) return "#20ad68";
  if (score >= 60) return "#c98a2b";
  return "#d1495b";
}

const DIFFICULTY_META: Record<Difficulty, { label: string; cls: string }> = {
  easy: { label: "Easier sound", cls: "bg-[#e5f3ec] text-[#2e7d5b]" },
  moderate: { label: "Moderate sound", cls: "bg-[#eef4f9] text-[#52719f]" },
  hard: { label: "Tricky sound", cls: "bg-[#fbefd9] text-[#8a5a17]" },
};

export default function FeedbackCard({
  score,
  title,
  message,
  rhythm,
  confidence,
  difficulty,
  phonemes,
  strengths,
  improvements,
  tip,
  comparison,
  source,
}: FeedbackCardProps) {
  const hasScore = typeof score === "number";

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9f8f3] text-2xl">
          🤖
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-[#20ad68]">Nina&apos;s feedback</p>
            {difficulty && (
              <span className={"rounded-full px-2.5 py-0.5 text-xs font-semibold " + DIFFICULTY_META[difficulty].cls}>
                {DIFFICULTY_META[difficulty].label}
              </span>
            )}
          </div>
          <h2 className="mt-2 font-display text-2xl text-[#17223b]">{title}</h2>

          {comparison && (
            <div
              className={
                "mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold " +
                (comparison.direction === "up"
                  ? "bg-[#e5f3ec] text-[#2e7d5b]"
                  : comparison.direction === "down"
                    ? "bg-[#fdecec] text-[#c0473f]"
                    : "bg-[#eef4f9] text-[#52719f]")
              }
            >
              <span>{comparison.direction === "up" ? "▲" : comparison.direction === "down" ? "▼" : "—"}</span>
              {comparison.delta > 0 ? "+" : ""}
              {comparison.delta} vs. your last try on this sound ({comparison.previous})
            </div>
          )}

          <p className="mt-4 leading-7 text-gray-600">{message}</p>

          {hasScore && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-[#f8fbfa] p-5">
                <p className="text-sm text-gray-500">Pronunciation</p>
                <p className="mt-2 font-display text-4xl text-[#20ad68]">{score}%</p>
              </div>
              {typeof rhythm === "number" && (
                <div className="rounded-xl border border-gray-100 bg-[#f8fbfa] p-5">
                  <p className="text-sm text-gray-500">Rhythm &amp; stress</p>
                  <p className="mt-2 font-display text-4xl text-[#52719f]">{rhythm}%</p>
                </div>
              )}
              {typeof confidence === "number" && (
                <div className="rounded-xl border border-gray-100 bg-[#f8fbfa] p-5">
                  <p className="text-sm text-gray-500">Nina&apos;s confidence</p>
                  <p className="mt-2 font-display text-4xl text-[#17223b]">{confidence}%</p>
                </div>
              )}
            </div>
          )}

          {((strengths && strengths.length > 0) || (improvements && improvements.length > 0)) && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {strengths && strengths.length > 0 && (
                <div className="rounded-xl border border-[#d7f2e7] bg-[#f6fdfa] p-5">
                  <p className="text-sm font-semibold text-[#168c56]">What worked</p>
                  <ul className="mt-2 space-y-1.5">
                    {strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-[#20ad68]">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {improvements && improvements.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-[#f8fbfa] p-5">
                  <p className="text-sm font-semibold text-[#8a5a17]">To work on</p>
                  <ul className="mt-2 space-y-1.5">
                    {improvements.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-[#c98a2b]">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {phonemes && phonemes.length > 0 && (
            <div className="mt-8">
              <p className="text-sm font-semibold text-[#52719f]">Sound by sound</p>
              <div className="mt-4 space-y-3">
                {phonemes.map((p) => (
                  <div key={p.symbol + p.word} className="flex items-center gap-3">
                    <div className="flex h-9 w-11 items-center justify-center rounded-lg bg-[#e9f8f3] text-sm font-semibold text-[#20ad68]">
                      {p.symbol}
                    </div>
                    <div className="w-24 text-sm text-gray-500">{p.word}</div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.score}%`, backgroundColor: barColor(p.score) }}
                      />
                    </div>
                    <div
                      className="w-9 text-right text-sm font-semibold"
                      style={{ color: barColor(p.score) }}
                    >
                      {p.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tip && (
            <div className="mt-8 rounded-xl border border-[#cdeee1] bg-[#f0faf6] p-5">
              <p className="text-sm font-semibold text-[#20ad68]">Try this next</p>
              <p className="mt-2 text-sm leading-6 text-gray-700">{tip.text}</p>
            </div>
          )}

          {source === "practice-estimate" && (
            <p className="mt-4 text-xs text-gray-400">
              Practice estimate — connect Azure Speech for exact per-sound scoring.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
