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
  billingLabel?: string | null;
  planRenewsAt?: string | null;
};

export default function TrialConfirmation() {
  const [status, setStatus] =
    useState<EnrollmentStatus | null>(null);
  const [attempts, setAttempts] =
    useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeout:
      | ReturnType<typeof setTimeout>
      | undefined;

    async function checkStatus() {
      try {
        const response = await fetch(
          "/api/onboarding/status",
          {
            cache: "no-store",
          },
        );

        const data =
          (await response.json()) as EnrollmentStatus;

        if (cancelled) {
          return;
        }

        setStatus(data);

        if (!data.ready && attempts < 15) {
          timeout = setTimeout(() => {
            setAttempts(
              (current) => current + 1,
            );
          }, 1500);
        }
      } catch {
        if (!cancelled && attempts < 15) {
          timeout = setTimeout(() => {
            setAttempts(
              (current) => current + 1,
            );
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
      <div className="rounded-2xl border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6 text-center sm:p-8">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[var(--mat-green-200)] border-t-[var(--mat-green-600)]" />

        <p className="mat-eyebrow mt-6">
          Almost there
        </p>

        <h2 className="mt-2 font-display text-3xl leading-tight text-[var(--mat-ink)]">
          Finalizing your Premium trial
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--mat-muted)]">
          Stripe has returned you safely to MyAccentTrainer. We&apos;re
          confirming your payment method and activating your dashboard access.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-xl border border-[var(--mat-border)] bg-white px-4 py-3 text-xs leading-5 text-[var(--mat-muted)]">
          You can stay on this page while we finish confirming your enrollment.
        </div>

        {attempts >= 15 ? (
          <div className="mt-7 border-t border-[var(--mat-border-green)] pt-6">
            <p className="text-sm leading-6 text-[#805c25]">
              Confirmation is taking longer than expected. Your payment method
              may still be processing.
            </p>

            <button
              type="button"
              onClick={() => setAttempts(0)}
              className="mat-button mat-button-secondary mt-4"
            >
              Check again
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  const firstChargeDateLabel =
    status.planRenewsAt
      ? new Intl.DateTimeFormat(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          },
        ).format(
          new Date(status.planRenewsAt),
        )
      : null;

  return (
    <div className="rounded-2xl border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--mat-green-600)] text-2xl font-bold text-white shadow-[var(--mat-shadow-sm)]">
          ✓
        </span>

        <p className="mat-eyebrow mt-5">
          Enrollment complete
        </p>

        <h2 className="mt-2 font-display text-3xl leading-tight text-[var(--mat-ink)]">
          Your Premium trial is active.
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--mat-muted)]">
          Your personalized workspace is ready. You can begin learning now.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--mat-border)] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted-light)]">
            Plan
          </p>

          <p className="mt-2 font-bold text-[var(--mat-ink)]">
            {status.planName ||
              "Premium Membership"}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--mat-border)] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted-light)]">
            Due today
          </p>

          <p className="mt-2 font-bold text-[var(--mat-green-700)]">
            $0.00
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--mat-border)] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mat-muted-light)]">
            First payment
          </p>

          <p className="mt-2 font-bold text-[var(--mat-ink)]">
            {status.billingLabel ||
              "Your selected membership"}
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--mat-muted)]">
            {firstChargeDateLabel
              ? `Approximately ${firstChargeDateLabel}`
              : "After your trial"}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--mat-border)] bg-white p-5 text-sm leading-7 text-[var(--mat-muted)]">
        You now have access to Premium lessons, practice tools, progress
        tracking, and coaching with Nina. You may manage or cancel your
        membership before the trial ends.
      </div>

      <Link
        href="/dashboard"
        className="mat-button mat-button-primary mt-7 w-full"
      >
        Enter My Dashboard
      </Link>
    </div>
  );
}
