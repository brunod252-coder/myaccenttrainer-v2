import {
  getLearnerCourseReadModels,
  type LearnerCourseReadModel,
} from "@/lib/curriculum";

import {
  getMissionLessonRecommendations,
} from "./lesson-recommendations";

import {
  getLearningProfile,
  type LearningProfile,
} from "./profile";

export type LearningPathLessonSource =
  | "mission"
  | "curriculum";

export interface LearningPathLesson {
  courseId: string;
  courseSlug: string;
  courseTitle: string;

  moduleId: string;
  moduleTitle: string;

  lessonId: string;
  slug: string;
  title: string;
  description: string | null;

  difficulty: string | null;
  estimatedMinutes: number | null;

  source: LearningPathLessonSource;
  pathOrder: number;
  completed: boolean;
}

export interface LearningPathCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  courseEnrollment:
    LearnerCourseReadModel["courseEnrollment"];
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
}

export interface LearningPathReadModel {
  mission: LearningProfile["mission"];
  level: LearningProfile["level"];

  headline: string;
  description: string;

  totalLessons: number;
  completedLessons: number;
  percentComplete: number;

  nextLesson: LearningPathLesson | null;

  courses: LearningPathCourse[];
  lessons: LearningPathLesson[];
}

interface FlattenedCurriculumLesson {
  courseId: string;
  courseSlug: string;
  courseTitle: string;

  moduleId: string;
  moduleTitle: string;

  lessonId: string;
  slug: string;
  title: string;
  description: string | null;

  difficulty: string | null;
  estimatedMinutes: number | null;

  completed: boolean;
}

function flattenCurriculum(
  courses: LearnerCourseReadModel[],
): FlattenedCurriculumLesson[] {
  return courses.flatMap((course) =>
    course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,

        moduleId: module.id,
        moduleTitle: module.title,

        lessonId: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,

        difficulty:
          lesson.instructional?.difficulty ??
          null,

        estimatedMinutes:
          lesson.instructional
            ?.estimatedMinutes ??
          null,

        /*
         * LearnerCourseReadModel currently exposes aggregate
         * completion, not per-lesson completion state.
         *
         * Per-lesson completion is resolved below using the
         * learner's completed LessonProgress identities.
         */
        completed: false,
      })),
    ),
  );
}

async function getCompletedLessonIds(
  userId: string,
  courseLessons: FlattenedCurriculumLesson[],
): Promise<Set<string>> {
  if (courseLessons.length === 0) {
    return new Set();
  }

  /*
   * Import Prisma lazily inside this read helper so Learning Path
   * remains a derived read model and performs no writes.
   */
  const { prisma } =
    await import("@/lib/prisma");

  const lessonIds =
    courseLessons.map(
      (lesson) => lesson.lessonId,
    );

  const rows =
    await prisma.lessonProgress.findMany({
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
    });

  return new Set(
    rows.map((row) => row.lessonId),
  );
}

/**
 * Derive one learner's purpose-aware path through real published
 * curriculum.
 *
 * Rules:
 * 1. The database Course → Module → Lesson hierarchy remains curriculum truth.
 * 2. The existing mission recommendation engine supplies personalized priority.
 * 3. Recommended lessons that exist in real curriculum are placed first.
 * 4. Remaining curriculum is appended in canonical course/module/lesson order.
 * 5. Lessons are de-duplicated by durable Lesson ID.
 * 6. Completion does not remove lessons from the path.
 * 7. nextLesson is the first unfinished lesson in derived path order.
 * 8. Learning level is carried as learner context only; it does not gate or
 *    reorder the current pronunciation curriculum.
 * 9. This function creates no Course, Enrollment, or LessonProgress records.
 */
export async function getLearningPath(
  userId: string,
): Promise<LearningPathReadModel> {
  const [
    learningProfile,
    learnerCourses,
  ] = await Promise.all([
    getLearningProfile(userId),
    getLearnerCourseReadModels(userId),
  ]);

  const flattened =
    flattenCurriculum(learnerCourses);

  const completedLessonIds =
    await getCompletedLessonIds(
      userId,
      flattened,
    );

  const curriculumLessons =
    flattened.map((lesson) => ({
      ...lesson,
      completed:
        completedLessonIds.has(
          lesson.lessonId,
        ),
    }));

  /*
   * Use the full currently-defined mission priority set.
   *
   * Six explicit missions currently expose up to five useful
   * pronunciation recommendations; General exposes the existing
   * three starter recommendations.
   */
  const missionRecommendations =
    getMissionLessonRecommendations(
      learningProfile.mission,
      5,
    );

  /*
   * A slug is recommendation metadata, not the durable lesson identity.
   * Resolve recommendations against real curriculum first, then dedupe
   * the final path using durable Lesson IDs.
   *
   * Current Basic Pronunciation lesson slugs are globally unique in
   * production, but the schema only guarantees moduleId + slug.
   * Therefore ambiguity is handled defensively: a recommendation is
   * elevated only when it resolves to exactly one real curriculum lesson.
   */
  const bySlug = new Map<
    string,
    FlattenedCurriculumLesson[]
  >();

  for (const lesson of curriculumLessons) {
    const existing =
      bySlug.get(lesson.slug) ?? [];

    existing.push(lesson);

    bySlug.set(
      lesson.slug,
      existing,
    );
  }

  const prioritized: FlattenedCurriculumLesson[] =
    [];

  for (const recommendation of missionRecommendations) {
    const matches =
      bySlug.get(
        recommendation.slug,
      ) ?? [];

    if (matches.length !== 1) {
      continue;
    }

    prioritized.push(
      matches[0],
    );
  }

  const ordered: LearningPathLesson[] =
    [];

  const seenLessonIds =
    new Set<string>();

  function appendLesson(
    lesson: FlattenedCurriculumLesson,
    source: LearningPathLessonSource,
  ) {
    if (
      seenLessonIds.has(
        lesson.lessonId,
      )
    ) {
      return;
    }

    seenLessonIds.add(
      lesson.lessonId,
    );

    ordered.push({
      courseId: lesson.courseId,
      courseSlug: lesson.courseSlug,
      courseTitle: lesson.courseTitle,

      moduleId: lesson.moduleId,
      moduleTitle: lesson.moduleTitle,

      lessonId: lesson.lessonId,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,

      difficulty: lesson.difficulty,
      estimatedMinutes:
        lesson.estimatedMinutes,

      source,
      pathOrder:
        ordered.length + 1,

      completed: lesson.completed,
    });
  }

  for (const lesson of prioritized) {
    appendLesson(
      lesson,
      "mission",
    );
  }

  for (const lesson of curriculumLessons) {
    appendLesson(
      lesson,
      "curriculum",
    );
  }

  const completedLessons =
    ordered.filter(
      (lesson) => lesson.completed,
    ).length;

  const totalLessons =
    ordered.length;

  const percentComplete =
    totalLessons > 0
      ? Math.round(
          (completedLessons /
            totalLessons) *
            100,
        )
      : 0;

  const nextLesson =
    ordered.find(
      (lesson) => !lesson.completed,
    ) ?? null;

  const courses: LearningPathCourse[] =
    learnerCourses.map(
      (course) => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        description:
          course.description,

        courseEnrollment:
          course.courseEnrollment,

        totalLessons:
          course.progress.totalLessons,

        completedLessons:
          course.progress.completedLessons,

        percentComplete:
          course.progress.percentComplete,
      }),
    );

  return {
    mission:
      learningProfile.mission,

    level:
      learningProfile.level,

    headline:
      learningProfile.mission.headline,

    description:
      learningProfile.mission.description,

    totalLessons,
    completedLessons,
    percentComplete,

    nextLesson,

    courses,
    lessons: ordered,
  };
}
