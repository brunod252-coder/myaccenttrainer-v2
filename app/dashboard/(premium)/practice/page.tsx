import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import LessonSaveControls from "@/components/lesson/LessonSaveControls";
import { Mic, Arrow } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
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

  const lessons = await getMergedLessons();
  const bookmarks = await getBookmarkState(payload.userId);
  const favSet = new Set(bookmarks.favorites);
  const saveSet = new Set(bookmarks.bookmarks);
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const bySlug = new Map(lessons.map((l) => [l.slug, l]));
  const favLessons = bookmarks.favorites.map((s) => bySlug.get(s)).filter(Boolean) as Lesson[];
  const savedLessons = bookmarks.bookmarks.map((s) => bySlug.get(s)).filter(Boolean) as Lesson[];

  function Card({ lesson }: { lesson: Lesson }) {
    return (
      <Link
        href={`/dashboard/lesson/${lesson.slug}`}
        className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f8f3] text-[#20ad68]">
            <Mic className="h-6 w-6" />
          </div>
          <LessonSaveControls
            slug={lesson.slug}
            initialFavorite={favSet.has(lesson.slug)}
            initialBookmark={saveSet.has(lesson.slug)}
          />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">{lesson.title}</p>
        <h2 className="mt-1 font-display text-lg text-[#17223b]">{lesson.subtitle}</h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">{lesson.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-2 text-xs font-semibold">
            <span className="rounded-full bg-[#e9f8f3] px-2.5 py-1 text-[#168c56]">{lesson.difficulty}</span>
            <span className="rounded-full bg-[#e9f1f6] px-2.5 py-1 text-[#52719f]">{lesson.estimatedMinutes} min</span>
          </div>
          <Arrow className="h-5 w-5 text-[#20ad68] transition group-hover:translate-x-1" />
        </div>
      </Link>
    );
  }

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">Practice</p>
        <h1 className="mt-1 font-display text-3xl text-[#17223b]">Lessons with Nina</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pick a sound to practice. Tap the heart to favorite a lesson, or save one for later.
        </p>
      </div>

      {favLessons.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[#d1495b]">♥</span>
            <h2 className="font-display text-lg text-[#17223b]">Your favorites</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {favLessons.map((l) => <Card key={l.slug} lesson={l} />)}
          </div>
        </section>
      )}

      {savedLessons.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[#168c56]">🔖</span>
            <h2 className="font-display text-lg text-[#17223b]">Saved for later</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {savedLessons.map((l) => <Card key={l.slug} lesson={l} />)}
          </div>
        </section>
      )}

      {(favLessons.length > 0 || savedLessons.length > 0) && (
        <h2 className="mb-3 font-display text-lg text-[#17223b]">All lessons</h2>
      )}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => <Card key={lesson.slug} lesson={lesson} />)}
      </div>
    </AppLayout>
  );
}
