import { prisma } from "@/lib/prisma";

type SubscriptionUpdate = {
  subscriptionStatus?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  planRenewsAt?: Date | null;
};

export async function getSubscriptionStatus(
  userId: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      subscriptionStatus: true,
    },
  });

  return user?.subscriptionStatus ?? null;
}

export async function setSubscriptionByUserId(
  userId: string,
  data: SubscriptionUpdate,
): Promise<void> {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });
}

export async function findUserByStripeSubscription(
  subscriptionId: string,
): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: {
      stripeSubscriptionId: subscriptionId,
    },
    select: {
      id: true,
    },
  });

  return user?.id ?? null;
}

type StripeRecoveryCandidate = {
  id: string;
  status: string;
  customerId: string | null;
  planId: string | null;
};

export type StripeSubscriptionRecoveryResult =
  | {
      kind: "none";
      candidates: [];
    }
  | {
      kind: "single";
      candidates: [StripeRecoveryCandidate];
    }
  | {
      kind: "multiple";
      candidates: StripeRecoveryCandidate[];
    };

export async function findBlockingStripeSubscriptionsForUser(
  secret: string,
  userId: string,
): Promise<StripeSubscriptionRecoveryResult> {
  const response = await fetch(
    "https://api.stripe.com/v1/subscriptions?status=all&limit=100",
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Stripe subscription recovery lookup failed (${response.status}): ${body}`,
    );
  }

  const data = (await response.json()) as {
    data?: Array<{
      id: string;
      status: string;
      customer?: string | {
        id?: string;
      };
      metadata?: {
        userId?: string;
        planId?: string;
      };
    }>;
  };

  const blockingStatuses = new Set([
    "trialing",
    "active",
    "past_due",
    "unpaid",
    "incomplete",
    "paused",
  ]);

  const candidates =
    (data.data ?? [])
      .filter(
        (subscription) =>
          subscription.metadata?.userId === userId &&
          blockingStatuses.has(
            subscription.status,
          ),
      )
      .map(
        (subscription): StripeRecoveryCandidate => ({
          id: subscription.id,
          status: subscription.status,
          customerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id ?? null,
          planId:
            subscription.metadata?.planId ?? null,
        }),
      );

  if (candidates.length === 0) {
    return {
      kind: "none",
      candidates: [],
    };
  }

  if (candidates.length === 1) {
    return {
      kind: "single",
      candidates: [candidates[0]],
    };
  }

  return {
    kind: "multiple",
    candidates,
  };
}
