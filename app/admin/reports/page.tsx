import AdminLayout from "@/components/admin/AdminLayout";
import { Chart } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/auth/admin";
import { getPlatformStats, getLessonStats } from "@/lib/admin/stats";

export default async function AdminReports() {
  const admin = await requireAdmin();

  const [s, lessonStats] = await Promise.all([
    getPlatformStats(),
    getLessonStats(),
  ]);

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  const activeSubscriptionShare =
    s.users > 0
      ? Math.round((s.subscribers / s.users) * 100)
      : 0;

  const rows = [
    {
      label: "Total accounts",
      value: String(s.users),
      detail: "All stored user accounts, including administrators.",
    },
    {
      label: "Accounts created in the last 7 days",
      value: String(s.newThisWeek),
      detail: "A rolling seven-day count of newly created accounts.",
    },
    {
      label: "Active subscribers",
      value: String(s.subscribers),
      detail: 'Accounts whose subscription status is recorded as "active".',
    },
    {
      label: "Pronunciation attempts",
      value: String(s.attempts),
      detail: "Stored pronunciation-attempt records.",
    },
    {
      label: "Voice recordings",
      value: String(s.recordings),
      detail: "Stored voice-recording records.",
    },
    {
      label: "Referral invites",
      value: String(s.invites),
      detail: `${s.rewarded} currently recorded as rewarded.`,
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
                Reports
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
                Review stored platform counts and lesson-level pronunciation
                activity without changing operational data.
              </p>
            </div>

            <a
              href="/api/admin/users/export"
              className="mat-button mat-button-secondary"
            >
              Export users CSV
            </a>
          </div>
        </section>

        <section aria-labelledby="report-summary-heading">
          <div className="mb-4">
            <p className="mat-eyebrow">Snapshot</p>

            <h2
              id="report-summary-heading"
              className="mt-1 font-display text-2xl text-[var(--mat-ink)]"
            >
              Platform counts
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
              These figures describe records currently available to the
              administrative reporting layer.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
              <p className="text-sm font-medium text-[var(--mat-muted)]">
                Active-subscription share
              </p>

              <p className="mt-3 font-display text-4xl text-[var(--mat-ink)]">
                {activeSubscriptionShare}%
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--mat-muted-light)]">
                Active subscription accounts divided by all stored accounts.
                This is not a measured signup-to-purchase conversion funnel.
              </p>
            </article>

            <article className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
              <p className="text-sm font-medium text-[var(--mat-muted)]">
                Referral invites
              </p>

              <p className="mt-3 font-display text-4xl text-[var(--mat-ink)]">
                {s.invites}
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--mat-muted-light)]">
                {s.rewarded} currently recorded as rewarded.
              </p>
            </article>

            <article className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
              <p className="text-sm font-medium text-[var(--mat-muted)]">
                Pronunciation attempts
              </p>

              <p className="mt-3 font-display text-4xl text-[var(--mat-ink)]">
                {s.attempts}
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--mat-muted-light)]">
                Stored attempt records, not a count of unique active learners.
              </p>
            </article>
          </div>
        </section>

        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="border-b border-[var(--mat-border)] px-5 py-5 sm:px-6">
            <p className="mat-eyebrow">Detail</p>

            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              Platform reporting values
            </h2>
          </div>

          <div className="divide-y divide-[var(--mat-border)]">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--mat-ink)]">
                    {row.label}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                    {row.detail}
                  </p>
                </div>

                <p className="font-display text-2xl text-[var(--mat-ink)] sm:text-right">
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="border-b border-[var(--mat-border)] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--mat-radius-lg)] bg-[var(--mat-green-50)] text-[var(--mat-green-700)]">
                <Chart className="h-5 w-5" />
              </div>

              <div>
                <p className="mat-eyebrow">Learning activity</p>

                <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  Lesson pronunciation statistics
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                  Aggregated from stored pronunciation attempts. Average clarity
                  is the arithmetic mean of the stored overall scores associated
                  with each lesson.
                </p>
              </div>
            </div>
          </div>

          {lessonStats.length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-6">
              <p className="font-semibold text-[var(--mat-ink)]">
                No lesson pronunciation statistics yet
              </p>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--mat-muted)]">
                This section will populate when stored pronunciation attempts
                can be associated with lesson slugs.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[var(--mat-border)] md:hidden">
                {lessonStats.map((lesson) => (
                  <article key={lesson.slug} className="px-5 py-4">
                    <p className="font-semibold text-[var(--mat-ink)]">
                      {lesson.title}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-[var(--mat-radius-lg)] bg-[var(--mat-surface-soft)] p-3">
                        <p className="text-xs text-[var(--mat-muted-light)]">
                          Attempts
                        </p>
                        <p className="mt-1 font-semibold text-[var(--mat-ink)]">
                          {lesson.attempts}
                        </p>
                      </div>

                      <div className="rounded-[var(--mat-radius-lg)] bg-[var(--mat-surface-soft)] p-3">
                        <p className="text-xs text-[var(--mat-muted-light)]">
                          Average clarity
                        </p>
                        <p className="mt-1 font-semibold text-[var(--mat-ink)]">
                          {lesson.avg}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--mat-surface-soft)] text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mat-muted-light)]">
                      <th className="px-6 py-3">Lesson</th>
                      <th className="px-6 py-3 text-right">
                        Attempts
                      </th>
                      <th className="px-6 py-3 text-right">
                        Average clarity
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--mat-border)]">
                    {lessonStats.map((lesson) => (
                      <tr key={lesson.slug}>
                        <td className="px-6 py-4 font-medium text-[var(--mat-ink)]">
                          {lesson.title}
                        </td>

                        <td className="px-6 py-4 text-right text-[var(--mat-muted)]">
                          {lesson.attempts}
                        </td>

                        <td className="px-6 py-4 text-right font-semibold text-[var(--mat-ink)]">
                          {lesson.avg}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6 sm:p-7">
          <p className="mat-eyebrow">Reporting boundary</p>

          <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
            What these reports mean
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
            These views summarize stored records. They do not infer unique-user
            engagement, revenue, retention, churn, or funnel conversion unless
            the underlying data explicitly measures those concepts.
          </p>
        </aside>
      </div>
    </AdminLayout>
  );
}
