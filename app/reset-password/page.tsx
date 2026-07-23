import type { Metadata } from "next";

import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new MyAccentTrainer password.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell
      heading="Choose a new password"
      sub="Pick a strong password you'll remember."
      altText="Need a new link?"
      altHref="/forgot-password"
      altLabel="Request another"
    >
      <ResetPasswordForm token={token || ""} />
    </AuthShell>
  );
}
