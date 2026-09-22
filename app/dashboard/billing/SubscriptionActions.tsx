"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  canCancelSubscription,
  canResumeSubscription,
  type EnrollmentState,
} from "@/lib/auth/enrollment";

type Props = {
  enrollmentState: EnrollmentState;
};

export default function SubscriptionActions({
  enrollmentState,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const canCancel = canCancelSubscription(enrollmentState);
  const canResume = canResumeSubscription(enrollmentState);

  async function runAction(
    endpoint: "/api/billing/cancel" | "/api/billing/resume",
  ) {
    if (loading) return;

    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "same-origin",
      });

      const data = (await response.json()) as {
        ok?: boolean;
        status?: string;
        message?: string;
      };

      if (!response.ok) {
        setError(true);
        setMessage(
          data.message || "We could not update your subscription.",
        );
        return;
      }

      if (endpoint === "/api/billing/cancel") {
        setConfirmingCancel(false);
        setMessage(
          "Cancellation scheduled. You will keep Premium access until the end of your current billing period.",
        );
      } else {
        setMessage("Your subscription will continue normally.");
      }

      router.refresh();
    } catch (cause) {
      console.error("SUBSCRIPTION_ACTION_FAILED", cause);

      setError(true);
      setMessage("We could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!canCancel && !canResume) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-[var(--mat-border-green)] pt-5">
      {message ? (
        <div
          role={error ? "alert" : "status"}
          className={
            "mb-4 rounded-[var(--mat-radius-lg)] border p-4 text-sm leading-6 " +
            (error
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-[var(--mat-border-green)] bg-[var(--mat-green-50)] text-[var(--mat-green-800)]")
          }
        >
          {message}
        </div>
      ) : null}

      {canCancel && !confirmingCancel ? (
        <div>
          <p className="text-xs leading-5 text-[var(--mat-muted)]">
            You can schedule cancellation without ending your current Premium
            access immediately.
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() => setConfirmingCancel(true)}
            className="mt-3 text-sm font-semibold text-[#9c3f3f] hover:text-[#7f3030] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel subscription
          </button>
        </div>
      ) : null}

      {canCancel && confirmingCancel ? (
        <div className="rounded-[var(--mat-radius-lg)] border border-red-200 bg-red-50/50 p-5">
          <p className="text-sm font-semibold text-[#7f3030]">
            Cancel your subscription?
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
            You will not be charged again after this billing period. Your
            Premium access will remain available until the end of the current
            period.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void runAction("/api/billing/cancel")}
              className="rounded-[var(--mat-radius-lg)] bg-[#9c3f3f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7f3030] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Scheduling cancellation…"
                : "Yes, cancel subscription"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setConfirmingCancel(false)}
              className="mat-button mat-button-secondary"
            >
              Keep my subscription
            </button>
          </div>
        </div>
      ) : null}

      {canResume ? (
        <div className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5">
          <p className="text-sm font-semibold text-[var(--mat-ink)]">
            Keep your Premium membership
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
            Your subscription is scheduled to end. You can keep it active
            before the cancellation date.
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() => void runAction("/api/billing/resume")}
            className="mat-button mat-button-primary mt-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Restoring subscription…" : "Keep subscription"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
