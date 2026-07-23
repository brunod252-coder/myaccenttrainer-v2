// ── Practice-attempt persistence ─────────────────────────────────────
// Saves each scored attempt and reads back real clarity, streak, trend,
// and per-sound mastery.
//
// The `db()` cast lets this compile before `npx prisma db push` regenerates
// the Prisma client with the new PronunciationAttempt model. Every call is
// wrapped in try/catch, so until the schema is applied the app behaves
// exactly as before (scoring works, stats show the "new" state).

import { prisma } from "@/lib/prisma";
import type { PronunciationResult } from "./types";

type AttemptRow = { overall: number; focus: string | null; createdAt: Date };

const FOCUS_LABELS: Record<string, string> = {
  r: "R", l: "L", th: "TH", v: "V", w: "W",
  sh: "SH", ee: "Vowels", stress: "Word stress", endings: "Final sounds", linking: "Linking",
};

function db() {
  return prisma as unknown as {
    pronunciationAttempt: {
      create: (args: unknown) => Promise<unknown>;
      findMany: (args: unknown) => Promise<AttemptRow[]>;
      findFirst: (args: unknown) => Promise<{ overall: number } | null>;
    };
  };
}

export async function saveAttempt(
  userId: string,
  result: PronunciationResult,
  meta: { referenceText?: string; focus?: string; lessonSlug?: string },
): Promise<void> {
  try {
    await db().pronunciationAttempt.create({
      data: {
        userId,
        lessonSlug: meta.lessonSlug,
        referenceText: meta.referenceText,
        focus: meta.focus,
        overall: result.overall,
        rhythm: result.rhythm,
        source: result.source,
      },
    });
  } catch {
    // Table not created yet (run `npx prisma db push`) — ignore silently.
  }
}

export type ClarityStats = {
  clarity: number | null;
  attempts: number;
  streakDays: number;
};

export async function getClarityStats(userId: string): Promise<ClarityStats> {
  try {
    const rows = await db().pronunciationAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    if (!rows.length) return { clarity: null, attempts: 0, streakDays: 0 };
    const recent = rows.slice(0, 5);
    const clarity = Math.round(recent.reduce((sum, r) => sum + r.overall, 0) / recent.length);
    return { clarity, attempts: rows.length, streakDays: computeStreak(rows.map((r) => r.createdAt)) };
  } catch {
    return { clarity: null, attempts: 0, streakDays: 0 };
  }
}

export type ProgressData = {
  clarity: number | null;
  attempts: number;
  streakDays: number;
  trend: number[]; // recent attempt scores, oldest → newest
  soundMastery: { label: string; score: number }[];
};

export async function getProgressData(userId: string): Promise<ProgressData> {
  try {
    const rows = await db().pronunciationAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 300,
    });
    if (!rows.length) {
      return { clarity: null, attempts: 0, streakDays: 0, trend: [], soundMastery: [] };
    }

    const overalls = rows.map((r) => r.overall);
    const recent = overalls.slice(-5);
    const clarity = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
    const trend = overalls.slice(-10);
    const streakDays = computeStreak(rows.map((r) => r.createdAt));

    const byFocus = new Map<string, { sum: number; n: number }>();
    for (const r of rows) {
      const f = r.focus || "other";
      const cur = byFocus.get(f) || { sum: 0, n: 0 };
      cur.sum += r.overall;
      cur.n += 1;
      byFocus.set(f, cur);
    }
    const soundMastery = [...byFocus.entries()]
      .map(([f, v]) => ({ label: FOCUS_LABELS[f] || f, score: Math.round(v.sum / v.n) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return { clarity, attempts: rows.length, streakDays, trend, soundMastery };
  } catch {
    return { clarity: null, attempts: 0, streakDays: 0, trend: [], soundMastery: [] };
  }
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


// Most recent prior attempt score for a given focus sound — powers the
// "compared to last time" moment in live feedback. Returns null on the
// learner's first attempt at that sound.
export async function getPreviousAttemptScore(
  userId: string,
  focus: string,
): Promise<number | null> {
  if (!focus) return null;
  try {
    const prev = await db().pronunciationAttempt.findFirst({
      where: { userId, focus },
      orderBy: { createdAt: "desc" },
      select: { overall: true },
    });
    return prev?.overall ?? null;
  } catch {
    return null;
  }
}
