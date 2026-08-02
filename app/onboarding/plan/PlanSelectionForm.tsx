"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PlanOption = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  badge?: string;
  effective?: string;
};

const plans: PlanOption[] = [
  {
    id: "monthly",
    name: "Premium Monthly",
    price: "$19.99",
    cadence: "/month",
    description: "Flexible monthly access. Cancel anytime.",
  },
  {
    id: "annual",
    name: "Premium Annual",
    price: "$199",
    cadence: "/year",
    description: "Save $40.88 compared with monthly billing.",
    badge: "Best value",
    effective: "$16.58/month effective",
  },
];

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
        body: JSON.stringify({ planId: selectedPlanId }),
      });

      const data = (await response.json()) as {
        message?: string;
        next?: string;
      };

      if (!response.ok) {
        setMessage(data.message || "We could not save your selection.");
        return;
      }

      router.push(data.next || "/onboarding/payment");
      router.refresh();
    } catch {
      setMessage("We could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((plan) => {
          const selected = selectedPlanId === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className={[
                "relative rounded-3xl border p-6 text-left transition",
                selected
                  ? "border-[#20ad68] bg-[#f4fbf7] shadow-md ring-2 ring-[#20ad68]/15"
                  : "border-gray-200 bg-white hover:border-[#8bd8b1]",
              ].join(" ")}
            >
              {plan.badge ? (
                <span className="absolute right-5 top-5 rounded-full bg-[#17223b] px-3 py-1 text-xs font-semibold text-white">
                  {plan.badge}
                </span>
              ) : null}

              <div className="flex items-center gap-3">
                <span
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    selected
                      ? "border-[#20ad68] bg-[#20ad68]"
                      : "border-gray-300 bg-white",
                  ].join(" ")}
                >
                  {selected ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </span>

                <p className="font-display text-xl text-[#17223b]">
                  {plan.name}
                </p>
              </div>

              <div className="mt-6 flex items-end gap-1">
                <span className="font-display text-4xl text-[#17223b]">
                  {plan.price}
                </span>
                <span className="pb-1 text-sm text-gray-500">
                  {plan.cadence}
                </span>
              </div>

              {plan.effective ? (
                <p className="mt-2 text-sm font-semibold text-[#168c56]">
                  {plan.effective}
                </p>
              ) : null}

              <p className="mt-4 text-sm leading-6 text-gray-600">
                {plan.description}
              </p>

              <div className="mt-5 border-t border-gray-100 pt-5 text-sm text-gray-600">
                <p>✓ Two-day free trial</p>
                <p className="mt-2">✓ Payment method required</p>
                <p className="mt-2">✓ Full Premium access during trial</p>
              </div>
            </button>
          );
        })}
      </div>

      {message ? (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      ) : null}

      <button
        type="button"
        onClick={continueEnrollment}
        disabled={loading}
        className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#20ad68] px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving your plan..." : "Continue to payment method"}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-gray-500">
        You will not be charged today. Your selected plan begins automatically
        after the two-day trial unless canceled beforehand.
      </p>
    </div>
  );
}
