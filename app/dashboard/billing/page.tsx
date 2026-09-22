import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppLayout from "@/components/layouts/AppLayout";
import SubscriptionActions from "./SubscriptionActions";
import WalletInvoicePayment from "./WalletInvoicePayment";
import { Arrow, CheckCircle } from "@/components/ui/icons";
import {
  getEnrollmentState,
  hasPremiumAccess,
  needsPaymentRecovery,
} from "@/lib/auth/enrollment";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/payments/plans";
import { getStripeBillingHistory } from "@/lib/payments/stripe-billing";
import { getWalletSummary } from "@/lib/payments/wallet";

export default async function BillingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mat_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAuthToken(token);

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      emailVerified: true,
      profile: {
        select: {
          englishGoal: true,
          proficiencyLevel: true,
        },
      },
      selectedPlanId: true,
      subscriptionStatus: true,
      planRenewsAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [invoices, wallet] = await Promise.all([
    getStripeBillingHistory(
      user.stripeCustomerId,
    ),
    getWalletSummary(
      payload.userId,
      1,
    ),
  ]);

  const payableInvoice =
    invoices.find(
      (invoice) =>
        invoice.status === "open" &&
        invoice.amountDue > 0,
    ) ?? null;

  const status = user.subscriptionStatus;

  const enrollmentState =
    getEnrollmentState({
      emailVerified: user.emailVerified,
      englishGoal: user.profile?.englishGoal,
      proficiencyLevel: user.profile?.proficiencyLevel,
      subscriptionStatus: status,
    });

  const hasPremium =
    hasPremiumAccess(enrollmentState);

  const isPaymentRecovery =
    needsPaymentRecovery(enrollmentState);

  const isTrialing =
    enrollmentState === "TRIALING";

  const isCancelScheduled =
    enrollmentState === "CANCEL_SCHEDULED";

  const planName =
    user.selectedPlanId === "annual"
      ? "Premium Annual"
      : user.selectedPlanId === "monthly"
        ? "Premium Monthly"
        : "Premium Membership";

  const planPrice =
    user.selectedPlanId === "annual"
      ? "$199/year"
      : user.selectedPlanId === "monthly"
        ? "$19.99/month"
        : null;

  const statusLabel =
    isTrialing
      ? "Premium trial"
      : isCancelScheduled
        ? "Cancellation scheduled"
        : status === "active"
          ? "Active"
          : status === "past_due"
            ? "Past due"
            : status === "payment_method_required"
              ? "Payment required"
            : status === "canceled"
              ? "Canceled"
              : "No active plan";

  const billingDate = user.planRenewsAt
    ? new Date(user.planRenewsAt).toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        },
      )
    : null;

  const userName =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ") || user.email;

  return (
    <AppLayout
      userName={userName}
      role={user.role}
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 sm:p-8">
              <Link
                href="/dashboard/wallet"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--mat-green-700)] hover:underline"
              >
                <Arrow className="h-4 w-4 rotate-180" />
                Back to wallet
              </Link>

              <p className="mat-eyebrow mt-6">Billing</p>

              <h1 className="mt-2 max-w-2xl font-display text-3xl text-[var(--mat-ink)] sm:text-4xl">
                Your membership &amp; billing
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--mat-muted)] sm:text-base">
                Review your current membership state, billing date, payment
                recovery options, and Stripe invoice history.
              </p>
            </div>

            <div className="border-t border-[var(--mat-border)] bg-[var(--mat-green-50)] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--mat-green-700)]">
                Membership status
              </p>

              <p className="mt-3 font-display text-3xl text-[var(--mat-ink)]">
                {statusLabel}
              </p>

              <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
                {isTrialing
                  ? "Your Premium trial is currently active."
                  : isCancelScheduled
                    ? "Your cancellation is scheduled for the end of the current billing period."
                    : status === "active"
                      ? "Your Premium membership is currently active."
                      : isPaymentRecovery
                        ? "Your membership needs payment attention."
                        : status === "canceled"
                          ? "Your Premium membership has ended."
                          : "There is no active Premium membership on this account."}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mat-eyebrow">Membership</p>
                <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                  Current plan
                </h2>
              </div>

              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (hasPremium
                    ? "bg-[#e5f3ec] text-[#2e7d5b]"
                    : isPaymentRecovery
                      ? "bg-[#fff4e5] text-[#a35a00]"
                      : "bg-[#eef4f9] text-[#52719f]")
                }
              >
                {statusLabel}
              </span>
            </div>

            {hasPremium ? (
              <div className="mt-5">
                <div className="flex items-start gap-3 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#20ad68]" />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#168c56]">
                      {planName}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#2e7d5b]">
                      {isTrialing
                        ? "Your Premium trial is active. You have full access to every lesson, practice tool, and Nina."
                        : isCancelScheduled
                          ? "Your Premium membership remains active through the end of your current billing period."
                          : "Your Premium membership is active with full access to My Accent Trainer."}
                    </p>

                    <div className="mt-4 space-y-2 text-sm text-[#42506a]">
                      {planPrice ? (
                        <p>
                          <span className="font-semibold text-[#17223b]">
                            Plan:
                          </span>{" "}
                          {planPrice}
                        </p>
                      ) : null}

                      {billingDate ? (
                        <p>
                          <span className="font-semibold text-[#17223b]">
                            {isTrialing
                              ? "Trial ends:"
                              : isCancelScheduled
                                ? "Access through:"
                                : "Next billing date:"}
                          </span>{" "}
                          {billingDate}
                        </p>
                      ) : null}

                      <p>
                        <span className="font-semibold text-[#17223b]">
                          Payment method:
                        </span>{" "}
                        {user.stripeCustomerId
                          ? "On file"
                          : "Not available"}
                      </p>
                    </div>

                    <Link
                      href="/dashboard/settings"
                      className="mt-5 inline-flex text-sm font-semibold text-[#168c56] hover:text-[#127548]"
                    >
                      Manage membership
                    </Link>

                    <SubscriptionActions
                      enrollmentState={
                        enrollmentState
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm leading-6 text-gray-600">
                  {isPaymentRecovery
                    ? "We could not complete your latest subscription payment. Choose how you would like to settle the outstanding balance."
                    : status === "canceled"
                      ? "Your Premium membership has ended. Choose a plan whenever you are ready to continue."
                      : "Choose a membership plan when you are ready to continue with Premium access."}
                </p>

                {isPaymentRecovery &&
                payableInvoice ? (
                  <>
                    <WalletInvoicePayment
                      invoiceId={
                        payableInvoice.id
                      }
                      amountDueMinor={
                        payableInvoice.amountDue
                      }
                      currencyCode={
                        payableInvoice.currency
                      }
                      balanceMinor={
                        wallet.balanceMinor
                      }
                    />

                    {payableInvoice.hostedInvoiceUrl ? (
                      <a
                        href={
                          payableInvoice.hostedInvoiceUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex text-sm font-semibold text-[#168c56] hover:text-[#127548]"
                      >
                        Pay with card instead
                      </a>
                    ) : null}
                  </>
                ) : (
                  <Link
                    href="/onboarding/plan"
                    className="mt-4 inline-flex rounded-lg bg-[#20ad68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#169357]"
                  >
                    See plans
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
            <div>
              <p className="mat-eyebrow">Invoices</p>

              <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
                Payment history
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                Stripe invoices associated with your membership appear here
                when they are available.
              </p>
            </div>

            {invoices.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-[#f8fbfa] p-6 text-center text-sm leading-6 text-gray-500">
                {isTrialing
                  ? "Your Premium trial is active. Paid invoices will appear here when billing begins."
                  : "No Stripe invoices are available yet."}
              </div>
            ) : (
              <div className="mt-4 divide-y divide-gray-100">
                {invoices.map((invoice) => {
                  const amount =
                    invoice.amountPaid > 0
                      ? invoice.amountPaid
                      : invoice.amountDue;

                  return (
                    <div
                      key={invoice.id}
                      className="py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[#17223b]">
                              {invoice.number
                                ? `Invoice ${invoice.number}`
                                : "Stripe invoice"}
                            </p>

                            {invoice.status ? (
                              <span className="rounded-full bg-[#eef4f9] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#52719f]">
                                {invoice.status}
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-1 text-xs text-gray-400">
                            {invoice.createdAt.toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-semibold text-[#17223b]">
                          {formatMoney(
                            amount,
                            invoice.currency,
                          )}
                        </span>
                      </div>

                      {(invoice.hostedInvoiceUrl ||
                        invoice.invoicePdf) ? (
                        <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold">
                          {invoice.hostedInvoiceUrl ? (
                            <a
                              href={invoice.hostedInvoiceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#168c56] hover:text-[#127548]"
                            >
                              View invoice
                            </a>
                          ) : null}

                          {invoice.invoicePdf ? (
                            <a
                              href={invoice.invoicePdf}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#168c56] hover:text-[#127548]"
                            >
                              Download PDF
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
