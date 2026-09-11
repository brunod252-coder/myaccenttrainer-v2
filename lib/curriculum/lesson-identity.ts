import { prisma } from "@/lib/prisma";

export interface PublishedCurriculumLessonIdentity {
  id: string;
  slug: string;
  moduleId: string;
  courseId: string;
  courseSlug: string;
}

/**
 * Resolve a human-readable lesson slug into one durable learner-visible
 * curriculum identity.
 *
 * Lesson.slug is not globally unique in the schema. Therefore a slug is
 * accepted only when it resolves to exactly one published lesson belonging
 * to a published course.
 */
export async function getPublishedCurriculumLessonBySlug(
  slug: string,
): Promise<PublishedCurriculumLessonIdentity | null> {
  const matches = await prisma.lesson.findMany({
    where: {
      slug,
      isPublished: true,
      module: {
        course: {
          isPublished: true,
        },
      },
    },
    select: {
      id: true,
      slug: true,
      moduleId: true,
      module: {
        select: {
          courseId: true,
          course: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
    take: 2,
  });

  if (matches.length !== 1) {
    return null;
  }

  const [lesson] = matches;

  return {
    id: lesson.id,
    slug: lesson.slug,
    moduleId: lesson.moduleId,
    courseId: lesson.module.courseId,
    courseSlug: lesson.module.course.slug,
  };
}

/**
 * Validate a durable lesson identity before recording learner progress.
 */
export async function getPublishedCurriculumLessonById(
  lessonId: string,
): Promise<PublishedCurriculumLessonIdentity | null> {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      isPublished: true,
      module: {
        course: {
          isPublished: true,
        },
      },
    },
    select: {
      id: true,
      slug: true,
      moduleId: true,
      module: {
        select: {
          courseId: true,
          course: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return null;
  }

  return {
    id: lesson.id,
    slug: lesson.slug,
    moduleId: lesson.moduleId,
    courseId: lesson.module.courseId,
    courseSlug: lesson.module.course.slug,
  };
}
