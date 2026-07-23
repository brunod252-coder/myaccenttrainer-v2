import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import { Arrow, CheckCircle } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getSubscriptionStatus } from "@/lib/payments/subscription";
import { getBillingHistory } from "@/lib/payments/wallet";
import { formatMoney } from "@/lib/payments/plans";

export default async function BillingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");
  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  const [status, history] = await Promise.all([
    getSubscriptionStatus(payload.userId),
    getBillingHistory(payload.userId),
  ]);
  const isActive = status === "active";
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="mb-8">
        <Link href="/dashboard/wallet" className="inline-flex items-center gap-1 text-sm font-semibold text-[#168c56] hover:underline">
          <Arrow className="h-4 w-4 rotate-180" /> Back to wallet
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#20ad68]">Billing</p>
        <h1 className="mt-1 font-display text-3xl text-[#17223b]">Your subscription &amp; invoices</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your plan and review past payments.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-[#17223b]">Current plan</h2>
            <span
              className={
                "rounded-full px-2.5 py-1 text-xs font-semibold " +
                (isActive ? "bg-[#e5f3ec] text-[#2e7d5b]" : "bg-[#eef4f9] text-[#52719f]")
              }
            >
              {isActive ? "Active" : "No active plan"}
            </span>
          </div>
          {isActive ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#cdeee1] bg-[#f0faf6] p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 text-[#20ad68]" />
              <div>
                <p className="text-sm font-semibold text-[#168c56]">All-access membership</p>
                <p className="mt-1 text-sm text-[#2e7d5b]">
                  You have unlimited lessons and feedback from Nina. Thank you for learning with us!
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                You&apos;re on the free assessment. Choose a plan to unlock every lesson and unlimited coaching.
              </p>
              <Link
                href="/dashboard/wallet"
                className="mt-4 inline-flex rounded-lg bg-[#20ad68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#169357]"
              >
                See plans
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-[#17223b]">Payment history</h2>
          {history.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-[#f8fbfa] p-6 text-center text-sm text-gray-500">
              No payments yet. Your invoices will appear here once you subscribe.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {history.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-sm font-medium text-[#17223b]">{t.description || "Payment"}</p>
                    <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#17223b]">
                    {formatMoney(Math.abs(t.amountMinor), t.currencyCode || "USD")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

