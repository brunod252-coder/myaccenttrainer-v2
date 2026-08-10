import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/jwt";
import { ensureReferralCode } from "@/lib/referrals/referrals";
import { appUrl } from "@/lib/email/send";
import { renderReferralInvitationEmail } from "@/lib/email/templates/referral-invitation";
import { sendTransactionalEmailOnce } from "@/lib/email/transactional";

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

    const normalizedFriendEmail =
      parsed.data.friendEmail
        .trim()
        .toLowerCase();

    /*
     * Referral recipient safeguards.
     *
     * We intentionally do not tell the inviter that these
     * determinations are based on email-address matching.
     */

    const existingMember =
      await prisma.user.findUnique({
        where: {
          email: normalizedFriendEmail,
        },
        select: {
          id: true,
        },
      });

    if (existingMember) {
      return NextResponse.json(
        {
          ok: false,
          code: "ALREADY_MEMBER",
          message:
            "This person is already a My Accent Trainer member.",
        },
        {
          status: 409,
        },
      );
    }

    const pendingInvitation =
      await prisma.referralInvite.findFirst({
        where: {
          friendEmail:
            normalizedFriendEmail,
          status: "SENT",
        },
        select: {
          id: true,
        },
      });

    if (pendingInvitation) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_PENDING",
          message:
            "This person already has a pending invitation.",
        },
        {
          status: 409,
        },
      );
    }

    const referralCode = await ensureReferralCode(userId);
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, email: true },
    });
    const inviterName = inviter?.firstName || "A friend";

    const invite =
      await prisma.referralInvite.create({
        data: {
          inviterUserId: userId,
          friendEmail:
            normalizedFriendEmail,
          friendName:
            parsed.data.friendName || null,
          referralCode,
          status: "SENT",
        },
      });

    const link =
      `${appUrl()}/register?ref=${encodeURIComponent(referralCode)}`;

    const subject =
      `${inviterName} invited you to My Accent Trainer`;

    const invitationEmail =
      renderReferralInvitationEmail({
        inviterName,
        friendName:
          invite.friendName,
        referralCode,
        link,
      });

    const result =
      await sendTransactionalEmailOnce({
        deliveryKey:
          `referral-invite:${invite.id}`,
        userId,
        type: "REFERRAL_INVITATION",
        to: invite.friendEmail,
        subject,
        html:
          invitationEmail.html,
        text:
          invitationEmail.text,
        link,
        metadata: {
          referralInviteId: invite.id,
          inviterUserId: userId,
          inviterName,
          friendName: invite.friendName,
          referralCode,
        },
      });

    return NextResponse.json({
      ok: true,
      deliveryId: result.deliveryId,
      emailSent: result.sent,
      emailSkipped: result.skipped,
    });
  } catch (error) {
    console.error("REFERRAL_CREATE_ERROR", error);
    return NextResponse.json({ message: "Could not send the invite. Please try again." }, { status: 500 });
  }
}
