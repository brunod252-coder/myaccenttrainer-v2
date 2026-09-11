import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import { Arrow } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { getLearningPath } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export default async function DashboardCoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const learningPath =
    await getLearningPath(payload.userId);

  const userName =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ") || user.email;

  const nextLesson =
    learningPath.nextLesson;

  return (
    <AppLayout
      userName={userName}
      role={user.role}
    >
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">
          Your learning path
        </p>

        <h1 className="mt-1 font-display text-3xl text-[#17223b]">
          {learningPath.headline}
        </h1>

        <p className="mt-2 text-sm font-medium text-[#52719f]">
          {learningPath.level} ·{" "}
          {learningPath.mission.label}
        </p>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
          {learningPath.description}
        </p>
      </div>

      {learningPath.lessons.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f8f3] text-2xl">
            🗣️
          </div>

          <h2 className="mt-5 font-display text-xl text-[#17223b]">
            Your curriculum is being prepared
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            There are no published lessons in your
            learning path yet. When curriculum becomes
            available, Nina will organize it around your
            learning goal here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#52719f]">
                Path progress
              </p>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-3xl text-[#17223b]">
                    {learningPath.percentComplete}%
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {learningPath.completedLessons} of{" "}
                    {learningPath.totalLessons} lessons
                    complete
                  </p>
                </div>

                <div className="rounded-full bg-[#e9f8f3] px-3 py-1 text-xs font-semibold text-[#168c56]">
                  {learningPath.completedLessons ===
                  learningPath.totalLessons
                    ? "Path complete"
                    : "In progress"}
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#20ad68] to-[#52719f]"
                  style={{
                    width: `${learningPath.percentComplete}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                Nina has ordered the available curriculum
                around your{" "}
                {learningPath.mission.shortLabel} goal.
                Completed lessons stay in your path so you
                can revisit them whenever you want.
              </p>
            </section>

            {nextLesson ? (
              <section className="rounded-2xl border border-[#d7f2e7] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">
                      Your next step
                    </p>

                    <h2 className="mt-2 font-display text-2xl text-[#17223b]">
                      {nextLesson.title}
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#e9f8f3] px-3 py-1 text-xs font-semibold text-[#168c56]">
                    {nextLesson.source === "mission"
                      ? "Nina recommends"
                      : "Recommended next"}
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium text-[#52719f]">
                  {nextLesson.courseTitle} ·{" "}
                  {nextLesson.moduleTitle}
                </p>

                {nextLesson.description && (
                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {nextLesson.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  {nextLesson.difficulty && (
                    <span className="rounded-full bg-[#e9f8f3] px-3 py-1 text-[#168c56]">
                      {nextLesson.difficulty}
                    </span>
                  )}

                  {nextLesson.estimatedMinutes !==
                    null && (
                    <span className="rounded-full bg-[#e9f1f6] px-3 py-1 text-[#52719f]">
                      about{" "}
                      {nextLesson.estimatedMinutes} min
                    </span>
                  )}
                </div>

                <Link
                  href={`/dashboard/lesson/${nextLesson.slug}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#20ad68] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357]"
                >
                  Practice with Nina
                  <Arrow className="h-4 w-4" />
                </Link>
              </section>
            ) : (
              <section className="rounded-2xl border border-[#d7f2e7] bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">
                  Your next step
                </p>

                <h2 className="mt-2 font-display text-2xl text-[#17223b]">
                  Path complete
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  You have completed every lesson currently
                  available in this learning path. You can
                  still revisit any lesson below.
                </p>
              </section>
            )}
          </div>

          <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">
                Personalized path
              </p>

              <h2 className="mt-1 font-display text-2xl text-[#17223b]">
                Your lessons, in Nina&apos;s recommended
                order
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
                Mission priorities come first, followed by
                the rest of your published course
                curriculum. Lesson difficulty remains the
                course&apos;s instructional label and does
                not change based on your profile level.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="divide-y divide-gray-100">
                {learningPath.lessons.map(
                  (lesson) => {
                    const isNext =
                      nextLesson?.lessonId ===
                      lesson.lessonId;

                    const status = lesson.completed
                      ? "Completed"
                      : isNext
                        ? "Recommended next"
                        : lesson.source === "mission"
                          ? "Nina priority"
                          : "In your course";

                    return (
                      <Link
                        key={lesson.lessonId}
                        href={`/dashboard/lesson/${lesson.slug}`}
                        className="group flex items-start gap-4 p-5 transition hover:bg-[#f8fbfa]"
                      >
                        <div
                          className={
                            lesson.completed
                              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e5f3ec] text-sm font-semibold text-[#2e7d5b]"
                              : isNext
                                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#20ad68] text-sm font-semibold text-white"
                                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f1f6] text-sm font-semibold text-[#52719f]"
                          }
                        >
                          {lesson.pathOrder}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[#17223b] transition group-hover:text-[#20ad68]">
                              {lesson.title}
                            </h3>

                            <span
                              className={
                                lesson.completed
                                  ? "rounded-full bg-[#e5f3ec] px-2.5 py-1 text-[11px] font-semibold text-[#2e7d5b]"
                                  : isNext
                                    ? "rounded-full bg-[#e9f8f3] px-2.5 py-1 text-[11px] font-semibold text-[#168c56]"
                                    : lesson.source ===
                                        "mission"
                                      ? "rounded-full bg-[#edf4fb] px-2.5 py-1 text-[11px] font-semibold text-[#52719f]"
                                      : "rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500"
                              }
                            >
                              {status}
                            </span>
                          </div>

                          {lesson.description && (
                            <p className="mt-1 text-sm leading-6 text-gray-500">
                              {lesson.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                            <span>
                              {lesson.courseTitle}
                            </span>

                            <span aria-hidden="true">
                              ·
                            </span>

                            <span>
                              {lesson.moduleTitle}
                            </span>

                            {lesson.difficulty && (
                              <>
                                <span aria-hidden="true">
                                  ·
                                </span>

                                <span>
                                  {lesson.difficulty}
                                </span>
                              </>
                            )}

                            {lesson.estimatedMinutes !==
                              null && (
                              <>
                                <span aria-hidden="true">
                                  ·
                                </span>

                                <span>
                                  about{" "}
                                  {
                                    lesson.estimatedMinutes
                                  }{" "}
                                  min
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <Arrow className="mt-2 h-5 w-5 shrink-0 text-[#20ad68] transition group-hover:translate-x-1" />
                      </Link>
                    );
                  },
                )}
              </div>
            </div>
          </section>

          {learningPath.courses.length > 0 && (
            <section className="mt-10">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#52719f]">
                  Course foundation
                </p>

                <h2 className="mt-1 font-display text-xl text-[#17223b]">
                  The real courses behind your path
                </h2>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
                  Your learning path personalizes the order
                  of published course material without
                  changing the identity of the underlying
                  courses.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {learningPath.courses.map(
                  (course) => (
                    <div
                      key={course.id}
                      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-xl text-[#17223b]">
                            {course.title}
                          </h3>

                          {course.description && (
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                              {course.description}
                            </p>
                          )}
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e9f8f3] text-xl">
                          🔤
                        </div>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <p className="text-sm text-gray-500">
                          {course.completedLessons} of{" "}
                          {course.totalLessons} lessons
                          complete
                        </p>

                        <span className="text-sm font-semibold text-[#52719f]">
                          {course.percentComplete}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#20ad68] to-[#52719f]"
                          style={{
                            width: `${course.percentComplete}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}
        </>
      )}
    </AppLayout>
  );
}
