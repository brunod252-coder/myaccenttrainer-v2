import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { learnerTimelineService } from "@/lib/learner-timeline/learner-timeline-service";

export default async function ProgressPage() {
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

  const timeline = await learnerTimelineService.getTimeline(user.id);

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-8">

        <div className="rounded border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-[#20ad68]">
            Learning Journey
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#52719f]">
            Your Progress Timeline
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
            Every completed lesson becomes part of your permanent learning
            journey. Nina uses this history to personalize future practice.
          </p>
        </div>

        <div className="rounded border bg-white p-8 shadow-sm">

          {timeline.length === 0 ? (
            <p className="text-gray-500">
              No completed lessons yet.
            </p>
          ) : (
            <div className="space-y-6">
              {timeline.map((entry) => (
                <TimelineCard
                  key={entry.id}
                  title={entry.lessonTitle}
                  words={entry.wordsPracticed}
                  confidence={entry.confidenceGain}
                  completedAt={entry.completedAt}
                />
              ))}
            </div>
          )}

        </div>

      </div>
    </AppLayout>
  );
}

function TimelineCard({
  title,
  words,
  confidence,
  completedAt,
}: {
  title: string;
  words: number;
  confidence: number;
  completedAt: string;
}) {
  return (
    <div className="rounded border bg-[#fafafa] p-6">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold text-[#52719f]">
            {title}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {new Date(completedAt).toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-[#20ad68]">
            +{confidence}% confidence
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {words} words practiced
          </p>
        </div>

      </div>

    </div>
  );
}
