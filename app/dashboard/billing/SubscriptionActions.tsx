"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  status: string | null;
};

export default function SubscriptionActions({
  status,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [confirmingCancel, setConfirmingCancel] =
    useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const canCancel =
    status === "trialing" ||
    status === "active";

  const canResume =
    status === "cancel_scheduled";

  async function runAction(
    endpoint:
      | "/api/billing/cancel"
      | "/api/billing/resume",
  ) {
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
          data.message ||
            "We could not update your subscription.",
        );
        return;
      }

      if (endpoint === "/api/billing/cancel") {
        setConfirmingCancel(false);
        setMessage(
          "Cancellation scheduled. You will keep Premium access until the end of your current billing period.",
        );
      } else {
        setMessage(
          "Your subscription will continue normally.",
        );
      }

      router.refresh();
    } catch (cause) {
      console.error(
        "SUBSCRIPTION_ACTION_FAILED",
        cause,
      );

      setError(true);
      setMessage(
        "We could not reach the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!canCancel && !canResume) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-[#dbece4] pt-4">
      {message ? (
        <p
          className={[
            "mb-3 rounded-lg px-3 py-2 text-sm",
            error
              ? "bg-[#fff4ed] text-[#b54708]"
              : "bg-[#eaf7f1] text-[#2e7d5b]",
          ].join(" ")}
        >
          {message}
        </p>
      ) : null}

      {canCancel && !confirmingCancel ? (
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            setConfirmingCancel(true)
          }
          className="text-sm font-semibold text-[#9c3f3f] hover:text-[#7f3030] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel subscription
        </button>
      ) : null}

      {canCancel && confirmingCancel ? (
        <div className="rounded-xl border border-[#f0d2d2] bg-[#fffafa] p-4">
          <p className="text-sm font-semibold text-[#7f3030]">
            Cancel your subscription?
          </p>

          <p className="mt-1 text-sm leading-6 text-[#6b4b4b]">
            You will not be charged again after this billing
            period. Your Premium access will remain available
            until the end of the current period.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                void runAction(
                  "/api/billing/cancel",
                )
              }
              className="rounded-lg bg-[#9c3f3f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7f3030] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Scheduling cancellation..."
                : "Yes, cancel subscription"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                setConfirmingCancel(false)
              }
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#42506a] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Keep my subscription
            </button>
          </div>
        </div>
      ) : null}

      {canResume ? (
        <div>
          <p className="mb-3 text-sm leading-6 text-[#42506a]">
            Your subscription is scheduled to end. You can
            keep it active before the cancellation date.
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void runAction(
                "/api/billing/resume",
              )
            }
            className="rounded-lg bg-[#20ad68] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Restoring subscription..."
              : "Keep subscription"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
