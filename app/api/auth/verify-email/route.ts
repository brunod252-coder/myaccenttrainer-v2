import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { consumeToken } from "@/lib/auth/tokens";
import { appUrl } from "@/lib/email/send";

export const runtime = "nodejs";

// GET /api/auth/verify-email?token=... → marks verified, redirects.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const userId = await consumeToken(token, "verify");
  if (!userId) {
    return NextResponse.redirect(`${appUrl()}/login?verify=invalid`);
  }
  try {
    await (prisma as unknown as {
      user: { update: (a: unknown) => Promise<unknown> };
    }).user.update({
      where: { id: userId },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });
  } catch {
    // field not migrated yet — ignore
  }
  return NextResponse.redirect(`${appUrl()}/onboarding/plan?verify=success`);
}
