import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import PricingCard from "@/components/cards/PricingCard";

export default function PricingPreview() {
  return (
    <Section className="pt-0">
      <Container>
<>
  <SectionHeader
    title="Invest in Your English Mastery"
    subtitle="Explore My Accent Trainer's pricing and secure payment options tailored to suit your learning needs and budget."
  />
<PricingCard
  title="Choose your plan"
  price="From $29.99/month"
  description="Or $220/year billed annually."
/>
      </>
    </Container>
    </Section>
  );
}