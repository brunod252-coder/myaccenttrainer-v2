import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AssessmentForm from "./AssessmentForm";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export default async function OnboardingAssessmentPage() {
  const token =
    (await cookies()).get("mat_session")?.value;

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
      firstName: true,
      emailVerified: true,
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

  if (!user.emailVerified) {
    redirect("/verify-email");
  }

  const profileComplete =
    Boolean(user.profile?.englishGoal?.trim()) &&
    Boolean(user.profile?.proficiencyLevel?.trim());

  if (profileComplete) {
    redirect("/onboarding/plan");
  }

  const firstName =
    user.firstName?.trim() || "there";

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          <span>My Accent Trainer</span>
          <span>Step 3 of 6</span>
        </div>

        <section className="rounded-[2rem] border border-white bg-white p-7 shadow-xl shadow-slate-200/50 md:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#20ad68]">
              Free learning assessment
            </p>

            <h1 className="mt-3 font-display text-4xl leading-tight text-[#17223b] md:text-5xl">
              Tell Nina what you want English to do for you, {firstName}.
            </h1>

            <p className="mt-5 text-base leading-7 text-gray-600">
              Your learning path should begin with your goal—not
              with a payment page. These two questions give Nina
              the starting context she needs to make your practice
              more relevant from the beginning.
            </p>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl bg-[#f8fafc] p-5 text-sm text-gray-600 md:grid-cols-6">
            <span className="font-semibold text-[#168c56]">
              ✓ Account
            </span>
            <span className="font-semibold text-[#168c56]">
              ✓ Email
            </span>
            <span className="font-semibold text-[#17223b]">
              3. Assessment
            </span>
            <span>4. Plan</span>
            <span>5. Payment</span>
            <span>6. Trial</span>
          </div>

          <div className="mt-10">
            <AssessmentForm
              initialGoal={
                user.profile?.englishGoal
              }
              initialLevel={
                user.profile?.proficiencyLevel
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}
