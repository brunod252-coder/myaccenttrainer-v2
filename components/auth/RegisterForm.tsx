"use client";

import { useState } from "react";

export default function RegisterForm() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = {
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      countryOfResidence: String(formData.get("countryOfResidence") || ""),
      nativeLanguage: String(formData.get("nativeLanguage") || ""),
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Registration failed.");
      setIsSubmitting(false);
      return;
    }

    setMessage("Account created successfully. You can now log in.");
    event.currentTarget.reset();
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl border bg-white p-8 shadow-sm">
      {message && (
        <div className="mb-6 border border-[#20ad68] bg-[#e9f8f3] p-4 text-sm text-[#168c56]">
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="First Name" name="firstName" />
        <Field label="Last Name" name="lastName" />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Field label="Country of Residence" name="countryOfResidence" />
        <Field label="Native Language" name="nativeLanguage" />
      </div>

      <button
        disabled={isSubmitting}
        className="mt-8 w-full rounded bg-[#20ad68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#169357] disabled:opacity-60"
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      <input
        name={name}
        type={type}
        required={name === "email" || name === "password"}
        className="mt-2 w-full border px-4 py-3 text-sm font-normal outline-none focus:border-[#20ad68]"
      />
    </label>
  );
}