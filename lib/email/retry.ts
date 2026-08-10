import { prisma } from "@/lib/prisma";

import {
  sendTransactionalEmailOnce,
  type TransactionalEmailResult,
} from "./transactional";

export type RetryEmailDeliveryResult = {
  deliveryKey: string;

  status:
    | "SENT"
    | "SKIPPED"
    | "FAILED"
    | "NOT_RETRYABLE";

  result?: TransactionalEmailResult;
  error?: string;
};

/**
 * Retries one persisted EmailDelivery record.
 *
 * A delivery is retryable only when:
 *
 * - sentAt is null
 * - the original rendered HTML payload exists
 *
 * The existing transactional email service remains responsible
 * for row locking, attempt counting, SES delivery, and final
 * idempotency.
 */
export async function retryEmailDelivery(
  deliveryKey: string,
): Promise<RetryEmailDeliveryResult> {
  const delivery =
    await prisma.emailDelivery.findUnique({
      where: {
        deliveryKey,
      },
    });

  if (!delivery) {
    return {
      deliveryKey,
      status: "NOT_RETRYABLE",
      error: "EmailDelivery record not found.",
    };
  }

  if (delivery.sentAt) {
    return {
      deliveryKey,
      status: "SKIPPED",
    };
  }

  if (!delivery.html) {
    return {
      deliveryKey,
      status: "NOT_RETRYABLE",
      error:
        "Stored HTML payload is unavailable for this delivery.",
    };
  }

  try {
    const result =
      await sendTransactionalEmailOnce({
        deliveryKey:
          delivery.deliveryKey,
        userId:
          delivery.userId,
        type:
          delivery.type,
        to:
          delivery.recipient,
        subject:
          delivery.subject,
        html:
          delivery.html,
        text:
          delivery.text ?? undefined,
        link:
          delivery.link ?? undefined,
        metadata:
          normalizeMetadata(
            delivery.metadata,
          ),
      });

    if (!result.sent) {
      return {
        deliveryKey,
        status: "FAILED",
        result,
        error:
          result.error ??
          "Email provider did not send the message.",
      };
    }

    return {
      deliveryKey,
      status:
        result.skipped
          ? "SKIPPED"
          : "SENT",
      result,
    };
  } catch (error) {
    return {
      deliveryKey,
      status: "FAILED",
      error:
        error instanceof Error
          ? error.message
          : "Unknown retry error.",
    };
  }
}

/**
 * Retries a bounded batch of unsent deliveries that have a
 * persisted replay payload.
 *
 * Old historical ledger rows created before retry payload
 * persistence are deliberately excluded.
 */
export async function retryPendingEmailDeliveries(
  limit = 25,
): Promise<RetryEmailDeliveryResult[]> {
  const safeLimit =
    Math.max(
      1,
      Math.min(limit, 100),
    );

  const candidates =
    await prisma.emailDelivery.findMany({
      where: {
        sentAt: null,
        html: {
          not: null,
        },
      },
      select: {
        deliveryKey: true,
      },
      orderBy: [
        {
          lastAttemptAt: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
      take: safeLimit,
    });

  const results:
    RetryEmailDeliveryResult[] = [];

  /*
   * Process sequentially rather than creating a burst of SES
   * traffic. The caller can choose an appropriate batch size.
   */
  for (const candidate of candidates) {
    results.push(
      await retryEmailDelivery(
        candidate.deliveryKey,
      ),
    );
  }

  return results;
}

function normalizeMetadata(
  value: unknown,
):
  | Record<
      string,
      string | number | boolean | null
    >
  | undefined {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return undefined;
  }

  const normalized:
    Record<
      string,
      string | number | boolean | null
    > = {};

  for (
    const [key, item]
    of Object.entries(value)
  ) {
    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean" ||
      item === null
    ) {
      normalized[key] = item;
    }
  }

  return normalized;
}
