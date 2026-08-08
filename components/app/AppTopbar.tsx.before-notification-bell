import Link from "next/link";
import { cookies } from "next/headers";

import MobileNav from "@/components/app/MobileNav";
import { Search, Bell, Wallet } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

async function getBalance(): Promise<string> {
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return "$0.00";
    const { userId } = verifyAuthToken(token);
    const wallet = await prisma.walletAccount.findUnique({
      where: { userId },
      include: { transactions: true },
    });
    const minor = (wallet?.transactions ?? []).reduce((sum, t) => sum + t.amountMinor, 0);
    const currency = wallet?.currencyCode || "USD";
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(minor / 100);
  } catch {
    return "$0.00";
  }
}

type Props = { userName?: string | null };

export default async function AppTopbar({ userName }: Props) {
  const initial = (userName || "U").slice(0, 1).toUpperCase();
  const balance = await getBalance();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-[#f6faf8]/85 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="hidden items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 sm:flex">
          <Search className="h-4 w-4" />
          <span>Search lessons, sounds, phrases…</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/wallet"
          className="flex items-center gap-2 rounded-xl border border-[#eddcc0] bg-[#f8f0e2] px-3 py-2 text-sm font-semibold text-[#8a5a17]"
        >
          <Wallet className="h-4 w-4" /> {balance}
        </Link>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-[#e9f8f3]"
        >
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-[#d1495b]" />
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#20ad68] font-semibold text-white">
          {initial}
        </div>
      </div>
    </header>
  );
}
