import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import {
  getEnrollmentState,
  canAccessDashboard,
} from "@/lib/auth/enrollment";
import { getPlan } from "@/lib/payments/plans";

export async function GET() {
  try {
    const token = (await cookies()).get("mat_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          authenticated: false,
          ready: false,
        },
        {
          status: 401,
        },
      );
    }

    const payload = verifyAuthToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        emailVerified: true,
        selectedPlanId: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        planRenewsAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          ready: false,
        },
        {
          status: 404,
        },
      );
    }

    const enrollmentState = getEnrollmentState(user);
    const plan = user.selectedPlanId
      ? getPlan(user.selectedPlanId)
      : undefined;

    return NextResponse.json({
      authenticated: true,
      ready: canAccessDashboard(enrollmentState),
      enrollmentState,
      subscriptionStatus: user.subscriptionStatus,
      selectedPlanId: user.selectedPlanId,
      planName: plan ? `Premium ${plan.name}` : null,
      planRenewsAt: user.planRenewsAt,
    });
  } catch (error) {
    console.error("ONBOARDING_STATUS_ERROR", error);

    return NextResponse.json(
      {
        authenticated: false,
        ready: false,
      },
      {
        status: 401,
      },
    );
  }
}
