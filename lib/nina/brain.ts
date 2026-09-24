// ── Nina Brain ───────────────────────────────────────────────────────
// The memory and intelligence layer. It reads every scored attempt and
// turns raw numbers into things a real coach would notice: personal bests,
// which sounds are mastered vs. weakest, whether a learner is improving or
// slipping, milestones reached, and what to practice next.
//
// Reads are guarded (the `db()` cast + try/catch) so the app behaves
// gracefully before `npx prisma db push` and for brand-new learners.

import { prisma } from "@/lib/prisma";

type AttemptRow = {
  overall: number;
  rhythm: number;
  focus: string | null;
  lessonSlug: string | null;
  referenceText: string | null;
  source: string;
  createdAt: Date;
};

const FOCUS_LABELS: Record<string, string> = {
  r: "American R", l: "The L sound", th: "TH", v: "V and W", w: "V and W",
  sh: "SH", ee: "Vowels", stress: "Word stress", endings: "Final sounds", linking: "Linking",
};

const FOCUS_PHRASES: Record<string, string> = {
  r: "The red car is really rare.",
  l: "Lucy will call a little later.",
  th: "Think about three thin things.",
  v: "We view every wave.",
  w: "We view every wave.",
  sh: "She sells shining shells.",
  ee: "He can see the green trees.",
  stress: "I'd like to PREsent a PREsent.",
  endings: "He asked and walked back.",
  linking: "Turn it off and on again.",
};

function labelFor(focus: string | null): string {
  if (!focus) return "General practice";
  return FOCUS_LABELS[focus] || focus;
}

function db() {
  return prisma as unknown as {
    pronunciationAttempt: {
      findMany: (args: unknown) => Promise<AttemptRow[]>;
    };
  };
}

export type SoundStat = {
  focus: string;
  label: string;
  attempts: number;
  avg: number;
  best: number;
  recentAvg: number;
  earlierAvg: number;
  delta: number; // recentAvg - earlierAvg
  status: "mastered" | "improving" | "steady" | "needs-work" | "weakest";
};

export type Milestone = { key: string; label: string; hint: string; reached: boolean };

export type NinaBrain = {
  hasData: boolean;
  totalAttempts: number;
  daysPracticed: number;
  streakDays: number;
  clarity: number | null;
  firstClarity: number | null;
  personalBest: { overall: number; label: string; date: Date } | null;
  latest: { overall: number; label: string; focus: string | null; date: Date } | null;
  comparison: { previous: number; delta: number; direction: "up" | "down" | "same" } | null;
  sounds: SoundStat[];
  strongest: SoundStat | null;
  weakest: SoundStat | null;
  improving: SoundStat[];
  regressing: SoundStat[];
  mastered: SoundStat[];
  mostPracticed: SoundStat | null;
  milestones: Milestone[];
  plan: { focus: string; label: string; reason: string; phrase: string } | null;
  longTerm: string;
};

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function computeStreak(dates: Date[]): number {
  const days = new Set(dates.map((d) => new Date(d).toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function emptyBrain(): NinaBrain {
  return {
    hasData: false, totalAttempts: 0, daysPracticed: 0, streakDays: 0,
    clarity: null, firstClarity: null, personalBest: null, latest: null, comparison: null,
    sounds: [], strongest: null, weakest: null, improving: [], regressing: [], mastered: [],
    mostPracticed: null, milestones: baseMilestones(0, null, [], 0), plan: null,
    longTerm: "Nina hasn't heard you yet. Record your first attempt and she'll start remembering your voice, your progress, and exactly which sounds to help you with.",
  };
}

function baseMilestones(attempts: number, clarity: number | null, mastered: SoundStat[], streak: number): Milestone[] {
  return [
    { key: "first", label: "First practice", hint: "Record your first attempt", reached: attempts >= 1 },
    { key: "ten", label: "10 recordings", hint: "Practice adds up", reached: attempts >= 10 },
    { key: "clarity70", label: "Clarity 70+", hint: "Clearly understandable", reached: (clarity ?? 0) >= 70 },
    { key: "mastered", label: "First sound mastered", hint: "A sound above 85", reached: mastered.length >= 1 },
    { key: "streak7", label: "7-day streak", hint: "A week of practice", reached: streak >= 7 },
    { key: "fifty", label: "50 recordings", hint: "Real dedication", reached: attempts >= 50 },
  ];
}

export async function getNinaBrain(userId: string): Promise<NinaBrain> {
  let rows: AttemptRow[] = [];

  try {
    rows = await db().pronunciationAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 500,
    });
  } catch {
    return emptyBrain();
  }

  if (!rows.length) return emptyBrain();

  // Practice activity includes every real recording attempt, including
  // historical practice estimates.
  const daysPracticed = new Set(
    rows.map((r) => new Date(r.createdAt).toDateString()),
  ).size;

  const streakDays = computeStreak(
    rows.map((r) => r.createdAt),
  );

  // Speech-quality intelligence must come only from assessments that
  // actually analyzed the learner's audio.
  const measured = rows.filter(
    (r) => r.source === "azure",
  );

  if (!measured.length) {
    return {
      ...emptyBrain(),
      hasData: true,
      totalAttempts: rows.length,
      daysPracticed,
      streakDays,
      milestones: baseMilestones(
        rows.length,
        null,
        [],
        streakDays,
      ),
      longTerm:
        `You've completed ${rows.length} practice ${
          rows.length === 1 ? "recording" : "recordings"
        } across ${daysPracticed} ${
          daysPracticed === 1 ? "day" : "days"
        }. Complete a measured speech assessment to establish your clarity baseline.`,
    };
  }

  const overalls = measured.map(
    (r) => r.overall,
  );

  const clarity = avg(
    overalls.slice(-5),
  );

  const firstClarity = avg(
    overalls.slice(
      0,
      Math.min(3, overalls.length),
    ),
  );

  // Personal best is meaningful only among measured assessments.
  const bestRow = measured.reduce(
    (best, r) =>
      r.overall > best.overall ? r : best,
    measured[0],
  );

  const personalBest = {
    overall: bestRow.overall,
    label: labelFor(bestRow.focus),
    date: bestRow.createdAt,
  };

  // Latest + comparison use measured attempts only.
  const latestRow =
    measured[measured.length - 1];

  const latest = {
    overall: latestRow.overall,
    label: labelFor(latestRow.focus),
    focus: latestRow.focus,
    date: latestRow.createdAt,
  };

  let comparison: NinaBrain["comparison"] = null;

  const sameFocusPrev = [...measured]
    .slice(0, -1)
    .reverse()
    .find(
      (r) => r.focus === latestRow.focus,
    );

  if (sameFocusPrev) {
    const delta =
      latestRow.overall -
      sameFocusPrev.overall;

    comparison = {
      previous: sameFocusPrev.overall,
      delta,
      direction:
        delta > 1
          ? "up"
          : delta < -1
            ? "down"
            : "same",
    };
  }

  // Per-sound quality statistics use measured assessments only.
  const byFocus =
    new Map<string, AttemptRow[]>();

  for (const r of measured) {
    const focus =
      r.focus || "general";

    (
      byFocus.get(focus) ||
      byFocus.set(focus, []).get(focus)!
    ).push(r);
  }

  const sounds: SoundStat[] = [];

  for (
    const [focus, list]
    of byFocus.entries()
  ) {
    const values = list.map(
      (r) => r.overall,
    );

    const half = Math.max(
      1,
      Math.floor(list.length / 2),
    );

    const earlierAvg = avg(
      values.slice(0, half),
    );

    const recentAvg = avg(
      values.slice(-half),
    );

    const average = avg(values);

    const delta =
      recentAvg - earlierAvg;

    let status: SoundStat["status"] =
      "steady";

    if (average >= 85) {
      status = "mastered";
    } else if (delta >= 5) {
      status = "improving";
    } else if (delta <= -5) {
      status = "needs-work";
    }

    sounds.push({
      focus,
      label: labelFor(focus),
      attempts: list.length,
      avg: average,
      best: Math.max(...values),
      recentAvg,
      earlierAvg,
      delta,
      status,
    });
  }

  sounds.sort(
    (a, b) => a.avg - b.avg,
  );

  const rated = sounds.filter(
    (s) => s.attempts >= 2,
  );

  const weakest =
    (rated.length ? rated : sounds)[0] ||
    null;

  if (weakest) {
    weakest.status =
      weakest.status === "mastered"
        ? "mastered"
        : "weakest";
  }

  const strongest = sounds.length
    ? sounds[sounds.length - 1]
    : null;

  const improving = sounds
    .filter((s) => s.delta >= 5)
    .sort(
      (a, b) => b.delta - a.delta,
    );

  const regressing = sounds
    .filter((s) => s.delta <= -5)
    .sort(
      (a, b) => a.delta - b.delta,
    );

  const mastered = sounds.filter(
    (s) => s.avg >= 85,
  );

  const mostPracticed =
    [...sounds].sort(
      (a, b) =>
        b.attempts - a.attempts,
    )[0] || null;

  // Coaching plans are based only on measured sound quality.
  const planTarget =
    weakest || strongest;

  const plan = planTarget
    ? {
        focus: planTarget.focus,
        label: planTarget.label,
        reason:
          planTarget.status ===
          "needs-work"
            ? `${planTarget.label} slipped a little recently — a short focused session will bring it back.`
            : planTarget.avg < 70
              ? `${planTarget.label} is your biggest opportunity right now. A few clear reps will move your overall clarity the most.`
              : `Keep ${planTarget.label} sharp with a quick warm-up, then push into a new sound.`,
        phrase:
          FOCUS_PHRASES[
            planTarget.focus
          ] ||
          "Practice your target sound slowly and clearly.",
      }
    : null;

  const trendWord =
    clarity > firstClarity + 2
      ? "climbing"
      : clarity < firstClarity - 2
        ? "dipping"
        : "holding steady";

  const longTerm =
    `Across ${measured.length} measured recording${
      measured.length === 1 ? "" : "s"
    }, your clarity has moved from about ${firstClarity} to ${clarity} — ${trendWord}. ` +
    (
      mastered.length
        ? `You've mastered ${mastered.length} sound${
            mastered.length === 1
              ? ""
              : "s"
          }. `
        : ""
    ) +
    (
      weakest
        ? `Right now, ${weakest.label} is where a little focus will pay off most.`
        : ""
    );

  // Recording-count and streak milestones remain genuine activity
  // milestones; clarity/mastery milestones use measured data.
  const milestones = baseMilestones(
    rows.length,
    clarity,
    mastered,
    streakDays,
  );

  return {
    hasData: true,
    totalAttempts: rows.length,
    daysPracticed,
    streakDays,
    clarity,
    firstClarity,
    personalBest,
    latest,
    comparison,
    sounds: sounds.slice().reverse(),
    strongest,
    weakest,
    improving,
    regressing,
    mastered,
    mostPracticed,
    milestones,
    plan,
    longTerm,
  };
}
