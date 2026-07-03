import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import CourseProgressCard from "@/components/courses/CourseProgressCard";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

const courses = [
  {
    title: "Basic Lessons",
    description:
      "Build the foundation for clear English pronunciation through Nina's core sound lessons.",
    progress: 42,
    lessons: "Lesson 7 of 18",
  },
  {
    title: "Life in America",
    description:
      "Practice everyday vocabulary and pronunciation for common situations in American life.",
    progress: 13,
    lessons: "Lesson 2 of 15",
  },
  {
    title: "Professional Vocabulary",
    description:
      "Strengthen pronunciation and confidence with words used in professional and academic settings.",
    progress: 0,
    lessons: "Not started",
  },
];

export default async function DashboardCoursesPage() {
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

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold text-[#20ad68]">My Courses</p>
          <h1 className="mt-2 text-3xl font-bold text-[#52719f]">
            Continue your learning journey
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
            Pick up where you left off or start a new course when you're ready.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseProgressCard
              key={course.title}
              title={course.title}
              description={course.description}
              progress={course.progress}
              lessons={course.lessons}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}