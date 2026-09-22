import Link from "next/link";

import AdminLayout from "@/components/admin/AdminLayout";
import { Search } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/auth/admin";
import { listUsers } from "@/lib/admin/stats";

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const admin = await requireAdmin();
  const { q } = await searchParams;
  const users = await listUsers(q);

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  const query = q?.trim() || "";

  return (
    <AdminLayout admin={{ name: adminName }}>
      <div className="space-y-6">
        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mat-eyebrow">Platform</p>

              <h1 className="mt-2 font-display text-3xl text-[var(--mat-ink)] sm:text-4xl">
                User accounts
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
                Search the platform account directory and open an individual
                account to review its stored learning and account information.
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

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-5 shadow-[var(--mat-shadow-sm)] sm:p-6">
          <form action="/admin/users" method="get">
            <label
              htmlFor="admin-user-search"
              className="text-sm font-semibold text-[var(--mat-ink)]"
            >
              Search accounts
            </label>

            <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
              Search by email, first name, or last name.
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mat-muted-light)]"
                />

                <input
                  id="admin-user-search"
                  name="q"
                  defaultValue={query}
                  placeholder="Name or email"
                  autoComplete="off"
                  className="w-full rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--mat-ink)] outline-none transition placeholder:text-[var(--mat-muted-light)] focus:border-[var(--mat-green-700)] focus:ring-2 focus:ring-[var(--mat-green-50)]"
                />
              </div>

              <button
                type="submit"
                className="mat-button mat-button-primary sm:w-auto"
              >
                Search
              </button>

              {query ? (
                <Link
                  href="/admin/users"
                  className="mat-button mat-button-secondary sm:w-auto"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="border-b border-[var(--mat-border)] px-5 py-5 sm:px-6">
            <p className="mat-eyebrow">Directory</p>

            <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <h2 className="font-display text-2xl text-[var(--mat-ink)]">
                Accounts
              </h2>

              <p className="text-sm text-[var(--mat-muted)]">
                {users.length} account{users.length === 1 ? "" : "s"}
                {query ? ` matching “${query}”` : " returned"}
              </p>
            </div>

            <p className="mt-2 text-xs leading-5 text-[var(--mat-muted-light)]">
              The directory can include learner and administrator accounts.
              Results are limited by the existing account-list provider.
            </p>
          </div>

          {users.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <p className="font-semibold text-[var(--mat-ink)]">
                {query ? "No matching accounts" : "No accounts returned"}
              </p>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--mat-muted)]">
                {query
                  ? "Try a different name or email address."
                  : "The account provider did not return any records."}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[var(--mat-border)] md:hidden">
                {users.map((u) => (
                  <article key={u.id} className="px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--mat-ink)]">
                          {u.name}
                        </p>

                        <p className="mt-1 break-all text-sm text-[var(--mat-muted)]">
                          {u.email}
                        </p>
                      </div>

                      <span
                        className={[
                          "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
                          u.role === "ADMIN"
                            ? "border-[var(--mat-ink)] bg-[var(--mat-ink)] text-white"
                            : "border-[var(--mat-border)] bg-[var(--mat-surface-soft)] text-[var(--mat-muted)]",
                        ].join(" ")}
                      >
                        {u.role.toLowerCase()}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-xs text-[var(--mat-muted-light)]">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </p>

                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-sm font-semibold text-[var(--mat-green-700)] hover:underline"
                      >
                        View account
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--mat-surface-soft)] text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mat-muted-light)]">
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Joined</th>
                      <th className="px-6 py-3">
                        <span className="sr-only">Open account</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--mat-border)]">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="transition hover:bg-[var(--mat-surface-soft)]"
                      >
                        <td className="px-6 py-4 font-medium text-[var(--mat-ink)]">
                          {u.name}
                        </td>

                        <td className="px-6 py-4 text-[var(--mat-muted)]">
                          {u.email}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                              u.role === "ADMIN"
                                ? "border-[var(--mat-ink)] bg-[var(--mat-ink)] text-white"
                                : "border-[var(--mat-border)] bg-[var(--mat-surface-soft)] text-[var(--mat-muted)]",
                            ].join(" ")}
                          >
                            {u.role.toLowerCase()}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-[var(--mat-muted)]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="font-semibold text-[var(--mat-green-700)] hover:underline"
                          >
                            View account
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
          <p className="text-sm font-semibold text-[var(--mat-ink)]">
            Account-directory boundary
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
            This view lists stored user accounts returned by the existing
            provider. It does not imply that every account is a learner, and
            searching or opening an account does not modify it.
          </p>
        </aside>
      </div>
    </AdminLayout>
  );
}
