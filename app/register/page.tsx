import RegisterForm from "@/components/auth/RegisterForm";
import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function RegisterPage() {
  return (
    <MarketingLayout>
      <PageBanner
        title="Create Account"
        subtitle="Start your My Accent Trainer learning journey."
      />

      <Section>
        <Container>
          <RegisterForm />
        </Container>
      </Section>
    </MarketingLayout>
  );
}