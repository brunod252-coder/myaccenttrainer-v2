import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import { Arrow } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { getAllLessons } from "@/lib/lessons";
import { prisma } from "@/lib/prisma";

const upcomingCourses = [
  {
    title: "Life in America",
    description: "Everyday vocabulary and pronunciation for common situations in American life.",
    emoji: "🏙️",
  },
  {
    title: "Professional Vocabulary",
    description: "Confident pronunciation for business, academic, and professional settings.",
    emoji: "💼",
  },
];

export default async function DashboardCoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");
  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  const completedLessons = await prisma.lessonProgress.count({
    where: { userId: payload.userId, status: "COMPLETED" },
  });

  const lessons = getAllLessons();
  const total = lessons.length;
  const progress = total > 0 ? Math.round((completedLessons / total) * 100) : 0;
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">My courses</p>
        <h1 className="mt-1 font-display text-3xl text-[#17223b]">Continue your learning journey</h1>
        <p className="mt-1 text-sm text-gray-500">Work through Nina&apos;s core sound lessons at your own pace.</p>
      </div>

      {/* Active course */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f8f3] text-2xl">🔤</div>
            <div>
              <h2 className="font-display text-xl text-[#17223b]">Basic Pronunciation</h2>
              <p className="text-sm text-gray-500">
                {completedLessons} of {total} lessons complete
              </p>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-gradient-to-r from-[#20ad68] to-[#52719f]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-right text-xs text-gray-400">{progress}%</p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-gray-100">
          {lessons.map((lesson, index) => (
            <Link
              key={lesson.slug}
              href={`/dashboard/lesson/${lesson.slug}`}
              className="group flex items-center gap-4 py-4 transition"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9f1f6] text-sm font-semibold text-[#52719f]">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#17223b] group-hover:text-[#20ad68]">{lesson.subtitle}</p>
                <p className="truncate text-sm text-gray-500">{lesson.description}</p>
              </div>
              <span className="hidden shrink-0 rounded-full bg-[#e9f8f3] px-2.5 py-1 text-xs font-semibold text-[#168c56] sm:inline">
                {lesson.estimatedMinutes} min
              </span>
              <Arrow className="h-5 w-5 shrink-0 text-[#20ad68] transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming courses */}
      <h2 className="mb-4 mt-10 font-display text-lg text-[#17223b]">Coming soon</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {upcomingCourses.map((course) => (
          <div key={course.title} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 opacity-70 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">{course.emoji}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#17223b]">{course.title}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">Soon</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{course.description}</p>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
