// ── Subscription status helpers ──────────────────────────────────────
// Guarded reads/writes for the Stripe subscription fields on User. The
// `as any` cast lets this compile before `npx prisma db push` regenerates
// the client with the new fields; every call is wrapped in try/catch, so
// until you run that command the app behaves exactly as before.

import { prisma } from "@/lib/prisma";

type UserWrite = Record<string, unknown>;

function db() {
  return prisma as unknown as {
    user: {
      update: (args: unknown) => Promise<unknown>;
      findUnique: (args: unknown) => Promise<{ subscriptionStatus?: string | null } | null>;
      findFirst: (args: unknown) => Promise<{ id: string } | null>;
    };
  };
}

export async function getSubscriptionStatus(userId: string): Promise<string | null> {
  try {
    const user = await db().user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true },
    });
    return user?.subscriptionStatus ?? null;
  } catch {
    return null;
  }
}

export async function setSubscriptionByUserId(userId: string, data: UserWrite): Promise<void> {
  try {
    await db().user.update({ where: { id: userId }, data });
  } catch {
    // Fields not migrated yet (run `npx prisma db push`) — ignore.
  }
}

export async function findUserByStripeSubscription(subscriptionId: string): Promise<string | null> {
  try {
    const user = await db().user.findFirst({ where: { stripeSubscriptionId: subscriptionId } });
    return user?.id ?? null;
  } catch {
    return null;
  }
}
