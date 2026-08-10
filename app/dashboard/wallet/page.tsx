import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import PlanTiers from "@/components/app/PlanTiers";
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
  const enrollmentState =
    getEnrollmentState({
      emailVerified: user.emailVerified,
      subscriptionStatus,
    });

  const isActive =
    hasPremiumAccess(enrollmentState);

  const userName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">
          Wallet
        </p>

        <h1 className="mt-1 font-display text-3xl text-[#17223b]">
          Your learning credit
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Earn, receive, send, and apply credit throughout My Accent Trainer.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#20ad68] via-[#178a57] to-[#142b4c] p-7 text-white shadow-md">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />

            <p className="relative text-sm text-white/80">Available balance</p>

            <p className="relative mt-1 font-display text-5xl">
              {formatMoney(wallet.balanceMinor, currency)}
            </p>

            <div className="relative mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard/wallet/ledger"
                className="inline-flex items-center gap-1 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Full ledger
                <Arrow className="h-4 w-4" />
              </Link>
            </div>

            <p className="relative mt-4 text-xs text-white/70">
              Credit can be transferred to other registered users or applied to
              eligible services.
            </p>
          </div>

          <SendCreditForm
            balanceMinor={wallet.balanceMinor}
            currencyCode={currency}
          />

          <RedeemPromo />

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-[#17223b]">
                Recent activity
              </h2>

              <Link
                href="/dashboard/wallet/ledger"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#168c56] hover:underline"
              >
                Full ledger
                <Arrow className="h-4 w-4" />
              </Link>
            </div>

            {wallet.transactions.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-[#f8fbfa] p-6 text-center text-sm text-gray-500">
                No transactions yet. Redeem a promo code, invite a friend, or
                receive credit from another user.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-gray-100">
                {wallet.transactions.map((transaction) => {
                  const meta = txnMeta(transaction.type);

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e9f8f3] text-[#20ad68]">
                        <Gift className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#17223b]">
                          {transaction.description || meta.label}
                        </p>

                        <p className="text-xs text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div
                        className={
                          "text-sm font-semibold " +
                          (transaction.amountMinor >= 0
                            ? "text-[#2e7d5b]"
                            : "text-[#c05b5b]")
                        }
                      >
                        {transaction.amountMinor >= 0 ? "+" : "−"}
                        {formatMoney(
                          Math.abs(transaction.amountMinor),
                          transaction.currencyCode || currency,
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-[#17223b]">
                Choose your plan
              </h2>

              <Link
                href="/dashboard/billing"
                className="text-sm font-semibold text-[#168c56] hover:underline"
              >
                Billing
              </Link>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Unlimited lessons, Nina feedback, and certificates.
            </p>

            <div className="mt-5">
              <PlanTiers isActive={isActive} />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-[#17223b]">
              Transfer protection
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-6 text-gray-500">
              <p>
                Sender and recipient entries are created together in one
                database transaction.
              </p>

              <p>
                A transfer never partially completes: either both wallets
                update, or neither wallet changes.
              </p>

              <p>
                Each transfer receives a shared reference that appears in both
                account ledgers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
