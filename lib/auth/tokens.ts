// ── One-time auth tokens (password reset & email verification) ───────
// Random, single-use, expiring tokens stored in VerificationToken.
// Guarded so it compiles/no-ops before `npx prisma db push`.

import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

export type TokenType = "reset" | "verify";

function db() {
  return prisma as unknown as {
    verificationToken: {
      create: (args: unknown) => Promise<unknown>;
      findFirst: (args: unknown) => Promise<{ id: string; userId: string; expiresAt: Date; usedAt: Date | null } | null>;
      update: (args: unknown) => Promise<unknown>;
      deleteMany: (args: unknown) => Promise<unknown>;
    };
  };
}

// Create a token; returns the raw token string (or null if storage fails).
export async function createToken(userId: string, type: TokenType, ttlMinutes = 60): Promise<string | null> {
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  try {
    // Clear any prior unused tokens of the same type for this user.
    await db().verificationToken.deleteMany({ where: { userId, type, usedAt: null } });
    await db().verificationToken.create({ data: { userId, token, type, expiresAt } });
    return token;
  } catch {
    return null;
  }
}

// Consume a token; returns the userId if valid & unused & unexpired.
export async function consumeToken(token: string, type: TokenType): Promise<string | null> {
  if (!token) return null;
  try {
    const row = await db().verificationToken.findFirst({ where: { token, type } });
    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) return null;
    await db().verificationToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
    return row.userId;
  } catch {
    return null;
  }
}


// Atomically verify an email address and consume its verification token.
//
// The token and User.emailVerified state are committed together.
// If either database update fails, Prisma rolls back the transaction,
// leaving the token unused so the learner can try again.
export async function verifyEmailWithToken(
  token: string,
): Promise<string | null> {
  if (!token) return null;

  return prisma.$transaction(async (tx) => {
    const row = await tx.verificationToken.findFirst({
      where: {
        token,
        type: "verify",
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (
      !row ||
      row.usedAt ||
      row.expiresAt.getTime() < Date.now()
    ) {
      return null;
    }

    /*
     * Claim the token only if it is still unused.
     * This also protects against two requests attempting
     * to consume the same link at nearly the same time.
     */
    const claimed = await tx.verificationToken.updateMany({
      where: {
        id: row.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    if (claimed.count !== 1) {
      return null;
    }

    await tx.user.update({
      where: {
        id: row.userId,
      },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    return row.userId;
  });
}
