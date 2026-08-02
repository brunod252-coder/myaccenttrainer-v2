import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import PlanSelectionForm from "./PlanSelectionForm";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPlanPage() {
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
    where: { id: payload.userId },
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
    user.subscriptionStatus === "active"
  ) {
    redirect("/dashboard");
  }

  const name = user.firstName || "there";

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          <span>My Accent Trainer</span>
          <span>Step 3 of 5</span>
        </div>

        <section className="rounded-[2rem] border border-white bg-white p-7 shadow-xl shadow-slate-200/50 md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#20ad68]">
              Membership selection
            </p>

            <h1 className="mt-3 font-display text-4xl leading-tight text-[#17223b]">
              Welcome, {name}. Choose how you would like to continue.
            </h1>

            <p className="mt-4 text-base leading-7 text-gray-600">
              Your email is verified. Select Monthly or Annual, then add a
              valid payment method to begin your two-day Premium trial.
            </p>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl bg-[#f8fafc] p-5 text-sm text-gray-600 md:grid-cols-5">
            <span className="font-semibold text-[#168c56]">✓ Account</span>
            <span className="font-semibold text-[#168c56]">✓ Email</span>
            <span className="font-semibold text-[#17223b]">3. Plan</span>
            <span>4. Payment</span>
            <span>5. Trial</span>
          </div>

          <PlanSelectionForm initialPlanId={user.selectedPlanId} />
        </section>
      </div>
    </main>
  );
}
