// ── Admin analytics ──────────────────────────────────────────────────
// Platform-wide stats, user search, and per-learner detail. Every read is
// guarded so the admin area degrades gracefully before migration.

import { prisma } from "@/lib/prisma";
import { getAllLessons } from "@/lib/lessons";
import { listCustomLessons } from "@/lib/lessons/custom";

export type PlatformStats = {
  users: number;
  admins: number;
  subscribers: number;
  attempts: number;
  recordings: number;
  invites: number;
  rewarded: number;
  newThisWeek: number;
};

function anydb() {
  return prisma as unknown as Record<string, { count: (a?: unknown) => Promise<number>; findMany: (a?: unknown) => Promise<unknown[]>; findUnique: (a?: unknown) => Promise<unknown> }>;
}

async function safeCount(model: string, args?: unknown): Promise<number> {
  try {
    return await anydb()[model].count(args as undefined);
  } catch {
    return 0;
  }
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [users, admins, subscribers, attempts, recordings, invites, rewarded, newThisWeek] = await Promise.all([
    safeCount("user"),
    safeCount("user", { where: { role: "ADMIN" } }),
    safeCount("user", { where: { subscriptionStatus: "active" } }),
    safeCount("pronunciationAttempt"),
    safeCount("voiceRecording"),
    safeCount("referralInvite"),
    safeCount("referralInvite", { where: { status: "REWARDED" } }),
    safeCount("user", { where: { createdAt: { gte: weekAgo } } }),
  ]);
  return { users, admins, subscribers, attempts, recordings, invites, rewarded, newThisWeek };
}

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
};

export async function listUsers(q?: string, limit = 100): Promise<AdminUserRow[]> {
  try {
    const where = q
      ? {
          OR: [
            { email: { contains: q } },
            { firstName: { contains: q } },
            { lastName: { contains: q } },
          ],
        }
      : {};
    const rows = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "—",
      role: u.role,
      createdAt: u.createdAt,
    }));
  } catch {
    return [];
  }
}

export type UserDetail = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  emailVerified: boolean | null;
  country: string | null;
  nativeLanguage: string | null;
  subscriptionStatus: string | null;
  attempts: number;
  clarity: number | null;
  lessonsCompleted: number;
  recordings: number;
  walletMinor: number;
  invitesSent: number;
};

export async function getUserDetail(id: string): Promise<UserDetail | null> {
  try {
    const u = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, profile: true },
    });
    if (!u) return null;

    const db = anydb();
    const [attemptsRows, lessonsCompleted, recordings, invitesSent] = await Promise.all([
      (async () => {
        try {
          return (await db.pronunciationAttempt.findMany({
            where: { userId: id, source: "azure" }, orderBy: { createdAt: "desc" }, take: 5, select: { overall: true },
          })) as { overall: number }[];
        } catch { return []; }
      })(),
      safeCount("lessonProgress", { where: { userId: id, status: "COMPLETED" } }),
      safeCount("voiceRecording", { where: { userId: id } }),
      safeCount("referralInvite", { where: { inviterUserId: id } }),
    ]);
    const attempts = await safeCount("pronunciationAttempt", { where: { userId: id } });
    const clarity = attemptsRows.length
      ? Math.round(attemptsRows.reduce((s, r) => s + r.overall, 0) / attemptsRows.length)
      : null;

    // guarded new fields + wallet
    let emailVerified: boolean | null = null;
    let subscriptionStatus: string | null = null;
    try {
      const extra = (await (prisma as unknown as {
        user: { findUnique: (a: unknown) => Promise<{ emailVerified: boolean; subscriptionStatus: string | null } | null> };
      }).user.findUnique({ where: { id }, select: { emailVerified: true, subscriptionStatus: true } }));
      emailVerified = extra?.emailVerified ?? null;
      subscriptionStatus = extra?.subscriptionStatus ?? null;
    } catch { /* not migrated */ }

    let walletMinor = 0;
    try {
      const wallet = (await (prisma as unknown as {
        walletAccount: { findUnique: (a: unknown) => Promise<{ transactions: { amountMinor: number }[] } | null> };
      }).walletAccount.findUnique({ where: { userId: id }, include: { transactions: true } }));
      walletMinor = (wallet?.transactions ?? []).reduce((s, t) => s + t.amountMinor, 0);
    } catch { /* ignore */ }

    const profile = u.profile as { countryOfResidence?: string | null; nativeLanguage?: string | null } | null;

    return {
      id: u.id,
      email: u.email,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "—",
      role: u.role,
      createdAt: u.createdAt,
      emailVerified,
      country: profile?.countryOfResidence ?? null,
      nativeLanguage: profile?.nativeLanguage ?? null,
      subscriptionStatus,
      attempts,
      clarity,
      lessonsCompleted,
      recordings,
      walletMinor,
      invitesSent,
    };
  } catch {
    return null;
  }
}

export async function listUsersForExport(): Promise<{ email: string; name: string; role: string; created: string }[]> {
  try {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: { email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });
    return rows.map((u) => ({
      email: u.email,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "",
      role: u.role,
      created: u.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

// Which integrations are configured (read-only system settings view).
export function getIntegrationStatus() {
  return [
    { key: "Database", ok: true, note: "Connected", detail: "Prisma + SQLite (Postgres in production)" },
    { key: "Auth (JWT)", ok: Boolean(process.env.JWT_SECRET), note: process.env.JWT_SECRET ? "Configured" : "Using dev default", detail: "Set JWT_SECRET before launch" },
    { key: "Payments (Stripe)", ok: Boolean(process.env.STRIPE_SECRET_KEY), note: process.env.STRIPE_SECRET_KEY ? "Live" : "Not configured", detail: "STRIPE_SECRET_KEY + price IDs" },
    { key: "Speech (Azure)", ok: Boolean(process.env.AZURE_SPEECH_KEY), note: process.env.AZURE_SPEECH_KEY ? "Live" : "Practice-estimate mode", detail: "AZURE_SPEECH_KEY + region" },
    {
      key: "Email (AWS SES)",
      ok:
        process.env.EMAIL_PROVIDER?.trim().toLowerCase() === "ses" &&
        process.env.ALLOW_REAL_EMAIL_SENDS?.trim().toLowerCase() === "true" &&
        Boolean(process.env.SES_FROM_EMAIL?.trim()) &&
        Boolean(
          process.env.SES_REGION?.trim() ||
            process.env.AWS_REGION?.trim(),
        ),
      note:
        process.env.EMAIL_PROVIDER?.trim().toLowerCase() === "ses" &&
        process.env.ALLOW_REAL_EMAIL_SENDS?.trim().toLowerCase() === "true" &&
        Boolean(process.env.SES_FROM_EMAIL?.trim()) &&
        Boolean(
          process.env.SES_REGION?.trim() ||
            process.env.AWS_REGION?.trim(),
        )
          ? "Real-send mode enabled"
          : "Real-send mode not fully configured",
      detail:
        "EMAIL_PROVIDER=ses + real-send flag + sender + AWS region",
    },
  ];
}


export type AdminRecording = { id: string; focus: string | null; overall: number | null; createdAt: Date };

export async function getUserRecordings(userId: string): Promise<AdminRecording[]> {
  try {
    return (await (prisma as unknown as {
      voiceRecording: { findMany: (a: unknown) => Promise<AdminRecording[]> };
    }).voiceRecording.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, focus: true, overall: true, createdAt: true },
    }));
  } catch {
    return [];
  }
}


export type LessonStat = { slug: string; title: string; attempts: number; avg: number };

// Per-lesson usage: how many recordings each lesson has drawn and their
// average clarity. Built from stored attempts (guarded).
export async function getLessonStats(): Promise<LessonStat[]> {
  let rows: { lessonSlug: string | null; overall: number }[] = [];
  try {
    rows = (await (prisma as unknown as {
      pronunciationAttempt: { findMany: (a: unknown) => Promise<{ lessonSlug: string | null; overall: number }[]> };
    }).pronunciationAttempt.findMany({
      where: { source: "azure" },
      take: 5000,
      select: {
        lessonSlug: true,
        overall: true,
      },
    }));
  } catch {
    return [];
  }

  // Title lookup from built-in + custom lessons.
  const titles = new Map<string, string>();
  for (const l of getAllLessons()) titles.set(l.slug, l.subtitle);
  try {
    for (const c of await listCustomLessons({ adminAll: true })) titles.set(c.slug, c.subtitle);
  } catch { /* ignore */ }

  const agg = new Map<string, { sum: number; n: number }>();
  for (const r of rows) {
    const slug = r.lessonSlug || "practice";
    const cur = agg.get(slug) || { sum: 0, n: 0 };
    cur.sum += r.overall;
    cur.n += 1;
    agg.set(slug, cur);
  }

  return [...agg.entries()]
    .map(([slug, v]) => ({ slug, title: titles.get(slug) || slug, attempts: v.n, avg: Math.round(v.sum / v.n) }))
    .sort((a, b) => b.attempts - a.attempts);
}

export type AdminRecordingDirectoryRow = {
  id: string;
  userId: string;
  lessonSlug: string | null;
  focus: string | null;
  overall: number | null;
  mimeType: string;
  createdAt: Date;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

export async function listAdminRecordings(
  limit = 100,
): Promise<AdminRecordingDirectoryRow[]> {
  try {
    return await prisma.voiceRecording.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        userId: true,
        lessonSlug: true,
        focus: true,
        overall: true,
        mimeType: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export type AdminReferralInviteRow = {
  id: string;
  inviterUserId: string;
  friendEmail: string;
  friendName: string | null;
  referralCode: string;
  status: "SENT" | "REGISTERED" | "SUBSCRIBED" | "REWARDED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
  inviter: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

export async function listAdminReferralInvites(
  limit = 200,
): Promise<AdminReferralInviteRow[]> {
  try {
    return await prisma.referralInvite.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        inviterUserId: true,
        friendEmail: true,
        friendName: true,
        referralCode: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        inviter: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  } catch {
    return [];
  }
}
