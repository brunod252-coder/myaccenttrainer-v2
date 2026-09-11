import { getAllLessons } from "@/lib/lessons";
import { prisma } from "@/lib/prisma";

import { CORE_COURSE } from "./sync-core-curriculum";

/**
 * Learner-facing curriculum read model.
 *
 * Architecture:
 *
 *   Database Course / Module / Lesson
 *       = durable curriculum identity, publication, hierarchy, ordering.
 *
 *   Built-in lesson catalog
 *       = canonical instructional metadata/content for built-in lessons.
 *
 *   Enrollment / LessonProgress
 *       = optional learner-specific overlay.
 *
 * This layer intentionally does not create enrollment or progress records.
 */

export interface CourseLessonInstructionalMetadata {
  difficulty: string;
  estimatedMinutes: number;
}

export interface CourseLessonReadModel {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;

  /**
   * Present when this durable DB lesson identity maps to an existing
   * built-in instructional lesson.
   */
  instructional: CourseLessonInstructionalMetadata | null;
}

export interface CourseModuleReadModel {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessonCount: number;
  lessons: CourseLessonReadModel[];
}

export interface CourseReadModel {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  moduleCount: number;
  lessonCount: number;
  modules: CourseModuleReadModel[];
}

export interface CourseEnrollmentReadModel {
  id: string;
  status: string;
}

export interface CourseProgressReadModel {
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;
}

export interface LearnerCourseReadModel extends CourseReadModel {
  /**
   * Curriculum enrollment only.
   *
   * This is deliberately distinct from the membership/account enrollment
   * lifecycle implemented in lib/auth/enrollment.ts.
   */
  courseEnrollment: CourseEnrollmentReadModel | null;

  progress: CourseProgressReadModel;
}

const builtInLessonsBySlug = new Map(
  getAllLessons().map((lesson) => [
    lesson.slug,
    lesson,
  ]),
);

function getBuiltInInstructionalMetadata(
  courseSlug: string,
  lessonSlug: string,
): CourseLessonInstructionalMetadata | null {
  /*
   * The current built-in catalog belongs to Basic Pronunciation.
   * Do not accidentally apply those lesson definitions to some future
   * course that happens to reuse a lesson slug.
   */
  if (courseSlug !== CORE_COURSE.slug) {
    return null;
  }

  const lesson = builtInLessonsBySlug.get(lessonSlug);

  if (!lesson) {
    return null;
  }

  return {
    difficulty: lesson.difficulty,
    estimatedMinutes: lesson.estimatedMinutes,
  };
}

/**
 * Return learner-visible published curriculum.
 *
 * Publication semantics:
 * - Course must be published.
 * - Lesson must be published.
 * - Module currently has no publication flag.
 * - Empty modules are omitted.
 * - A published course with no learner-visible lessons is omitted.
 *
 * This deliberately has no static-course fallback. The database hierarchy
 * is the durable source of curriculum availability.
 */
export async function getPublishedCourseReadModels(): Promise<
  CourseReadModel[]
> {
  const rows = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      imageUrl: true,
      sortOrder: true,
      isPublished: true,
      modules: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            id: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          description: true,
          sortOrder: true,
          lessons: {
            where: {
              isPublished: true,
            },
            orderBy: [
              {
                sortOrder: "asc",
              },
              {
                id: "asc",
              },
            ],
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              sortOrder: true,
              isPublished: true,
            },
          },
        },
      },
    },
  });

  return rows
    .map((course): CourseReadModel => {
      const modules = course.modules
        .map((module): CourseModuleReadModel => {
          const lessons = module.lessons.map(
            (lesson): CourseLessonReadModel => ({
              id: lesson.id,
              slug: lesson.slug,
              title: lesson.title,
              description: lesson.description,
              sortOrder: lesson.sortOrder,
              isPublished: lesson.isPublished,
              instructional:
                getBuiltInInstructionalMetadata(
                  course.slug,
                  lesson.slug,
                ),
            }),
          );

          return {
            id: module.id,
            title: module.title,
            description: module.description,
            sortOrder: module.sortOrder,
            lessonCount: lessons.length,
            lessons,
          };
        })
        .filter(
          (module) => module.lessonCount > 0,
        );

      const lessonCount = modules.reduce(
        (total, module) =>
          total + module.lessonCount,
        0,
      );

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        sortOrder: course.sortOrder,
        isPublished: course.isPublished,
        moduleCount: modules.length,
        lessonCount,
        modules,
      };
    })
    .filter(
      (course) => course.lessonCount > 0,
    );
}

/**
 * Overlay learner-specific course enrollment and completion state without
 * changing curriculum availability or creating records.
 */
export async function getLearnerCourseReadModels(
  userId: string,
): Promise<LearnerCourseReadModel[]> {
  const courses =
    await getPublishedCourseReadModels();

  if (courses.length === 0) {
    return [];
  }

  const courseIds = courses.map(
    (course) => course.id,
  );

  const lessonIds = courses.flatMap(
    (course) =>
      course.modules.flatMap(
        (module) =>
          module.lessons.map(
            (lesson) => lesson.id,
          ),
      ),
  );

  const [courseEnrollments, completedProgress] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: {
          userId,
          courseId: {
            in: courseIds,
          },
        },
        select: {
          id: true,
          courseId: true,
          status: true,
        },
      }),

      lessonIds.length > 0
        ? prisma.lessonProgress.findMany({
            where: {
              userId,
              lessonId: {
                in: lessonIds,
              },
              status: "COMPLETED",
            },
            select: {
              lessonId: true,
            },
          })
        : Promise.resolve([]),
    ]);

  const enrollmentByCourseId = new Map(
    courseEnrollments.map(
      (courseEnrollment) => [
        courseEnrollment.courseId,
        courseEnrollment,
      ],
    ),
  );

  const completedLessonIds = new Set(
    completedProgress.map(
      (progress) => progress.lessonId,
    ),
  );

  return courses.map(
    (course): LearnerCourseReadModel => {
      const completedLessons =
        course.modules.reduce(
          (total, module) =>
            total +
            module.lessons.filter(
              (lesson) =>
                completedLessonIds.has(
                  lesson.id,
                ),
            ).length,
          0,
        );

      const courseEnrollment =
        enrollmentByCourseId.get(course.id);

      return {
        ...course,

        courseEnrollment: courseEnrollment
          ? {
              id: courseEnrollment.id,
              status: courseEnrollment.status,
            }
          : null,

        progress: {
          completedLessons,
          totalLessons: course.lessonCount,
          percentComplete:
            course.lessonCount > 0
              ? Math.round(
                  (completedLessons /
                    course.lessonCount) *
                    100,
                )
              : 0,
        },
      };
    },
  );
}
