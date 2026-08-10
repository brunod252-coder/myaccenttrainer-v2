// ── Referral system ──────────────────────────────────────────────────
// Stable per-user referral codes, invite-to-inviter lookup, and reward
// credits ($10 each) granted when a referred friend joins. Guarded so it
// compiles/no-ops before `npx prisma db push`.

import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

export const REFERRAL_REWARD_MINOR = 1000; // $10.00 each side

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

export async function registerReferral(
  inviterId: string,
  newUserId: string,
  friendEmail: string,
  friendName?: string | null,
): Promise<void> {
  if (!inviterId || inviterId === newUserId) return;

  const email = friendEmail.trim().toLowerCase();

  try {
    const code =
      (
        await udb().user.findUnique({
          where: { id: inviterId },
          select: { referralCode: true },
        })
      )?.referralCode || "";

    const existing =
      await udb().referralInvite.findFirst({
        where: {
          inviterUserId: inviterId,
          friendEmail: email,
        },
      });

    if (existing) {
      await udb().referralInvite.update({
        where: { id: existing.id },
        data: {
          status: "REGISTERED",
          friendName: friendName || undefined,
        },
      });

      return;
    }

    await udb().referralInvite.create({
      data: {
        inviterUserId: inviterId,
        friendEmail: email,
        friendName: friendName || null,
        referralCode: code,
        status: "REGISTERED",
      },
    });
  } catch (error) {
    console.error("REFERRAL_REGISTRATION_ERROR", {
      inviterId,
      newUserId,
      friendEmail: email,
      error,
    });
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

/**
 * Marks a registered referral as having started its Premium
 * subscription lifecycle.
 *
 * Starting a trial does NOT issue referral credit.
 * Rewards remain locked until a real paid invoice succeeds.
 */
export async function markReferralSubscribed(
  userId: string,
): Promise<boolean> {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        email: true,
      },
    });

  if (!user?.email) {
    return false;
  }

  const email =
    user.email.trim().toLowerCase();

  const referral =
    await prisma.referralInvite.findFirst({
      where: {
        friendEmail: email,
        status: "REGISTERED",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
    });

  if (!referral) {
    return false;
  }

  const result =
    await prisma.referralInvite.updateMany({
      where: {
        id: referral.id,
        status: "REGISTERED",
      },
      data: {
        status: "SUBSCRIBED",
      },
    });

  return result.count === 1;
}


export type PaidReferralRewardResult = {
  rewarded: boolean;
  reason:
    | "REWARDED"
    | "NO_REFERRAL"
    | "NOT_ELIGIBLE";
  referralInviteId?: string;
};

/**
 * Rewards a referral only after the referred learner has made
 * their first real successful subscription payment.
 *
 * Financial guarantees:
 *
 * - only SUBSCRIBED referrals are eligible;
 * - the referral row is locked during reward processing;
 * - both $10 wallet credits and the REWARDED state transition
 *   happen inside one database transaction;
 * - both wallet entries use the referral invitation ID as their
 *   durable reference;
 * - Stripe retries and later paid renewals cannot reward again.
 */
export async function rewardPaidReferral(
  referredUserId: string,
): Promise<PaidReferralRewardResult> {
  const referredUser =
    await prisma.user.findUnique({
      where: {
        id: referredUserId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

  if (!referredUser?.email) {
    return {
      rewarded: false,
      reason: "NO_REFERRAL",
    };
  }

  const normalizedEmail =
    referredUser.email
      .trim()
      .toLowerCase();

  const candidate =
    await prisma.referralInvite.findFirst({
      where: {
        friendEmail: normalizedEmail,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
    });

  if (!candidate) {
    return {
      rewarded: false,
      reason: "NO_REFERRAL",
    };
  }

  return prisma.$transaction(
    async (tx) => {
      /*
       * Serialize competing Stripe webhook attempts for the
       * same referral before making any financial mutation.
       */
      await tx.$queryRawUnsafe(
        `
          SELECT "id"
          FROM "ReferralInvite"
          WHERE "id" = $1
          FOR UPDATE
        `,
        candidate.id,
      );

      const referral =
        await tx.referralInvite.findUnique({
          where: {
            id: candidate.id,
          },
          select: {
            id: true,
            inviterUserId: true,
            friendEmail: true,
            friendName: true,
            status: true,
          },
        });

      if (!referral) {
        return {
          rewarded: false,
          reason: "NO_REFERRAL",
        } satisfies PaidReferralRewardResult;
      }

      if (referral.status !== "SUBSCRIBED") {
        return {
          rewarded: false,
          reason: "NOT_ELIGIBLE",
          referralInviteId:
            referral.id,
        } satisfies PaidReferralRewardResult;
      }

      if (
        referral.inviterUserId ===
        referredUserId
      ) {
        return {
          rewarded: false,
          reason: "NOT_ELIGIBLE",
          referralInviteId:
            referral.id,
        } satisfies PaidReferralRewardResult;
      }

      let referredWallet =
        await tx.walletAccount.findUnique({
          where: {
            userId: referredUserId,
          },
          select: {
            id: true,
          },
        });

      if (!referredWallet) {
        referredWallet =
          await tx.walletAccount.create({
            data: {
              userId: referredUserId,
              currencyCode: "USD",
            },
            select: {
              id: true,
            },
          });
      }

      let inviterWallet =
        await tx.walletAccount.findUnique({
          where: {
            userId:
              referral.inviterUserId,
          },
          select: {
            id: true,
          },
        });

      if (!inviterWallet) {
        inviterWallet =
          await tx.walletAccount.create({
            data: {
              userId:
                referral.inviterUserId,
              currencyCode: "USD",
            },
            select: {
              id: true,
            },
          });
      }

      const referredName =
        [
          referredUser.firstName,
          referredUser.lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        normalizedEmail;

      /*
       * Both wallets use the same referral invitation ID as the
       * business reference. The WalletTransaction composite
       * unique constraint prevents duplicate credit per wallet.
       */
      await tx.walletTransaction.create({
        data: {
          walletAccountId:
            referredWallet.id,
          type: "REFERRAL_CREDIT",
          amountMinor:
            REFERRAL_REWARD_MINOR,
          currencyCode: "USD",
          description:
            "Referral welcome credit",
          referenceType:
            "REFERRAL",
          referenceId:
            referral.id,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletAccountId:
            inviterWallet.id,
          type: "REFERRAL_CREDIT",
          amountMinor:
            REFERRAL_REWARD_MINOR,
          currencyCode: "USD",
          description:
            `Referral reward — ${referredName} became a paid member`,
          referenceType:
            "REFERRAL",
          referenceId:
            referral.id,
        },
      });

      await tx.referralInvite.update({
        where: {
          id: referral.id,
        },
        data: {
          status: "REWARDED",
        },
      });

      return {
        rewarded: true,
        reason: "REWARDED",
        referralInviteId:
          referral.id,
      } satisfies PaidReferralRewardResult;
    },
    {
      maxWait: 5000,
      timeout: 20000,
    },
  );
}
