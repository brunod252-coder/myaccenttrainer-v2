import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/admin/recordings/[id] → stream any learner's recording (admin only).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return new NextResponse("Forbidden", { status: 403 });
  const { id } = await params;
  try {
    const rec = await (prisma as unknown as {
      voiceRecording: { findUnique: (a: unknown) => Promise<{ audioBase64: string; mimeType: string } | null> };
    }).voiceRecording.findUnique({ where: { id }, select: { audioBase64: true, mimeType: true } });
    if (!rec) return new NextResponse("Not found", { status: 404 });
    const bytes = Buffer.from(rec.audioBase64, "base64");
    return new NextResponse(bytes, {
      status: 200,
      headers: { "Content-Type": rec.mimeType || "audio/wav", "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
