// ── Learning analytics ───────────────────────────────────────────────
// Turns raw practice attempts into the views a learner wants to see over
// time: a practice calendar, month-by-month progress, speaking time, and a
// recent-activity timeline. Guarded reads so it's safe before migration
// and for brand-new learners.

import { prisma } from "@/lib/prisma";

type Row = {
  overall: number;
  focus: string | null;
  source: string;
  createdAt: Date;
};

const FOCUS_LABELS: Record<string, string> = {
  r: "American R", l: "The L sound", th: "TH", v: "V and W", w: "V and W",
  sh: "SH", ee: "Vowels", stress: "Word stress", endings: "Final sounds", linking: "Linking",
};
function labelFor(focus: string | null): string {
  if (!focus) return "General practice";
  return FOCUS_LABELS[focus] || focus;
}

// Average seconds of speaking per recording (the recorder caps at ~8s).
const SECONDS_PER_ATTEMPT = 7;

function db() {
  return prisma as unknown as {
    pronunciationAttempt: { findMany: (args: unknown) => Promise<Row[]> };
  };
}

export type CalendarDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type MonthBucket = {
  label: string;
  attempts: number;
  avg: number | null;
};
export type TimelineItem = { date: string; label: string; overall: number };

export type Analytics = {
  hasData: boolean;
  totalAttempts: number;
  daysPracticed: number;
  distinctSounds: number;
  speakingMinutes: number;
  calendar: CalendarDay[]; // last 84 days, oldest → newest
  weeks: number; // number of week columns in the calendar
  months: MonthBucket[]; // last 6 months, oldest → newest
  timeline: TimelineItem[]; // most recent first
};

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getAnalytics(userId: string): Promise<Analytics> {
  let rows: Row[] = [];
  try {
    rows = await db().pronunciationAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 1000,
    });
  } catch {
    rows = [];
  }

  const empty: Analytics = {
    hasData: false, totalAttempts: 0, daysPracticed: 0, distinctSounds: 0, speakingMinutes: 0,
    calendar: buildEmptyCalendar(), weeks: 12, months: [], timeline: [],
  };
  if (!rows.length) return empty;

  const measured = rows.filter(
    (r) => r.source === "azure",
  );

  // ── per-day counts: all practice activity ──
  const perDay = new Map<string, number>();
  for (const r of rows) {
    const key = ymd(new Date(r.createdAt));
    perDay.set(key, (perDay.get(key) || 0) + 1);
  }

  // ── calendar: last 84 days ending today ──
  const DAYS = 84;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calendar: CalendarDay[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = ymd(d);
    const count = perDay.get(key) || 0;
    calendar.push({ date: key, count, level: levelFor(count) });
  }

  // ── months: activity count + measured clarity ──
  const monthMap = new Map<
    string,
    {
      attempts: number;
      measuredSum: number;
      measuredN: number;
      label: string;
    }
  >();

  for (const r of rows) {
    const d = new Date(r.createdAt);
    const key =
      `${d.getFullYear()}-${d.getMonth()}`;

    const label = d.toLocaleDateString(
      "en-US",
      {
        month: "short",
        year: "2-digit",
      },
    );

    const current =
      monthMap.get(key) || {
        attempts: 0,
        measuredSum: 0,
        measuredN: 0,
        label,
      };

    current.attempts += 1;

    if (r.source === "azure") {
      current.measuredSum += r.overall;
      current.measuredN += 1;
    }

    monthMap.set(key, current);
  }

  const months: MonthBucket[] =
    [...monthMap.values()]
      .slice(-6)
      .map((month) => ({
        label: month.label,
        attempts: month.attempts,
        avg: month.measuredN
          ? Math.round(
              month.measuredSum /
                month.measuredN,
            )
          : null,
      }));

  // ── timeline: most recent 8 ──
  const timeline: TimelineItem[] = [...measured]
    .slice(-8)
    .reverse()
    .map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      label: labelFor(r.focus),
      overall: r.overall,
    }));

  return {
    hasData: true,
    totalAttempts: rows.length,
    daysPracticed: perDay.size,
    distinctSounds: new Set(rows.map((r) => r.focus || "general")).size,
    speakingMinutes: Math.max(1, Math.round((rows.length * SECONDS_PER_ATTEMPT) / 60)),
    calendar,
    weeks: 12,
    months,
    timeline,
  };
}

function levelFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

function buildEmptyCalendar(): CalendarDay[] {
  const DAYS = 84;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const out: CalendarDay[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({ date: ymd(d), count: 0, level: 0 });
  }
  return out;
}

// Rows for CSV export (raw attempts, newest first).
export async function getAttemptRowsForExport(
  userId: string,
): Promise<
  {
    date: string;
    sound: string;
    score: number | null;
    source: string;
  }[]
> {
  try {
    const rows = await db().pronunciationAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 2000,
    });
    return rows.map((r) => ({
      date: new Date(r.createdAt).toISOString(),
      sound: labelFor(r.focus),
      score:
        r.source === "azure"
          ? r.overall
          : null,
      source: r.source,
    }));
  } catch {
    return [];
  }
}
