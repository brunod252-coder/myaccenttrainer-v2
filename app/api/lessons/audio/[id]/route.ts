import { NextResponse } from "next/server";

import { getLessonAudio } from "@/lib/lessons/custom";

export const runtime = "nodejs";

// GET /api/lessons/audio/[id] → the uploaded audio for a custom lesson.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audio = await getLessonAudio(id);
  if (!audio) return new NextResponse("Not found", { status: 404 });
  const bytes = Buffer.from(audio.base64, "base64");
  return new NextResponse(bytes, {
    status: 200,
    headers: { "Content-Type": audio.mime || "audio/wav", "Cache-Control": "public, max-age=86400" },
  });
}
