import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import LessonPlayer from "@/components/lesson/LessonPlayer";
import { getPublishedCurriculumLessonBySlug } from "@/lib/curriculum";
import { verifyAuthToken } from "@/lib/jwt";
import { getMergedLesson } from "@/lib/lessons";
import { prisma } from "@/lib/prisma";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");

  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  const [lesson, curriculumLesson] = await Promise.all([
    getMergedLesson(id),
    getPublishedCurriculumLessonBySlug(id),
  ]);

  if (!lesson || !curriculumLesson) {
    redirect("/dashboard/practice");
  }

  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="mat-eyebrow">
              {lesson.course}
            </p>

            <h1 className="mt-3 max-w-4xl font-display text-3xl leading-tight text-[var(--mat-ink)] md:text-4xl">
              {lesson.title}
            </h1>

            <p className="mt-2 text-base font-semibold text-[var(--mat-blue)]">
              {lesson.subtitle}
            </p>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--mat-muted)] sm:text-base">
              {lesson.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
                {lesson.difficulty}
              </span>

              <span className="mat-pill bg-[var(--mat-blue-soft)] text-[var(--mat-blue)]">
                about {lesson.estimatedMinutes} min
              </span>

              <span className="mat-pill bg-[var(--mat-surface-soft)] text-[var(--mat-muted)]">
                Listen · Practice · Feedback
              </span>
            </div>
          </div>
        </section>

        <LessonPlayer
          lesson={lesson}
          lessonId={curriculumLesson.id}
        />
      </div>
    </AppLayout>
  );
}
