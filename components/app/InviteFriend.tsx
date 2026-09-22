"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  referralCode: string;
};

type InviteState =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success"; message: string };

export default function InviteFriend({ referralCode }: Props) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copying, setCopying] = useState(false);
  const [state, setState] = useState<InviteState>({ kind: "idle" });

  const referralLink = useMemo(() => {
    if (typeof window === "undefined") {
      return `https://myaccenttrainer.com/register?ref=${encodeURIComponent(
        referralCode,
      )}`;
    }

    return `${window.location.origin}/register?ref=${encodeURIComponent(
      referralCode,
    )}`;
  }, [referralCode]);

  async function copyReferralLink() {
    if (copying) return;

    setCopying(true);
    setState({ kind: "idle" });

    try {
      await navigator.clipboard.writeText(referralLink);

      setState({
        kind: "success",
        message: "Referral link copied.",
      });
    } catch {
      setState({
        kind: "error",
        message: "Unable to copy the referral link on this device.",
      });
    } finally {
      setCopying(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setState({
        kind: "error",
        message: "Enter the email address of the person you want to invite.",
      });
      return;
    }

    setSubmitting(true);
    setState({ kind: "idle" });

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || data.message || "Unable to send this invitation.",
        );
      }

      setEmail("");

      setState({
        kind: "success",
        message: data.message || "Invitation sent.",
      });

      router.refresh();
    } catch (err) {
      setState({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Unable to send this invitation. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <label
          htmlFor="referral-link"
          className="text-sm font-semibold text-[var(--mat-ink)]"
        >
          Personal referral link
        </label>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="referral-link"
            type="text"
            value={referralLink}
            readOnly
            aria-label="Personal referral link"
            className="mat-input min-w-0 flex-1"
          />

          <button
            type="button"
            onClick={copyReferralLink}
            disabled={copying}
            className="mat-button mat-button-secondary shrink-0 justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copying ? "Copying…" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-[var(--mat-border)]" />
        <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mat-muted-light)]">
          or invite by email
        </span>
        <div className="h-px flex-1 bg-[var(--mat-border)]" />
      </div>

      <form onSubmit={submit}>
        <label
          htmlFor="referral-email"
          className="text-sm font-semibold text-[var(--mat-ink)]"
        >
          Friend&apos;s email
        </label>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="referral-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);

              if (state.kind !== "idle") {
                setState({ kind: "idle" });
              }
            }}
            autoComplete="email"
            required
            disabled={submitting}
            placeholder="friend@example.com"
            className="mat-input min-w-0 flex-1"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mat-button mat-button-primary shrink-0 justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send invitation"}
          </button>
        </div>

        <p className="mt-2 text-xs leading-5 text-[var(--mat-muted-light)]">
          Sending an invitation does not itself issue referral credit.
        </p>
      </form>

      {state.kind === "error" && (
        <div
          role="alert"
          className="rounded-[var(--mat-radius-lg)] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
        >
          {state.message}
        </div>
      )}

      {state.kind === "success" && (
        <div
          role="status"
          className="rounded-[var(--mat-radius-lg)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-4 text-sm leading-6 text-[var(--mat-green-800)]"
        >
          {state.message}
        </div>
      )}
    </div>
  );
}
