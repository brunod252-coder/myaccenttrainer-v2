"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SendCreditFormProps = {
  balanceMinor: number;
  currencyCode: string;
};

type TransferReceipt = {
  transferReference: string;
  recipient: {
    email: string;
    name: string;
  };
  amountMinor: number;
  currencyCode: string;
};

function money(amountMinor: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amountMinor / 100);
}

function parseAmount(value: string): number | null {
  const normalized = value.replace(/[$,\s]/g, "");

  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100);
}

export default function SendCreditForm({
  balanceMinor,
  currencyCode,
}: SendCreditFormProps) {
  const router = useRouter();

  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null);

  async function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setReceipt(null);

    const amountMinor = parseAmount(amount);

    if (!amountMinor) {
      setError(
        "Enter a valid amount greater than zero, with no more than two decimal places.",
      );
      return;
    }

    if (amountMinor > balanceMinor) {
      setError("Your wallet does not have enough available credit.");
      return;
    }

    const email = recipientEmail.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      setError("Enter a valid recipient email address.");
      return;
    }

    const confirmed = window.confirm(
      `Send ${money(
        amountMinor,
        currencyCode,
      )} to ${email}?\n\nTransfers are recorded immediately.`,
    );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: email,
          amountMinor,
          message: message.trim() || undefined,
          requestId: crypto.randomUUID(),
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        transferReference?: string;
        amountMinor?: number;
        currencyCode?: string;
        recipient?: {
          email: string;
          name: string;
        };
      };

      if (
        !response.ok ||
        !result.ok ||
        !result.transferReference ||
        !result.recipient ||
        typeof result.amountMinor !== "number"
      ) {
        throw new Error(result.error || "The transfer could not be completed.");
      }

      setReceipt({
        transferReference: result.transferReference,
        recipient: result.recipient,
        amountMinor: result.amountMinor,
        currencyCode: result.currencyCode || currencyCode,
      });

      setRecipientEmail("");
      setAmount("");
      setMessage("");

      router.refresh();
    } catch (transferError) {
      setError(
        transferError instanceof Error
          ? transferError.message
          : "The transfer could not be completed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg text-[#17223b]">
        Send learning credit
      </h2>

      <p className="mt-1 text-sm leading-6 text-gray-500">
        Transfer available wallet credit to another registered My Accent Trainer
        user.
      </p>

      <form onSubmit={submitTransfer} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="recipientEmail"
            className="text-sm font-semibold text-[#17223b]"
          >
            Recipient email
          </label>

          <input
            id="recipientEmail"
            type="email"
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
            placeholder="student@example.com"
            autoComplete="email"
            disabled={submitting}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#20ad68]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="transferAmount"
              className="text-sm font-semibold text-[#17223b]"
            >
              Amount
            </label>

            <span className="text-xs text-gray-400">
              Available: {money(balanceMinor, currencyCode)}
            </span>
          </div>

          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              $
            </span>

            <input
              id="transferAmount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              disabled={submitting}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-4 text-sm outline-none focus:border-[#20ad68]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="transferMessage"
            className="text-sm font-semibold text-[#17223b]"
          >
            Message{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>

          <textarea
            id="transferMessage"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Add a short note for the recipient."
            rows={3}
            maxLength={160}
            disabled={submitting}
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#20ad68]"
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {message.length}/160
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {receipt && (
          <div className="rounded-xl border border-[#bcebd5] bg-[#edf9f4] px-4 py-4 text-sm text-[#126f45]">
            <p className="font-bold">Transfer complete</p>

            <p className="mt-1">
              {money(receipt.amountMinor, receipt.currencyCode)} was sent to{" "}
              {receipt.recipient.name}.
            </p>

            <p className="mt-1 text-xs">{receipt.recipient.email}</p>

            <p className="mt-3 font-mono text-xs">
              {receipt.transferReference}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || balanceMinor <= 0}
          className="w-full rounded-xl bg-[#20ad68] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#168c56] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Sending credit…" : "Review and send"}
        </button>

        <p className="text-xs leading-5 text-gray-400">
          Transfers are final once completed. Both accounts receive linked
          ledger entries under the same transfer reference.
        </p>
      </form>
    </div>
  );
}
