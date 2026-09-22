"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type RedemptionState =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success"; message: string };

export default function RedeemPromo() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<RedemptionState>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const normalizedCode = code.trim();

    if (!normalizedCode) {
      setState({
        kind: "error",
        message: "Enter a promo code before redeeming.",
      });
      return;
    }

    setSubmitting(true);
    setState({ kind: "idle" });

    try {
      const response = await fetch("/api/wallet/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: normalizedCode,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || data.message || "Unable to redeem this promo code.",
        );
      }

      setState({
        kind: "success",
        message:
          data.message ||
          "Promo code redeemed. Your wallet balance has been updated.",
      });

      setCode("");
      router.refresh();
    } catch (err) {
      setState({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Unable to redeem this promo code. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-6 shadow-[var(--mat-shadow-sm)] sm:p-7">
      <div>
        <p className="mat-eyebrow">Promo credit</p>

        <h2 className="mt-1 font-display text-2xl text-[var(--mat-ink)]">
          Redeem a promo code
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
          If you have an eligible MyAccentTrainer promo code, redeem it here.
          Any wallet credit issued by the code will appear in your wallet
          activity.
        </p>
      </div>

      <form onSubmit={submit} className="mt-6">
        <label
          htmlFor="wallet-promo-code"
          className="text-sm font-semibold text-[var(--mat-ink)]"
        >
          Promo code
        </label>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="wallet-promo-code"
            type="text"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);

              if (state.kind !== "idle") {
                setState({ kind: "idle" });
              }
            }}
            autoComplete="off"
            spellCheck={false}
            disabled={submitting}
            placeholder="Enter your code"
            className="mat-input min-w-0 flex-1 uppercase"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mat-button mat-button-secondary shrink-0 justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Redeeming…" : "Redeem code"}
          </button>
        </div>

        <p className="mt-2 text-xs leading-5 text-[var(--mat-muted-light)]">
          Promo eligibility and credit value are determined when the code is
          redeemed.
        </p>

        {state.kind === "error" && (
          <div
            role="alert"
            className="mt-4 rounded-[var(--mat-radius-lg)] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
          >
            {state.message}
          </div>
        )}

        {state.kind === "success" && (
          <div
            role="status"
            className="mt-4 rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-4 text-sm leading-6 text-[var(--mat-green-800)]"
          >
            {state.message}
          </div>
        )}
      </form>
    </section>
  );
}
