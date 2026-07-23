import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRequest } from "@/lib/auth/admin";
import { createCustomLesson, deleteCustomLesson, toggleCustomLesson, reorderLesson, setLessonAudio } from "@/lib/lessons/custom";

export const runtime = "nodejs";

const schema = z.object({
  action: z.enum(["create", "delete", "toggle", "reorder", "setAudio"]),
  id: z.string().optional(),
  subtitle: z.string().max(120).optional(),
  description: z.string().max(600).optional(),
  focus: z.string().max(20).optional(),
  referenceText: z.string().max(300).optional(),
  published: z.boolean().optional(),
  direction: z.enum(["up", "down"]).optional(),
  audioBase64: z.string().max(2_200_000).optional(),
  audioMime: z.string().max(60).optional(),
});

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = schema.parse(await req.json());
    if (b.action === "create" && b.subtitle && b.referenceText) {
      await createCustomLesson({
        subtitle: b.subtitle,
        description: b.description || "",
        focus: (b.focus || "r").toLowerCase(),
        referenceText: b.referenceText,
      });
    } else if (b.action === "delete" && b.id) {
      await deleteCustomLesson(b.id);
    } else if (b.action === "toggle" && b.id) {
      await toggleCustomLesson(b.id, Boolean(b.published));
    } else if (b.action === "reorder" && b.id && b.direction) {
      await reorderLesson(b.id, b.direction);
    } else if (b.action === "setAudio" && b.id && b.audioBase64) {
      await setLessonAudio(b.id, b.audioBase64, b.audioMime || "audio/wav");
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
