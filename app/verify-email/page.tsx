import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ResendVerificationButton from "./ResendVerificationButton";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export default async function VerifyEmailPage() {
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
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.emailVerified) {
    redirect("/dashboard");
  }

  const firstName = user.firstName || "there";

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          <span>My Accent Trainer</span>
          <span>Step 2 of 5</span>
        </div>

        <section className="rounded-[2rem] border border-white bg-white p-7 shadow-xl shadow-slate-200/50 md:p-10">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f8f3] text-3xl">
              ✉️
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#20ad68]">
              Verify your email
            </p>

            <h1 className="mt-3 font-display text-4xl leading-tight text-[#17223b]">
              Check your inbox, {firstName}.
            </h1>

            <p className="mt-5 text-base leading-7 text-gray-600">
              We sent a verification link to:
            </p>

            <p className="mt-2 break-all font-semibold text-[#17223b]">
              {user.email}
            </p>

            <p className="mt-5 text-sm leading-6 text-gray-500">
              Open the message and click the verification link. After your
              email is confirmed, you will choose your Monthly or Annual
              membership plan.
            </p>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl bg-[#f8fafc] p-5 text-sm text-gray-600 md:grid-cols-5">
            <span className="font-semibold text-[#168c56]">✓ Account</span>
            <span className="font-semibold text-[#17223b]">2. Email</span>
            <span>3. Plan</span>
            <span>4. Payment</span>
            <span>5. Trial</span>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            <ResendVerificationButton />

            <div className="mt-6 rounded-2xl border border-gray-100 bg-[#f8fafc] p-5 text-sm leading-6 text-gray-600">
              <p className="font-semibold text-[#17223b]">
                Cannot find the email?
              </p>

              <p className="mt-2">
                Check your Spam, Junk, Promotions, and Updates folders. Make
                sure the email address shown above is correct.
              </p>
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row">
              <Link
                href="/login"
                className="font-semibold text-[#168c56] hover:underline"
              >
                Return to login
              </Link>

              <span className="hidden text-gray-300 sm:inline">•</span>

              <Link
                href="/"
                className="font-semibold text-gray-500 hover:text-[#17223b]"
              >
                Return to homepage
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
