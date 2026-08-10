import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type WalletTransferInput = {
  senderUserId: string;
  recipientEmail: string;
  amountMinor: number;
  message?: string;
  requestId: string;
};

export type WalletTransferSuccess = {
  ok: true;
  duplicate: boolean;
  transferReference: string;
  amountMinor: number;
  currencyCode: string;
  recipient: {
    id: string;
    email: string;
    name: string;
  };
  balanceMinor: number;
};

export type WalletTransferFailure = {
  ok: false;
  error:
    | "INVALID_AMOUNT"
    | "RECIPIENT_NOT_FOUND"
    | "SELF_TRANSFER"
    | "INSUFFICIENT_FUNDS"
    | "CURRENCY_MISMATCH"
    | "TRANSFER_FAILED";
  message: string;
};

export type WalletTransferResult =
  WalletTransferSuccess | WalletTransferFailure;

function transferReference(requestId: string): string {
  /*
   * A transfer reference must be deterministic for the lifetime
   * of the requestId. Never include the current date/time here:
   * retries may occur on another day and must still resolve to
   * the exact same transfer identity.
   */
  const stableId =
    requestId
      .replaceAll("-", "")
      .toUpperCase();

  return `MAT-TRF-${stableId}`;
}

function displayName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
  );
}

function buildDescription(
  direction: "SENT" | "RECEIVED",
  otherUser: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  },
  message?: string,
) {
  const name = displayName(otherUser);

  const base =
    direction === "SENT"
      ? `Transfer to ${name} (${otherUser.email})`
      : `Transfer from ${name} (${otherUser.email})`;

  const cleanMessage = message?.trim();

  return cleanMessage ? `${base} — ${cleanMessage}` : base;
}

async function performTransfer(
  input: WalletTransferInput,
): Promise<WalletTransferResult> {
  if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
    return {
      ok: false,
      error: "INVALID_AMOUNT",
      message: "Enter a valid transfer amount greater than zero.",
    };
  }

  const recipientEmail = input.recipientEmail.trim().toLowerCase();
  const reference = transferReference(input.requestId);

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const sender = await tx.user.findUnique({
          where: {
            id: input.senderUserId,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });

        if (!sender) {
          throw new Error("SENDER_NOT_FOUND");
        }

        const recipient = await tx.user.findFirst({
          where: {
            email: {
              equals: recipientEmail,
              mode: "insensitive",
            },
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        });

        if (!recipient) {
          return {
            status: "RECIPIENT_NOT_FOUND" as const,
          };
        }

        if (recipient.id === sender.id) {
          return {
            status: "SELF_TRANSFER" as const,
          };
        }

        const senderWallet = await tx.walletAccount.upsert({
          where: {
            userId: sender.id,
          },
          update: {},
          create: {
            userId: sender.id,
            currencyCode: "USD",
          },
          select: {
            id: true,
            currencyCode: true,
          },
        });

        const recipientWallet = await tx.walletAccount.upsert({
          where: {
            userId: recipient.id,
          },
          update: {},
          create: {
            userId: recipient.id,
            currencyCode: senderWallet.currencyCode || "USD",
          },
          select: {
            id: true,
            currencyCode: true,
          },
        });

        if (senderWallet.currencyCode !== recipientWallet.currencyCode) {
          return {
            status: "CURRENCY_MISMATCH" as const,
          };
        }

        const existing = await tx.walletTransaction.findFirst({
          where: {
            walletAccountId: senderWallet.id,
            type: "TRANSFER_SENT",
            referenceType: "WALLET_TRANSFER",
            referenceId: reference,
          },
          select: {
            id: true,
          },
        });

        if (existing) {
          const current = await tx.walletTransaction.aggregate({
            where: {
              walletAccountId: senderWallet.id,
            },
            _sum: {
              amountMinor: true,
            },
          });

          return {
            status: "SUCCESS" as const,
            duplicate: true,
            recipient,
            currencyCode: senderWallet.currencyCode || "USD",
            balanceMinor: current._sum.amountMinor ?? 0,
          };
        }

        const balance = await tx.walletTransaction.aggregate({
          where: {
            walletAccountId: senderWallet.id,
          },
          _sum: {
            amountMinor: true,
          },
        });

        const senderBalanceMinor = balance._sum.amountMinor ?? 0;

        if (senderBalanceMinor < input.amountMinor) {
          return {
            status: "INSUFFICIENT_FUNDS" as const,
          };
        }

        await tx.walletTransaction.createMany({
          data: [
            {
              walletAccountId: senderWallet.id,
              type: "TRANSFER_SENT",
              amountMinor: -input.amountMinor,
              currencyCode: senderWallet.currencyCode || "USD",
              description: buildDescription("SENT", recipient, input.message),
              referenceType: "WALLET_TRANSFER",
              referenceId: reference,
            },
            {
              walletAccountId: recipientWallet.id,
              type: "TRANSFER_RECEIVED",
              amountMinor: input.amountMinor,
              currencyCode: recipientWallet.currencyCode || "USD",
              description: buildDescription("RECEIVED", sender, input.message),
              referenceType: "WALLET_TRANSFER",
              referenceId: reference,
            },
          ],
        });

        return {
          status: "SUCCESS" as const,
          duplicate: false,
          recipient,
          currencyCode: senderWallet.currencyCode || "USD",
          balanceMinor: senderBalanceMinor - input.amountMinor,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    if (result.status === "RECIPIENT_NOT_FOUND") {
      return {
        ok: false,
        error: "RECIPIENT_NOT_FOUND",
        message:
          "No My Accent Trainer account was found for that email address.",
      };
    }

    if (result.status === "SELF_TRANSFER") {
      return {
        ok: false,
        error: "SELF_TRANSFER",
        message: "You cannot transfer credit to your own account.",
      };
    }

    if (result.status === "INSUFFICIENT_FUNDS") {
      return {
        ok: false,
        error: "INSUFFICIENT_FUNDS",
        message:
          "Your wallet does not have enough available credit for this transfer.",
      };
    }

    if (result.status === "CURRENCY_MISMATCH") {
      return {
        ok: false,
        error: "CURRENCY_MISMATCH",
        message:
          "These wallets use different currencies and cannot currently transfer credit.",
      };
    }

    return {
      ok: true,
      duplicate: result.duplicate,
      transferReference: reference,
      amountMinor: input.amountMinor,
      currencyCode: result.currencyCode,
      recipient: {
        id: result.recipient.id,
        email: result.recipient.email,
        name: displayName(result.recipient),
      },
      balanceMinor: result.balanceMinor,
    };
  } catch (error) {
    console.error("Wallet transfer failed:", error);

    return {
      ok: false,
      error: "TRANSFER_FAILED",
      message: "The transfer could not be completed. No credit was moved.",
    };
  }
}

export async function transferWalletCredit(
  input: WalletTransferInput,
): Promise<WalletTransferResult> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await performTransfer(input);

    if (result.ok || result.error !== "TRANSFER_FAILED" || attempt === 1) {
      return result;
    }
  }

  return {
    ok: false,
    error: "TRANSFER_FAILED",
    message: "The transfer could not be completed. No credit was moved.",
  };
}
