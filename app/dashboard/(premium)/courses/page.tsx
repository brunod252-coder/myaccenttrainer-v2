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
      <section className="mb-6 rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
        <p className="mat-eyebrow">
          My Learning
        </p>

        <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-[var(--mat-ink)] sm:text-4xl">
          {learningPath.headline}
        </h1>

        <p className="mt-3 text-sm font-semibold text-[var(--mat-blue)] sm:text-base">
          {learningPath.level} ·{" "}
          {learningPath.mission.label}
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--mat-muted)]">
          {learningPath.description}
        </p>
      </section>

      {learningPath.lessons.length === 0 ? (
        <div className="mat-empty-state">
          <p className="mat-eyebrow">
            Learning path
          </p>

          <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
            Your curriculum is being prepared
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--mat-muted)]">
            There are no published lessons in your learning path yet.
            When curriculum becomes available, Nina will organize it
            around your learning goal here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted)]">
                Path progress
              </p>

              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-3xl text-[var(--mat-ink)]">
                    {learningPath.percentComplete}%
                  </p>

                  <p className="mt-1 text-sm text-[var(--mat-muted)]">
                    {learningPath.completedLessons} of{" "}
                    {learningPath.totalLessons} lessons
                    complete
                  </p>
                </div>

                <div className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
                  {learningPath.completedLessons ===
                  learningPath.totalLessons
                    ? "Path complete"
                    : "In progress"}
                </div>
              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[var(--mat-surface-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--mat-green-700)]"
                  style={{
                    width: `${learningPath.percentComplete}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-sm leading-7 text-[var(--mat-muted)]">
                Nina has ordered the available curriculum
                around your{" "}
                {learningPath.mission.shortLabel} goal.
                Completed lessons stay in your path so you
                can revisit them whenever you want.
              </p>
            </section>

            {nextLesson ? (
              <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-green-700)]">
                      Your next step
                    </p>

                    <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
                      {nextLesson.title}
                    </h2>
                  </div>

                  <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
                    {nextLesson.source === "mission"
                      ? "Nina recommends"
                      : "Recommended next"}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-[var(--mat-blue)]">
                  {nextLesson.courseTitle} ·{" "}
                  {nextLesson.moduleTitle}
                </p>

                {nextLesson.description && (
                  <p className="mt-3 text-sm leading-7 text-[var(--mat-muted)]">
                    {nextLesson.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  {nextLesson.difficulty && (
                    <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
                      {nextLesson.difficulty}
                    </span>
                  )}

                  {nextLesson.estimatedMinutes !==
                    null && (
                    <span className="mat-pill bg-[var(--mat-blue-soft)] text-[var(--mat-blue)]">
                      about{" "}
                      {nextLesson.estimatedMinutes} min
                    </span>
                  )}
                </div>

                <Link
                  href={`/dashboard/lesson/${nextLesson.slug}`}
                  className="mat-button mat-button-primary mt-5"
                >
                  Practice with Nina
                  <Arrow className="h-4 w-4" />
                </Link>
              </section>
            ) : (
              <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-green-700)]">
                  Your next step
                </p>

                <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
                  Path complete
                </h2>

                <p className="mt-2 text-sm leading-7 text-[var(--mat-muted)]">
                  You have completed every lesson currently
                  available in this learning path. You can
                  still revisit any lesson below.
                </p>
              </section>
            )}
          </div>

          <section className="mt-8 rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <div className="mb-5">
              <p className="mat-eyebrow">
                Personalized path
              </p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Your lessons, in Nina&apos;s recommended
                order
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--mat-muted)]">
                Mission priorities come first, followed by
                the rest of your published course
                curriculum. Lesson difficulty remains the
                course&apos;s instructional label and does
                not change based on your profile level.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--mat-border)] bg-[var(--mat-surface-soft)]">
              <div className="divide-y divide-[var(--mat-border)]">
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
                        className="group flex items-start gap-4 bg-white p-5 transition hover:bg-[var(--mat-green-50)]"
                      >
                        <div
                          className={
                            lesson.completed
                              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mat-green-100)] text-sm font-bold text-[var(--mat-green-800)]"
                              : isNext
                                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mat-green-700)] text-sm font-bold text-white"
                                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mat-blue-soft)] text-sm font-bold text-[var(--mat-blue)]"
                          }
                        >
                          {lesson.pathOrder}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[var(--mat-ink)] transition group-hover:text-[var(--mat-green-700)]">
                              {lesson.title}
                            </h3>

                            <span
                              className={
                                lesson.completed
                                  ? "mat-pill bg-[var(--mat-green-100)] text-[var(--mat-green-800)]"
                                  : isNext
                                    ? "mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]"
                                    : lesson.source ===
                                        "mission"
                                      ? "mat-pill bg-[var(--mat-blue-soft)] text-[var(--mat-blue)]"
                                      : "mat-pill bg-[var(--mat-surface-soft)] text-[var(--mat-muted)]"
                              }
                            >
                              {status}
                            </span>
                          </div>

                          {lesson.description && (
                            <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
                              {lesson.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--mat-muted-light)]">
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

                        <Arrow className="mt-2 h-5 w-5 shrink-0 text-[var(--mat-green-700)] transition group-hover:translate-x-1" />
                      </Link>
                    );
                  },
                )}
              </div>
            </div>
          </section>

          {learningPath.courses.length > 0 && (
            <section className="mt-8">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted)]">
                  Course foundation
                </p>

                <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  The real courses behind your path
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--mat-muted)]">
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
                      className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-xl text-[var(--mat-ink)]">
                            {course.title}
                          </h3>

                          {course.description && (
                            <p className="mt-2 text-sm leading-7 text-[var(--mat-muted)]">
                              {course.description}
                            </p>
                          )}
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--mat-green-50)] text-xl">
                          🔤
                        </div>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <p className="text-sm text-[var(--mat-muted)]">
                          {course.completedLessons} of{" "}
                          {course.totalLessons} lessons
                          complete
                        </p>

                        <span className="text-sm font-semibold text-[var(--mat-blue)]">
                          {course.percentComplete}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--mat-surface-soft)]">
                        <div
                          className="h-full rounded-full bg-[var(--mat-green-700)]"
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
