import Link from "next/link";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { requireAdmin } from "@/lib/auth/admin";
import { listAdminRecordings } from "@/lib/admin/stats";

function learnerName(recording: {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}) {
  return (
    [recording.user.firstName, recording.user.lastName]
      .filter(Boolean)
      .join(" ") || recording.user.email
  );
}

export default async function AdminRecordingsPage() {
  const admin = await requireAdmin();
  const recordings = await listAdminRecordings();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  const scoredCount = recordings.filter(
    (recording) => typeof recording.overall === "number",
  ).length;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Learner activity"
        title="Recordings"
        description="Review recent stored learner voice recordings and their stored recording metadata."
      >
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <SummaryCard
              label="Recent recordings"
              value={String(recordings.length)}
            />
            <SummaryCard
              label="With stored score"
              value={String(scoredCount)}
            />
          </section>

          <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
            <p className="mat-eyebrow">Recording boundary</p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              Read-only voice activity
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              This directory shows up to the 100 most recent stored voice
              recordings. Audio is loaded only through the administrator-
              protected playback endpoint when you use a player.
            </p>

            <p className="mt-3 text-xs leading-5 text-[var(--mat-muted-light)]">
              “Stored score” is the score saved on the recording record. This
              view does not claim a direct relationship between a recording
              and a separate pronunciation-attempt record.
            </p>
          </aside>

          <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
            <div className="border-b border-[var(--mat-border)] px-5 py-5 sm:px-6">
              <p className="mat-eyebrow">Voice directory</p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Recent stored recordings
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                Newest first. Open the learner account for broader account
                context.
              </p>
            </div>

            {recordings.length === 0 ? (
              <div className="px-5 py-12 text-center sm:px-6">
                <p className="font-semibold text-[var(--mat-ink)]">
                  No stored recordings
                </p>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--mat-muted)]">
                  The recording directory did not return any stored learner
                  voice recordings.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--mat-border)]">
                {recordings.map((recording) => (
                  <article key={recording.id} className="p-5 sm:p-6">
                    <div className="grid gap-5 xl:grid-cols-[1fr_1fr] xl:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/users/${recording.userId}`}
                            className="font-semibold text-[var(--mat-ink)] hover:text-[var(--mat-green-700)] hover:underline"
                          >
                            {learnerName(recording)}
                          </Link>

                          <span className="rounded-full border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--mat-muted)]">
                            {typeof recording.overall === "number"
                              ? `Stored score ${recording.overall}%`
                              : "Not scored"}
                          </span>
                        </div>

                        <p className="mt-1 break-all text-xs text-[var(--mat-muted-light)]">
                          {recording.user.email}
                        </p>

                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                          <Metadata
                            label="Focus"
                            value={recording.focus || "Not recorded"}
                          />
                          <Metadata
                            label="Lesson"
                            value={recording.lessonSlug || "Practice"}
                          />
                          <Metadata
                            label="Recorded"
                            value={new Date(
                              recording.createdAt,
                            ).toLocaleString()}
                          />
                        </dl>
                      </div>

                      <div className="min-w-0">
                        <audio
                          controls
                          preload="none"
                          src={`/api/admin/recordings/${recording.id}`}
                          className="h-10 w-full"
                        />

                        <p className="mt-2 text-xs text-[var(--mat-muted-light)]">
                          Stored media type: {recording.mimeType}
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
  value: string;
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
