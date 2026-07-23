import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import PracticeSessionCard from "@/components/practice/PracticeSessionCard";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export default async function PracticePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
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
      <div className="space-y-6">
        <div className="rounded border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-[#20ad68]">
            Practice Session
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#52719f]">
            Daily pronunciation practice
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
            Complete this short practice session so Nina can remember today’s
            progress and update your learner profile.
          </p>
        </div>

        <PracticeSessionCard
          learnerId={user.id}
          displayName={userName}
          wordsPracticed={10}
        />
      </div>
    </AppLayout>
  );
}
