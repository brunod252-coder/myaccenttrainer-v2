import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createToken } from "@/lib/auth/tokens";
import { sendEmail, emailShell, appUrl } from "@/lib/email/send";
import { ensureReferralCode, findInviterByCode, registerReferral } from "@/lib/referrals/referrals";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  countryOfResidence: z.string().optional(),
  nativeLanguage: z.string().optional(),
  referralCode: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`register:${clientIp(req)}`, 5, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { message: "Too many attempts. Please wait a minute and try again." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid registration details" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account already exists with this email." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        profile: {
          create: {
            countryOfResidence: data.countryOfResidence,
            nativeLanguage: data.nativeLanguage,
          },
        },
        wallet: {
          create: {
            currencyCode: "USD",
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Give the new learner their own referral code.
    await ensureReferralCode(user.id);

    // If they signed up via a referral code, record the referral.
    // Rewards are issued only after the referred learner makes
    // their first successful paid subscription payment.
    if (data.referralCode) {
      const inviterId =
        await findInviterByCode(data.referralCode);

      if (inviterId && inviterId !== user.id) {
        await registerReferral(
          inviterId,
          user.id,
          user.email,
          [data.firstName, data.lastName]
            .filter(Boolean)
            .join(" ") || undefined,
        );
      }
    }

    // Send a verification email (best-effort; keyless-safe in dev).
    let devLink: string | undefined;
    try {
      const token = await createToken(user.id, "verify", 60 * 24);
      if (token) {
        const link = `${appUrl()}/api/auth/verify-email?token=${token}`;
        const result = await sendEmail({
          to: user.email,
          subject: "Welcome to MyAccentTrainer — verify your email",
          html: emailShell(
            "Welcome to MyAccentTrainer!",
            "You're all set to start practicing with Nina. Please confirm your email address:",
            { label: "Verify my email", href: link },
          ),
          link,
        });
        devLink = result.devLink;
      }
    } catch {
      // never block signup on email
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
        devLink,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      { message: "Something went wrong while creating the account." },
      { status: 500 }
    );
  }
}