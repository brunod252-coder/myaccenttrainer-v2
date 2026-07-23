import CheckoutButton from "@/components/app/CheckoutButton";
import { Check } from "@/components/ui/icons";
import { PLANS, formatMoney } from "@/lib/payments/plans";

type Props = { isActive?: boolean };

export default function PlanTiers({ isActive = false }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={
            "relative rounded-2xl border bg-white p-6 shadow-sm " +
            (plan.featured ? "border-[#20ad68] ring-1 ring-[#20ad68]/20" : "border-gray-100")
          }
        >
          {plan.featured && (
            <span className="absolute right-5 top-5 rounded-full bg-[#e9f8f3] px-2.5 py-1 text-[11px] font-semibold text-[#168c56]">
              Best value
            </span>
          )}
          <h3 className="font-display text-lg text-[#17223b]">{plan.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{plan.blurb}</p>

          <div className="mt-4 flex items-end gap-1">
            <span className="font-display text-3xl text-[#17223b]">{formatMoney(plan.priceMinor)}</span>
            <span className="pb-1 text-sm text-gray-500">/{plan.interval}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {formatMoney(plan.perMonthMinor)}/mo effective
            {plan.savingsLabel ? ` · ${plan.savingsLabel}` : ""}
          </p>

          <ul className="mt-5 space-y-2.5">
            {plan.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#e9f8f3] text-[#20ad68]">
                  <Check className="h-3 w-3" />
                </span>
                {perk}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {isActive ? (
              <p className="rounded-lg border border-[#cdeee1] bg-[#f0faf6] p-3 text-center text-xs font-semibold text-[#168c56]">
                Current plan
              </p>
            ) : (
              <CheckoutButton
                planId={plan.id}
                className={
                  "w-full rounded-lg px-5 py-3 text-sm font-semibold shadow-sm transition disabled:opacity-60 " +
                  (plan.featured
                    ? "bg-[#20ad68] text-white hover:bg-[#169357]"
                    : "border border-[#20ad68] text-[#168c56] hover:bg-[#e9f8f3]")
                }
              >
                Choose {plan.name}
              </CheckoutButton>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
