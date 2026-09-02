import { NextResponse } from "next/server";

import { verifyEmailWithToken } from "@/lib/auth/tokens";
import { appUrl } from "@/lib/email/send";

export const runtime = "nodejs";

// GET /api/auth/verify-email?token=...
//
// Email verification is atomic:
//   1. validate the token
//   2. mark the token used
//   3. mark the user's email verified
//
// Steps 2 and 3 commit together. A database failure cannot
// consume the token while leaving the user unverified.
export async function GET(req: Request) {
  const token =
    new URL(req.url).searchParams.get("token") || "";

  try {
    const userId =
      await verifyEmailWithToken(token);

    if (!userId) {
      return NextResponse.redirect(
        `${appUrl()}/login?verify=invalid`,
      );
    }

    return NextResponse.redirect(
      `${appUrl()}/onboarding/assessment?verify=success`,
    );
  } catch (error) {
    console.error(
      "EMAIL_VERIFICATION_ATOMIC_FAILURE",
      error,
    );

    /*
     * Do not report success when the database operation failed.
     * Because verification is transactional, the token remains
     * unconsumed when this path is reached.
     */
    return NextResponse.redirect(
      `${appUrl()}/login?verify=error`,
    );
  }
}
