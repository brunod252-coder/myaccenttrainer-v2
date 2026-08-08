import Stripe from "stripe";

export type StripeBillingInvoice = {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number;
  amountDue: number;
  currency: string;
  createdAt: Date;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
};

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(secretKey);
}

export async function getStripeBillingHistory(
  customerId: string | null,
): Promise<StripeBillingInvoice[]> {
  if (!customerId) {
    return [];
  }

  const stripe = getStripe();

  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 24,
  });

  return invoices.data.map((invoice) => ({
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    amountPaid: invoice.amount_paid,
    amountDue: invoice.amount_due,
    currency: invoice.currency.toUpperCase(),
    createdAt: new Date(invoice.created * 1000),
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    invoicePdf: invoice.invoice_pdf ?? null,
  }));
}
