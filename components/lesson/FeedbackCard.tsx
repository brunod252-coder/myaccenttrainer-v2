import type {
  AttemptComparison,
  Difficulty,
  PhonemeScore,
} from "@/lib/pronunciation/types";

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

const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; cls: string }
> = {
  easy: {
    label: "Easier sound",
    cls: "bg-[var(--mat-green-50)] text-[var(--mat-green-800)]",
  },
  moderate: {
    label: "Moderate sound",
    cls: "bg-[var(--mat-blue-soft)] text-[var(--mat-blue)]",
  },
  hard: {
    label: "Tricky sound",
    cls: "bg-amber-50 text-amber-800",
  },
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
    <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19v-7a8 8 0 0 1 16 0v7" />
              <path d="M8 19h8" />
              <path d="M9 8h.01" />
              <path d="M15 8h.01" />
              <path d="M9 12c1.8 1.4 4.2 1.4 6 0" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mat-eyebrow">
                Nina&apos;s feedback
              </p>

              {difficulty && (
                <span className={"mat-pill " + DIFFICULTY_META[difficulty].cls}>
                  {DIFFICULTY_META[difficulty].label}
                </span>
              )}
            </div>

            <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
              {title}
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--mat-muted)] sm:text-base">
              {message}
            </p>

            {comparison && (
              <div
                className={
                  "mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold " +
                  (comparison.direction === "up"
                    ? "bg-[var(--mat-green-50)] text-[var(--mat-green-800)]"
                    : comparison.direction === "down"
                      ? "bg-red-50 text-[var(--mat-red)]"
                      : "bg-[var(--mat-blue-soft)] text-[var(--mat-blue)]")
                }
              >
                <span aria-hidden="true">
                  {comparison.direction === "up"
                    ? "▲"
                    : comparison.direction === "down"
                      ? "▼"
                      : "—"}
                </span>

                <span>
                  {comparison.delta > 0 ? "+" : ""}
                  {comparison.delta} vs. your last try on this sound (
                  {comparison.previous})
                </span>
              </div>
            )}
          </div>
        </div>

        {hasScore && (
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <ScoreMetric
              label="Pronunciation"
              value={score}
              emphasis="green"
            />

            {typeof rhythm === "number" && (
              <ScoreMetric
                label="Rhythm & stress"
                value={rhythm}
                emphasis="blue"
              />
            )}

            {typeof confidence === "number" && (
              <ScoreMetric
                label="Nina's confidence"
                value={confidence}
                emphasis="ink"
              />
            )}
          </div>
        )}

        {((strengths && strengths.length > 0) ||
          (improvements && improvements.length > 0)) && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {strengths && strengths.length > 0 && (
              <div className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5">
                <p className="text-sm font-bold text-[var(--mat-green-800)]">
                  What worked
                </p>

                <ul className="mt-3 space-y-2">
                  {strengths.map((strength, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm leading-6 text-[var(--mat-ink)]"
                    >
                      <span
                        aria-hidden="true"
                        className="font-bold text-[var(--mat-green-700)]"
                      >
                        ✓
                      </span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {improvements && improvements.length > 0 && (
              <div className="rounded-[var(--mat-radius-lg)] border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-bold text-amber-900">
                  To work on
                </p>

                <ul className="mt-3 space-y-2">
                  {improvements.map((improvement, index) => (
                    <li
                      key={index}
                      className="flex gap-2 text-sm leading-6 text-amber-950"
                    >
                      <span
                        aria-hidden="true"
                        className="font-bold text-amber-700"
                      >
                        →
                      </span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {phonemes && phonemes.length > 0 && (
          <div className="mt-7 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-[var(--mat-ink)]">
                  Sound by sound
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                  See which sounds were clear and which ones need another try.
                </p>
              </div>

              <span className="mat-pill bg-white text-[var(--mat-muted)]">
                {phonemes.length} sounds
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {phonemes.map((phoneme) => (
                <div
                  key={phoneme.symbol + phoneme.word}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 min-w-11 items-center justify-center rounded-lg bg-white px-2 text-sm font-bold text-[var(--mat-green-700)]">
                      {phoneme.symbol}
                    </span>

                    <span className="truncate text-sm text-[var(--mat-muted)]">
                      {phoneme.word}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${phoneme.score}%`,
                        backgroundColor: barColor(phoneme.score),
                      }}
                    />
                  </div>

                  <span
                    className="w-9 text-right text-sm font-bold"
                    style={{ color: barColor(phoneme.score) }}
                  >
                    {phoneme.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tip && (
          <div className="mt-6 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-[var(--mat-green-800)]">
                Try this next
              </p>

              {tip.sound && (
                <span className="mat-pill bg-white text-[var(--mat-green-800)]">
                  {tip.sound}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm leading-7 text-[var(--mat-ink)]">
              {tip.text}
            </p>
          </div>
        )}

        {source === "practice-estimate" && (
          <p className="mt-5 text-xs leading-5 text-[var(--mat-muted-light)]">
            Practice estimate — connect Azure Speech for exact per-sound
            scoring.
          </p>
        )}
      </div>
    </section>
  );
}

function ScoreMetric({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: number;
  emphasis: "green" | "blue" | "ink";
}) {
  const valueClass =
    emphasis === "green"
      ? "text-[var(--mat-green-700)]"
      : emphasis === "blue"
        ? "text-[var(--mat-blue)]"
        : "text-[var(--mat-ink)]";

  return (
    <div className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5">
      <p className="text-sm text-[var(--mat-muted)]">
        {label}
      </p>

      <p className={"mt-2 font-display text-4xl " + valueClass}>
        {value}%
      </p>
    </div>
  );
}
