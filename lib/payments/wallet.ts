// ── Wallet service ───────────────────────────────────────────────────
// Balance, ledger, promo redemption, and billing history — all built on
// the existing WalletAccount / WalletTransaction models. New behaviour
// (promo redemption, billing history) needs no schema change: it uses the
// transaction `referenceType` / `type` fields already in the schema.
//
// Every function is wrapped in try/catch so the app degrades gracefully if
// the wallet tables are empty or unavailable.

import { prisma } from "@/lib/prisma";
import { findPromo } from "./promos";

export type Txn = {
  id: string;
  type: string;
  amountMinor: number;
  currencyCode: string;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: Date;
};

const PROMO_REF = "PROMO";

function db() {
  return prisma as unknown as {
    walletAccount: {
      findUnique: (args: unknown) => Promise<{ id: string; currencyCode: string; transactions: Txn[] } | null>;
      create: (args: unknown) => Promise<{ id: string; currencyCode: string }>;
    };
    walletTransaction: {
      create: (args: unknown) => Promise<unknown>;
      findFirst: (args: unknown) => Promise<Txn | null>;
    };
  };
}

async function ensureWallet(userId: string): Promise<{ id: string; currencyCode: string; transactions: Txn[] }> {
  const existing = await db().walletAccount.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: "desc" } } },
  });
  if (existing) return existing;
  const created = await db().walletAccount.create({ data: { userId } });
  return { id: created.id, currencyCode: created.currencyCode || "USD", transactions: [] };
}

export type WalletSummary = {
  balanceMinor: number;
  currency: string;
  transactions: Txn[];
};

export async function getWalletSummary(userId: string, limit = 8): Promise<WalletSummary> {
  try {
    const wallet = await ensureWallet(userId);
    const all = wallet.transactions ?? [];
    const balanceMinor = all.reduce((sum, t) => sum + t.amountMinor, 0);
    return {
      balanceMinor,
      currency: wallet.currencyCode || "USD",
      transactions: limit ? all.slice(0, limit) : all,
    };
  } catch {
    return { balanceMinor: 0, currency: "USD", transactions: [] };
  }
}

export type LedgerRow = Txn & { runningMinor: number };

// Full ledger, oldest → newest, with a running balance on each row.
export async function getLedger(userId: string): Promise<{ rows: LedgerRow[]; currency: string; balanceMinor: number }> {
  try {
    const wallet = await ensureWallet(userId);
    const asc = [...(wallet.transactions ?? [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    let running = 0;
    const rows: LedgerRow[] = asc.map((t) => {
      running += t.amountMinor;
      return { ...t, runningMinor: running };
    });
    rows.reverse(); // newest first for display
    return { rows, currency: wallet.currencyCode || "USD", balanceMinor: running };
  } catch {
    return { rows: [], currency: "USD", balanceMinor: 0 };
  }
}

// Billing history = money-in payment events (Stripe / applied subscription).
export async function getBillingHistory(userId: string): Promise<Txn[]> {
  try {
    const wallet = await ensureWallet(userId);
    const billingTypes = new Set(["STRIPE_PAYMENT", "SUBSCRIPTION_APPLIED", "REFUND"]);
    return (wallet.transactions ?? []).filter((t) => billingTypes.has(t.type));
  } catch {
    return [];
  }
}

export type RedeemResult =
  | { ok: true; creditMinor: number; note: string; balanceMinor: number }
  | { ok: false; error: string };

export async function redeemPromo(userId: string, rawCode: string): Promise<RedeemResult> {
  const promo = findPromo(rawCode || "");
  if (!promo) return { ok: false, error: "That code isn't valid. Check it and try again." };

  try {
    const wallet = await ensureWallet(userId);

    // Already redeemed? (one use per learner)
    const already = await db().walletTransaction.findFirst({
      where: { walletAccountId: wallet.id, referenceType: PROMO_REF, referenceId: promo.code },
    });
    if (already) return { ok: false, error: "You've already redeemed this code." };

    await db().walletTransaction.create({
      data: {
        walletAccountId: wallet.id,
        type: "REFERRAL_CREDIT",
        amountMinor: promo.creditMinor,
        currencyCode: wallet.currencyCode || "USD",
        description: promo.label,
        referenceType: PROMO_REF,
        referenceId: promo.code,
      },
    });

    const balanceMinor =
      (wallet.transactions ?? []).reduce((s, t) => s + t.amountMinor, 0) + promo.creditMinor;
    return { ok: true, creditMinor: promo.creditMinor, note: promo.note, balanceMinor };
  } catch {
    return { ok: false, error: "We couldn't redeem that just now. Please try again." };
  }
}

// Friendly label + sign styling helper for any transaction type.
export function txnMeta(type: string): { label: string; positive: boolean } {
  const map: Record<string, string> = {
    STRIPE_PAYMENT: "Payment",
    REFERRAL_CREDIT: "Credit",
    WELCOME_CREDIT: "Welcome credit",
    TRANSFER_SENT: "Transfer sent",
    TRANSFER_RECEIVED: "Transfer received",
    SUBSCRIPTION_APPLIED: "Subscription",
    ADMIN_ADJUSTMENT: "Adjustment",
    REFUND: "Refund",
  };
  const negativeTypes = new Set(["TRANSFER_SENT", "SUBSCRIPTION_APPLIED"]);
  return { label: map[type] || type.replaceAll("_", " "), positive: !negativeTypes.has(type) };
}
