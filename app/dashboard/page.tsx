import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

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
            MAT Core Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#52719f]">
            Welcome back, {user.firstName || "there"}.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
            This is the beginning of your authenticated workspace. Soon this
            area will adapt based on whether you are a student, Nina, or an
            administrator.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <DashboardCard title="Courses" value="6" description="Published learning areas" />
          <DashboardCard title="Role" value={user.role} description="Current account access" />
          <DashboardCard title="Wallet" value="$0.00" description="Learning credit balance" />
        </div>

        <div className="rounded border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#20ad68]">Quick Actions</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <QuickAction label="Continue Learning" />
            <QuickAction label="View Courses" />
            <QuickAction label="Invite a Friend" />
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

function QuickAction({ label }: { label: string }) {
  return (
    <button className="rounded border border-[#20ad68] px-4 py-3 text-sm font-semibold text-[#20ad68] transition hover:bg-[#e9f8f3]">
      {label}
    </button>
  );
}