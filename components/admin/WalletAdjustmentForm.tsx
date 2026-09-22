"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type WalletAdjustmentFormProps = {
  userId: string;
  userName: string;
  userEmail: string;
  currencyCode: string;
};

function dollarsToMinorUnits(value: string): number | null {
  const normalized = value.replace(/[$,\s]/g, "");

  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const amountMinor = Math.round(amount * 100);

  if (amountMinor > 10_000_000) {
    return null;
  }

  return amountMinor;
}

export default function WalletAdjustmentForm({
  userId,
  userName,
  userEmail,
  currencyCode,
}: WalletAdjustmentFormProps) {
  const router = useRouter();

  const [direction, setDirection] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const amountMinor = dollarsToMinorUnits(amount);

    if (!amountMinor) {
      setMessage({
        type: "error",
        text: "Enter an amount from $0.01 through $100,000.00, with no more than two decimal places.",
      });
      return;
    }

    if (reason.trim().length < 3) {
      setMessage({
        type: "error",
        text: "Enter a clear reason for this wallet adjustment.",
      });
      return;
    }

    const actionWord = direction === "CREDIT" ? "credit" : "debit";

    const confirmed = window.confirm(
      `Confirm ${actionWord} of ${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
      }).format(amountMinor / 100)} for ${userName} (${userEmail})?`,
    );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/wallets/adjustment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          direction,
          amountMinor,
          reason: reason.trim(),
          requestId: crypto.randomUUID(),
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        duplicate?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "The wallet adjustment failed.");
      }

      setAmount("");
      setReason("");

      setMessage({
        type: "success",
        text: result.duplicate
          ? "This adjustment had already been recorded."
          : `${
              direction === "CREDIT" ? "Credit" : "Debit"
            } recorded successfully.`,
      });

      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "The wallet adjustment failed.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label
          htmlFor="direction"
          className="text-sm font-semibold text-[var(--mat-ink)]"
        >
          Adjustment type
        </label>

        <select
          id="direction"
          name="direction"
          value={direction}
          onChange={(event) =>
            setDirection(event.target.value as "CREDIT" | "DEBIT")
          }
          disabled={submitting}
          className="mt-2 w-full rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-white px-4 py-3 text-sm text-[var(--mat-ink)] outline-none transition focus:border-[var(--mat-green-700)] focus:ring-2 focus:ring-[var(--mat-green-50)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="CREDIT">Credit wallet</option>
          <option value="DEBIT">Debit wallet</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="text-sm font-semibold text-[var(--mat-ink)]"
        >
          Amount ({currencyCode})
        </label>

        <div className="relative mt-2">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mat-muted-light)]">
            $
          </span>

          <input
            id="amount"
            name="amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            autoComplete="off"
            aria-describedby="wallet-adjustment-amount-help"
            disabled={submitting}
            className="w-full rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-white py-3 pl-8 pr-4 text-sm text-[var(--mat-ink)] outline-none transition placeholder:text-[var(--mat-muted-light)] focus:border-[var(--mat-green-700)] focus:ring-2 focus:ring-[var(--mat-green-50)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <p
          id="wallet-adjustment-amount-help"
          className="mt-1 text-xs leading-5 text-[var(--mat-muted-light)]"
        >
          Enter an amount from $0.01 through $100,000.00.
        </p>
      </div>

      <div>
        <label
          htmlFor="reason"
          className="text-sm font-semibold text-[var(--mat-ink)]"
        >
          Reason
        </label>

        <textarea
          id="reason"
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Explain why this adjustment is being issued."
          rows={4}
          maxLength={240}
          disabled={submitting}
          className="mt-2 w-full resize-none rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)] bg-white px-4 py-3 text-sm text-[var(--mat-ink)] outline-none transition placeholder:text-[var(--mat-muted-light)] focus:border-[var(--mat-green-700)] focus:ring-2 focus:ring-[var(--mat-green-50)] disabled:cursor-not-allowed disabled:opacity-60"
        />

        <p className="mt-1 text-right text-xs text-[var(--mat-muted-light)]">
          {reason.length}/240
        </p>
      </div>

      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={[
            "rounded-[var(--mat-radius-lg)] border px-4 py-3 text-sm leading-6",
            message.type === "success"
              ? "border-[var(--mat-border-green)] bg-[var(--mat-green-50)] text-[var(--mat-green-800)]"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={[
          "w-full rounded-[var(--mat-radius-lg)] px-5 py-3 text-sm font-semibold text-white transition",
          direction === "CREDIT"
            ? "bg-[var(--mat-green-700)] hover:bg-[var(--mat-green-800)]"
            : "bg-[#b94040] hover:bg-[#9d3434]",
          submitting ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        {submitting
          ? "Recording adjustment…"
          : direction === "CREDIT"
            ? "Issue credit"
            : "Record debit"}
      </button>

      <div className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mat-green-700)]">
          Permanent ledger entry
        </p>

        <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
          Every adjustment creates a permanent ledger transaction. Wallet balances
          are never overwritten directly.
        </p>
      </div>
    </form>
  );
}
