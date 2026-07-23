import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import ProfileForm from "@/components/app/ProfileForm";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");
  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { profile: true },
  });
  if (!user) redirect("/login");

  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const initial = {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    countryOfResidence: user.profile?.countryOfResidence ?? "",
    nativeLanguage: user.profile?.nativeLanguage ?? "",
    englishGoal: user.profile?.englishGoal ?? "",
    proficiencyLevel: user.profile?.proficiencyLevel ?? "",
  };

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">Settings</p>
        <h1 className="mt-1 font-display text-3xl text-[#17223b]">Your account</h1>
        <p className="mt-1 text-sm text-gray-500">Update your profile and review your account details.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-[#17223b]">Profile</h2>
          <p className="mt-1 text-sm text-gray-500">This helps Nina tailor your lessons.</p>
          <div className="mt-5">
            <ProfileForm initial={initial} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-[#17223b]">Account</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-[#17223b]">{user.email}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Role</dt>
                <dd className="text-sm font-medium text-[#17223b]">{user.role}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Member since</dt>
                <dd className="text-sm font-medium text-[#17223b]">{memberSince}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-[#17223b]">Session</h2>
            <p className="mt-2 text-sm text-gray-500">Sign out of your account on this device.</p>
            <form action="/api/auth/logout" method="post" className="mt-4">
              <button
                type="submit"
                className="w-full rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-[#52719f] transition hover:bg-[#f6faf8]"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
