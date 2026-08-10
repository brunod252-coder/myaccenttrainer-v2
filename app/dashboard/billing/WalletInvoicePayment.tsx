"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const hasEnough =
    balanceMinor >= amountDueMinor;

  const remainingMinor =
    balanceMinor - amountDueMinor;

  async function payWithWallet() {
    if (
      submitting ||
      !hasEnough
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Pay ${formatMoney(
        amountDueMinor,
        currencyCode,
      )} from your My Accent Trainer wallet?`,
    );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/billing/pay-with-wallet",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            invoiceId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Wallet payment failed.",
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
    <div className="mt-5 rounded-xl border border-[#cdeee1] bg-[#f0faf6] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#17223b]">
            My Accent Trainer Wallet
          </p>

          <p className="mt-1 text-xs text-[#52719f]">
            Use your available learning credit
            toward this subscription invoice.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#168c56]">
          {formatMoney(
            balanceMinor,
            currencyCode,
          )}
        </span>
      </div>

      <div className="mt-4 space-y-2 border-t border-[#dcefe7] pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">
            Payment due
          </span>

          <span className="font-semibold text-[#17223b]">
            {formatMoney(
              amountDueMinor,
              currencyCode,
            )}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-500">
            Available balance
          </span>

          <span className="font-semibold text-[#17223b]">
            {formatMoney(
              balanceMinor,
              currencyCode,
            )}
          </span>
        </div>

        {hasEnough ? (
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">
              Balance after payment
            </span>

            <span className="font-semibold text-[#168c56]">
              {formatMoney(
                remainingMinor,
                currencyCode,
              )}
            </span>
          </div>
        ) : null}
      </div>

      {hasEnough ? (
        <button
          type="button"
          disabled={submitting}
          onClick={payWithWallet}
          className="mt-4 w-full rounded-lg bg-[#20ad68] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Processing wallet payment..."
            : `Pay ${formatMoney(
                amountDueMinor,
                currencyCode,
              )} with wallet`}
        </button>
      ) : (
        <div className="mt-4 rounded-lg border border-[#f2d6b3] bg-[#fff8ef] px-4 py-3 text-sm text-[#8a571c]">
          Your wallet does not currently
          have enough credit to pay this
          invoice.
        </div>
      )}

      {error ? (
        <p className="mt-3 text-sm font-medium text-[#b54747]">
          {error}
        </p>
      ) : null}

      <p className="mt-3 text-xs leading-5 text-gray-500">
        Your wallet will not be charged
        until you confirm the payment.
      </p>
    </div>
  );
}
