import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import { Arrow } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getLedger, txnMeta } from "@/lib/payments/wallet";
import { formatMoney } from "@/lib/payments/plans";

export default async function LedgerPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;
  if (!token) redirect("/login");
  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  const { rows, currency, balanceMinor } = await getLedger(payload.userId);
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <AppLayout userName={userName} role={user.role}>
      <div className="mb-8">
        <Link href="/dashboard/wallet" className="inline-flex items-center gap-1 text-sm font-semibold text-[#168c56] hover:underline">
          <Arrow className="h-4 w-4 rotate-180" /> Back to wallet
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#20ad68]">Ledger</p>
        <h1 className="mt-1 font-display text-3xl text-[#17223b]">Full transaction history</h1>
        <p className="mt-1 text-sm text-gray-500">
          Every credit and charge on your wallet, with a running balance. Current balance:{" "}
          <span className="font-semibold text-[#17223b]">{formatMoney(balanceMinor, currency)}</span>.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No transactions yet. Your wallet activity will appear here.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8fbfa] text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const meta = txnMeta(t.type);
                return (
                  <tr key={t.id} className="border-b border-gray-50 last:border-none">
                    <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#17223b]">{t.description || meta.label}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-[#eef4f9] px-2.5 py-1 text-xs font-semibold text-[#52719f]">
                        {meta.label}
                      </span>
                    </td>
                    <td className={"px-5 py-3.5 text-right font-semibold " + (t.amountMinor >= 0 ? "text-[#2e7d5b]" : "text-[#c05b5b]")}>
                      {t.amountMinor >= 0 ? "+" : "−"}
                      {formatMoney(Math.abs(t.amountMinor), t.currencyCode || currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-500">
                      {formatMoney(t.runningMinor, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
