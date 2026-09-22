"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  balanceMinor: number;
  currencyCode: string;
};

type TransferReceipt = {
  referenceId: string;
  recipientEmail: string;
  amountMinor: number;
};

function money(minor: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  }).format(minor / 100);
}

function parseAmount(value: string) {
  const normalized = value.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 100);
}

export default function SendCreditForm({
  balanceMinor,
  currencyCode,
}: Props) {
  const router = useRouter();

  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null);

  const amountMinor = useMemo(() => parseAmount(amount), [amount]);
  const currencyLabel = currencyCode.toUpperCase();

  async function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setReceipt(null);

    const email = recipientEmail.trim().toLowerCase();

    if (!email) {
      setError("Enter the recipient's email address.");
      return;
    }

    if (amountMinor === null) {
      setError("Enter a valid amount with no more than two decimal places.");
      return;
    }

    if (amountMinor > balanceMinor) {
      setError("This transfer is greater than your available wallet balance.");
      return;
    }

    const confirmed = window.confirm(
      `Send ${money(amountMinor, currencyCode)} to ${email}? Transfers are final once completed.`,
    );

    if (!confirmed) return;

    setSubmitting(true);

    try {
      const requestId = crypto.randomUUID();

      const response = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: email,
          amountMinor,
          message: message.trim() || undefined,
          requestId,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        referenceId?: string;
        recipientEmail?: string;
        amountMinor?: number;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to complete this transfer.");
      }

      if (
        typeof data.referenceId !== "string" ||
        typeof data.recipientEmail !== "string" ||
        typeof data.amountMinor !== "number"
      ) {
        throw new Error("The transfer completed without a usable receipt.");
      }

      setReceipt({
        referenceId: data.referenceId,
        recipientEmail: data.recipientEmail,
        amountMinor: data.amountMinor,
      });

      setRecipientEmail("");
      setAmount("");
      setMessage("");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete this transfer. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mat-eyebrow">Send credit</p>

          <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
            Transfer learning credit
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--mat-muted)]">
            Send credit from your available wallet balance to another
            registered learner.
          </p>
        </div>

        <div className="rounded-full bg-[var(--mat-green-50)] px-3 py-1.5 text-sm font-semibold text-[var(--mat-green-700)]">
          Available: {money(balanceMinor, currencyCode)}
        </div>
      </div>

      <form onSubmit={submitTransfer} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="wallet-recipient-email"
            className="text-sm font-semibold text-[var(--mat-ink)]"
          >
            Recipient email
          </label>

          <input
            id="wallet-recipient-email"
            type="email"
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={submitting}
            placeholder="learner@example.com"
            className="mat-input mt-2 w-full"
          />

          <p className="mt-2 text-xs leading-5 text-[var(--mat-muted-light)]">
            The recipient must already have a MyAccentTrainer account.
          </p>
        </div>

        <div>
          <label
            htmlFor="wallet-transfer-amount"
            className="text-sm font-semibold text-[var(--mat-ink)]"
          >
            Amount
          </label>

          <div className="relative mt-2">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-[var(--mat-muted)]"
            >
              {currencyLabel}
            </span>

            <input
              id="wallet-transfer-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              disabled={submitting}
              placeholder="0.00"
              className="mat-input w-full pl-14"
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--mat-muted-light)]">
            <span>Available: {money(balanceMinor, currencyCode)}</span>

            {amountMinor !== null && (
              <span>Transfer: {money(amountMinor, currencyCode)}</span>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="wallet-transfer-message"
            className="text-sm font-semibold text-[var(--mat-ink)]"
          >
            Note
            <span className="ml-1 font-normal text-[var(--mat-muted-light)]">
              optional
            </span>
          </label>

          <textarea
            id="wallet-transfer-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={240}
            disabled={submitting}
            rows={3}
            placeholder="Add a short note for the recipient"
            className="mat-input mt-2 w-full resize-none"
          />

          <p className="mt-2 text-right text-xs text-[var(--mat-muted-light)]">
            {message.length}/240
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-[var(--mat-radius-lg)] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
          >
            {error}
          </div>
        )}

        {receipt && (
          <div
            role="status"
            className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5"
          >
            <p className="text-sm font-bold text-[var(--mat-green-800)]">
              Transfer complete
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--mat-muted)]">
              {money(receipt.amountMinor, currencyCode)} was sent to{" "}
              <span className="font-semibold text-[var(--mat-ink)]">
                {receipt.recipientEmail}
              </span>
              .
            </p>

            <div className="mt-4 rounded-[var(--mat-radius-lg)] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted-light)]">
                Transfer reference
              </p>

              <p className="mt-1 break-all font-mono text-xs text-[var(--mat-ink)]">
                {receipt.referenceId}
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-[var(--mat-border)] pt-5">
          <button
            type="submit"
            disabled={submitting}
            className="mat-button mat-button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Sending…" : "Review and send"}
          </button>

          <p className="mt-3 text-xs leading-5 text-[var(--mat-muted-light)]">
            You will be asked to confirm the recipient and amount before the
            transfer request is submitted.
          </p>
        </div>
      </form>
    </section>
  );
}
