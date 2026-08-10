import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import LessonPlayer from "@/components/lesson/LessonPlayer";
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

  const lesson = await getMergedLesson(id);
  if (!lesson) redirect("/dashboard/practice");

  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">
            {lesson.course}
          </p>
          <h1 className="mt-2 font-display text-3xl text-[#17223b] md:text-4xl">
            {lesson.title} — {lesson.subtitle}
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-gray-600">{lesson.description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-[#e9f8f3] px-3 py-1 text-[#168c56]">
              {lesson.difficulty}
            </span>
            <span className="rounded-full bg-[#e9f1f6] px-3 py-1 text-[#52719f]">
              about {lesson.estimatedMinutes} min
            </span>
          </div>
        </div>

        <LessonPlayer lesson={lesson} />
      </div>
    </AppLayout>
  );
}
