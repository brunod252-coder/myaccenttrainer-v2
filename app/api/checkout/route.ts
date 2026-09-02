import { randomUUID } from "crypto";

import {
  CHECKOUT_CREATOR_STALE_MS,
  rotateCheckoutAttempt,
} from "@/lib/payments/checkout-attempt";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";
import { getPlan } from "@/lib/payments/plans";
import { findBlockingStripeSubscriptionsForUser } from "@/lib/payments/subscription";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://myaccenttrainer.com";

  if (!secret) {
    return NextResponse.json(
      {
        configured: false,
        message: "Stripe is not configured.",
      },
      { status: 503 },
    );
  }

  let userId: string;

  try {
    const token = (await cookies()).get("mat_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please log in to continue." },
        { status: 401 },
      );
    }

    userId = verifyAuthToken(token).userId;
  } catch {
    return NextResponse.json(
      {
        message: "Your session has expired. Please log in again.",
      },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      selectedPlanId: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Your account could not be found." },
      { status: 404 },
    );
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      {
        message: "Verify your email before continuing.",
      },
      { status: 403 },
    );
  }

  if (!user.selectedPlanId) {
    return NextResponse.json(
      {
        message: "Choose a membership plan first.",
      },
      { status: 400 },
    );
  }

  /*
   * Stripe is authoritative for whether the user's
   * currently stored subscription can coexist with
   * a new checkout.
   *
   * past_due, unpaid, incomplete, active and trialing
   * are all still existing subscriptions. None should
   * result in another overlapping subscription.
   */
  if (user.stripeSubscriptionId) {
    try {
      const subscriptionResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions/${user.stripeSubscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${secret}`,
          },
          cache: "no-store",
        },
      );

      if (subscriptionResponse.ok) {
        const subscription = (await subscriptionResponse.json()) as {
          id: string;
          status: string;
        };

        const blockingStatuses = new Set([
          "trialing",
          "active",
          "past_due",
          "unpaid",
          "incomplete",
          "paused",
        ]);

        if (blockingStatuses.has(subscription.status)) {
          console.warn("STRIPE_CHECKOUT_EXISTING_SUBSCRIPTION_BLOCKED", {
            userId: user.id,
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
          });

          return NextResponse.json(
            {
              configured: true,
              code: "existing_subscription",
              message:
                subscription.status === "trialing" ||
                subscription.status === "active"
                  ? "Your membership is already active."
                  : "You already have an existing membership that requires attention. Please review your billing information instead of starting another membership.",
              href: "/dashboard/billing",
            },
            { status: 409 },
          );
        }
      } else if (subscriptionResponse.status !== 404) {
        const errorBody = await subscriptionResponse.text();

        console.error("STRIPE_CHECKOUT_SUBSCRIPTION_LOOKUP_ERROR", {
          userId: user.id,
          subscriptionId: user.stripeSubscriptionId,
          status: subscriptionResponse.status,
          body: errorBody,
        });

        return NextResponse.json(
          {
            configured: true,
            message:
              "We could not verify your current membership. Please try again.",
          },
          { status: 502 },
        );
      }
    } catch (error) {
      console.error("STRIPE_CHECKOUT_SUBSCRIPTION_LOOKUP_EXCEPTION", {
        userId: user.id,
        subscriptionId: user.stripeSubscriptionId,
        error: error instanceof Error ? error.message : String(error),
      });

      return NextResponse.json(
        {
          configured: true,
          message:
            "We could not verify your current membership. Please try again.",
        },
        { status: 502 },
      );
    }
  } else {
    try {
      const recovery = await findBlockingStripeSubscriptionsForUser(
        secret,
        user.id,
      );

      if (recovery.kind === "single") {
        const [subscription] = recovery.candidates;

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customerId,
            subscriptionStatus: subscription.status,
            selectedPlanId: subscription.planId ?? user.selectedPlanId,
          },
        });

        console.warn("STRIPE_CHECKOUT_SUBSCRIPTION_RECOVERED", {
          userId: user.id,
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          customerId: subscription.customerId,
        });

        return NextResponse.json(
          {
            configured: true,
            code: "existing_subscription",
            message:
              subscription.status === "trialing" ||
              subscription.status === "active"
                ? "Your membership is already active."
                : "We found your existing membership and restored your billing connection. Please review your billing information instead of starting another membership.",
            href: "/dashboard/billing",
          },
          { status: 409 },
        );
      }

      if (recovery.kind === "multiple") {
        console.error(
          "STRIPE_CHECKOUT_MULTIPLE_SUBSCRIPTIONS_REQUIRE_RECONCILIATION",
          {
            userId: user.id,
            candidates: recovery.candidates.map((subscription) => ({
              id: subscription.id,
              status: subscription.status,
              customerId: subscription.customerId,
            })),
          },
        );

        return NextResponse.json(
          {
            configured: true,
            code: "subscription_reconciliation_required",
            message:
              "We found more than one active billing record for your account. Please contact support before starting another checkout.",
            href: "/dashboard/billing",
          },
          { status: 409 },
        );
      }

      if (
        user.subscriptionStatus === "trialing" ||
        user.subscriptionStatus === "active" ||
        user.subscriptionStatus === "past_due" ||
        user.subscriptionStatus === "unpaid"
      ) {
        console.warn("STRIPE_CHECKOUT_LOCAL_SUBSCRIPTION_WITHOUT_ID_BLOCKED", {
          userId: user.id,
          subscriptionStatus: user.subscriptionStatus,
        });

        return NextResponse.json(
          {
            configured: true,
            code: "subscription_reconciliation_required",
            message:
              "Your membership needs to be synchronized before starting another checkout.",
            href: "/dashboard/billing",
          },
          { status: 409 },
        );
      }
    } catch (error) {
      console.error("STRIPE_CHECKOUT_SUBSCRIPTION_RECOVERY_ERROR", {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error),
      });

      return NextResponse.json(
        {
          configured: true,
          message:
            "We could not verify your existing memberships. Please try again.",
        },
        { status: 502 },
      );
    }
  }

  const plan = getPlan(user.selectedPlanId);

  if (!plan) {
    return NextResponse.json(
      {
        message: "Your selected plan is not available.",
      },
      { status: 400 },
    );
  }

  const priceId = process.env[plan.stripePriceEnv];

  if (!priceId) {
    return NextResponse.json(
      {
        configured: false,
        message: "The selected Stripe price is not configured.",
      },
      { status: 503 },
    );
  }

  /*
   * Checkout creation is protected at two layers:
   *
   * 1. CheckoutAttempt.userId is unique in PostgreSQL, so every
   *    user converges on one persisted checkout attempt.
   *
   * 2. attemptKey is sent to Stripe as the Idempotency-Key, so
   *    concurrent/retried requests cannot independently create
   *    multiple Checkout Sessions.
   */
  const proposedAttemptId = randomUUID();
  const proposedAttemptKey = `mat-checkout:${user.id}:${randomUUID()}`;

  const insertedAttemptCount = await prisma.$executeRaw`
      INSERT INTO "CheckoutAttempt" (
        "id",
        "userId",
        "attemptKey",
        "status",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${proposedAttemptId},
        ${user.id},
        ${proposedAttemptKey},
        'CREATING',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT ("userId") DO NOTHING
    `;

  const isCheckoutCreator = insertedAttemptCount === 1;

  const checkoutAttempt = await prisma.checkoutAttempt.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!checkoutAttempt) {
    console.error("STRIPE_CHECKOUT_ATTEMPT_ACQUISITION_FAILED", {
      userId: user.id,
    });

    return NextResponse.json(
      {
        configured: true,
        message: "We could not safely start checkout. Please try again.",
      },
      { status: 500 },
    );
  }

  /*
   * Recover lifecycle states that must not permanently pin a user
   * to an unusable CheckoutAttempt.
   *
   * Rotation uses an id compare-and-swap. If another request wins
   * the rotation race, this request becomes a follower instead of
   * creating another Stripe Checkout Session.
   */
  let activeAttempt = checkoutAttempt;
  let activeIsCreator = isCheckoutCreator;

  const now = Date.now();

  const openAttemptExpired =
    activeAttempt.status === "OPEN" &&
    (!activeAttempt.expiresAt || activeAttempt.expiresAt.getTime() <= now);

  const failedAttempt = activeAttempt.status === "FAILED";

  const staleCreatingAttempt =
    activeAttempt.status === "CREATING" &&
    now - activeAttempt.updatedAt.getTime() >= CHECKOUT_CREATOR_STALE_MS;

  if (
    !activeIsCreator &&
    (openAttemptExpired || failedAttempt || staleCreatingAttempt)
  ) {
    const previousAttemptId = activeAttempt.id;
    const previousStatus = activeAttempt.status;

    const rotated = await rotateCheckoutAttempt(user.id, previousAttemptId);

    if (rotated) {
      activeAttempt = rotated;
      activeIsCreator = true;

      console.info("STRIPE_CHECKOUT_ATTEMPT_ROTATED", {
        userId: user.id,
        previousCheckoutAttemptId: previousAttemptId,
        checkoutAttemptId: activeAttempt.id,
        previousStatus,
        reason: openAttemptExpired
          ? "open_expired"
          : failedAttempt
            ? "failed"
            : "creating_stale",
      });
    } else {
      const winner = await prisma.checkoutAttempt.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!winner) {
        return NextResponse.json(
          {
            configured: true,
            message: "We could not safely recover checkout. Please try again.",
          },
          { status: 500 },
        );
      }

      activeAttempt = winner;
      activeIsCreator = false;
    }
  }

  /*
   * If this user already owns an unexpired open Stripe Checkout
   * Session, return exactly that same URL rather than creating
   * another session.
   */
  if (
    activeAttempt.status === "OPEN" &&
    activeAttempt.stripeCheckoutUrl &&
    activeAttempt.expiresAt &&
    activeAttempt.expiresAt.getTime() > Date.now()
  ) {
    console.info("STRIPE_CHECKOUT_SESSION_REUSED", {
      userId: user.id,
      checkoutAttemptId: activeAttempt.id,
      stripeCheckoutSessionId: activeAttempt.stripeCheckoutSessionId,
    });

    return NextResponse.json({
      configured: true,
      sessionId: activeAttempt.stripeCheckoutSessionId,
      url: activeAttempt.stripeCheckoutUrl,
      reused: true,
    });
  }

  /*
   * Only the request that inserted CheckoutAttempt may call Stripe.
   *
   * Concurrent followers wait briefly for that creator to persist
   * the resulting Stripe Checkout Session, then return the same URL.
   */
  if (!activeIsCreator) {
    const maxWaitMs = 5000;
    const pollIntervalMs = 100;
    const startedAt = Date.now();

    while (Date.now() - startedAt < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

      const resolvedAttempt = await prisma.checkoutAttempt.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!resolvedAttempt) {
        break;
      }

      if (
        resolvedAttempt.status === "OPEN" &&
        resolvedAttempt.stripeCheckoutSessionId &&
        resolvedAttempt.stripeCheckoutUrl &&
        resolvedAttempt.expiresAt &&
        resolvedAttempt.expiresAt.getTime() > Date.now()
      ) {
        console.info("STRIPE_CHECKOUT_CONCURRENT_REQUEST_REUSED", {
          userId: user.id,
          checkoutAttemptId: resolvedAttempt.id,
          stripeCheckoutSessionId: resolvedAttempt.stripeCheckoutSessionId,
        });

        return NextResponse.json({
          configured: true,
          sessionId: resolvedAttempt.stripeCheckoutSessionId,
          url: resolvedAttempt.stripeCheckoutUrl,
          reused: true,
        });
      }

      if (resolvedAttempt.status === "FAILED") {
        return NextResponse.json(
          {
            configured: true,
            message:
              resolvedAttempt.lastError ||
              "Checkout could not be started. Please try again.",
          },
          { status: 503 },
        );
      }
    }

    console.warn("STRIPE_CHECKOUT_CREATOR_WAIT_TIMEOUT", {
      userId: user.id,
      checkoutAttemptId: activeAttempt.id,
    });

    return NextResponse.json(
      {
        configured: true,
        message: "Checkout is still being prepared. Please try again.",
      },
      { status: 503 },
    );
  }

  const body = new URLSearchParams();

  body.set("mode", "subscription");
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("payment_method_collection", "always");
  body.set("subscription_data[trial_period_days]", "2");

  body.set("client_reference_id", user.id);

  if (user.stripeCustomerId) {
    body.set("customer", user.stripeCustomerId);
  } else {
    body.set("customer_email", user.email);
  }

  body.set("metadata[userId]", user.id);
  body.set("metadata[planId]", plan.id);

  body.set("subscription_data[metadata][userId]", user.id);
  body.set("subscription_data[metadata][planId]", plan.id);

  body.set(
    "success_url",
    `${appUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
  );

  body.set("cancel_url", `${appUrl}/onboarding/payment?checkout=cancelled`);

  try {
    const response = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": activeAttempt.attemptKey,
        },
        body,
      },
    );

    const data = (await response.json()) as {
      id?: string;
      url?: string;
      expires_at?: number;
      error?: {
        message?: string;
      };
    };

    if (!response.ok || !data.url) {
      console.error("STRIPE_CHECKOUT_ERROR", data);

      await prisma.checkoutAttempt.update({
        where: {
          userId: user.id,
        },
        data: {
          status: "FAILED",
          lastError:
            data.error?.message ?? "Stripe Checkout Session creation failed.",
        },
      });

      return NextResponse.json(
        {
          configured: true,
          message:
            data.error?.message ||
            "Could not start checkout. Please try again.",
        },
        { status: 500 },
      );
    }

    await prisma.checkoutAttempt.update({
      where: {
        userId: user.id,
      },
      data: {
        status: "OPEN",
        stripeCheckoutSessionId: data.id ?? null,
        stripeCheckoutUrl: data.url,
        expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : null,
        lastError: null,
      },
    });

    return NextResponse.json({
      configured: true,
      sessionId: data.id,
      url: data.url,
      reused: false,
    });
  } catch (error) {
    console.error("STRIPE_CHECKOUT_EXCEPTION", error);

    await prisma.checkoutAttempt
      .update({
        where: {
          userId: user.id,
        },
        data: {
          status: "FAILED",
          lastError: error instanceof Error ? error.message : String(error),
        },
      })
      .catch((attemptError) => {
        console.error("STRIPE_CHECKOUT_ATTEMPT_ERROR_RECORD_FAILED", {
          userId: user.id,
          error:
            attemptError instanceof Error
              ? attemptError.message
              : String(attemptError),
        });
      });

    return NextResponse.json(
      {
        configured: true,
        message: "Could not reach Stripe.",
      },
      { status: 502 },
    );
  }
}
