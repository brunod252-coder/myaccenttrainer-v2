import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import CheckoutButton from "./CheckoutButton";
import { Mic } from "@/components/ui/icons";
import {
  canChoosePlan,
  getEnrollmentRedirect,
  getEnrollmentState,
} from "@/lib/auth/enrollment";
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
      profile: {
        select: {
          englishGoal: true,
          proficiencyLevel: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const enrollmentState = getEnrollmentState({
    emailVerified: user.emailVerified,
    englishGoal: user.profile?.englishGoal,
    proficiencyLevel: user.profile?.proficiencyLevel,
    subscriptionStatus: user.subscriptionStatus,
  });

  if (canChoosePlan(enrollmentState)) {
    redirect("/onboarding/plan");
  }

  if (
    enrollmentState !==
    "PAYMENT_METHOD_REQUIRED"
  ) {
    const destination =
      getEnrollmentRedirect(
        enrollmentState,
      );

    redirect(
      destination ?? "/dashboard",
    );
  }

  if (!user.selectedPlanId) {
    redirect("/onboarding/plan");
  }

  const plan = getPlan(user.selectedPlanId);

  if (!plan) {
    redirect("/onboarding/plan");
  }

  const planPrice =
    formatMoney(plan.priceMinor);

  const billingLabel =
    plan.interval === "month"
      ? `${planPrice}/month`
      : `${planPrice}/year`;

  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 2);

  const trialEndLabel =
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(trialEnds);

  const firstName =
    user.firstName || "there";

  return (
    <main className="min-h-screen bg-[var(--mat-green-50)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--mat-green-600)] text-white">
              <Mic className="h-[18px] w-[18px]" />
            </span>

            <span className="text-sm font-extrabold tracking-[-0.02em] text-[var(--mat-ink)]">
              MyAccentTrainer
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted-light)]">
            Step 5 of 6
          </span>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-[var(--mat-border-green)] bg-white shadow-[var(--mat-shadow-lg)]">
          <div className="border-b border-[var(--mat-border)] p-6 sm:p-8 md:p-10">
            <div className="max-w-2xl">
              <p className="mat-eyebrow">
                Complete your enrollment
              </p>

              <h1 className="mat-page-title">
                One last step, {firstName}.
              </h1>

              <p className="mt-5 text-sm leading-7 text-[var(--mat-muted)]">
                Add a valid payment method to activate your two-day Premium
                trial. You&apos;ll receive Premium access immediately and
                won&apos;t be charged today.
              </p>
            </div>

            <div className="mt-8 grid gap-2 rounded-2xl border border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 text-xs sm:grid-cols-3 md:grid-cols-6">
              <span className="font-bold text-[var(--mat-green-700)]">
                ✓ Account
              </span>
              <span className="font-bold text-[var(--mat-green-700)]">
                ✓ Email
              </span>
              <span className="font-bold text-[var(--mat-green-700)]">
                ✓ Assessment
              </span>
              <span className="font-bold text-[var(--mat-green-700)]">
                ✓ Membership
              </span>
              <span className="font-bold text-[var(--mat-ink)]">
                5. Payment
              </span>
              <span className="text-[var(--mat-muted)]">
                6. Trial
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-6 sm:p-8 md:p-10">
              <div className="rounded-2xl border border-[var(--mat-border)] bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="mat-eyebrow">
                      Selected membership
                    </p>

                    <h2 className="mt-2 font-display text-3xl text-[var(--mat-ink)]">
                      Premium {plan.name}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                      {plan.blurb}
                    </p>
                  </div>

                  {plan.featured ? (
                    <span className="mat-pill bg-[var(--mat-ink)] text-white">
                      Best value
                    </span>
                  ) : null}
                </div>

                <div className="mt-7 space-y-3 border-t border-[var(--mat-border)] pt-6">
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
                    <span>Full Premium access throughout your trial</span>
                  </p>

                  <p className="flex items-start gap-2.5 text-sm leading-6 text-[var(--mat-muted)]">
                    <span className="font-bold text-[var(--mat-green-600)]">
                      ✓
                    </span>
                    <span>Cancel before the trial ends to avoid the first charge</span>
                  </p>
                </div>

                <Link
                  href="/onboarding/plan"
                  className="mt-6 inline-flex text-sm font-bold text-[var(--mat-green-700)] transition hover:text-[var(--mat-green-800)]"
                >
                  Change membership plan
                </Link>
              </div>
            </div>

            <aside className="bg-[var(--mat-green-800)] p-6 text-white sm:p-8 md:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--mat-green-200)]">
                Order summary
              </p>

              <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.07] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl">
                      Premium {plan.name}
                    </p>

                    <p className="mt-1 text-sm text-white/65">
                      Two-day free trial
                    </p>
                  </div>

                  <p className="font-display text-xl">
                    {billingLabel}
                  </p>
                </div>

                <div className="mt-8 space-y-5 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/70">
                      Due today
                    </span>

                    <strong className="text-2xl text-[var(--mat-green-200)]">
                      $0.00
                    </strong>
                  </div>

                  <div className="flex items-start justify-between gap-6">
                    <span className="text-white/70">
                      First charge
                    </span>

                    <span className="text-right font-semibold">
                      {billingLabel}
                      <br />
                      <span className="text-xs font-normal text-white/60">
                        on approximately {trialEndLabel}
                      </span>
                    </span>
                  </div>

                  {plan.savingsLabel ? (
                    <div className="rounded-xl bg-white/[0.07] px-4 py-3 text-sm text-[var(--mat-green-200)]">
                      {plan.savingsLabel} with annual billing.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-sm leading-6 text-white/75">
                <p className="font-bold text-white">
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
