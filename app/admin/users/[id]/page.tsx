import Link from "next/link";
import { notFound } from "next/navigation";

import AdminLayout from "@/components/admin/AdminLayout";
import { Arrow } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/auth/admin";
import { getUserDetail, getUserRecordings } from "@/lib/admin/stats";

function money(minor: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(minor / 100);
}

function displayValue(value: string | null) {
  return value?.trim() ? value : "Not available";
}

export default async function AdminUserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;

  const [u, recordings] = await Promise.all([
    getUserDetail(id),
    getUserRecordings(id),
  ]);

  if (!u) notFound();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  const displayName = u.name !== "—" ? u.name : u.email;
  const initial = displayName.slice(0, 1).toUpperCase();

  const facts = [
    {
      label: "Recent clarity average",
      value: u.clarity !== null ? `${u.clarity}%` : "No attempts",
      detail: "Average of up to the 5 most recent pronunciation attempts.",
    },
    {
      label: "Pronunciation attempts",
      value: String(u.attempts),
      detail: "Total stored pronunciation-attempt records.",
    },
    {
      label: "Stored recordings",
      value: String(u.recordings),
      detail: "Total stored voice-recording records.",
    },
    {
      label: "Lessons completed",
      value: String(u.lessonsCompleted),
      detail: "Lesson-progress records currently marked completed.",
    },
    {
      label: "Wallet balance",
      value: money(u.walletMinor),
      detail: "Sum of the account's stored wallet transaction amounts.",
    },
    {
      label: "Referral invites sent",
      value: String(u.invitesSent),
      detail: "All stored referral invitations sent by this account.",
    },
  ];

  return (
    <AdminLayout admin={{ name: adminName }}>
      <div className="space-y-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--mat-green-700)] hover:underline"
        >
          <Arrow className="h-4 w-4 rotate-180" />
          User accounts
        </Link>

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--mat-green-700)] font-display text-2xl text-white">
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="mat-eyebrow">Account detail</p>

              <h1 className="mt-1 break-words font-display text-3xl text-[var(--mat-ink)]">
                {displayName}
              </h1>

              <p className="mt-1 break-all text-sm text-[var(--mat-muted)]">
                {u.email}
              </p>
            </div>

            <span
              className={[
                "inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
                u.role === "ADMIN"
                  ? "border-[var(--mat-ink)] bg-[var(--mat-ink)] text-white"
                  : "border-[var(--mat-border)] bg-[var(--mat-surface-soft)] text-[var(--mat-muted)]",
              ].join(" ")}
            >
              {u.role.toLowerCase()}
            </span>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <p className="mat-eyebrow">Identity</p>

            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              Account information
            </h2>

            <dl className="mt-5 divide-y divide-[var(--mat-border)]">
              <Item
                label="Joined"
                value={new Date(u.createdAt).toLocaleDateString()}
              />

              <Item
                label="Email verified"
                value={
                  u.emailVerified === null
                    ? "Not available"
                    : u.emailVerified
                      ? "Yes"
                      : "No"
                }
              />

              <Item
                label="Subscription status"
                value={u.subscriptionStatus || "None recorded"}
              />

              <Item
                label="Country"
                value={displayValue(u.country)}
              />

              <Item
                label="Native language"
                value={displayValue(u.nativeLanguage)}
              />
            </dl>

            <p className="mt-5 text-xs leading-5 text-[var(--mat-muted-light)]">
              Subscription status is shown exactly as stored on the account.
              This page does not infer membership access beyond that value.
            </p>
          </section>

          <section>
            <div>
              <p className="mat-eyebrow">Activity</p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Learning &amp; account snapshot
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                Counts and summaries from the existing administrative account
                provider.
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {facts.map((fact) => (
                <article
                  key={fact.label}
                  className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-5 shadow-[var(--mat-shadow-sm)]"
                >
                  <p className="text-sm font-medium text-[var(--mat-muted)]">
                    {fact.label}
                  </p>

                  <p className="mt-2 font-display text-3xl text-[var(--mat-ink)]">
                    {fact.value}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[var(--mat-muted-light)]">
                    {fact.detail}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="border-b border-[var(--mat-border)] px-5 py-5 sm:px-6">
            <p className="mat-eyebrow">Voice activity</p>

            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              Recent recordings
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
              Up to the 8 most recent stored voice recordings for this account.
            </p>
          </div>

          {recordings.length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-6">
              <p className="font-semibold text-[var(--mat-ink)]">
                No stored recordings
              </p>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--mat-muted)]">
                The administrative recording provider did not return any voice
                recordings for this account.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--mat-border)]">
              {recordings.map((recording) => (
                <article
                  key={recording.id}
                  className="px-5 py-5 sm:px-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="min-w-0 lg:w-56 lg:shrink-0">
                      <p className="font-semibold text-[var(--mat-ink)]">
                        {recording.focus || "Practice"}
                      </p>

                      <p className="mt-1 text-xs text-[var(--mat-muted-light)]">
                        {new Date(recording.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 lg:w-28 lg:shrink-0">
                      <span className="text-xs text-[var(--mat-muted-light)]">
                        Score
                      </span>

                      <span className="font-semibold text-[var(--mat-ink)]">
                        {typeof recording.overall === "number"
                          ? `${recording.overall}%`
                          : "Not scored"}
                      </span>
                    </div>

                    <audio
                      controls
                      preload="none"
                      src={`/api/admin/recordings/${recording.id}`}
                      className="h-10 min-w-0 flex-1"
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
          <p className="text-sm font-semibold text-[var(--mat-ink)]">
            Account-detail boundary
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
            This administrative view summarizes stored account, learning,
            referral, wallet, and recording data. It does not change the
            account, wallet, subscription, role, or learning records.
          </p>
        </aside>
      </div>
    </AdminLayout>
  );
}

function Item({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
      <dt className="text-sm text-[var(--mat-muted)]">{label}</dt>

      <dd className="break-words text-sm font-semibold text-[var(--mat-ink)] sm:text-right">
        {value}
      </dd>
    </div>
  );
}
