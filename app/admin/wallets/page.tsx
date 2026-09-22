import Link from "next/link";

import AdminLayout from "@/components/admin/AdminLayout";
import WalletAdjustmentForm from "@/components/admin/WalletAdjustmentForm";
import {
  getAdminWalletDetail,
  listAdminWalletUsers,
} from "@/lib/admin/wallets";
import { requireAdmin } from "@/lib/auth/admin";

function money(amountMinor: number, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amountMinor / 100);
}

function transactionLabel(type: string) {
  const labels: Record<string, string> = {
    STRIPE_PAYMENT: "Stripe payment",
    REFERRAL_CREDIT: "Referral credit",
    WELCOME_CREDIT: "Welcome credit",
    TRANSFER_SENT: "Transfer sent",
    TRANSFER_RECEIVED: "Transfer received",
    SUBSCRIPTION_APPLIED: "Subscription applied",
    ADMIN_ADJUSTMENT: "Admin adjustment",
    REFUND: "Refund",
  };

  return labels[type] || type.replaceAll("_", " ");
}

export default async function AdminWalletsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    userId?: string;
  }>;
}) {
  const admin = await requireAdmin();
  const { q, userId } = await searchParams;

  const users = await listAdminWalletUsers(q);

  const selectedUserId =
    userId && users.some((user) => user.id === userId) ? userId : users[0]?.id;

  const detail = selectedUserId
    ? await getAdminWalletDetail(selectedUserId)
    : null;

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.email;

  const totalBalanceMinor = users.reduce(
    (sum, user) => sum + user.balanceMinor,
    0,
  );

  const totalTransactions = users.reduce(
    (sum, user) => sum + user.transactionCount,
    0,
  );

  return (
    <AdminLayout admin={{ name: adminName }}>
      <div className="space-y-6">
        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-8">
          <p className="mat-eyebrow">Finance</p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-[var(--mat-ink)] sm:text-4xl">
              Wallet administration
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
              Review ledger-derived wallet balances, inspect recent transaction
              activity, and access the existing administrative adjustment workflow.
            </p>
          </div>

          <div className="w-fit rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mat-muted-light)]">
              Returned-wallet balance total
            </p>
            <p className="mt-1 font-display text-2xl text-[var(--mat-green-700)]">
              {money(totalBalanceMinor)}
            </p>
          </div>
        </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Returned accounts" value={String(users.length)} />

          <StatCard
            label="Returned ledger entries"
            value={String(totalTransactions)}
          />

          <StatCard
            label="Selected wallet balance"
            value={
              detail
                ? money(detail.wallet.balanceMinor, detail.wallet.currencyCode)
                : "$0.00"
            }
          />
        </div>

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-5 shadow-[var(--mat-shadow-sm)] sm:p-6">
          <form action="/admin/wallets" method="get">
            <label
              htmlFor="wallet-account-search"
              className="text-sm font-semibold text-[var(--mat-ink)]"
            >
              Search wallet accounts
            </label>

            <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
              Search the administrative wallet directory by name or email.
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="wallet-account-search"
                name="q"
                defaultValue={q || ""}
                placeholder="Name or email"
                autoComplete="off"
                className="w-full flex-1 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-white px-4 py-2.5 text-sm text-[var(--mat-ink)] outline-none transition placeholder:text-[var(--mat-muted-light)] focus:border-[var(--mat-green-700)] focus:ring-2 focus:ring-[var(--mat-green-50)]"
              />

              <button
                type="submit"
                className="mat-button mat-button-primary sm:w-auto"
              >
                Search
              </button>

              {q ? (
                <Link
                  href="/admin/wallets"
                  className="mat-button mat-button-secondary sm:w-auto"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
            <div className="border-b border-[var(--mat-border)] px-5 py-5 sm:px-6">
              <p className="mat-eyebrow">Directory</p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Wallet accounts
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select an account to inspect its wallet and ledger activity.
              </p>
            </div>

            {users.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">
                No wallet accounts returned.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {users.map((user) => {
                  const selected = user.id === selectedUserId;

                  const href = new URLSearchParams();

                  if (q) {
                    href.set("q", q);
                  }

                  href.set("userId", user.id);

                  return (
                    <Link
                      key={user.id}
                      href={`/admin/wallets?${href.toString()}`}
                      className={[
                        "grid gap-3 px-5 py-4 transition sm:grid-cols-[1fr_auto] sm:items-center",
                        selected ? "bg-[#effaf5]" : "hover:bg-[#f8fbfa]",
                      ].join(" ")}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-[#17223b]">
                            {user.name}
                          </p>

                          <span
                            className={[
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                              user.role === "ADMIN"
                                ? "bg-[#111c30] text-white"
                                : "bg-[#eef4f9] text-[#52719f]",
                            ].join(" ")}
                          >
                            {user.role}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm text-gray-500">
                          {user.email}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {user.transactionCount} ledger{" "}
                          {user.transactionCount === 1 ? "entry" : "entries"}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p
                          className={[
                            "font-display text-xl",
                            user.balanceMinor < 0
                              ? "text-red-600"
                              : "text-[#168c56]",
                          ].join(" ")}
                        >
                          {money(user.balanceMinor, user.currencyCode)}
                        </p>

                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          {user.currencyCode}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {detail ? (
            <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)]">
              <p className="mat-eyebrow">Selected wallet</p>

              <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
                {detail.user.name}
              </h2>

              <p className="mt-1 break-all text-sm text-[var(--mat-muted)]">{detail.user.email}</p>

              <div className="mt-5 rounded-[var(--mat-radius-xl)] bg-[var(--mat-ink)] p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
                  Wallet balance
                </p>

                <p className="mt-2 font-display text-4xl">
                  {money(
                    detail.wallet.balanceMinor,
                    detail.wallet.currencyCode,
                  )}
                </p>

                <p className="mt-2 text-xs leading-5 text-white/50">
                  Balance derived from the full stored ledger
                </p>
              </div>

              <WalletAdjustmentForm
                userId={detail.user.id}
                userName={detail.user.name}
                userEmail={detail.user.email}
                currencyCode={detail.wallet.currencyCode}
              />
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Select an account to inspect its wallet.
            </section>
          )}
        </div>

        {detail && (
          <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
            <div className="border-b border-[var(--mat-border)] px-5 py-5 sm:px-6">
              <p className="mat-eyebrow">Ledger</p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Recent wallet ledger activity
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                Latest stored transactions returned for {detail.user.email}.
              </p>
            </div>

            {detail.transactions.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">
                No wallet transactions yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#f8fbfa] text-left text-xs font-bold uppercase tracking-wide text-gray-400">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {detail.transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-50 last:border-none"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#eef4f9] px-2.5 py-1 text-xs font-semibold text-[#52719f]">
                            {transactionLabel(transaction.type)}
                          </span>
                        </td>

                        <td className="max-w-md px-5 py-4 text-gray-600">
                          {transaction.description || "—"}
                        </td>

                        <td
                          className={[
                            "whitespace-nowrap px-5 py-4 text-right font-bold",
                            transaction.amountMinor >= 0
                              ? "text-[#168c56]"
                              : "text-red-600",
                          ].join(" ")}
                        >
                          {transaction.amountMinor >= 0 ? "+" : ""}
                          {money(
                            transaction.amountMinor,
                            transaction.currencyCode,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
          <p className="text-sm font-semibold text-[var(--mat-ink)]">
            Wallet administration boundary
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
            Wallet balances shown here are derived from stored ledger
            transactions. Administrative credits and debits append adjustment
            entries; this interface does not overwrite wallet balances
            directly.
          </p>

          <p className="mt-3 text-xs leading-5 text-[var(--mat-muted-light)]">
            Summary totals describe only the accounts returned by the existing
            administrative wallet provider. They are not a separate accounting
            or settlement balance.
          </p>
        </aside>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 font-display text-2xl text-[#17223b]">{value}</p>
    </div>
  );
}
