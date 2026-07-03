import LoginForm from "@/components/auth/LoginForm";
import MarketingLayout from "@/components/layouts/MarketingLayout";
import PageBanner from "@/components/marketing/PageBanner";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function LoginPage() {
  return (
    <MarketingLayout>
      <PageBanner
        title="Login"
        subtitle="Access your My Accent Trainer account."
      />

      <Section>
        <Container>
          <LoginForm />
        </Container>
      </Section>
    </MarketingLayout>
  );
}