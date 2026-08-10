import Stripe from "stripe";

import { prisma } from "@/lib/prisma";

export type WalletInvoicePaymentResult =
  | {
      status: "SUCCESS";
      duplicate: boolean;
      invoiceId: string;
      amountMinor: number;
      currencyCode: string;
      balanceMinor: number;
    }
  | {
      status: "INVOICE_NOT_FOUND";
    }
  | {
      status: "INVOICE_NOT_PAYABLE";
      invoiceStatus: string | null;
    }
  | {
      status: "INVOICE_OWNERSHIP_MISMATCH";
    }
  | {
      status: "CURRENCY_MISMATCH";
      walletCurrency: string;
      invoiceCurrency: string;
    }
  | {
      status: "INSUFFICIENT_FUNDS";
      balanceMinor: number;
      amountDueMinor: number;
    };

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured.",
    );
  }

  return new Stripe(secretKey);
}

function stripeCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  if (!customer) {
    return null;
  }

  return typeof customer === "string"
    ? customer
    : customer.id;
}

export async function payStripeInvoiceWithWallet(
  userId: string,
  invoiceId: string,
): Promise<WalletInvoicePaymentResult> {
  const stripe = getStripe();

  /*
   * Stripe is the invoice authority.
   *
   * Always retrieve the invoice directly from Stripe rather
   * than trusting an amount supplied by the browser.
   */
  const invoice =
    await stripe.invoices.retrieve(invoiceId);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      wallet: {
        select: {
          id: true,
          currencyCode: true,
        },
      },
    },
  });

  if (!user || !user.wallet) {
    return {
      status: "INVOICE_NOT_FOUND",
    };
  }

  const invoiceCustomerId =
    stripeCustomerId(invoice.customer);

  /*
   * A user may only pay an invoice belonging to the Stripe
   * customer attached to their MAT account.
   */
  if (
    !user.stripeCustomerId ||
    !invoiceCustomerId ||
    invoiceCustomerId !== user.stripeCustomerId
  ) {
    return {
      status: "INVOICE_OWNERSHIP_MISMATCH",
    };
  }

  if (
    invoice.status !== "open" ||
    invoice.amount_remaining <= 0
  ) {
    return {
      status: "INVOICE_NOT_PAYABLE",
      invoiceStatus: invoice.status,
    };
  }

  const invoiceCurrency =
    invoice.currency.toUpperCase();

  const walletCurrency =
    (user.wallet.currencyCode || "USD").toUpperCase();

  if (walletCurrency !== invoiceCurrency) {
    return {
      status: "CURRENCY_MISMATCH",
      walletCurrency,
      invoiceCurrency,
    };
  }

  const referenceType = "STRIPE_INVOICE";
  const referenceId = invoice.id;
  const amountDueMinor = invoice.amount_remaining;

  /*
   * First check whether this exact invoice has already
   * consumed wallet funds.
   *
   * This is the application-level retry path. The database
   * unique constraint is the final concurrency guard.
   */
  const existing =
    await prisma.walletTransaction.findFirst({
      where: {
        walletAccountId: user.wallet.id,
        type: "SUBSCRIPTION_APPLIED",
        referenceType,
        referenceId,
      },
      select: {
        id: true,
        amountMinor: true,
      },
    });

  let duplicate = false;

  if (existing) {
    duplicate = true;
  } else {
    const debitResult =
      await prisma.$transaction(async (tx) => {
        /*
         * Recalculate the balance inside the transaction.
         * Never trust a balance supplied by the client.
         */
        const balance =
          await tx.walletTransaction.aggregate({
            where: {
              walletAccountId: user.wallet!.id,
            },
            _sum: {
              amountMinor: true,
            },
          });

        const balanceMinor =
          balance._sum.amountMinor ?? 0;

        if (balanceMinor < amountDueMinor) {
          return {
            kind: "INSUFFICIENT_FUNDS" as const,
            balanceMinor,
          };
        }

        /*
         * Re-check inside the transaction before creating.
         * The unique database index still protects against
         * simultaneous requests that race past this point.
         */
        const alreadyApplied =
          await tx.walletTransaction.findFirst({
            where: {
              walletAccountId: user.wallet!.id,
              type: "SUBSCRIPTION_APPLIED",
              referenceType,
              referenceId,
            },
            select: {
              id: true,
            },
          });

        if (alreadyApplied) {
          return {
            kind: "DUPLICATE" as const,
          };
        }

        await tx.walletTransaction.create({
          data: {
            walletAccountId: user.wallet!.id,
            type: "SUBSCRIPTION_APPLIED",
            amountMinor: -amountDueMinor,
            currencyCode: walletCurrency,
            description:
              `Premium subscription payment — Stripe invoice ${invoice.id}`,
            referenceType,
            referenceId,
          },
        });

        return {
          kind: "DEBITED" as const,
        };
      });

    if (
      debitResult.kind ===
      "INSUFFICIENT_FUNDS"
    ) {
      return {
        status: "INSUFFICIENT_FUNDS",
        balanceMinor:
          debitResult.balanceMinor,
        amountDueMinor,
      };
    }

    duplicate =
      debitResult.kind === "DUPLICATE";
  }

  /*
   * The wallet debit now exists exactly once.
   *
   * Mark the Stripe invoice paid out-of-band. If this Stripe
   * request fails, a retry finds the existing wallet debit
   * above and retries Stripe settlement WITHOUT debiting the
   * wallet again.
   */
  /*
   * Persist payment provenance on Stripe before settling the
   * invoice.
   *
   * This update is safe to repeat because the metadata values
   * are deterministic for this wallet/invoice pair.
   */
  await stripe.invoices.update(invoice.id, {
    metadata: {
      ...invoice.metadata,
      mat_payment_source: "wallet",
      mat_wallet_reference_type: referenceType,
      mat_wallet_reference_id: referenceId,
    },
  });

  /*
   * Managed Payments subscriptions don't permit paying their
   * subscription invoices through invoices.pay().
   *
   * For those subscriptions, the MAT wallet has already
   * satisfied the customer's obligation internally. Voiding
   * the corresponding Stripe invoice prevents a later Stripe
   * card collection and lets Stripe restore a past_due
   * subscription to active.
   *
   * Ordinary Stripe Billing subscriptions continue to use the
   * supported paid_out_of_band settlement path.
   */
  let managedPaymentsEnabled = false;

  if (user.stripeSubscriptionId) {
    const subscription =
      await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId,
      );

    managedPaymentsEnabled =
      Boolean(
        (
          subscription as Stripe.Subscription & {
            managed_payments?: {
              enabled?: boolean;
            } | null;
          }
        ).managed_payments?.enabled,
      );
  }

  if (managedPaymentsEnabled) {
    await stripe.invoices.voidInvoice(
      invoice.id,
    );
  } else {
    await stripe.invoices.pay(invoice.id, {
      paid_out_of_band: true,
    });
  }

  const finalBalance =
    await prisma.walletTransaction.aggregate({
      where: {
        walletAccountId: user.wallet.id,
      },
      _sum: {
        amountMinor: true,
      },
    });

  return {
    status: "SUCCESS",
    duplicate,
    invoiceId: invoice.id,
    amountMinor: amountDueMinor,
    currencyCode: walletCurrency,
    balanceMinor:
      finalBalance._sum.amountMinor ?? 0,
  };
}
