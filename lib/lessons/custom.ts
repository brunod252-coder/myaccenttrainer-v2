// ── Custom (admin-authored) lessons ──────────────────────────────────
// Admins can create extra lessons stored in the database. They render
// through the same section builder as the built-in lessons, so the learner
// experience is identical. Guarded so it no-ops before migration.

import { prisma } from "@/lib/prisma";
import { buildSections } from "./lesson-data";
import type { Lesson } from "./lesson-types";

export type CustomLessonRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  focus: string;
  referenceText: string;
  difficulty: string;
  estimatedMinutes: number;
  published: boolean;
  sortOrder: number;
  audioBase64?: string | null;
  audioMime?: string | null;
};

function db() {
  return prisma as unknown as {
    customLesson: {
      findMany: (a?: unknown) => Promise<CustomLessonRow[]>;
      findUnique: (a: unknown) => Promise<CustomLessonRow | null>;
      create: (a: unknown) => Promise<unknown>;
      update: (a: unknown) => Promise<unknown>;
      delete: (a: unknown) => Promise<unknown>;
    };
  };
}

export function toLesson(row: CustomLessonRow): Lesson {
  const allowed = ["Beginner", "Intermediate", "Advanced"];
  const difficulty = (allowed.includes(row.difficulty) ? row.difficulty : "Beginner") as Lesson["difficulty"];
  const sections = buildSections(row.referenceText, row.focus);
  if (row.audioBase64 && sections[0]) {
    // Play the uploaded recording on the "listen" step instead of the browser voice.
    sections[0].audioUrl = "/api/lessons/audio/" + row.id;
  }
  return {
    id: "custom-" + row.id,
    slug: row.slug,
    title: row.title || "Lesson",
    subtitle: row.subtitle,
    description: row.description,
    course: "Custom lessons",
    difficulty,
    estimatedMinutes: row.estimatedMinutes || 5,
    sections,
  };
}

export async function listCustomLessons(opts?: { adminAll?: boolean }): Promise<CustomLessonRow[]> {
  try {
    const rows = await db().customLesson.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    return opts?.adminAll ? rows : rows.filter((r) => r.published);
  } catch {
    return [];
  }
}

function slugify(s: string): string {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
  return (base || "lesson") + "-" + Math.random().toString(36).slice(2, 6);
}

export async function createCustomLesson(input: {
  subtitle: string; description: string; focus: string; referenceText: string; difficulty?: string; sortOrder?: number;
}): Promise<void> {
  try {
    await db().customLesson.create({
      data: {
        slug: slugify(input.subtitle),
        title: "Lesson",
        subtitle: input.subtitle,
        description: input.description,
        focus: input.focus || "r",
        referenceText: input.referenceText,
        difficulty: input.difficulty || "Beginner",
        sortOrder: input.sortOrder ?? 100,
      },
    });
  } catch { /* not migrated */ }
}

export async function deleteCustomLesson(id: string): Promise<void> {
  try { await db().customLesson.delete({ where: { id } }); } catch {}
}
export async function toggleCustomLesson(id: string, published: boolean): Promise<void> {
  try { await db().customLesson.update({ where: { id }, data: { published } }); } catch {}
}


export async function setLessonAudio(id: string, audioBase64: string, audioMime: string): Promise<void> {
  try { await db().customLesson.update({ where: { id }, data: { audioBase64, audioMime } }); } catch {}
}

export async function getLessonAudio(id: string): Promise<{ base64: string; mime: string } | null> {
  try {
    const row = await db().customLesson.findUnique({ where: { id } });
    if (!row?.audioBase64) return null;
    return { base64: row.audioBase64, mime: row.audioMime || "audio/wav" };
  } catch {
    return null;
  }
}

// Move a lesson up/down by swapping sortOrder with its neighbour.
export async function reorderLesson(id: string, dir: "up" | "down"): Promise<void> {
  try {
    const all = await db().customLesson.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    const idx = all.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= all.length) return;
    const a = all[idx], b = all[swapIdx];
    // normalise sortOrders to their positions, then swap the two
    await db().customLesson.update({ where: { id: a.id }, data: { sortOrder: (b.sortOrder ?? swapIdx) } });
    await db().customLesson.update({ where: { id: b.id }, data: { sortOrder: (a.sortOrder ?? idx) } });
  } catch {}
}
