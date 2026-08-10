import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import InviteFriend from "@/components/app/InviteFriend";
import { Gift } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { ensureReferralCode } from "@/lib/referrals/referrals";

export default async function ReferralsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");
  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  const invites = await prisma.referralInvite.findMany({
    where: { inviterUserId: payload.userId },
    orderBy: { createdAt: "desc" },
  });

  const referralCode = await ensureReferralCode(payload.userId);
  const joined = invites.filter((i) => i.status !== "SENT").length;
  const rewarded = invites.filter((i) => i.status === "REWARDED").length;
  const pending = invites.filter((i) => i.status === "SENT").length;
  const creditEarned = rewarded * 10;
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">Referrals</p>
        <h1 className="mt-1 font-display text-3xl text-[#17223b]">Invite friends, earn credit</h1>
        <p className="mt-1 text-sm text-gray-500">Share your code — you both earn learning credit when a friend joins.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e9f8f3] text-[#20ad68]">
                <Gift className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg text-[#17223b]">Your referral code</h2>
            </div>
            <span className="rounded-full bg-[#20ad68] px-3 py-1 text-xs font-semibold text-white">$10 each</span>
          </div>

          <InviteFriend referralCode={referralCode} />

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-5 text-center">
            <div>
              <p className="font-display text-2xl text-[#17223b]">{joined}</p>
              <p className="text-xs text-gray-500">joined</p>
            </div>
            <div>
              <p className="font-display text-2xl text-[#17223b]">{rewarded}</p>
              <p className="text-xs text-gray-500">rewarded</p>
            </div>
            <div>
              <p className="font-display text-2xl text-[#17223b]">{pending}</p>
              <p className="text-xs text-gray-500">pending</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f0faf6] px-5 py-3">
            <span className="text-sm font-medium text-[#168c56]">Credit earned</span>
            <span className="font-display text-xl text-[#168c56]">${creditEarned.toFixed(2)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-[#17223b]">Your invites</h2>
          {invites.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-[#f8fbfa] p-6 text-center text-sm text-gray-500">
              No invites yet. Send your first one — it takes a few seconds.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#17223b]">
                      {invite.friendName || invite.friendEmail}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(invite.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-[#e9f1f6] px-2.5 py-1 text-xs font-semibold capitalize text-[#52719f]">
                    {invite.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
