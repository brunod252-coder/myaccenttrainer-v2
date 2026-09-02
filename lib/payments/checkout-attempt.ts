import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";

export const CHECKOUT_CREATOR_STALE_MS = 30_000;

export function newCheckoutAttemptIdentity(userId: string) {
  return {
    id: randomUUID(),
    attemptKey: `mat-checkout:${userId}:${randomUUID()}`,
  };
}

export async function rotateCheckoutAttempt(
  userId: string,
  expectedAttemptId: string,
) {
  const next = newCheckoutAttemptIdentity(userId);

  const rotated = await prisma.checkoutAttempt.updateMany({
    where: {
      userId,
      id: expectedAttemptId,
    },
    data: {
      id: next.id,
      attemptKey: next.attemptKey,
      status: "CREATING",
      stripeCheckoutSessionId: null,
      stripeCheckoutUrl: null,
      expiresAt: null,
      lastError: null,
    },
  });

  if (rotated.count !== 1) {
    return null;
  }

  return prisma.checkoutAttempt.findUnique({
    where: {
      userId,
    },
  });
}

export async function retireCheckoutAttemptForSession(
  userId: string,
  stripeCheckoutSessionId: string,
) {
  return prisma.checkoutAttempt.deleteMany({
    where: {
      userId,
      stripeCheckoutSessionId,
    },
  });
}
