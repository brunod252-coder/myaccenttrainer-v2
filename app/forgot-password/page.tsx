import type { Metadata } from "next";

import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your MyAccentTrainer password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      heading="Forgot your password?"
      sub="Enter your email and we'll send you a link to reset it."
      altText="Remembered it?"
      altHref="/login"
      altLabel="Back to log in"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
