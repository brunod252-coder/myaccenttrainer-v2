import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";
import { getPlan, PLANS } from "@/lib/payments/plans";

export const runtime = "nodejs";

// POST /api/checkout   { planId? }
// Starts a Stripe Checkout session for the chosen plan and returns its URL.
// Uses the Stripe REST API directly (no SDK dependency), so the app builds
// and runs without any package. Returns { configured: false } until the
// Stripe keys and the plan's price ID are set — see docs/PAYMENTS.md.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Resolve the plan (default to the first plan for backward compatibility).
  let planId = PLANS[0]?.id ?? "monthly";
  try {
    const body = (await request.json()) as { planId?: string };
    if (body?.planId) planId = body.planId;
  } catch {
    // no body — use default plan
  }
  const plan = getPlan(planId) ?? PLANS[0];
  const priceId = plan ? process.env[plan.stripePriceEnv] : process.env.STRIPE_PRICE_ID;

  if (!secret || !priceId) {
    return NextResponse.json({
      configured: false,
      message: "Payments aren't set up yet. Add your Stripe keys to enable checkout.",
    });
  }

  let userId = "";
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (token) userId = verifyAuthToken(token).userId;
  } catch {
    // not logged in — proceed without a reference id
  }

  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("success_url", `${appUrl}/dashboard/wallet?checkout=success`);
  body.set("cancel_url", `${appUrl}/dashboard/wallet?checkout=cancelled`);
  if (userId) {
    body.set("client_reference_id", userId);
    body.set("metadata[planId]", plan?.id ?? planId);
  }

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const data = (await res.json()) as { url?: string; error?: { message?: string } };

    if (!res.ok || !data.url) {
      console.error("STRIPE_CHECKOUT_ERROR", data);
      return NextResponse.json(
        { configured: true, message: "Could not start checkout. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ configured: true, url: data.url });
  } catch (error) {
    console.error("STRIPE_CHECKOUT_EXCEPTION", error);
    return NextResponse.json(
      { configured: true, message: "Could not reach the payment service." },
      { status: 500 },
    );
  }
}
