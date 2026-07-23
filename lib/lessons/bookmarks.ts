// ── Lesson favorites & bookmarks ─────────────────────────────────────
// Lets a learner heart a lesson ("favorite") or save it for later
// ("bookmark"). Guarded reads/writes so it compiles and no-ops cleanly
// until `npx prisma db push` creates the LessonBookmark table.

import { prisma } from "@/lib/prisma";

export type BookmarkKind = "favorite" | "bookmark";

type Row = { lessonSlug: string; kind: string };

function db() {
  return prisma as unknown as {
    lessonBookmark: {
      findMany: (args: unknown) => Promise<Row[]>;
      findFirst: (args: unknown) => Promise<{ id: string } | null>;
      create: (args: unknown) => Promise<unknown>;
      delete: (args: unknown) => Promise<unknown>;
    };
  };
}

export type BookmarkState = { favorites: string[]; bookmarks: string[] };

export async function getBookmarkState(userId: string): Promise<BookmarkState> {
  try {
    const rows = await db().lessonBookmark.findMany({ where: { userId } });
    return {
      favorites: rows.filter((r) => r.kind === "favorite").map((r) => r.lessonSlug),
      bookmarks: rows.filter((r) => r.kind === "bookmark").map((r) => r.lessonSlug),
    };
  } catch {
    return { favorites: [], bookmarks: [] };
  }
}

// Toggle a bookmark; returns the new active state (true = now saved).
export async function toggleBookmark(
  userId: string,
  lessonSlug: string,
  kind: BookmarkKind,
): Promise<{ active: boolean }> {
  try {
    const existing = await db().lessonBookmark.findFirst({ where: { userId, lessonSlug, kind } });
    if (existing) {
      await db().lessonBookmark.delete({ where: { id: existing.id } });
      return { active: false };
    }
    await db().lessonBookmark.create({ data: { userId, lessonSlug, kind } });
    return { active: true };
  } catch {
    // Table not migrated yet — report inactive so the UI stays consistent.
    return { active: false };
  }
}
