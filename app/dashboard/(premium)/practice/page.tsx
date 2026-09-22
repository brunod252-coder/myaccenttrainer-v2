import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import LessonSaveControls from "@/components/lesson/LessonSaveControls";
import { Mic, Arrow } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import {
  getLearningProfile,
  getMissionLessonRecommendations,
} from "@/lib/learning";
import { getMergedLessons, type Lesson } from "@/lib/lessons";
import { getBookmarkState } from "@/lib/lessons/bookmarks";
import { prisma } from "@/lib/prisma";

export default async function PracticePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");

  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });

  if (!user) redirect("/login");

  const [lessons, bookmarks, learningProfile] = await Promise.all([
    getMergedLessons(),
    getBookmarkState(payload.userId),
    getLearningProfile(payload.userId),
  ]);

  const favSet = new Set(bookmarks.favorites);
  const saveSet = new Set(bookmarks.bookmarks);

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const bySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));

  const favLessons = bookmarks.favorites
    .map((slug) => bySlug.get(slug))
    .filter(Boolean) as Lesson[];

  const savedLessons = bookmarks.bookmarks
    .map((slug) => bySlug.get(slug))
    .filter(Boolean) as Lesson[];

  const recommendedLessons = getMissionLessonRecommendations(
    learningProfile.mission,
    3,
  )
    .map((recommendation) => bySlug.get(recommendation.slug))
    .filter(Boolean) as Lesson[];

  function Card({
    lesson,
    recommended = false,
  }: {
    lesson: Lesson;
    recommended?: boolean;
  }) {
    return (
      <Link
        href={`/dashboard/lesson/${lesson.slug}`}
        className="group relative flex h-full flex-col rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-5 shadow-[var(--mat-shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--mat-border-green)] hover:shadow-[var(--mat-shadow-md)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--mat-green-50)] text-[var(--mat-green-700)]">
            <Mic className="h-5 w-5" />
          </span>

          <LessonSaveControls
            slug={lesson.slug}
            initialFavorite={favSet.has(lesson.slug)}
            initialBookmark={saveSet.has(lesson.slug)}
          />
        </div>

        {recommended && (
          <div className="mt-4">
            <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
              Nina recommends
            </span>
          </div>
        )}

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--mat-muted-light)]">
          {lesson.title}
        </p>

        <h3 className="mt-1 font-display text-xl leading-snug text-[var(--mat-ink)]">
          {lesson.subtitle}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-7 text-[var(--mat-muted)]">
          {lesson.description}
        </p>

        <div className="mt-6 flex items-end justify-between gap-3 border-t border-[var(--mat-border)] pt-4">
          <div className="flex flex-wrap gap-2">
            <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
              {lesson.difficulty}
            </span>

            <span className="mat-pill bg-[var(--mat-blue-soft)] text-[var(--mat-blue)]">
              {lesson.estimatedMinutes} min
            </span>
          </div>

          <Arrow className="h-5 w-5 shrink-0 text-[var(--mat-green-700)] transition group-hover:translate-x-1" />
        </div>
      </Link>
    );
  }

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-10">
        <header className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mat-eyebrow">
                Practice
              </p>

              <h1 className="mt-2 font-display text-3xl text-[var(--mat-ink)] md:text-4xl">
                Build clarity through repetition
              </h1>

              <p className="mt-3 text-sm leading-7 text-[var(--mat-muted)] sm:text-base">
                Return to sounds you want to strengthen, keep lessons you care
                about close, or explore the full pronunciation library.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[var(--mat-surface-soft)] px-4 py-3">
                <p className="font-display text-xl text-[var(--mat-ink)]">
                  {lessons.length}
                </p>
                <p className="mt-1 text-xs text-[var(--mat-muted)]">
                  Lessons
                </p>
              </div>

              <div className="rounded-xl bg-[var(--mat-surface-soft)] px-4 py-3">
                <p className="font-display text-xl text-[var(--mat-ink)]">
                  {favLessons.length}
                </p>
                <p className="mt-1 text-xs text-[var(--mat-muted)]">
                  Favorites
                </p>
              </div>

              <div className="rounded-xl bg-[var(--mat-surface-soft)] px-4 py-3">
                <p className="font-display text-xl text-[var(--mat-ink)]">
                  {savedLessons.length}
                </p>
                <p className="mt-1 text-xs text-[var(--mat-muted)]">
                  Saved
                </p>
              </div>
            </div>
          </div>
        </header>

        {recommendedLessons.length > 0 && (
          <section>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mat-eyebrow">
                  Recommended for you
                </p>

                <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  Practice for your {learningProfile.mission.shortLabel} goal
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                  {learningProfile.level} · These lessons support priorities in
                  your personalized learning plan.
                </p>
              </div>

              <span className="mat-pill bg-[var(--mat-green-50)] text-[var(--mat-green-800)]">
                {recommendedLessons.length} recommended
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {recommendedLessons.map((lesson) => (
                <Card
                  key={`recommended-${lesson.slug}`}
                  lesson={lesson}
                  recommended
                />
              ))}
            </div>
          </section>
        )}

        {(favLessons.length > 0 || savedLessons.length > 0) && (
          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5 sm:p-6">
            <div className="mb-5">
              <p className="mat-eyebrow">
                Your collection
              </p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Keep useful lessons close
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                Favorites are lessons you value most. Saved lessons are the
                ones you want to return to later.
              </p>
            </div>

            <div className="grid gap-8 xl:grid-cols-2">
              {favLessons.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-[var(--mat-red)]">
                        ♥
                      </span>
                      <h3 className="font-display text-lg text-[var(--mat-ink)]">
                        Favorites
                      </h3>
                    </div>

                    <span className="text-xs font-semibold text-[var(--mat-muted)]">
                      {favLessons.length}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {favLessons.map((lesson) => (
                      <Card key={`favorite-${lesson.slug}`} lesson={lesson} />
                    ))}
                  </div>
                </div>
              )}

              {savedLessons.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="text-[var(--mat-green-700)]"
                      >
                        🔖
                      </span>
                      <h3 className="font-display text-lg text-[var(--mat-ink)]">
                        Saved for later
                      </h3>
                    </div>

                    <span className="text-xs font-semibold text-[var(--mat-muted)]">
                      {savedLessons.length}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {savedLessons.map((lesson) => (
                      <Card key={`saved-${lesson.slug}`} lesson={lesson} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mat-eyebrow">
                Explore
              </p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Pronunciation library
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                Browse every available lesson whenever you want to practice
                something different.
              </p>
            </div>

            <span className="mat-pill bg-[var(--mat-blue-soft)] text-[var(--mat-blue)]">
              {lessons.length} available
            </span>
          </div>

          {lessons.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => (
                <Card key={lesson.slug} lesson={lesson} />
              ))}
            </div>
          ) : (
            <div className="mat-empty-state">
              <p className="mat-eyebrow">
                Practice library
              </p>

              <h3 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
                No practice lessons are published yet
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--mat-muted)]">
                Published pronunciation lessons will appear here when they are
                available.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
