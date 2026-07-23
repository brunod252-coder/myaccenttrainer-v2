// ── Subscription plan catalog ────────────────────────────────────────
// Plans are defined in code so the pricing UI works with zero setup. Each
// plan can point at a Stripe Price via an environment variable; until those
// are set, the plans still display and checkout shows a friendly "not set up
// yet" message (see app/api/checkout/route.ts).

export type Plan = {
  id: string;
  name: string;
  blurb: string;
  priceMinor: number;      // price in cents for the whole interval
  interval: "month" | "year";
  perMonthMinor: number;   // effective monthly cost, for comparison
  savingsLabel?: string;   // e.g. "Save 33%"
  featured?: boolean;
  stripePriceEnv: string;  // env var holding the Stripe Price ID
  perks: string[];
};

export const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    blurb: "Full access, billed month to month.",
    priceMinor: 2999,
    interval: "month",
    perMonthMinor: 2999,
    stripePriceEnv: "STRIPE_PRICE_ID",
    perks: [
      "Every lesson & sound track",
      "Unlimited feedback from Nina",
      "Progress, streaks & certificates",
      "Cancel anytime",
    ],
  },
  {
    id: "annual",
    name: "Annual",
    blurb: "The same everything — two months free.",
    priceMinor: 29900,
    interval: "year",
    perMonthMinor: 2492,
    savingsLabel: "Save 17%",
    featured: true,
    stripePriceEnv: "STRIPE_PRICE_ID_ANNUAL",
    perks: [
      "Everything in Monthly",
      "Two months free vs. monthly",
      "Priority access to new courses",
      "Best value for serious learners",
    ],
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function formatMoney(minor: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(minor / 100);
}
