import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications/service";

export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(secretKey);
}

export async function POST() {
  const token =
    (await cookies()).get("mat_session")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Please log in." },
      { status: 401 },
    );
  }

  let userId: string;

  try {
    userId = verifyAuthToken(token).userId;
  } catch {
    return NextResponse.json(
      { message: "Your session has expired." },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      stripeSubscriptionId: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Account not found." },
      { status: 404 },
    );
  }

  if (!user.stripeSubscriptionId) {
    return NextResponse.json(
      { message: "No Stripe subscription was found." },
      { status: 400 },
    );
  }

  if (user.subscriptionStatus !== "cancel_scheduled") {
    return NextResponse.json(
      {
        message:
          "This subscription is not scheduled for cancellation.",
      },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();

    const subscription =
      await stripe.subscriptions.update(
        user.stripeSubscriptionId,
        {
          cancel_at_period_end: false,
        },
      );

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        subscriptionStatus:
          subscription.status,
      },
    });

      await createNotification({
        userId,
        type: "billing.cancellation_reversed",
        title: "Your subscription will continue",
        body:
          "Your cancellation has been reversed. Your Premium membership will continue normally.",
        href: "/dashboard/billing",
        metadata: {
          stripeSubscriptionId:
            user.stripeSubscriptionId,
          cancelAtPeriodEnd:
            subscription.cancel_at_period_end,
          stripeStatus:
            subscription.status,
        },
      });

    return NextResponse.json({
      ok: true,
      status: subscription.status,
      cancelAtPeriodEnd:
        subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error(
      "STRIPE_RESUME_SUBSCRIPTION_ERROR",
      error,
    );

    return NextResponse.json(
      {
        message:
          "We could not resume your subscription. Please try again.",
      },
      { status: 500 },
    );
  }
}
