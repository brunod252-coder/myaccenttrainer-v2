import PricingCard from "@/components/cards/PricingCard";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  getMarketingCtaLabel,
  getMarketingDestination,
  getMarketingSessionUser,
} from "@/lib/auth/marketing-session";

const features = [
  "Unlimited lessons & practice",
  "Instant sound-by-sound feedback from Nina",
  "Progress tracking & certificates",
  "New courses added regularly",
];

export default async function PricingPreview() {
  const user =
    await getMarketingSessionUser();

  const buttonHref =
    getMarketingDestination(user);

  const buttonText =
    getMarketingCtaLabel(user);

  return (
    <Section className="pt-0">
      <Container>
        <SectionHeader
          eyebrow="Pricing"
          title="Invest in your English mastery"
          subtitle="Choose the plan that fits you best. Both include full access to MyAccentTrainer."
        />

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          <PricingCard
            title="All-access Monthly"
            price="$19.99"
            period="/month"
            description="Billed monthly — cancel anytime."
            features={features}
            buttonText={buttonText}
            buttonHref={buttonHref}
          />

          <PricingCard
            title="All-access Annual"
            price="$199"
            period="/year"
            description="Billed annually."
            emphasisText="Save $40.88 compared with monthly."
            badge="Best value"
            features={features}
            buttonText={buttonText}
            buttonHref={buttonHref}
          />
        </div>
      </Container>
    </Section>
  );
}
