import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import FeatureCard from "@/components/cards/FeatureCard";

const features = [
  {
    title: "Master the American accent",
    description:
      "Learn the exact sounds of clear, neutral English — the ones your first language makes hardest.",
    visual: <AccentWaveIcon />,
    href: "/courses#basic-lessons",
  },
  {
    title: "Simplify English pronunciation",
    description:
      "Nina breaks tricky sounds into simple, repeatable steps you can actually feel.",
    visual: <PronunciationIcon />,
    href: "/courses#pronunciation-tips",
  },
  {
    title: "Learn at your own pace",
    description:
      "Short, focused lessons that fit your schedule — practice five minutes or fifty.",
    visual: <PaceIcon />,
    href: "/about",
  },
  {
    title: "Ace TOEFL & interviews",
    description:
      "Build the confident, understandable speech that tests and conversations reward.",
    visual: <AchievementIcon />,
    href: "/courses#toefl-preparation",
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
              visual={feature.visual}
              href={feature.href}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function AccentWaveIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden
    >
      <path d="M7 24h4l3-9 5 18 5-24 5 30 5-18 4 3h3" />
    </svg>
  );
}

function PronunciationIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden
    >
      <path d="M9 17c6-8 24-8 30 0" />
      <path d="M12 23c4-5 20-5 24 0" />
      <path d="M16 29c3-3 13-3 16 0" />
      <path d="M20 35h8" />
    </svg>
  );
}

function PaceIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden
    >
      <circle cx="24" cy="25" r="13" />
      <path d="M24 25l7-6" />
      <path d="M20 7h8" />
      <path d="M24 7v5" />
    </svg>
  );
}

function AchievementIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden
    >
      <path d="M10 17l14-7 14 7-14 7-14-7Z" />
      <path d="M15 22v8c5 5 13 5 18 0v-8" />
      <path d="M38 17v10" />
    </svg>
  );
}
