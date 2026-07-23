import { NextRequest, NextResponse } from "next/server";

import { lessonPublisherService } from "@/lib/lesson-publisher/lesson-publisher-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await lessonPublisherService.publish({
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      difficulty: body.difficulty,
      estimatedMinutes: body.estimatedMinutes,
      generatedWords: body.generatedWords,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Lesson publishing failed.",
      },
      {
        status: 500,
      }
    );
  }
}
