import type { Metadata } from "next";

import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to continue your practice with Nina.",
};

export default function LoginPage() {
  return (
    <AuthShell
      heading="Welcome back"
      sub="Log in to continue your practice with Nina."
      altText="New to MyAccentTrainer?"
      altHref="/register"
      altLabel="Create an account"
    >
      <LoginForm />
    </AuthShell>
  );
}
