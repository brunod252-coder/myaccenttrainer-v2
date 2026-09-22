import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import { Arrow } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { formatMoney } from "@/lib/payments/plans";
import { getLedger, txnMeta } from "@/lib/payments/wallet";
import { prisma } from "@/lib/prisma";

export default async function LedgerPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const { rows, currency, balanceMinor } = await getLedger(payload.userId);

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
            <div className="p-6 sm:p-8">
              <Link
                href="/dashboard/wallet"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--mat-green-700)] hover:underline"
              >
                <Arrow className="h-4 w-4 rotate-180" />
                Back to wallet
              </Link>

              <p className="mat-eyebrow mt-6">Ledger</p>

              <h1 className="mt-2 max-w-2xl font-display text-3xl text-[var(--mat-ink)] sm:text-4xl">
                Full transaction history
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
                Review the transactions recorded in your wallet and the running
                balance after each entry.
              </p>
            </div>

            <div className="border-t border-[var(--mat-border)] bg-[var(--mat-green-50)] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--mat-green-700)]">
                Current balance
              </p>

              <p className="mt-3 font-display text-4xl text-[var(--mat-ink)] sm:text-5xl">
                {formatMoney(balanceMinor, currency)}
              </p>

              <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
                Calculated from the wallet transactions included in this
                ledger.
              </p>

              <div className="mt-5 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-white/80 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted-light)]">
                  Entries
                </p>

                <p className="mt-1 text-lg font-bold text-[var(--mat-ink)]">
                  {rows.length}
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
                  {rows.length === 1
                    ? "transaction in this ledger"
                    : "transactions in this ledger"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="border-b border-[var(--mat-border)] p-6 sm:p-7">
            <p className="mat-eyebrow">History</p>

            <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
              Wallet transactions
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
              Newest entries appear first. The balance column shows your wallet
              balance immediately after each transaction.
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="p-6 sm:p-10">
              <div className="rounded-[var(--mat-radius-lg)] border border-dashed border-[var(--mat-border-strong)] bg-[var(--mat-surface-soft)] p-6 text-center">
                <p className="font-semibold text-[var(--mat-ink)]">
                  No wallet transactions yet
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--mat-muted)]">
                  Wallet activity will appear here after a transaction is
                  recorded on your account.
                </p>

                <Link
                  href="/dashboard/wallet"
                  className="mat-button mat-button-secondary mt-5"
                >
                  Return to wallet
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 p-4 md:hidden">
                {rows.map((transaction) => {
                  const meta = txnMeta(transaction.type);
                  const positive = transaction.amountMinor >= 0;

                  return (
                    <article
                      key={transaction.id}
                      className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--mat-ink)]">
                            {transaction.description || meta.label}
                          </p>

                          <p className="mt-1 text-xs text-[var(--mat-muted-light)]">
                            {new Date(
                              transaction.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <p
                          className={
                            "shrink-0 text-sm font-bold " +
                            (positive
                              ? "text-[var(--mat-green-700)]"
                              : "text-[var(--mat-ink)]")
                          }
                        >
                          {positive ? "+" : "−"}
                          {formatMoney(
                            Math.abs(transaction.amountMinor),
                            transaction.currencyCode || currency,
                          )}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--mat-border)] pt-3">
                        <span className="rounded-full bg-[var(--mat-surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--mat-muted)]">
                          {meta.label}
                        </span>

                        <div className="text-right">
                          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--mat-muted-light)]">
                            Balance
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-[var(--mat-ink)]">
                            {formatMoney(transaction.runningMinor, currency)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--mat-border)] bg-[var(--mat-surface-soft)] text-left text-xs font-bold uppercase tracking-[0.08em] text-[var(--mat-muted-light)]">
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Description</th>
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5 text-right">Amount</th>
                      <th className="px-6 py-3.5 text-right">Balance</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--mat-border)]">
                    {rows.map((transaction) => {
                      const meta = txnMeta(transaction.type);
                      const positive = transaction.amountMinor >= 0;

                      return (
                        <tr key={transaction.id}>
                          <td className="whitespace-nowrap px-6 py-4 text-[var(--mat-muted)]">
                            {new Date(
                              transaction.createdAt,
                            ).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4 font-semibold text-[var(--mat-ink)]">
                            {transaction.description || meta.label}
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-[var(--mat-surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--mat-muted)]">
                              {meta.label}
                            </span>
                          </td>

                          <td
                            className={
                              "whitespace-nowrap px-6 py-4 text-right font-bold " +
                              (positive
                                ? "text-[var(--mat-green-700)]"
                                : "text-[var(--mat-ink)]")
                            }
                          >
                            {positive ? "+" : "−"}
                            {formatMoney(
                              Math.abs(transaction.amountMinor),
                              transaction.currencyCode || currency,
                            )}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-[var(--mat-ink)]">
                            {formatMoney(transaction.runningMinor, currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-5 sm:p-6">
          <p className="text-sm leading-6 text-[var(--mat-muted)]">
            <span className="font-semibold text-[var(--mat-ink)]">
              About running balances:
            </span>{" "}
            transactions are evaluated in chronological order to calculate the
            balance after each entry, then displayed here with the newest
            transaction first.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
