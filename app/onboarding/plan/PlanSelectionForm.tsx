"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PLANS, formatMoney } from "@/lib/payments/plans";

export default function PlanSelectionForm({
  initialPlanId,
}: {
  initialPlanId?: string | null;
}) {
  const router = useRouter();

  const [selectedPlanId, setSelectedPlanId] = useState(
    initialPlanId || "monthly",
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function continueEnrollment() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/onboarding/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlanId,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        next?: string;
      };

      if (!response.ok) {
        setMessage(
          data.message ||
            "We could not save your selection.",
        );
        return;
      }

      router.push(
        data.next || "/onboarding/payment",
      );
      router.refresh();
    } catch {
      setMessage(
        "We could not reach the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2">
        {PLANS.map((plan) => {
          const selected =
            selectedPlanId === plan.id;

          const price =
            formatMoney(plan.priceMinor);

          const cadence =
            plan.interval === "month"
              ? "/month"
              : "/year";

          const effective =
            plan.interval === "year"
              ? `${formatMoney(plan.perMonthMinor)}/month effective`
              : null;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() =>
                setSelectedPlanId(plan.id)
              }
              aria-pressed={selected}
              className={[
                "group relative rounded-2xl border p-6 text-left transition",
                selected
                  ? "border-[var(--mat-green-500)] bg-[var(--mat-green-50)] shadow-[var(--mat-shadow-md)] ring-2 ring-[var(--mat-focus)]"
                  : "border-[var(--mat-border)] bg-white hover:border-[var(--mat-border-green)] hover:shadow-[var(--mat-shadow-sm)]",
              ].join(" ")}
            >
              {plan.featured ? (
                <span className="absolute right-5 top-5 rounded-full bg-[var(--mat-ink)] px-3 py-1 text-[11px] font-bold text-white">
                  Best value
                </span>
              ) : null}

              <div className="flex items-center gap-3 pr-20">
                <span
                  className={[
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
                    selected
                      ? "border-[var(--mat-green-600)] bg-[var(--mat-green-600)]"
                      : "border-[var(--mat-border-strong)] bg-white group-hover:border-[var(--mat-green-400)]",
                  ].join(" ")}
                >
                  {selected ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </span>

                <p className="font-display text-xl text-[var(--mat-ink)]">
                  Premium {plan.name}
                </p>
              </div>

              <div className="mt-6 flex items-end gap-1">
                <span className="font-display text-4xl tracking-[-0.025em] text-[var(--mat-ink)]">
                  {price}
                </span>

                <span className="pb-1 text-sm text-[var(--mat-muted)]">
                  {cadence}
                </span>
              </div>

              {effective ? (
                <p className="mt-2 text-sm font-bold text-[var(--mat-green-700)]">
                  {effective}
                </p>
              ) : null}

              {plan.savingsLabel ? (
                <p className="mt-1 text-xs font-semibold text-[var(--mat-green-700)]">
                  {plan.savingsLabel}
                </p>
              ) : null}

              <p className="mt-4 text-sm leading-6 text-[var(--mat-muted)]">
                {plan.blurb}
              </p>

              <div className="mt-5 space-y-2.5 border-t border-[var(--mat-border)] pt-5">
                {plan.perks.map((perk) => (
                  <p
                    key={perk}
                    className="flex items-start gap-2.5 text-sm leading-6 text-[var(--mat-muted)]"
                  >
                    <span className="font-bold text-[var(--mat-green-600)]">
                      ✓
                    </span>
                    <span>{perk}</span>
                  </p>
                ))}

                <p className="flex items-start gap-2.5 text-sm leading-6 text-[var(--mat-muted)]">
                  <span className="font-bold text-[var(--mat-green-600)]">
                    ✓
                  </span>
                  <span>Two-day free trial</span>
                </p>

                <p className="flex items-start gap-2.5 text-sm leading-6 text-[var(--mat-muted)]">
                  <span className="font-bold text-[var(--mat-green-600)]">
                    ✓
                  </span>
                  <span>Payment method required to begin trial</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {message ? (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-[#efcccc] bg-[var(--mat-red-soft)] px-4 py-3 text-sm leading-6 text-[var(--mat-red)]"
        >
          {message}
        </div>
      ) : null}

      <button
        type="button"
        onClick={continueEnrollment}
        disabled={loading}
        className="mat-button mat-button-primary mt-7 w-full"
      >
        {loading
          ? "Saving your plan…"
          : "Continue to payment method"}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-[var(--mat-muted)]">
        You will not be charged today. Your selected plan begins automatically
        after the two-day trial unless canceled beforehand.
      </p>
    </div>
  );
}
