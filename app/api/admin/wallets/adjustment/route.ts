import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const requestSchema = z.object({
  userId: z.string().min(1),
  direction: z.enum(["CREDIT", "DEBIT"]),
  amountMinor: z.number().int().positive().max(10_000_000),
  reason: z.string().trim().min(3).max(240),
  requestId: z.string().uuid(),
});

export async function POST(request: Request) {
  let admin;

  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: "Administrator authorization is required." },
      { status: 403 },
    );
  }

  try {
    const body = requestSchema.parse(await request.json());

    const targetUser = await prisma.user.findUnique({
      where: {
        id: body.userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "The selected user no longer exists." },
        { status: 404 },
      );
    }

    const signedAmountMinor =
      body.direction === "CREDIT" ? body.amountMinor : -body.amountMinor;

    const result = await prisma.$transaction(async (tx) => {
      const duplicate = await tx.walletTransaction.findFirst({
        where: {
          referenceType: `ADMIN_ADJUSTMENT:${admin.id}`,
          referenceId: body.requestId,
        },
        select: {
          id: true,
        },
      });

      if (duplicate) {
        return {
          duplicate: true,
          transactionId: duplicate.id,
        };
      }

      const wallet = await tx.walletAccount.upsert({
        where: {
          userId: targetUser.id,
        },
        update: {},
        create: {
          userId: targetUser.id,
          currencyCode: "USD",
        },
        select: {
          id: true,
          currencyCode: true,
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletAccountId: wallet.id,
          type: "ADMIN_ADJUSTMENT",
          amountMinor: signedAmountMinor,
          currencyCode: wallet.currencyCode || "USD",
          description: body.reason,
          referenceType: `ADMIN_ADJUSTMENT:${admin.id}`,
          referenceId: body.requestId,
        },
        select: {
          id: true,
        },
      });

      return {
        duplicate: false,
        transactionId: transaction.id,
      };
    });

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      transactionId: result.transactionId,
      amountMinor: signedAmountMinor,
      targetEmail: targetUser.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            error.issues[0]?.message || "Please review the adjustment details.",
        },
        { status: 400 },
      );
    }

    console.error("Admin wallet adjustment failed:", error);

    return NextResponse.json(
      {
        error: "The wallet adjustment could not be completed.",
      },
      { status: 500 },
    );
  }
}
