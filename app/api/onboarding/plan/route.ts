import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/payments/plans";

const schema = z.object({
  planId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("mat_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please log in to continue." },
        { status: 401 },
      );
    }

    const payload = verifyAuthToken(token);
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please select a valid membership plan." },
        { status: 400 },
      );
    }

    const plan = getPlan(parsed.data.planId);

    if (!plan) {
      return NextResponse.json(
        { message: "That membership plan is not available." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        emailVerified: true,
        subscriptionStatus: true,
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
        { message: "Verify your email before choosing a plan." },
        { status: 403 },
      );
    }

    if (
      user.subscriptionStatus === "trialing" ||
      user.subscriptionStatus === "active"
    ) {
      return NextResponse.json(
        { message: "Your membership is already active." },
        { status: 409 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        selectedPlanId: plan.id,
        subscriptionStatus: "payment_method_required",
      },
    });

    return NextResponse.json({
      message: "Plan selected successfully.",
      planId: plan.id,
      next: "/onboarding/payment",
    });
  } catch (error) {
    console.error("ONBOARDING_PLAN_ERROR", error);

    return NextResponse.json(
      { message: "We could not save your plan selection." },
      { status: 500 },
    );
  }
}
