import Link from "next/link";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { listAdminReferralInvites } from "@/lib/admin/stats";
import { requireAdmin } from "@/lib/auth/admin";

type ReferralStatus =
  | "SENT"
  | "REGISTERED"
  | "SUBSCRIBED"
  | "REWARDED"
  | "CANCELLED";

function inviterName(invite: {
  inviter: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}) {
  return (
    [invite.inviter.firstName, invite.inviter.lastName]
      .filter(Boolean)
      .join(" ") || invite.inviter.email
  );
}

function statusLabel(status: ReferralStatus) {
  switch (status) {
    case "REGISTERED":
      return "Registered";
    case "SUBSCRIBED":
      return "Subscribed";
    case "REWARDED":
      return "Rewarded";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Invite sent";
  }
}

function statusClass(status: ReferralStatus) {
  if (status === "REWARDED") {
    return "border-[var(--mat-border-green)] bg-[var(--mat-green-50)] text-[var(--mat-green-700)]";
  }

  if (status === "SUBSCRIBED") {
    return "border-[var(--mat-border-green)] bg-[var(--mat-green-50)] text-[var(--mat-green-700)]";
  }

  return "border-[var(--mat-border)] bg-[var(--mat-surface-soft)] text-[var(--mat-muted)]";
}

export default async function AdminReferralsPage() {
  const admin = await requireAdmin();
  const invites = await listAdminReferralInvites();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  const sent = invites.filter((invite) => invite.status === "SENT").length;
  const registered = invites.filter(
    (invite) => invite.status === "REGISTERED",
  ).length;
  const subscribed = invites.filter(
    (invite) => invite.status === "SUBSCRIBED",
  ).length;
  const rewarded = invites.filter(
    (invite) => invite.status === "REWARDED",
  ).length;
  const cancelled = invites.filter(
    (invite) => invite.status === "CANCELLED",
  ).length;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Growth"
        title="Referrals"
        description="Inspect stored referral invitations and their current lifecycle state."
      >
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Invite sent" value={sent} />
            <SummaryCard label="Registered" value={registered} />
            <SummaryCard label="Subscribed" value={subscribed} />
            <SummaryCard label="Rewarded" value={rewarded} />
            <SummaryCard label="Cancelled" value={cancelled} />
          </section>

          <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
            <p className="mat-eyebrow">Referral boundary</p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              Read-only lifecycle view
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              This directory shows up to the 200 most recent stored referral
              invitations and their current lifecycle state.
            </p>

            <p className="mt-3 text-xs leading-5 text-[var(--mat-muted-light)]">
              Rewarded indicates the referral record reached the rewarded
              lifecycle state. The wallet ledger remains the financial source
              of truth for credits actually recorded on learner wallets.
            </p>
          </aside>

          <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
            <div className="border-b border-[var(--mat-border)] px-5 py-5 sm:px-6">
              <p className="mat-eyebrow">Referral directory</p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Recent referral invitations
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                Newest first. Open the inviter account for broader account,
                wallet, and referral context.
              </p>
            </div>

            {invites.length === 0 ? (
              <div className="px-5 py-12 text-center sm:px-6">
                <p className="font-semibold text-[var(--mat-ink)]">
                  No referral invitations
                </p>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--mat-muted)]">
                  The referral directory did not return any stored
                  invitations.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--mat-border)]">
                {invites.map((invite) => (
                  <article key={invite.id} className="p-5 sm:p-6">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/users/${invite.inviterUserId}`}
                            className="font-semibold text-[var(--mat-ink)] hover:text-[var(--mat-green-700)] hover:underline"
                          >
                            {inviterName(invite)}
                          </Link>

                          <span
                            className={[
                              "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                              statusClass(invite.status),
                            ].join(" ")}
                          >
                            {statusLabel(invite.status)}
                          </span>
                        </div>

                        <p className="mt-1 break-all text-xs text-[var(--mat-muted-light)]">
                          {invite.inviter.email}
                        </p>

                        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
                          <Metadata
                            label="Invited person"
                            value={invite.friendName || "Name not provided"}
                          />

                          <Metadata
                            label="Recipient email"
                            value={invite.friendEmail}
                          />

                          <Metadata
                            label="Referral code"
                            value={invite.referralCode}
                          />

                          <Metadata
                            label="Invited"
                            value={new Date(
                              invite.createdAt,
                            ).toLocaleString()}
                          />
                        </dl>
                      </div>

                      <div className="text-xs leading-5 text-[var(--mat-muted-light)] lg:text-right">
                        <p>Current state</p>
                        <p className="font-semibold text-[var(--mat-ink)]">
                          {statusLabel(invite.status)}
                        </p>

                        <p className="mt-2">
                          Updated{" "}
                          {new Date(invite.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </AdminWorkspace>
    </AdminLayout>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-5 shadow-[var(--mat-shadow-sm)]">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mat-muted-light)]">
        {label}
      </p>

      <p className="mt-2 font-display text-3xl text-[var(--mat-ink)]">
        {value}
      </p>
    </div>
  );
}

function Metadata({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mat-muted-light)]">
        {label}
      </dt>

      <dd className="mt-1 break-words text-[var(--mat-ink)]">{value}</dd>
    </div>
  );
}
