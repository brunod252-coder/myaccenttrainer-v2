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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (r) setReferralCode(r);
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
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
    >
            {referralCode && (
        <div className="mb-6 rounded-lg border border-[#cdeee1] bg-[#f0faf6] p-3 text-sm text-[#168c56]">
          🎁 You were invited! You and your friend each get $10 in learning credit when you join.
        </div>
      )}
      {message && (
        <div
          className={
            "mb-6 rounded-lg border p-3 text-sm " +
            (isError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-[#cdeee1] bg-[#e9f8f3] text-[#168c56]")
          }
        >
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" />
        <Field label="Last name" name="lastName" />
      </div>

      <div className="mt-4">
        <Field label="Email" name="email" type="email" required />
      </div>

      <div className="mt-4">
        <Field label="Password" name="password" type="password" required />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Country of residence" name="countryOfResidence" placeholder="e.g. Canada" />
        <label className="block text-sm font-semibold text-gray-700">
          Native language
          <select
            name="nativeLanguage"
            defaultValue=""
            className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-[#20ad68] focus:ring-2 focus:ring-[#20ad68]/20"
          >
            <option value="" disabled>
              Select…
            </option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        disabled={isSubmitting}
        className="mt-8 w-full rounded-lg bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357] disabled:opacity-60"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-normal outline-none transition focus:border-[#20ad68] focus:ring-2 focus:ring-[#20ad68]/20"
      />
    </label>
  );
}

