import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function ForgotPasswordPage() {
  return (
    <MarketingLayout>
      <PageBanner
        title="Forgot Password"
        subtitle="Request a secure link to reset your password."
      />

      <Section>
        <Container>
          <ForgotPasswordForm />
        </Container>
      </Section>
    </MarketingLayout>
  );
}
