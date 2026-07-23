import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import LessonPlayer from "@/components/lesson/LessonPlayer";
import PublishedLessonRuntime from "@/components/lesson/PublishedLessonRuntime";
import { verifyAuthToken } from "@/lib/jwt";
import { lessonRepository } from "@/lib/lesson-repository/lesson-repository";
import { getLessonBySlug } from "@/lib/lessons";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LessonPage({ params }: Props) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
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

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const publishedLesson = await lessonRepository.findBySlug(id);

  if (publishedLesson) {
    return (
      <AppLayout userName={userName} role={user.role}>
        <div className="space-y-8">
          <div className="rounded border bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-[#20ad68]">
              {publishedLesson.course}
            </p>

            <h1 className="mt-2 text-4xl font-bold text-[#52719f]">
              {publishedLesson.title} — {publishedLesson.subtitle}
            </h1>

            <p className="mt-6 max-w-3xl leading-7 text-gray-600">
              {publishedLesson.description}
            </p>
          </div>

<PublishedLessonRuntime
  lessonSlug={publishedLesson.slug}
  lessonTitle={publishedLesson.title}
  words={publishedLesson.words}
/>          
        </div>
      </AppLayout>
    );
  }

  const lesson = getLessonBySlug(id);

  if (!lesson) {
    redirect("/dashboard/courses");
  }

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-8">
        <div className="rounded border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-[#20ad68]">
            {lesson.course}
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#52719f]">
            {lesson.title} — {lesson.subtitle}
          </h1>

          <p className="mt-6 max-w-3xl leading-7 text-gray-600">
            {lesson.description}
          </p>
        </div>

        <LessonPlayer lesson={lesson} />
      </div>
    </AppLayout>
  );
}
