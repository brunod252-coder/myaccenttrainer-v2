import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth/tokens";
import { sendEmail, emailShell, appUrl } from "@/lib/email/send";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

// POST /api/auth/request-reset { email }
// Always responds success (never reveals whether an account exists).
export async function POST(req: Request) {
  const rl = rateLimit(`reset:${clientIp(req)}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { message: "Too many requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let email = "";
  try {
    email = schema.parse(await req.json()).email.toLowerCase();
  } catch {
    return NextResponse.json({ message: "Please enter a valid email." }, { status: 400 });
  }

  let devLink: string | undefined;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = await createToken(user.id, "reset", 60);
    if (token) {
      const link = `${appUrl()}/reset-password?token=${token}`;
      const result = await sendEmail({
        to: email,
        subject: "Reset your MyAccentTrainer password",
        html: emailShell(
          "Reset your password",
          "We received a request to reset your password. This link is valid for 1 hour.",
          { label: "Choose a new password", href: link },
        ),
        link,
      });
      devLink = result.devLink;
    }
  }

  return NextResponse.json({
    message: "If an account exists for that email, a reset link is on its way.",
    devLink,
  });
}
