import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/jwt";
import { createToken } from "@/lib/auth/tokens";
import { sendEmail, emailShell, appUrl } from "@/lib/email/send";

export const runtime = "nodejs";

// POST /api/auth/resend-verification → re-sends the verification email.
export async function POST() {
  let userId = "";
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return NextResponse.json({ message: "Please log in." }, { status: 401 });
    userId = verifyAuthToken(token).userId;
  } catch {
    return NextResponse.json({ message: "Please log in." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return NextResponse.json({ message: "Account not found." }, { status: 404 });

  const token = await createToken(userId, "verify", 60 * 24);
  let devLink: string | undefined;
  if (token) {
    const link = `${appUrl()}/api/auth/verify-email?token=${token}`;
    const result = await sendEmail({
      to: user.email,
      subject: "Verify your MyAccentTrainer email",
      html: emailShell("Confirm your email", "Tap below to verify your email address.", { label: "Verify email", href: link }),
      link,
    });
    devLink = result.devLink;
  }
  return NextResponse.json({ message: "Verification email sent.", devLink });
}
