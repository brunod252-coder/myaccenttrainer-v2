import AudioPracticeCard from "./AudioPracticeCard";
import CompletionCard from "./CompletionCard";
import FeedbackCard from "./FeedbackCard";

import type { LessonSection } from "@/lib/lessons";

type Props = {
  section: LessonSection;
  onSectionComplete?: () => void;
};

export default function LessonSectionRenderer({
  section,
  onSectionComplete,
}: Props) {
  switch (section.type) {
    case "listen":
      return (
        <AudioPracticeCard
          title={section.title}
          description={section.description}
          buttonLabel={section.buttonLabel || "Continue"}
          audioUrl={section.audioUrl}
          onPrimaryAction={onSectionComplete}
          onAudioEnded={onSectionComplete}
        />
      );

    case "practice":
      return (
        <AudioPracticeCard
          title={section.title}
          description={section.description}
          buttonLabel={section.buttonLabel || "Continue"}
          audioUrl={section.audioUrl}
          onPrimaryAction={onSectionComplete}
        />
      );

    case "feedback":
      return (
        <FeedbackCard
          score={91}
          title="Excellent progress"
          message="Your R sound is becoming clearer. Keep practicing slowly, then increase your speed as the sound becomes more natural."
        />
      );

    case "complete":
      return (
        <CompletionCard
          title="Great work!"
          message={section.description}
          nextLessonLabel="Continue to Next Lesson"
        />
      );

    default:
      return null;
  }
}