"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  invoiceId: string;
  amountDueMinor: number;
  currencyCode: string;
  balanceMinor: number;
};

function formatMoney(
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

export default function WalletInvoicePayment({
  invoiceId,
  amountDueMinor,
  currencyCode,
  balanceMinor,
}: Props) {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEnough = balanceMinor >= amountDueMinor;
  const remainingMinor = balanceMinor - amountDueMinor;

  async function payWithWallet() {
    if (submitting || !hasEnough) return;

    const confirmed = window.confirm(
      `Pay ${formatMoney(
        amountDueMinor,
        currencyCode,
      )} from your My Accent Trainer wallet?`,
    );

    if (!confirmed) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/billing/pay-with-wallet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoiceId,
          }),
        },
      );

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error || "Wallet payment failed.",
        );
      }

      router.refresh();
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Wallet payment failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-green-700)]">
            Wallet payment
          </p>

          <h3 className="mt-1 font-display text-lg text-[var(--mat-ink)]">
            Use your learning credit
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--mat-muted)]">
            Apply available My Accent Trainer wallet credit to this
            subscription invoice.
          </p>
        </div>

        <div className="shrink-0 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-white px-4 py-3 sm:text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--mat-muted-light)]">
            Wallet balance
          </p>

          <p className="mt-1 font-semibold text-[var(--mat-ink)]">
            {formatMoney(balanceMinor, currencyCode)}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-[var(--mat-border-green)] pt-5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[var(--mat-muted)]">
            Payment due
          </span>

          <span className="font-semibold text-[var(--mat-ink)]">
            {formatMoney(amountDueMinor, currencyCode)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[var(--mat-muted)]">
            Available balance
          </span>

          <span className="font-semibold text-[var(--mat-ink)]">
            {formatMoney(balanceMinor, currencyCode)}
          </span>
        </div>

        {hasEnough ? (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--mat-muted)]">
              Balance after payment
            </span>

            <span className="font-semibold text-[var(--mat-green-700)]">
              {formatMoney(remainingMinor, currencyCode)}
            </span>
          </div>
        ) : null}
      </div>

      {hasEnough ? (
        <button
          type="button"
          disabled={submitting}
          onClick={payWithWallet}
          className="mat-button mat-button-primary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Processing wallet payment…"
            : `Pay ${formatMoney(
                amountDueMinor,
                currencyCode,
              )} with wallet`}
        </button>
      ) : (
        <div
          role="status"
          className="mt-5 rounded-[var(--mat-radius-lg)] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
        >
          Your wallet does not currently have enough credit to pay this
          invoice.
        </div>
      )}

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-[var(--mat-radius-lg)] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
        >
          {error}
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-[var(--mat-muted-light)]">
        Your wallet will not be charged until you confirm the payment.
      </p>
    </div>
  );
}
