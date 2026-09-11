import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getPublishedCurriculumLessonById } from "@/lib/curriculum";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/lessons/complete  { lessonId: string }
// Marks one real published curriculum lesson complete for the signed-in user.
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("mat_session")?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false },
        { status: 401 },
      );
    }

    const { userId } = verifyAuthToken(token);

    const body = (await req.json().catch(() => ({}))) as {
      lessonId?: string;
    };

    const lessonId = String(body.lessonId ?? "").trim();

    if (!lessonId) {
      return NextResponse.json(
        { ok: false },
        { status: 400 },
      );
    }

    const lesson =
      await getPublishedCurriculumLessonById(
        lessonId,
      );

    if (!lesson) {
      return NextResponse.json(
        {
          ok: false,
          recorded: false,
        },
        { status: 404 },
      );
    }

    const completedAt = new Date();

    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: lesson.id,
        },
      },
      update: {
        status: "COMPLETED",
        completedAt,
      },
      create: {
        userId,
        lessonId: lesson.id,
        status: "COMPLETED",
        completedAt,
      },
    });

    return NextResponse.json({
      ok: true,
      recorded: true,
    });
  } catch (error) {
    console.error(
      "LESSON_COMPLETE_ERROR",
      error,
    );

    return NextResponse.json(
      { ok: false },
      { status: 500 },
    );
  }
}
