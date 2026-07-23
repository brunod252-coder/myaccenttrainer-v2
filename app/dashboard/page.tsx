import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import AppLayout from "@/components/layouts/AppLayout";
import LearnerProfileCard from "@/components/learner/LearnerProfileCard";
import { verifyAuthToken } from "@/lib/jwt";
import { learnerProfileService } from "@/lib/learner-profile/learner-profile-service";
import { prisma } from "@/lib/prisma";
import NinaRecommendationCard from "@/components/learner/NinaRecommendationCard";
import { recommendationService } from "@/lib/recommendations/recommendation-service";
import { learnerTimelineService } from "@/lib/learner-timeline/learner-timeline-service";

export default async function DashboardPage() {
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

  const profile = await learnerProfileService.getOrCreateProfile(
    user.id,
    userName
  );
const timeline = await learnerTimelineService.getTimeline(user.id);

const recommendation = recommendationService.getRecommendation(
  profile,
  timeline
);
  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-6">
        <div className="rounded border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-[#20ad68]">
            MAT Learner Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#52719f]">
            Welcome back, {user.firstName || "there"}.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
            Nina is beginning to remember your learning journey and personalize
            your path over time.
          </p>
        </div>

        <LearnerProfileCard profile={profile} />
        <NinaRecommendationCard recommendation={recommendation} />
        <div className="grid gap-6 md:grid-cols-3">
          <DashboardCard
            title="Courses"
            value="6"
            description="Published learning areas"
          />
          <DashboardCard
            title="Role"
            value={user.role}
            description="Current account access"
          />
          <DashboardCard
            title="Wallet"
            value="$0.00"
            description="Learning credit balance"
          />
        </div>

        <div className="rounded border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#20ad68]">Quick Actions</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <QuickAction href="/dashboard/lesson/american-r" label="Continue Learning" />
            <QuickAction href="/dashboard/courses" label="View Courses" />
            <QuickAction href="/dashboard/referrals" label="Invite a Friend" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      <p className="mt-3 text-2xl font-bold text-[#17223b]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-gray-500">{description}</p>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded border border-[#20ad68] px-4 py-3 text-center text-sm font-semibold text-[#20ad68] transition hover:bg-[#e9f8f3]"
    >
      {label}
    </Link>
  );
}
