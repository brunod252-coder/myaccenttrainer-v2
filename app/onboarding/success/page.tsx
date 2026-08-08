import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import TrialConfirmation from "./TrialConfirmation";
import { verifyAuthToken } from "@/lib/jwt";

export default async function OnboardingSuccessPage() {
  const token = (await cookies()).get("mat_session")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    verifyAuthToken(token);
  } catch {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          <span>My Accent Trainer</span>
          <span>Step 5 of 5</span>
        </div>

        <section className="rounded-[2rem] border border-white bg-white p-7 shadow-xl shadow-slate-200/50 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#20ad68]">
            Welcome to Premium
          </p>

          <h1 className="mt-3 font-display text-4xl leading-tight text-[#17223b]">
            Your learning journey begins now.
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-600">
            We are completing your enrollment and preparing your personalized
            MyAccentTrainer workspace.
          </p>

          <TrialConfirmation />
        </section>
      </div>
    </main>
  );
}
