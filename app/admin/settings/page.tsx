import AdminLayout from "@/components/admin/AdminLayout";
import { Gear } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/auth/admin";
import { getIntegrationStatus } from "@/lib/admin/stats";

export default async function AdminSettings() {
  const admin = await requireAdmin();
  const integrations = getIntegrationStatus();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <div className="space-y-6">
        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <p className="mat-eyebrow">System</p>

          <h1 className="mt-2 font-display text-3xl text-[var(--mat-ink)] sm:text-4xl">
            System settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
            Review the application configuration currently visible to
            MyAccentTrainer for core platform integrations.
          </p>
        </section>

        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="border-b border-[var(--mat-border)] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--mat-radius-lg)] bg-[var(--mat-green-50)] text-[var(--mat-green-700)]">
                <Gear className="h-5 w-5" />
              </div>

              <div>
                <p className="mat-eyebrow">Configuration</p>

                <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  Integration configuration
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mat-muted)]">
                  Each row reflects the configuration signal currently exposed
                  by the application.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[var(--mat-border)]">
            {integrations.map((it) => (
              <div
                key={it.key}
                className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={[
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        it.ok
                          ? "bg-[var(--mat-green-700)]"
                          : "bg-amber-500",
                      ].join(" ")}
                    />

                    <p className="font-semibold text-[var(--mat-ink)]">
                      {it.key}
                    </p>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)] sm:pl-[22px]">
                    {it.detail}
                  </p>
                </div>

                <span
                  className={[
                    "inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-semibold",
                    it.ok
                      ? "border-[var(--mat-border-green)] bg-[var(--mat-green-50)] text-[var(--mat-green-800)]"
                      : "border-amber-200 bg-amber-50 text-amber-900",
                  ].join(" ")}
                >
                  {it.ok
                    ? "Configuration present"
                    : "Configuration not detected"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6 sm:p-7">
          <p className="mat-eyebrow">Status boundary</p>

          <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
            Configuration is not a health check
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
            A configuration signal means the application has the corresponding
            setting or built-in configuration available. It does not by itself
            verify external connectivity, credential validity, webhook
            delivery, or current service availability.
          </p>

          <p className="mt-4 text-xs leading-5 text-[var(--mat-muted-light)]">
            The underlying provider also contains legacy status notes such as
            &quot;Live&quot; and &quot;Connected&quot;. This screen does not
            present those notes as verified service-health results.
          </p>
        </aside>

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5 sm:p-6">
          <p className="text-sm font-semibold text-[var(--mat-ink)]">
            Read-only system view
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
            This page does not change credentials or integration configuration.
            Configuration changes are managed outside this administrative
            screen.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
}
