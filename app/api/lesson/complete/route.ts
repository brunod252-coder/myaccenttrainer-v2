import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { lessonCompletionService } from "@/lib/lesson-completion/lesson-completion-service";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mat_session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = verifyAuthToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const lessonSlug = String(body.lessonSlug || "").trim();
    const wordsPracticed = Number(body.wordsPracticed || 0);

    if (!lessonSlug || wordsPracticed < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid completion payload." },
        { status: 400 }
      );
    }

    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
const result = await lessonCompletionService.completeLesson({
  learnerId: user.id,
  displayName,
  lessonSlug,
  lessonTitle: String(body.lessonTitle || lessonSlug),
  wordsPracticed,
});

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Failed to complete lesson." },
      { status: 500 }
    );
  }
}
