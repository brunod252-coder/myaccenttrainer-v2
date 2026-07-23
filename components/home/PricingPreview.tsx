import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import PricingCard from "@/components/cards/PricingCard";

export default function PricingPreview() {
  return (
    <Section className="pt-0">
      <Container>
        <SectionHeader
          eyebrow="Pricing"
          title="Invest in your English mastery"
          subtitle="Simple, flexible pricing with everything you need to sound clear and confident."
        />

        <PricingCard
          title="All-access"
          price="$29.99"
          period="/month"
          description="Or $220/year billed annually — cancel anytime."
          features={[
            "Unlimited lessons & practice",
            "Instant sound-by-sound feedback from Nina",
            "Progress tracking & certificates",
            "New courses added regularly",
          ]}
        />
      </Container>
    </Section>
  );
}
