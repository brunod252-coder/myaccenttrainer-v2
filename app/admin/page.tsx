import Link from "next/link";

import AdminLayout from "@/components/admin/AdminLayout";
import { Arrow, Book, Chart, Search } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/auth/admin";
import { getPlatformStats } from "@/lib/admin/stats";

export default async function AdminOverview() {
  const admin = await requireAdmin();
  const s = await getPlatformStats();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  const tiles = [
    {
      label: "Total accounts",
      value: s.users,
      hint: `${s.newThisWeek} created in the last 7 days`,
    },
    {
      label: "Active subscribers",
      value: s.subscribers,
      hint: 'Accounts with subscription status "active"',
    },
    {
      label: "Pronunciation attempts",
      value: s.attempts,
      hint: "Stored pronunciation-attempt records",
    },
    {
      label: "Voice recordings",
      value: s.recordings,
      hint: "Stored voice-recording records",
    },
    {
      label: "Referral invites",
      value: s.invites,
      hint: `${s.rewarded} rewarded`,
    },
    {
      label: "Administrators",
      value: s.admins,
      hint: "Accounts with the ADMIN role",
    },
  ];

  return (
    <AdminLayout admin={{ name: adminName }}>
      <div className="space-y-6">
        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mat-eyebrow">Administration</p>

              <h1 className="mt-2 font-display text-3xl text-[var(--mat-ink)] sm:text-4xl">
                Platform overview
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
                A current database snapshot of accounts, subscriptions,
                speaking activity, referrals, and administrative access.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/users"
                className="mat-button mat-button-primary"
              >
                <Search className="h-4 w-4" />
                Manage users
              </Link>

              <Link
                href="/admin/reports"
                className="mat-button mat-button-secondary"
              >
                <Chart className="h-4 w-4" />
                View reports
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="platform-snapshot-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="mat-eyebrow">Snapshot</p>

              <h2
                id="platform-snapshot-heading"
                className="mt-1 font-display text-2xl text-[var(--mat-ink)]"
              >
                Platform activity
              </h2>
            </div>

            <p className="hidden text-xs text-[var(--mat-muted-light)] sm:block">
              Read-only operational counts
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tiles.map((tile) => (
              <article
                key={tile.label}
                className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]"
              >
                <p className="text-sm font-medium text-[var(--mat-muted)]">
                  {tile.label}
                </p>

                <p className="mt-3 font-display text-4xl text-[var(--mat-ink)]">
                  {tile.value}
                </p>

                <p className="mt-2 text-xs leading-5 text-[var(--mat-muted-light)]">
                  {tile.hint}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <p className="mat-eyebrow">Operations</p>

            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              Administration workspace
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mat-muted)]">
              Move from this overview into the operational areas where account,
              learning, publishing, growth, and system information is managed.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href="/admin/users"
                className="group rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 transition hover:border-[var(--mat-border-green)] hover:bg-[var(--mat-green-50)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--mat-ink)]">
                      Users
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                      Search accounts and review learner details.
                    </p>
                  </div>

                  <Arrow className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mat-muted-light)] transition group-hover:translate-x-0.5 group-hover:text-[var(--mat-green-700)]" />
                </div>
              </Link>

              <Link
                href="/admin/reports"
                className="group rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 transition hover:border-[var(--mat-border-green)] hover:bg-[var(--mat-green-50)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--mat-ink)]">
                      Reports
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                      Review the reporting views available to administrators.
                    </p>
                  </div>

                  <Arrow className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mat-muted-light)] transition group-hover:translate-x-0.5 group-hover:text-[var(--mat-green-700)]" />
                </div>
              </Link>

              <Link
                href="/admin/courses"
                className="group rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 transition hover:border-[var(--mat-border-green)] hover:bg-[var(--mat-green-50)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--mat-ink)]">
                      Learning content
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                      Continue into courses, modules, and lessons.
                    </p>
                  </div>

                  <Book className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mat-muted-light)] transition group-hover:text-[var(--mat-green-700)]" />
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="group rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 transition hover:border-[var(--mat-border-green)] hover:bg-[var(--mat-green-50)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--mat-ink)]">
                      System
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                      Review configured platform integrations and settings.
                    </p>
                  </div>

                  <Arrow className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mat-muted-light)] transition group-hover:translate-x-0.5 group-hover:text-[var(--mat-green-700)]" />
                </div>
              </Link>
            </div>
          </section>

          <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6 sm:p-7">
            <p className="mat-eyebrow">About these numbers</p>

            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              Database snapshot
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              These totals come from the platform&apos;s stored records. The
              seven-day account figure is a rolling window, and active
              subscribers are accounts whose subscription status is currently
              recorded as active.
            </p>

            <p className="mt-4 text-xs leading-5 text-[var(--mat-muted-light)]">
              This overview is informational. Administrative changes are made
              from the dedicated management areas.
            </p>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
