import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import FeatureCard from "@/components/cards/FeatureCard";

const features = [
  "Master English Accent",
  "Simplify English Pronunciation",
  "Learn English at Your Pace",
  "Ace TOEFL with My Accent Trainer",
];

export default function Features() {
  return (
    <Section>
      <Container>
        <SectionHeader
          title="Empower Your English Journey"
          subtitle="Whether you're preparing for a test, advancing your career, or simply seeking confidence in English conversations, our courses are tailored to meet your unique needs."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {features.map((title) => (
            <FeatureCard
              key={title}
              title={title}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}