// ── Voice recording storage & history ────────────────────────────────
// Stores short recordings (base64) so Nina can play back a learner's
// previous takes. Keeps only the most recent few per learner to stay
// light. Guarded so it compiles/no-ops before `npx prisma db push`.

import { prisma } from "@/lib/prisma";

const KEEP_PER_USER = 6;

type MetaRow = { id: string; focus: string | null; overall: number | null; createdAt: Date; lessonSlug: string | null };

function db() {
  return prisma as unknown as {
    voiceRecording: {
      create: (args: unknown) => Promise<unknown>;
      findMany: (args: unknown) => Promise<MetaRow[]>;
      findFirst: (args: unknown) => Promise<{ audioBase64: string; mimeType: string } | null>;
      deleteMany: (args: unknown) => Promise<unknown>;
    };
  };
}

export async function saveRecording(
  userId: string,
  data: { audioBase64: string; mimeType: string; focus?: string; overall?: number; lessonSlug?: string },
): Promise<void> {
  if (!data.audioBase64) return;
  try {
    await db().voiceRecording.create({
      data: {
        userId,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || "audio/wav",
        focus: data.focus,
        overall: data.overall,
        lessonSlug: data.lessonSlug,
      },
    });
    // Prune: keep only the most recent KEEP_PER_USER for this learner.
    const all = await db().voiceRecording.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, focus: true, overall: true, createdAt: true, lessonSlug: true },
    });
    const stale = all.slice(KEEP_PER_USER).map((r) => r.id);
    if (stale.length) {
      await db().voiceRecording.deleteMany({ where: { id: { in: stale } } });
    }
  } catch {
    // Table not migrated yet — ignore.
  }
}

export type RecordingMeta = { id: string; focus: string | null; overall: number | null; createdAt: Date; lessonSlug: string | null };

export async function listRecordings(userId: string): Promise<RecordingMeta[]> {
  try {
    return await db().voiceRecording.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: KEEP_PER_USER,
      select: { id: true, focus: true, overall: true, createdAt: true, lessonSlug: true },
    });
  } catch {
    return [];
  }
}

export async function getRecordingAudio(
  userId: string,
  id: string,
): Promise<{ base64: string; mime: string } | null> {
  try {
    const rec = await db().voiceRecording.findFirst({
      where: { id, userId },
      select: { audioBase64: true, mimeType: true },
    });
    if (!rec) return null;
    return { base64: rec.audioBase64, mime: rec.mimeType };
  } catch {
    return null;
  }
}
