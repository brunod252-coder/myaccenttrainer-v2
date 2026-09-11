import { getAllLessons } from "@/lib/lessons";
import { prisma } from "@/lib/prisma";

export const CORE_COURSE = {
  slug: "basic-pronunciation",
  title: "Basic Pronunciation",
  description: "Nina's core sound lessons.",
  sortOrder: 0,
} as const;

export const CORE_MODULE = {
  title: "Core Sounds",
  description: "Core pronunciation sounds, stress, endings, and connected speech.",
  sortOrder: 0,
} as const;

export interface CoreCurriculumSyncResult {
  course: {
    id: string;
    slug: string;
    title: string;
  };
  module: {
    id: string;
    title: string;
  };
  lessons: {
    expected: number;
    synchronized: number;
  };
}

/**
 * Synchronize the built-in pronunciation curriculum with durable database
 * identities used by course publication, enrollment, and lesson progress.
 *
 * Contract:
 * - idempotent
 * - additive / updating only
 * - never deletes curriculum
 * - built-in lesson definitions remain the canonical instructional source
 * - database Course / Module / Lesson rows provide durable identities
 */
export async function syncCoreCurriculum(): Promise<CoreCurriculumSyncResult> {
  const course = await prisma.course.upsert({
    where: {
      slug: CORE_COURSE.slug,
    },
    update: {
      title: CORE_COURSE.title,
      description: CORE_COURSE.description,
      isPublished: true,
      sortOrder: CORE_COURSE.sortOrder,
    },
    create: {
      slug: CORE_COURSE.slug,
      title: CORE_COURSE.title,
      description: CORE_COURSE.description,
      isPublished: true,
      sortOrder: CORE_COURSE.sortOrder,
    },
  });

  let coreModule = await prisma.module.findFirst({
    where: {
      courseId: course.id,
      title: CORE_MODULE.title,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  if (coreModule) {
    coreModule = await prisma.module.update({
      where: {
        id: coreModule.id,
      },
      data: {
        title: CORE_MODULE.title,
        description: CORE_MODULE.description,
        sortOrder: CORE_MODULE.sortOrder,
      },
    });
  } else {
    coreModule = await prisma.module.create({
      data: {
        courseId: course.id,
        title: CORE_MODULE.title,
        description: CORE_MODULE.description,
        sortOrder: CORE_MODULE.sortOrder,
      },
    });
  }

  const lessons = getAllLessons();

  for (let index = 0; index < lessons.length; index += 1) {
    const lesson = lessons[index];

    await prisma.lesson.upsert({
      where: {
        moduleId_slug: {
          moduleId: coreModule.id,
          slug: lesson.slug,
        },
      },
      update: {
        title: lesson.subtitle,
        description: lesson.description,
        isPublished: true,
        sortOrder: index,
      },
      create: {
        moduleId: coreModule.id,
        slug: lesson.slug,
        title: lesson.subtitle,
        description: lesson.description,
        isPublished: true,
        sortOrder: index,
      },
    });
  }

  return {
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
    },
    module: {
      id: coreModule.id,
      title: coreModule.title,
    },
    lessons: {
      expected: lessons.length,
      synchronized: lessons.length,
    },
  };
}
