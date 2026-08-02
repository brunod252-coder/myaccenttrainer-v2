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
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#20ad68]">
          Finance
        </p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-[#17223b] sm:text-4xl">
              Wallets
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Review balances, inspect ledger activity, and issue audited
              administrative adjustments.
            </p>
          </div>

          <div className="rounded-xl border border-[#ccebdd] bg-[#effaf5] px-4 py-3 text-sm">
            <span className="text-gray-500">Platform wallet balance</span>
            <span className="ml-3 font-bold text-[#168c56]">
              {money(totalBalanceMinor)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Wallet users" value={String(users.length)} />

          <StatCard
            label="Ledger transactions"
            value={String(totalTransactions)}
          />

          <StatCard
            label="Selected balance"
            value={
              detail
                ? money(detail.wallet.balanceMinor, detail.wallet.currencyCode)
                : "$0.00"
            }
          />
        </div>

        <form action="/admin/wallets" method="get" className="mt-6">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Search users by name or email…"
            className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#20ad68]"
          />
        </form>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-display text-xl text-[#17223b]">
                User wallets
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select a user to inspect and manage their wallet.
              </p>
            </div>

            {users.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">
                No users found.
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
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#20ad68]">
                Selected wallet
              </p>

              <h2 className="mt-2 font-display text-2xl text-[#17223b]">
                {detail.user.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">{detail.user.email}</p>

              <div className="mt-5 rounded-2xl bg-[#111c30] p-5 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                  Available balance
                </p>

                <p className="mt-2 font-display text-4xl">
                  {money(
                    detail.wallet.balanceMinor,
                    detail.wallet.currencyCode,
                  )}
                </p>

                <p className="mt-2 text-xs text-white/45">
                  Balance derived from the full ledger
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
              Select a user to manage their wallet.
            </section>
          )}
        </div>

        {detail && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-display text-xl text-[#17223b]">
                Recent ledger activity
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest transactions for {detail.user.email}.
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
