import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyAuthToken } from "@/lib/jwt";
import { payStripeInvoiceWithWallet } from "@/lib/payments/wallet-invoice-payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  invoiceId: z
    .string()
    .trim()
    .min(1, "Invoice ID is required.")
    .max(255),
});

export async function POST(request: Request) {
  try {
    /*
     * Authenticate from the MAT session cookie.
     *
     * The browser never supplies a user ID. The authenticated
     * session determines which wallet may be charged.
     */
    const token =
      (await cookies()).get("mat_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Please sign in to pay with your wallet.",
        },
        {
          status: 401,
        },
      );
    }

    let payload;

    try {
      payload = verifyAuthToken(token);
    } catch {
      return NextResponse.json(
        {
          error:
            "Your session has expired. Please sign in again.",
        },
        {
          status: 401,
        },
      );
    }

    const body = requestSchema.parse(
      await request.json(),
    );

    const result =
      await payStripeInvoiceWithWallet(
        payload.userId,
        body.invoiceId,
      );

    switch (result.status) {
      case "SUCCESS":
        return NextResponse.json({
          success: true,
          invoiceId: result.invoiceId,
          amountMinor: result.amountMinor,
          currencyCode: result.currencyCode,
          balanceMinor: result.balanceMinor,
          duplicate: result.duplicate,
        });

      case "INSUFFICIENT_FUNDS":
        return NextResponse.json(
          {
            error:
              "Your wallet does not have enough credit to pay this invoice.",
            code: result.status,
            balanceMinor: result.balanceMinor,
            amountDueMinor:
              result.amountDueMinor,
          },
          {
            status: 409,
          },
        );

      case "CURRENCY_MISMATCH":
        return NextResponse.json(
          {
            error:
              "Your wallet currency does not match this invoice.",
            code: result.status,
            walletCurrency:
              result.walletCurrency,
            invoiceCurrency:
              result.invoiceCurrency,
          },
          {
            status: 409,
          },
        );

      case "INVOICE_NOT_PAYABLE":
        return NextResponse.json(
          {
            error:
              "This invoice is no longer available for wallet payment.",
            code: result.status,
            invoiceStatus:
              result.invoiceStatus,
          },
          {
            status: 409,
          },
        );

      case "INVOICE_OWNERSHIP_MISMATCH":
        /*
         * Do not reveal whether another customer's invoice
         * exists. Treat it as unavailable.
         */
        return NextResponse.json(
          {
            error:
              "This invoice is not available for this account.",
            code: result.status,
          },
          {
            status: 403,
          },
        );

      case "INVOICE_NOT_FOUND":
        return NextResponse.json(
          {
            error:
              "The wallet or invoice could not be found.",
            code: result.status,
          },
          {
            status: 404,
          },
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            error.issues[0]?.message ||
            "Please review the payment request.",
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "WALLET_INVOICE_PAYMENT_API_FAILED",
      error,
    );

    return NextResponse.json(
      {
        error:
          "The wallet payment could not be completed. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}
