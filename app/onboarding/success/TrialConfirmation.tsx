"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type EnrollmentStatus = {
  authenticated: boolean;
  ready: boolean;
  enrollmentState?: string;
  subscriptionStatus?: string | null;
  selectedPlanId?: string | null;
  planName?: string | null;
  planRenewsAt?: string | null;
};

export default function TrialConfirmation() {
  const [status, setStatus] = useState<EnrollmentStatus | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function checkStatus() {
      try {
        const response = await fetch("/api/onboarding/status", {
          cache: "no-store",
        });

        const data = (await response.json()) as EnrollmentStatus;

        if (cancelled) return;

        setStatus(data);

        if (!data.ready && attempts < 15) {
          timeout = setTimeout(() => {
            setAttempts((current) => current + 1);
          }, 1500);
        }
      } catch {
        if (!cancelled && attempts < 15) {
          timeout = setTimeout(() => {
            setAttempts((current) => current + 1);
          }, 1500);
        }
      }
    }

    checkStatus();

    return () => {
      cancelled = true;

      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [attempts]);

  if (!status?.ready) {
    return (
      <div className="mt-8 rounded-3xl border border-[#d7f2e7] bg-[#f4fbf7] p-7 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#bcebd2] border-t-[#20ad68]" />

        <h2 className="mt-5 font-display text-2xl text-[#17223b]">
          Finalizing your Premium trial
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600">
          Stripe has returned you safely to MyAccentTrainer. We are confirming
          your payment method and activating your dashboard access.
        </p>

        {attempts >= 15 ? (
          <div className="mt-6">
            <p className="text-sm text-amber-700">
              Confirmation is taking longer than expected. Your payment method
              may still be processing.
            </p>

            <button
              type="button"
              onClick={() => setAttempts(0)}
              className="mt-4 rounded-xl border border-[#20ad68] px-5 py-3 text-sm font-semibold text-[#168c56]"
            >
              Check again
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  const firstChargeDate = new Date();
  firstChargeDate.setDate(firstChargeDate.getDate() + 2);

  const firstChargeDateLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(firstChargeDate);

  const paymentLabel =
    status.selectedPlanId === "annual" ? "$199/year" : "$19.99/month";

  return (
    <div className="mt-8 rounded-3xl border border-[#d7f2e7] bg-[#f4fbf7] p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#20ad68] text-xl text-white">
          ✓
        </span>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#168c56]">
            Enrollment complete
          </p>

          <h2 className="font-display text-2xl text-[#17223b]">
            Your Premium trial is active.
          </h2>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Plan
          </p>
          <p className="mt-2 font-semibold text-[#17223b]">
            {status.planName || "Premium Membership"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Due today
          </p>
          <p className="mt-2 font-semibold text-[#168c56]">$0.00</p>
        </div>

        <div className="rounded-2xl bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            First payment
          </p>
          <p className="mt-2 font-semibold text-[#17223b]">
            {paymentLabel}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Approximately {firstChargeDateLabel}
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm leading-6 text-gray-600">
        You now have full access to Premium lessons, practice tools, progress
        tracking, and coaching with Nina. You may manage or cancel your
        subscription before the trial ends.
      </p>

      <Link
        href="/dashboard"
        className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#20ad68] px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357]"
      >
        Enter My Dashboard
      </Link>
    </div>
  );
}
