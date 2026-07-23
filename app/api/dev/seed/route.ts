import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAllLessons } from "@/lib/lessons";

export const runtime = "nodejs";

// GET /api/dev/seed
// Development helper: loads the static lessons into the database as a
// Course → Module → Lessons so progress and enrollment can be tracked.
// Idempotent (safe to hit repeatedly). Disabled in production.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seeding is disabled in production." }, { status: 403 });
  }

  try {
    const course = await prisma.course.upsert({
      where: { slug: "basic-pronunciation" },
      update: { title: "Basic Pronunciation", isPublished: true },
      create: {
        slug: "basic-pronunciation",
        title: "Basic Pronunciation",
        description: "Nina's core sound lessons.",
        isPublished: true,
        sortOrder: 0,
      },
    });

    let mod = await prisma.module.findFirst({ where: { courseId: course.id } });
    if (!mod) {
      mod = await prisma.module.create({
        data: { courseId: course.id, title: "Core Sounds", sortOrder: 0 },
      });
    }

    const lessons = getAllLessons();
    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      await prisma.lesson.upsert({
        where: { moduleId_slug: { moduleId: mod.id, slug: l.slug } },
        update: { title: l.subtitle, description: l.description, isPublished: true, sortOrder: i },
        create: {
          moduleId: mod.id,
          slug: l.slug,
          title: l.subtitle,
          description: l.description,
          isPublished: true,
          sortOrder: i,
        },
      });
    }

    const lessonCount = await prisma.lesson.count();
    return NextResponse.json({ ok: true, course: course.slug, lessons: lessonCount });
  } catch (error) {
    console.error("SEED_ERROR", error);
    return NextResponse.json(
      { error: "Seeding failed. Make sure you ran `npx prisma db push` first." },
      { status: 500 },
    );
  }
}
