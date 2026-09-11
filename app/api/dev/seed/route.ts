import { NextResponse } from "next/server";

import { syncCoreCurriculum } from "@/lib/curriculum";

export const runtime = "nodejs";

// GET /api/dev/seed
// Development helper: synchronizes the canonical built-in curriculum with
// durable Course → Module → Lesson database identities.
// Idempotent and disabled in production.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seeding is disabled in production." },
      { status: 403 },
    );
  }

  try {
    const result = await syncCoreCurriculum();

    return NextResponse.json({
      ok: true,
      course: result.course.slug,
      module: result.module.title,
      lessons: result.lessons.synchronized,
    });
  } catch (error) {
    console.error("SEED_ERROR", error);

    return NextResponse.json(
      {
        error:
          "Seeding failed. Make sure the database schema is current first.",
      },
      { status: 500 },
    );
  }
}
