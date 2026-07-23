import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/jwt";

export const runtime = "nodejs";

// POST /api/lessons/complete  { slug: string }
// Marks a lesson complete for the signed-in user. No-ops gracefully if the
// lesson isn't in the database yet (run /api/dev/seed once after db push).
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });
    const { userId } = verifyAuthToken(token);

    const body = (await req.json().catch(() => ({}))) as { slug?: string };
    const slug = String(body.slug ?? "");
    if (!slug) return NextResponse.json({ ok: false });

    const lesson = await prisma.lesson.findFirst({ where: { slug } });
    if (!lesson) return NextResponse.json({ ok: true, recorded: false });

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      update: { status: "COMPLETED", completedAt: new Date() },
      create: { userId, lessonId: lesson.id, status: "COMPLETED", completedAt: new Date() },
    });

    return NextResponse.json({ ok: true, recorded: true });
  } catch (error) {
    console.error("LESSON_COMPLETE_ERROR", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
