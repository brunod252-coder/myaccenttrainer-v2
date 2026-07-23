import type { Metadata } from "next";

import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Start your journey to clearer, more confident English.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      heading="Create your account"
      sub="Start your journey to clearer, more confident English."
      altText="Already have an account?"
      altHref="/login"
      altLabel="Log in"
    >
      <RegisterForm />
    </AuthShell>
  );
}
