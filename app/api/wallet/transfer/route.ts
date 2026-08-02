import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyAuthToken } from "@/lib/jwt";
import { transferWalletCredit } from "@/lib/payments/transfers";

export const runtime = "nodejs";

const transferSchema = z.object({
  recipientEmail: z
    .string()
    .trim()
    .email("Enter a valid recipient email address.")
    .max(254),
  amountMinor: z.number().int().positive().max(1_000_000),
  message: z.string().trim().max(160).optional(),
  requestId: z.string().uuid(),
});

export async function POST(request: Request) {
  let senderUserId = "";

  try {
    const token = (await cookies()).get("mat_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Please sign in to send credit." },
        { status: 401 },
      );
    }

    senderUserId = verifyAuthToken(token).userId;
  } catch {
    return NextResponse.json(
      { error: "Your session is no longer valid." },
      { status: 401 },
    );
  }

  try {
    const body = transferSchema.parse(await request.json());

    const result = await transferWalletCredit({
      senderUserId,
      recipientEmail: body.recipientEmail,
      amountMinor: body.amountMinor,
      message: body.message,
      requestId: body.requestId,
    });

    if (!result.ok) {
      const status =
        result.error === "RECIPIENT_NOT_FOUND"
          ? 404
          : result.error === "INSUFFICIENT_FUNDS"
            ? 409
            : 400;

      return NextResponse.json(
        {
          error: result.message,
          code: result.error,
        },
        { status },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            error.issues[0]?.message || "Please review the transfer details.",
        },
        { status: 400 },
      );
    }

    console.error("Transfer API failed:", error);

    return NextResponse.json(
      {
        error: "The transfer could not be completed. No credit was moved.",
      },
      { status: 500 },
    );
  }
}
