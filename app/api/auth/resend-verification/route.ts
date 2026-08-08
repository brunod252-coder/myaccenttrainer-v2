import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/jwt";
import { createToken } from "@/lib/auth/tokens";
import {
  sendEmail,
  emailShell,
  appUrl,
} from "@/lib/email/send";

export const runtime = "nodejs";

export async function POST() {
  let userId = "";

  try {
    const token =
      (await cookies()).get("mat_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please log in." },
        { status: 401 },
      );
    }

    userId = verifyAuthToken(token).userId;
  } catch {
    return NextResponse.json(
      { message: "Please log in." },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Account not found." },
      { status: 404 },
    );
  }

  if (user.emailVerified) {
    return NextResponse.json({
      message: "Your email is already verified.",
    });
  }

  const token = await createToken(
    userId,
    "verify",
    60 * 24,
  );

  if (!token) {
    return NextResponse.json(
      {
        message:
          "We could not create a verification link.",
      },
      { status: 500 },
    );
  }

  const link =
    `${appUrl()}/api/auth/verify-email?token=${token}`;

  const result = await sendEmail({
    to: user.email,
    subject: "Verify your My Accent Trainer email",
    html: emailShell(
      "Confirm your email",
      "Click the button below to verify your email address and continue your enrollment.",
      {
        label: "Verify email",
        href: link,
      },
    ),
    text:
      `Verify your My Accent Trainer email:\n\n${link}`,
    link,
  });

  if (!result.sent) {
    console.error("RESEND_VERIFICATION_FAILED", {
      userId,
      email: user.email,
      error: result.error,
    });

    return NextResponse.json(
      {
        message:
          "We could not send the verification email. Please try again.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message:
      "Verification email sent. Please check your inbox.",
  });
}
