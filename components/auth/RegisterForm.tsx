"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  "French",
  "Spanish",
  "Mandarin",
  "Hindi",
  "Arabic",
  "Portuguese",
  "Korean",
  "Vietnamese",
  "Other",
];

export default function RegisterForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");

    // The referral code originates from the browser URL after hydration.
    if (r) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReferralCode(r);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      countryOfResidence: String(formData.get("countryOfResidence") || ""),
      nativeLanguage: String(formData.get("nativeLanguage") || ""),
      referralCode: referralCode || undefined,
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setIsError(true);
      setMessage(data.message || "Registration failed.");
      setIsSubmitting(false);
      return;
    }

    router.push("/verify-email");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {referralCode ? (
        <div className="rounded-xl border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] px-4 py-3 text-sm leading-6 text-[var(--mat-green-700)]">
          <span className="font-bold">You were invited.</span>{" "}
          Your referral is attached to this account. Eligible referral rewards
          are added as learning credit after the qualifying subscription payment.
        </div>
      ) : null}

      {message ? (
        <div
          role={isError ? "alert" : "status"}
          className={[
            "rounded-xl border px-4 py-3 text-sm leading-6",
            isError
              ? "border-[#efcccc] bg-[var(--mat-red-soft)] text-[var(--mat-red)]"
              : "border-[var(--mat-border-green)] bg-[var(--mat-green-50)] text-[var(--mat-green-700)]",
          ].join(" ")}
        >
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="First name"
          name="firstName"
          autoComplete="given-name"
        />

        <Field
          label="Last name"
          name="lastName"
          autoComplete="family-name"
        />
      </div>

      <Field
        label="Email address"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
      />

      <Field
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="Create a password"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Country of residence"
          name="countryOfResidence"
          autoComplete="country-name"
          placeholder="e.g. United States"
        />

        <label className="mat-label">
          Native language

          <select
            name="nativeLanguage"
            defaultValue=""
            className="mat-select mt-2"
          >
            <option value="" disabled>
              Select…
            </option>

            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mat-button mat-button-primary mt-2 w-full"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-xs leading-5 text-[var(--mat-muted)]">
        After creating your account, we&apos;ll verify your email and personalize
        your learning path.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="mat-label">
      {label}

      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mat-input mt-2"
      />
    </label>
  );
}
