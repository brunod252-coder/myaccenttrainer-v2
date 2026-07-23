// ── Referral system ──────────────────────────────────────────────────
// Stable per-user referral codes, invite-to-inviter lookup, and reward
// credits ($5 each) granted when a referred friend joins. Guarded so it
// compiles/no-ops before `npx prisma db push`.

import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

export const REFERRAL_REWARD_MINOR = 500; // $5.00 each side

function udb() {
  return prisma as unknown as {
    user: {
      findUnique: (a: unknown) => Promise<{ id: string; referralCode: string | null } | null>;
      findFirst: (a: unknown) => Promise<{ id: string } | null>;
      update: (a: unknown) => Promise<unknown>;
    };
    walletAccount: {
      findUnique: (a: unknown) => Promise<{ id: string } | null>;
      create: (a: unknown) => Promise<{ id: string }>;
    };
    walletTransaction: { create: (a: unknown) => Promise<unknown> };
    referralInvite: {
      findFirst: (a: unknown) => Promise<{ id: string } | null>;
      create: (a: unknown) => Promise<unknown>;
      update: (a: unknown) => Promise<unknown>;
    };
  };
}

function newCode(): string {
  return "MAT-" + randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
}

// Return the learner's stable code, generating & saving one if needed.
export async function ensureReferralCode(userId: string): Promise<string> {
  try {
    const u = await udb().user.findUnique({ where: { id: userId }, select: { referralCode: true } });
    if (u?.referralCode) return u.referralCode;
    // generate a unique code (retry on the rare collision)
    for (let i = 0; i < 5; i++) {
      const code = newCode();
      try {
        await udb().user.update({ where: { id: userId }, data: { referralCode: code } });
        return code;
      } catch {
        // collision or not-migrated — try again / fall through
      }
    }
  } catch {
    // not migrated yet
  }
  // Fallback (deterministic) if persistence isn't available.
  return "MAT-" + userId.slice(-6).toUpperCase();
}

export async function findInviterByCode(code: string): Promise<string | null> {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  try {
    const u = await udb().user.findFirst({ where: { referralCode: c }, select: { id: true } });
    return u?.id ?? null;
  } catch {
    return null;
  }
}

async function grantCredit(userId: string, amountMinor: number, description: string, refId: string): Promise<void> {
  try {
    let wallet = await udb().walletAccount.findUnique({ where: { userId }, select: { id: true } });
    if (!wallet) wallet = await udb().walletAccount.create({ data: { userId } });
    await udb().walletTransaction.create({
      data: {
        walletAccountId: wallet.id,
        type: "REFERRAL_CREDIT",
        amountMinor,
        currencyCode: "USD",
        description,
        referenceType: "REFERRAL",
        referenceId: refId,
      },
    });
  } catch {
    // wallet tables not ready — ignore
  }
}

// Grant both sides their reward and record the invite as REWARDED.
export async function rewardReferral(
  inviterId: string,
  newUserId: string,
  friendEmail: string,
  friendName?: string | null,
): Promise<void> {
  if (!inviterId || inviterId === newUserId) return;
  try {
    await grantCredit(newUserId, REFERRAL_REWARD_MINOR, "Referral welcome credit", inviterId);
    await grantCredit(inviterId, REFERRAL_REWARD_MINOR, `Referral reward — ${friendName || friendEmail} joined`, newUserId);

    const code = (await udb().user.findUnique({ where: { id: inviterId }, select: { referralCode: true } }))?.referralCode || "";
    // Update a pending invite to this friend if one exists, else create a rewarded row.
    const existing = await udb().referralInvite.findFirst({
      where: { inviterUserId: inviterId, friendEmail: friendEmail.toLowerCase() },
    });
    if (existing) {
      await udb().referralInvite.update({ where: { id: existing.id }, data: { status: "REWARDED" } });
    } else {
      await udb().referralInvite.create({
        data: {
          inviterUserId: inviterId,
          friendEmail: friendEmail.toLowerCase(),
          friendName: friendName || null,
          referralCode: code,
          status: "REWARDED",
        },
      });
    }
  } catch {
    // best-effort — never block signup
  }
}
