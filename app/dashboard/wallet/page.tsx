import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import RedeemPromo from "@/components/app/RedeemPromo";
import SendCreditForm from "@/components/app/SendCreditForm";
import AppLayout from "@/components/layouts/AppLayout";
import { Arrow, Gift } from "@/components/ui/icons";
import {
  getEnrollmentState,
  hasPremiumAccess,
} from "@/lib/auth/enrollment";
import { verifyAuthToken } from "@/lib/jwt";
import { formatMoney } from "@/lib/payments/plans";
import { getSubscriptionStatus } from "@/lib/payments/subscription";
import { getWalletSummary, txnMeta } from "@/lib/payments/wallet";
import { prisma } from "@/lib/prisma";

export default async function WalletPage() {
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
      emailVerified: true,
      profile: {
        select: {
          englishGoal: true,
          proficiencyLevel: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [wallet, subscriptionStatus] = await Promise.all([
    getWalletSummary(payload.userId, 8),
    getSubscriptionStatus(payload.userId),
  ]);

  const currency = wallet.currency;

  const enrollmentState = getEnrollmentState({
    emailVerified: user.emailVerified,
    englishGoal: user.profile?.englishGoal,
    proficiencyLevel: user.profile?.proficiencyLevel,
    subscriptionStatus,
  });

  const isActive = hasPremiumAccess(enrollmentState);

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
            <div className="p-6 sm:p-8">
              <p className="mat-eyebrow">Wallet</p>

              <h1 className="mt-2 max-w-2xl font-display text-3xl text-[var(--mat-ink)] sm:text-4xl">
                Your learning credit
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
                See the credit available on your account, send credit to
                another registered learner, redeem eligible promo codes, and
                review the transactions recorded in your wallet.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/wallet/ledger"
                  className="mat-button mat-button-primary"
                >
                  View full ledger
                  <Arrow className="h-4 w-4" />
                </Link>

                <Link
                  href="/dashboard/referrals"
                  className="mat-button mat-button-secondary"
                >
                  Referral credits
                </Link>
              </div>
            </div>

            <div className="border-t border-[var(--mat-border)] bg-[var(--mat-green-50)] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--mat-green-700)]">
                Available balance
              </p>

              <p className="mt-3 font-display text-4xl text-[var(--mat-ink)] sm:text-5xl">
                {formatMoney(wallet.balanceMinor, currency)}
              </p>

              <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
                Balance calculated from the transactions recorded in your
                wallet.
              </p>

              <div className="mt-5 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-white/80 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted-light)]">
                  Membership
                </p>

                <p className="mt-1 text-sm font-semibold text-[var(--mat-ink)]">
                  {isActive
                    ? "Premium access is active"
                    : "No active Premium access"}
                </p>

                <Link
                  href="/dashboard/billing"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--mat-green-700)] hover:underline"
                >
                  Open Billing
                  <Arrow className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <SendCreditForm
              balanceMinor={wallet.balanceMinor}
              currencyCode={currency}
            />

            <RedeemPromo />
          </div>

          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mat-eyebrow">Wallet history</p>

                <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  Recent activity
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                  Your eight most recent wallet transactions appear here.
                </p>
              </div>

              <Link
                href="/dashboard/wallet/ledger"
                className="shrink-0 text-sm font-semibold text-[var(--mat-green-700)] hover:underline"
              >
                Full ledger
              </Link>
            </div>

            {wallet.transactions.length === 0 ? (
              <div className="mt-6 rounded-[var(--mat-radius-lg)] border border-dashed border-[var(--mat-border-strong)] bg-[var(--mat-surface-soft)] p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mat-green-50)] text-[var(--mat-green-700)]">
                  <Gift className="h-4 w-4" />
                </div>

                <p className="mt-4 font-semibold text-[var(--mat-ink)]">
                  No wallet activity yet
                </p>

                <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
                  Transactions will appear here after credit is added, received,
                  sent, redeemed, or applied.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-[var(--mat-border)]">
                {wallet.transactions.map((transaction) => {
                  const meta = txnMeta(transaction.type);
                  const positive = transaction.amountMinor >= 0;

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3 py-4"
                    >
                      <div
                        className={
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--mat-radius-lg)] " +
                          (positive
                            ? "bg-[var(--mat-green-50)] text-[var(--mat-green-700)]"
                            : "bg-[var(--mat-surface-soft)] text-[var(--mat-muted)]")
                        }
                      >
                        <Gift className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--mat-ink)]">
                          {transaction.description || meta.label}
                        </p>

                        <p className="mt-1 text-xs text-[var(--mat-muted-light)]">
                          {new Date(transaction.createdAt).toLocaleDateString()}
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
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-6 sm:p-7">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted-light)]">
                One transaction
              </p>

              <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
                Transfer protection
              </h2>
            </div>

            <div className="text-sm leading-6 text-[var(--mat-muted)]">
              <p className="font-semibold text-[var(--mat-ink)]">
                Both ledger entries are created together.
              </p>

              <p className="mt-1">
                Sender and recipient entries are written inside one database
                transaction, so a completed transfer does not leave only one
                side recorded.
              </p>
            </div>

            <div className="text-sm leading-6 text-[var(--mat-muted)]">
              <p className="font-semibold text-[var(--mat-ink)]">
                One shared transfer reference.
              </p>

              <p className="mt-1">
                The same transfer reference is recorded with the linked sender
                and recipient ledger entries.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
