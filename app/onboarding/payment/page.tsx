import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import CheckoutButton from "./CheckoutButton";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import {
  formatMoney,
  getPlan,
} from "@/lib/payments/plans";

export default async function OnboardingPaymentPage() {
  const token = (await cookies()).get("mat_session")?.value;

  if (!token) {
    redirect("/login");
  }

  let payload;

  try {
    payload = verifyAuthToken(token);
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      email: true,
      firstName: true,
      emailVerified: true,
      selectedPlanId: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!user.emailVerified) {
    redirect("/verify-email");
  }

  if (
    user.subscriptionStatus === "trialing" ||
    user.subscriptionStatus === "active" ||
    user.subscriptionStatus === "cancel_scheduled"
  ) {
    redirect("/dashboard");
  }

  if (!user.selectedPlanId) {
    redirect("/onboarding/plan");
  }

  const plan = getPlan(user.selectedPlanId);

  if (!plan) {
    redirect("/onboarding/plan");
  }

  const planPrice = formatMoney(plan.priceMinor);
  const billingLabel =
    plan.interval === "month" ? `${planPrice}/month` : `${planPrice}/year`;

  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 2);

  const trialEndLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(trialEnds);

  const firstName = user.firstName || "there";

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          <span>My Accent Trainer</span>
          <span>Step 4 of 5</span>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl shadow-slate-200/50">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-7 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#20ad68]">
                Complete your enrollment
              </p>

              <h1 className="mt-3 font-display text-4xl leading-tight text-[#17223b]">
                One last step, {firstName}.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                Add a valid payment method to activate your two-day Premium
                trial. You will receive full Premium access immediately and
                will not be charged today.
              </p>

              <div className="mt-8 grid gap-3 rounded-2xl bg-[#f8fafc] p-5 text-sm text-gray-600 md:grid-cols-5">
                <span className="font-semibold text-[#168c56]">
                  ✓ Account
                </span>
                <span className="font-semibold text-[#168c56]">
                  ✓ Email
                </span>
                <span className="font-semibold text-[#168c56]">
                  ✓ Plan
                </span>
                <span className="font-semibold text-[#17223b]">
                  4. Payment
                </span>
                <span>5. Trial</span>
              </div>

              <div className="mt-8 rounded-3xl border border-gray-100 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#20ad68]">
                      Selected membership
                    </p>

                    <h2 className="mt-2 font-display text-3xl text-[#17223b]">
                      Premium {plan.name}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      {plan.blurb}
                    </p>
                  </div>

                  {plan.featured ? (
                    <span className="rounded-full bg-[#17223b] px-3 py-1 text-xs font-semibold text-white">
                      Best value
                    </span>
                  ) : null}
                </div>

                <div className="mt-7 space-y-4 border-t border-gray-100 pt-6 text-sm text-gray-600">
                  {plan.perks.map((perk) => (
                    <p key={perk}>✓ {perk}</p>
                  ))}

                  <p>✓ Full Premium access throughout your trial</p>
                  <p>✓ Cancel before the trial ends to avoid the first charge</p>
                </div>

                <Link
                  href="/onboarding/plan"
                  className="mt-6 inline-flex text-sm font-semibold text-[#168c56] hover:underline"
                >
                  Change membership plan
                </Link>
              </div>
            </div>

            <aside className="bg-gradient-to-br from-[#0f2a20] to-[#17223b] p-7 text-white md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7fe3ac]">
                Order summary
              </p>

              <div className="mt-8 rounded-3xl bg-white/10 p-6 ring-1 ring-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl">
                      Premium {plan.name}
                    </p>
                    <p className="mt-1 text-sm text-white/65">
                      Two-day free trial
                    </p>
                  </div>

                  <p className="font-display text-xl">{billingLabel}</p>
                </div>

                <div className="mt-8 space-y-5 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Due today</span>
                    <strong className="text-2xl text-[#7fe3ac]">$0.00</strong>
                  </div>

                  <div className="flex items-start justify-between gap-6">
                    <span className="text-white/70">First charge</span>
                    <span className="text-right font-semibold">
                      {billingLabel}
                      <br />
                      <span className="text-xs font-normal text-white/60">
                        on approximately {trialEndLabel}
                      </span>
                    </span>
                  </div>

                  {plan.interval === "year" ? (
                    <div className="rounded-xl bg-[#7fe3ac]/10 px-4 py-3 text-sm text-[#b9f4d2]">
                      Annual billing saves $40.88 compared with paying monthly.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-white/5 p-5 text-sm leading-6 text-white/75">
                <p className="font-semibold text-white">
                  Your card will not be charged today.
                </p>

                <p className="mt-2">
                  Stripe will verify and securely save your payment method.
                  Your selected membership starts automatically after the
                  two-day trial unless you cancel beforehand.
                </p>
              </div>

              <div className="mt-7">
                <CheckoutButton />
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
