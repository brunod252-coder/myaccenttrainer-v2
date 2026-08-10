import { prisma } from "@/lib/prisma";

import { sendEmail } from "./send";

export type TransactionalEmailInput = {
  deliveryKey: string;
  userId?: string | null;

  type: string;
  to: string;
  subject: string;

  html: string;
  text?: string;
  link?: string;

  metadata?: Record<
    string,
    string | number | boolean | null
  >;
};

export type TransactionalEmailResult = {
  sent: boolean;
  skipped: boolean;

  deliveryId: string;

  messageId?: string;
  error?: string;
};

/**
 * Sends a transactional email with durable application-level
 * idempotency.
 *
 * Behavior:
 *
 * - deliveryKey uniquely identifies one business email.
 * - an already-successful delivery is never sent again.
 * - failed deliveries remain retryable.
 * - concurrent callers for the same deliveryKey are serialized
 *   with a PostgreSQL row lock.
 *
 * The durable ledger and SES call are intentionally coordinated
 * here so individual producers do not implement their own
 * deduplication rules.
 */
export async function sendTransactionalEmailOnce(
  input: TransactionalEmailInput,
): Promise<TransactionalEmailResult> {
  if (!input.deliveryKey.trim()) {
    throw new Error(
      "Transactional email deliveryKey is required.",
    );
  }

  if (!input.to.trim()) {
    throw new Error(
      "Transactional email recipient is required.",
    );
  }

  /*
   * Ensure the ledger row exists first.
   *
   * The unique deliveryKey makes this safe when multiple webhook
   * requests race to create the same delivery.
   */
  await prisma.emailDelivery.upsert({
    where: {
      deliveryKey: input.deliveryKey,
    },
    create: {
      deliveryKey: input.deliveryKey,
      userId: input.userId ?? null,
      type: input.type,
      recipient: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? null,
      link: input.link ?? null,
      metadata: input.metadata,
    },
    update: {},
  });

  return prisma.$transaction(
    async (tx) => {
      /*
       * Serialize concurrent attempts for this delivery.
       *
       * Once this row lock is held, a second request using the
       * same deliveryKey must wait. When it resumes, it will
       * observe sentAt and skip the duplicate SES send.
       */
      await tx.$queryRawUnsafe(
        `
          SELECT "id"
          FROM "EmailDelivery"
          WHERE "deliveryKey" = $1
          FOR UPDATE
        `,
        input.deliveryKey,
      );

      const delivery =
        await tx.emailDelivery.findUnique({
          where: {
            deliveryKey: input.deliveryKey,
          },
        });

      if (!delivery) {
        throw new Error(
          "Transactional email ledger row disappeared.",
        );
      }

      if (delivery.sentAt) {
        return {
          sent: true,
          skipped: true,
          deliveryId: delivery.id,
          messageId:
            delivery.providerMessageId ??
            undefined,
        };
      }

      await tx.emailDelivery.update({
        where: {
          id: delivery.id,
        },
        data: {
          attemptCount: {
            increment: 1,
          },
          lastAttemptAt: new Date(),
          lastError: null,
        },
      });

      const result = await sendEmail({
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        link: input.link,
      });

      if (!result.sent) {
        await tx.emailDelivery.update({
          where: {
            id: delivery.id,
          },
          data: {
            lastError:
              result.error ??
              "Email provider did not send the message.",
          },
        });

        return {
          sent: false,
          skipped: false,
          deliveryId: delivery.id,
          error:
            result.error ??
            "Email provider did not send the message.",
        };
      }

      const sentAt = new Date();

      await tx.emailDelivery.update({
        where: {
          id: delivery.id,
        },
        data: {
          provider: "ses",
          providerMessageId:
            result.messageId ?? null,
          sentAt,
          lastError: null,
        },
      });

      return {
        sent: true,
        skipped: false,
        deliveryId: delivery.id,
        messageId:
          result.messageId,
      };
    },
    {
      maxWait: 5000,
      timeout: 20000,
    },
  );
}
