import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyAuthToken } from "@/lib/jwt";
import { emailShell } from "@/lib/email/send";
import { sendTransactionalEmailOnce } from "@/lib/email/transactional";
import { createNotificationOnce } from "@/lib/notifications/service";
import { prisma } from "@/lib/prisma";
import { transferWalletCredit } from "@/lib/payments/transfers";

export const runtime = "nodejs";

function formatWalletMoney(
  amountMinor: number,
  currencyCode: string,
) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amountMinor / 100);
  } catch {
    return `${currencyCode} ${(amountMinor / 100).toFixed(2)}`;
  }
}

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

      const sender =
        await prisma.user.findUnique({
          where: {
            id: senderUserId,
          },
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        });

      const senderName =
        sender
          ? [sender.firstName, sender.lastName]
              .filter(Boolean)
              .join(" ") || sender.email
          : "A My Accent Trainer member";

      const amountDisplay =
        formatWalletMoney(
          result.amountMinor,
          result.currencyCode,
        );

      try {
        const [
          senderNotification,
          recipientNotification,
        ] = await Promise.all([
          createNotificationOnce({
            userId: senderUserId,
            type: "wallet.transfer_sent",
            title: "Credit sent",
            body:
              `You sent ${amountDisplay} to ${result.recipient.name}.`,
            href: "/dashboard/wallet/ledger",
            dedupeKey:
              `wallet:transfer:${result.transferReference}:sender`,
            metadata: {
              transferReference:
                result.transferReference,
              amountMinor:
                result.amountMinor,
              currencyCode:
                result.currencyCode,
              recipientUserId:
                result.recipient.id,
              recipientEmail:
                result.recipient.email,
            },
          }),

          createNotificationOnce({
            userId: result.recipient.id,
            type: "wallet.transfer_received",
            title: "Credit received",
            body:
              `${senderName} sent you ${amountDisplay} in My Accent Trainer credit.`,
            href: "/dashboard/wallet/ledger",
            dedupeKey:
              `wallet:transfer:${result.transferReference}:recipient`,
            metadata: {
              transferReference:
                result.transferReference,
              amountMinor:
                result.amountMinor,
              currencyCode:
                result.currencyCode,
              senderUserId,
              senderEmail:
                sender?.email ?? null,
            },
          }),
        ]);

        console.log(
          "WALLET_TRANSFER_NOTIFICATIONS_PROCESSED",
          {
            transferReference:
              result.transferReference,
            duplicateTransfer:
              result.duplicate,
            senderCreated:
              senderNotification.created,
            recipientCreated:
              recipientNotification.created,
          },
        );
      } catch (notificationError) {
        console.error(
          "WALLET_TRANSFER_NOTIFICATION_ERROR",
          {
            transferReference:
              result.transferReference,
            error: notificationError,
          },
        );
      }

      try {
        if (!sender?.email) {
          throw new Error(
            "Sender email is unavailable for wallet transfer notification.",
          );
        }

        const senderFirstName =
          sender.firstName?.trim() ||
          "there";

        const recipientName =
          result.recipient.name?.trim() ||
          "My Accent Trainer member";

        const recipientFirstName =
          recipientName.split(/\s+/)[0] ||
          "there";

        const senderDeliveryKey =
          `wallet-transfer:${result.transferReference}:sender`;

        const recipientDeliveryKey =
          `wallet-transfer:${result.transferReference}:recipient`;

        const transferMetadata = {
          transferReference:
            result.transferReference,
          amountMinor:
            result.amountMinor,
          currencyCode:
            result.currencyCode,
          senderUserId,
          senderEmail:
            sender.email,
          recipientUserId:
            result.recipient.id,
          recipientEmail:
            result.recipient.email,
          duplicateTransfer:
            result.duplicate,
        };

        const [
          senderEmailDelivery,
          recipientEmailDelivery,
        ] = await Promise.all([
          sendTransactionalEmailOnce({
            deliveryKey:
              senderDeliveryKey,
            userId:
              senderUserId,
            type: "WALLET_TRANSFER_SENT",
            to:
              sender.email,
            subject:
              `You sent ${amountDisplay} in My Accent Trainer credit`,
            html: emailShell(
              "Credit sent",
              `Hi ${senderFirstName}, you sent ${amountDisplay} in My Accent Trainer learning credit to ${recipientName}. Transfer reference: ${result.transferReference}.`,
              {
                label: "View wallet activity",
                href:
                  "/dashboard/wallet/ledger",
              },
            ),
            text:
              `Hi ${senderFirstName},\n\n` +
              `You sent ${amountDisplay} in My Accent Trainer learning credit to ${recipientName}.\n\n` +
              `Transfer reference: ${result.transferReference}\n\n` +
              "https://myaccenttrainer.com/dashboard/wallet/ledger",
            metadata: {
              ...transferMetadata,
              party: "sender",
            },
          }),

          sendTransactionalEmailOnce({
            deliveryKey:
              recipientDeliveryKey,
            userId:
              result.recipient.id,
            type: "WALLET_TRANSFER_RECEIVED",
            to:
              result.recipient.email,
            subject:
              `You received ${amountDisplay} in My Accent Trainer credit`,
            html: emailShell(
              "Credit received",
              `Hi ${recipientFirstName}, ${senderName} sent you ${amountDisplay} in My Accent Trainer learning credit. Transfer reference: ${result.transferReference}.`,
              {
                label: "Open your wallet",
                href:
                  "/dashboard/wallet",
              },
            ),
            text:
              `Hi ${recipientFirstName},\n\n` +
              `${senderName} sent you ${amountDisplay} in My Accent Trainer learning credit.\n\n` +
              `Transfer reference: ${result.transferReference}\n\n` +
              "https://myaccenttrainer.com/dashboard/wallet",
            metadata: {
              ...transferMetadata,
              party: "recipient",
            },
          }),
        ]);

        console.log(
          "WALLET_TRANSFER_EMAILS_PROCESSED",
          {
            transferReference:
              result.transferReference,
            duplicateTransfer:
              result.duplicate,
            senderSent:
              senderEmailDelivery.sent,
            senderSkipped:
              senderEmailDelivery.skipped,
            recipientSent:
              recipientEmailDelivery.sent,
            recipientSkipped:
              recipientEmailDelivery.skipped,
          },
        );
      } catch (emailError) {
        console.error(
          "WALLET_TRANSFER_EMAIL_ERROR",
          {
            transferReference:
              result.transferReference,
            error:
              emailError,
          },
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
