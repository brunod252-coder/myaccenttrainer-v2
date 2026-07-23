import { createHash, randomBytes } from "crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { passwordResetEmail } from "@/lib/email/password-reset-email";
import { sendEmail } from "@/lib/email/ses";
import { prisma } from "@/lib/prisma";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const PUBLIC_RESPONSE =
  "If an account exists for that email, a password reset link has been sent.";

const RESET_EXPIRATION_MINUTES = 60;

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: PUBLIC_RESPONSE });
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() +
        RESET_EXPIRATION_MINUTES * 60 * 1000
    );

    const createdToken = await prisma.$transaction(
      async (tx) => {
        await tx.passwordResetToken.updateMany({
          where: {
            userId: user.id,
            usedAt: null,
          },
          data: {
            usedAt: now,
          },
        });

        return tx.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
          select: {
            id: true,
          },
        });
      }
    );

    const baseUrl =
      process.env.APP_URL?.replace(/\/$/, "") ||
      new URL(req.url).origin;

    const resetUrl =
      `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    const emailContent = passwordResetEmail({
      firstName: user.firstName,
      resetUrl,
      expiresInMinutes: RESET_EXPIRATION_MINUTES,
    });

    try {
      const result = await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.info("PASSWORD_RESET_EMAIL_SENT", {
        userId: user.id,
        messageId: result.messageId,
      });
    } catch (emailError) {
      await prisma.passwordResetToken.updateMany({
        where: {
          id: createdToken.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      console.error("PASSWORD_RESET_EMAIL_ERROR", {
        userId: user.id,
        error:
          emailError instanceof Error
            ? emailError.message
            : "Unknown email error",
      });

      return NextResponse.json(
        {
          message:
            "We could not send the password reset email. Please try again shortly.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      message: PUBLIC_RESPONSE,
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while requesting a password reset.",
      },
      { status: 500 }
    );
  }
}
