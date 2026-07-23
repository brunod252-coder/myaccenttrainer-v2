import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";
import { getRecordingAudio } from "@/lib/pronunciation/recordings";

export const runtime = "nodejs";

// GET /api/recordings/[id] → streams back the learner's own stored recording.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let userId = "";
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    userId = verifyAuthToken(token).userId;
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const audio = await getRecordingAudio(userId, id);
  if (!audio) return new NextResponse("Not found", { status: 404 });

  const bytes = Buffer.from(audio.base64, "base64");
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": audio.mime || "audio/wav",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
