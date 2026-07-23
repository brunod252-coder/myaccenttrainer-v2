import AudioPracticeCard from "./AudioPracticeCard";
import CompletionCard from "./CompletionCard";
import FeedbackCard from "./FeedbackCard";

import type { LessonSection } from "@/lib/lessons";

type Props = {
  section: LessonSection;
  onComplete?: () => void;
};

export default function LessonSectionRenderer({
  section,
  onComplete,
}: Props) {
  switch (section.type) {
    case "listen":
      return (
        <AudioPracticeCard
          title={section.title}
          description={section.description}
          buttonLabel={section.buttonLabel || "Continue"}
          audio={section.audio}
          onComplete={onComplete}
        />
      );

    case "practice":
      return (
        <AudioPracticeCard
          title={section.title}
          description={section.description}
          buttonLabel={section.buttonLabel || "Continue"}
          audio={section.audio}
          onComplete={onComplete}
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
