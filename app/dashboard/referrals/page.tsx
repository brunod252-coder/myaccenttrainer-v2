import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import InviteFriend from "@/components/app/InviteFriend";
import AppLayout from "@/components/layouts/AppLayout";
import { Arrow, Gift } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import {
  ensureReferralCode,
  REFERRAL_REWARD_MINOR,
} from "@/lib/referrals/referrals";

function statusLabel(status: string) {
  switch (status) {
    case "REGISTERED":
      return "Registered";
    case "SUBSCRIBED":
      return "Paid membership pending reward";
    case "REWARDED":
      return "Rewarded";
    default:
      return "Invite sent";
  }
}

function statusClass(status: string) {
  if (status === "REWARDED") {
    return "bg-[var(--mat-green-50)] text-[var(--mat-green-700)]";
  }

  if (status === "SUBSCRIBED") {
    return "bg-amber-50 text-amber-800";
  }

  return "bg-[var(--mat-surface-soft)] text-[var(--mat-muted)]";
}

export default async function ReferralsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;

  if (!token) redirect("/login");

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

  if (!user) redirect("/login");

  const invites = await prisma.referralInvite.findMany({
    where: { inviterUserId: payload.userId },
    orderBy: { createdAt: "desc" },
  });

  const referralCode = await ensureReferralCode(payload.userId);

  const registered = invites.filter(
    (invite) => invite.status !== "SENT",
  ).length;

  const rewarded = invites.filter(
    (invite) => invite.status === "REWARDED",
  ).length;

  const pending = invites.filter(
    (invite) => invite.status === "SENT",
  ).length;

  const rewardDollars = REFERRAL_REWARD_MINOR / 100;
  const creditEarned = rewarded * rewardDollars;

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 sm:p-8">
              <p className="mat-eyebrow">Referrals</p>

              <h1 className="mt-2 max-w-2xl font-display text-3xl text-[var(--mat-ink)] sm:text-4xl">
                Invite someone to learn with you
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
                Share your referral link or send an invitation by email. When
                an eligible referred learner completes their qualifying first
                paid subscription payment, you and the referred learner each
                receive ${rewardDollars.toFixed(0)} in wallet credit.
              </p>

              <Link
                href="/dashboard/wallet"
                className="mat-button mat-button-secondary mt-6"
              >
                Open wallet
                <Arrow className="h-4 w-4" />
              </Link>
            </div>

            <div className="border-t border-[var(--mat-border)] bg-[var(--mat-green-50)] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--mat-radius-lg)] bg-white text-[var(--mat-green-700)]">
                <Gift className="h-5 w-5" />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--mat-green-700)]">
                Referral reward
              </p>

              <p className="mt-2 font-display text-4xl text-[var(--mat-ink)]">
                ${rewardDollars.toFixed(0)} each
              </p>

              <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
                Trial starts do not issue referral credit. Reward eligibility
                follows the paid-referral lifecycle.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <p className="mat-eyebrow">Invite</p>
            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              Your referral link
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
              Use your personal referral link or send an invitation directly
              to someone by email.
            </p>

            <InviteFriend referralCode={referralCode} />
          </section>

          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <p className="mat-eyebrow">Referral activity</p>
            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              Your referral progress
            </h2>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric value={registered} label="registered" />
              <Metric value={rewarded} label="rewarded" />
              <Metric value={pending} label="invite sent" />
            </div>

            <div className="mt-5 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-green-700)]">
                Referral credit earned
              </p>
              <p className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                ${creditEarned.toFixed(2)}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                Based on referrals currently recorded as rewarded.
              </p>
            </div>
          </section>
        </div>

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="border-b border-[var(--mat-border)] p-6 sm:p-7">
            <p className="mat-eyebrow">Invitations</p>
            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              People you invited
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
              Follow each invitation from sent through registration,
              subscription eligibility, and reward.
            </p>
          </div>

          {invites.length === 0 ? (
            <div className="p-6 sm:p-10">
              <div className="rounded-[var(--mat-radius-lg)] border border-dashed border-[var(--mat-border-strong)] bg-[var(--mat-surface-soft)] p-6 text-center">
                <p className="font-semibold text-[var(--mat-ink)]">
                  No invitations yet
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--mat-muted)]">
                  Invitations you send will appear here with their current
                  referral status.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[var(--mat-border)]">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--mat-ink)]">
                      {invite.friendName || invite.friendEmail}
                    </p>

                    {invite.friendName && (
                      <p className="mt-1 truncate text-xs text-[var(--mat-muted)]">
                        {invite.friendEmail}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-[var(--mat-muted-light)]">
                      Invited {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={
                      "w-fit rounded-full px-3 py-1 text-xs font-semibold " +
                      statusClass(invite.status)
                    }
                  >
                    {statusLabel(invite.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5 sm:p-6">
          <p className="text-sm leading-6 text-[var(--mat-muted)]">
            <span className="font-semibold text-[var(--mat-ink)]">
              How rewards work:
            </span>{" "}
            sending an invitation or starting a trial does not itself issue
            wallet credit. The reward is issued through the qualifying
            paid-referral flow and is recorded in the wallet when awarded.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}

function Metric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[var(--mat-radius-lg)] bg-[var(--mat-surface-soft)] p-3 text-center">
      <p className="font-display text-2xl text-[var(--mat-ink)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--mat-muted)]">{label}</p>
    </div>
  );
}
