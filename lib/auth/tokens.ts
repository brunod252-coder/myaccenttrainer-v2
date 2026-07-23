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
