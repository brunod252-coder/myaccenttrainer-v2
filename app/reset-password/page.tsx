import { Suspense } from "react";

import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function ResetPasswordPage() {
  return (
    <MarketingLayout>
      <PageBanner
        title="Reset Password"
        subtitle="Choose a new password for your account."
      />

      <Section>
        <Container>
          <Suspense
            fallback={
              <div className="mx-auto max-w-md border bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
                Loading password reset...
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </Container>
      </Section>
    </MarketingLayout>
  );
}
