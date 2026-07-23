import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/jwt";
import { ensureReferralCode } from "@/lib/referrals/referrals";
import { sendEmail, emailShell, appUrl } from "@/lib/email/send";

export const runtime = "nodejs";

const schema = z.object({
  friendEmail: z.string().email(),
  friendName: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    const { userId } = verifyAuthToken(token);

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    const referralCode = await ensureReferralCode(userId);
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, email: true },
    });
    const inviterName = inviter?.firstName || "A friend";

    await prisma.referralInvite.create({
      data: {
        inviterUserId: userId,
        friendEmail: parsed.data.friendEmail.toLowerCase(),
        friendName: parsed.data.friendName || null,
        referralCode,
        status: "SENT",
      },
    });

    // Send the invite (keyless-safe; logs + returns link in dev).
    const link = `${appUrl()}/register?ref=${encodeURIComponent(referralCode)}`;
    const result = await sendEmail({
      to: parsed.data.friendEmail,
      subject: `${inviterName} invited you to MyAccentTrainer`,
      html: emailShell(
        `${inviterName} thinks you'll love MyAccentTrainer`,
        "Practice English pronunciation with Nina, your patient AI coach — and you'll both get $5 in learning credit when you join.",
        { label: "Accept your invite", href: link },
      ),
      link,
    });

    return NextResponse.json({ ok: true, devLink: result.devLink });
  } catch (error) {
    console.error("REFERRAL_CREATE_ERROR", error);
    return NextResponse.json({ message: "Could not send the invite. Please try again." }, { status: 500 });
  }
}
