// ── Coaching goals ───────────────────────────────────────────────────
// A learner's weekly practice target (and optional clarity target).
// Guarded so it compiles/defaults cleanly before `npx prisma db push`.

import { prisma } from "@/lib/prisma";

export type Goal = { weeklyTarget: number; clarityTarget: number | null };

const DEFAULT_GOAL: Goal = { weeklyTarget: 4, clarityTarget: null };

function db() {
  return prisma as unknown as {
    coachingGoal: {
      findUnique: (a: unknown) => Promise<{ weeklyTarget: number; clarityTarget: number | null } | null>;
      upsert: (a: unknown) => Promise<unknown>;
    };
  };
}

export async function getGoal(userId: string): Promise<Goal> {
  try {
    const g = await db().coachingGoal.findUnique({ where: { userId } });
    if (!g) return DEFAULT_GOAL;
    return { weeklyTarget: g.weeklyTarget, clarityTarget: g.clarityTarget ?? null };
  } catch {
    return DEFAULT_GOAL;
  }
}

export async function setGoal(userId: string, weeklyTarget: number, clarityTarget: number | null): Promise<Goal> {
  const wt = Math.max(1, Math.min(7, Math.round(weeklyTarget)));
  const ct = clarityTarget === null ? null : Math.max(50, Math.min(100, Math.round(clarityTarget)));
  try {
    await db().coachingGoal.upsert({
      where: { userId },
      update: { weeklyTarget: wt, clarityTarget: ct },
      create: { userId, weeklyTarget: wt, clarityTarget: ct },
    });
  } catch {
    // not migrated yet — return the intended values anyway
  }
  return { weeklyTarget: wt, clarityTarget: ct };
}
