import Link from "next/link";
import { cookies } from "next/headers";

import MobileNav from "@/components/app/MobileNav";
import NotificationBell from "@/components/app/NotificationBell";
import { Wallet } from "@/components/ui/icons";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

async function getBalance(): Promise<string> {
  try {
    const token = (await cookies()).get("mat_session")?.value;

    if (!token) {
      return "$0.00";
    }

    const { userId } = verifyAuthToken(token);

    const wallet = await prisma.walletAccount.findUnique({
      where: { userId },
      include: { transactions: true },
    });

    const minor = (wallet?.transactions ?? []).reduce(
      (sum, transaction) => sum + transaction.amountMinor,
      0,
    );

    const currency = wallet?.currencyCode || "USD";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(minor / 100);
  } catch {
    return "$0.00";
  }
}

type Props = {
  userName?: string | null;
};

export default async function AppTopbar({ userName }: Props) {
  const initial = (userName || "U").slice(0, 1).toUpperCase();
  const balance = await getBalance();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--mat-border)] bg-white/92 backdrop-blur">
      <div className="flex h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav />

          <div className="min-w-0 lg:hidden">
            <p className="truncate text-sm font-extrabold tracking-[-0.02em] text-[var(--mat-ink)]">
              MyAccentTrainer
            </p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mat-muted-light)]">
              Learn with Nina
            </p>
          </div>

          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-[var(--mat-muted)]">
              Your personalized English learning space
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/wallet"
            aria-label={`Learning credit balance ${balance}`}
            className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--mat-border)] bg-[var(--mat-gold-soft)] px-3 text-sm font-bold text-[var(--mat-gold)] transition hover:border-[#e6d1ac] hover:bg-[#f7ecd8]"
          >
            <Wallet className="h-4 w-4" />

            <span className="hidden sm:inline">
              Credit
            </span>

            <span>{balance}</span>
          </Link>

          <NotificationBell />

          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mat-green-600)] text-sm font-bold text-white shadow-[var(--mat-shadow-xs)]"
            aria-label={userName ? `Signed in as ${userName}` : "Signed in learner"}
            title={userName || "Learner"}
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
