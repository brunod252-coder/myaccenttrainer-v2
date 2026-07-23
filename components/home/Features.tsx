import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import FeatureCard from "@/components/cards/FeatureCard";

const features = [
  {
    title: "Master the American accent",
    description:
      "Learn the exact sounds of clear, neutral English — the ones your first language makes hardest.",
    icon: "🗣️",
  },
  {
    title: "Simplify English pronunciation",
    description:
      "Nina breaks tricky sounds into simple, repeatable steps you can actually feel.",
    icon: "🔤",
  },
  {
    title: "Learn at your own pace",
    description:
      "Short, focused lessons that fit your schedule — practice five minutes or fifty.",
    icon: "⏱️",
  },
  {
    title: "Ace TOEFL & interviews",
    description:
      "Build the confident, understandable speech that tests and conversations reward.",
    icon: "🎓",
  },
];

export default function Features() {
  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Why MyAccentTrainer"
          title="Empower your English journey"
          subtitle="Whether you're preparing for a test, advancing your career, or simply seeking confidence in conversation, every lesson is tailored to you."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
