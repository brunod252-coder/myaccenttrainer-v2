import { NextRequest, NextResponse } from "next/server";

import { lessonBuilderService } from "@/lib/lesson-builder/lesson-builder-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await lessonBuilderService.generateLessonAudio({
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      difficulty: body.difficulty,
      estimatedMinutes: body.estimatedMinutes,
      words: body.words,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Lesson generation failed.",
      },
      {
        status: 500,
      }
    );
  }
}
