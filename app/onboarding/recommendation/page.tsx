import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { getLearningRecommendation } from "@/lib/onboarding/recommendation";

export default async function RecommendationPage() {
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

  const englishGoal =
    user.profile?.englishGoal?.trim();

  const proficiencyLevel =
    user.profile?.proficiencyLevel?.trim();

  if (!englishGoal || !proficiencyLevel) {
    redirect("/onboarding/assessment");
  }

  const recommendation =
    getLearningRecommendation(
      englishGoal,
      proficiencyLevel,
    );

  const firstName =
    user.firstName?.trim() || "there";

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          <span>My Accent Trainer</span>
          <span>Your recommendation</span>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl shadow-slate-200/50">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-7 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#20ad68]">
                {recommendation.eyebrow}
              </p>

              <h1 className="mt-3 font-display text-4xl leading-tight text-[#17223b] md:text-5xl">
                {firstName}, here is where Nina recommends you begin.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">
                {recommendation.summary}
              </p>

              <div className="mt-8 rounded-3xl border border-[#d9f1e5] bg-[#f3fbf7] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#168c56]">
                  Your starting point
                </p>

                <p className="mt-3 text-base leading-7 text-[#284239]">
                  {recommendation.firstFocus}
                </p>
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold text-[#17223b]">
                  Nina will prioritize:
                </p>

                <div className="mt-4 space-y-3">
                  {recommendation.priorities.map(
                    (priority) => (
                      <div
                        key={priority}
                        className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-[#fbfcfd] px-5 py-4"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e4f7ed] text-sm font-bold text-[#168c56]">
                          ✓
                        </span>

                        <span className="text-sm leading-6 text-gray-600">
                          {priority}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <aside className="bg-gradient-to-br from-[#0f2a20] to-[#17223b] p-7 text-white md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7fe3ac]">
                Your learning profile
              </p>

              <div className="mt-8 space-y-5">
                <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                    Main goal
                  </p>

                  <p className="mt-2 font-display text-2xl">
                    {recommendation.eyebrow}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                    Starting level
                  </p>

                  <p className="mt-2 font-display text-2xl">
                    {proficiencyLevel}
                  </p>
                </div>
              </div>

              <p className="mt-8 text-sm leading-6 text-white/70">
                This is your starting recommendation. As you practice,
                Nina can use your performance to make your coaching
                more specific over time.
              </p>

              <Link
                href="/onboarding/plan"
                className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#20ad68] px-6 py-3 text-center font-semibold text-white transition hover:bg-[#27bd74]"
              >
                Continue to membership
              </Link>

              <Link
                href="/dashboard/settings"
                className="mt-4 inline-flex w-full items-center justify-center text-sm font-semibold text-white/70 transition hover:text-white"
              >
                Update my learning profile
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
