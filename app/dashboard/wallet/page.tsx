import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import PlanTiers from "@/components/app/PlanTiers";
import RedeemPromo from "@/components/app/RedeemPromo";
import { Gift, Arrow } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getSubscriptionStatus } from "@/lib/payments/subscription";
import { getWalletSummary, txnMeta } from "@/lib/payments/wallet";
import { formatMoney } from "@/lib/payments/plans";

export default async function WalletPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");
  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  const [wallet, subscriptionStatus] = await Promise.all([
    getWalletSummary(payload.userId, 6),
    getSubscriptionStatus(payload.userId),
  ]);

  const currency = wallet.currency;
  const isActive = subscriptionStatus === "active";
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#20ad68]">Wallet</p>
        <h1 className="mt-1 font-display text-3xl text-[#17223b]">Your learning credit</h1>
        <p className="mt-1 text-sm text-gray-500">Earn credit through referrals and promos, and apply it to your plan.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#20ad68] via-[#178a57] to-[#142b4c] p-7 text-white shadow-md">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
            <p className="relative text-sm text-white/80">Available balance</p>
            <p className="relative mt-1 font-display text-5xl">{formatMoney(wallet.balanceMinor, currency)}</p>
            <p className="relative mt-4 text-xs text-white/70">Credit is applied automatically at checkout.</p>
          </div>

          <RedeemPromo />

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-[#17223b]">Recent activity</h2>
              <Link href="/dashboard/wallet/ledger" className="inline-flex items-center gap-1 text-sm font-semibold text-[#168c56] hover:underline">
                Full ledger <Arrow className="h-4 w-4" />
              </Link>
            </div>
            {wallet.transactions.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-[#f8fbfa] p-6 text-center text-sm text-gray-500">
                No transactions yet. Redeem a promo code or invite a friend to earn your first credit.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-gray-100">
                {wallet.transactions.map((t) => {
                  const meta = txnMeta(t.type);
                  return (
                    <div key={t.id} className="flex items-center gap-3 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e9f8f3] text-[#20ad68]">
                        <Gift className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#17223b]">{t.description || meta.label}</p>
                        <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className={"text-sm font-semibold " + (t.amountMinor >= 0 ? "text-[#2e7d5b]" : "text-gray-500")}>
                        {t.amountMinor >= 0 ? "+" : ""}
                        {formatMoney(t.amountMinor, t.currencyCode || currency)}
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
              <h2 className="font-display text-lg text-[#17223b]">Choose your plan</h2>
              <Link href="/dashboard/billing" className="text-sm font-semibold text-[#168c56] hover:underline">
                Billing
              </Link>
            </div>
            <p className="mt-1 text-sm text-gray-500">Unlimited lessons, Nina feedback, and certificates.</p>
            <div className="mt-5">
              <PlanTiers isActive={isActive} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
