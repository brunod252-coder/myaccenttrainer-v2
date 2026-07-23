import AudioPracticeCard from "./AudioPracticeCard";
import CompletionCard from "./CompletionCard";
import FeedbackCard from "./FeedbackCard";
import RecordingPracticeCard from "./RecordingPracticeCard";

import type { LessonSection } from "@/lib/lessons";
import type { PronunciationResult } from "@/lib/pronunciation/types";

type Props = {
  section: LessonSection;
  lessonSlug?: string;
  onSectionComplete?: () => void;
  onResult?: (result: PronunciationResult) => void;
  result?: PronunciationResult | null;
  nextHref?: string;
};

export default function LessonSectionRenderer({
  section,
  lessonSlug = "",
  onSectionComplete,
  onResult,
  result,
  nextHref = "/dashboard/practice",
}: Props) {
  switch (section.type) {
    case "listen":
      return (
        <AudioPracticeCard
          title={section.title}
          description={section.description}
          buttonLabel={section.buttonLabel || "Continue"}
          audioUrl={section.audioUrl}
          speakText={section.referenceText}
          onPrimaryAction={onSectionComplete}
          onAudioEnded={onSectionComplete}
        />
      );

    case "practice":
      return (
        <RecordingPracticeCard
          title={section.title}
          description={section.description}
          buttonLabel={section.buttonLabel || "Record my attempt"}
          referenceText={section.referenceText}
          focus={section.focus}
          lessonSlug={lessonSlug}
          onResult={onResult}
          onSectionComplete={onSectionComplete}
        />
      );

    case "feedback":
      if (result) {
        return (
          <FeedbackCard
            score={result.overall}
            title={result.title}
            message={result.message}
            rhythm={result.rhythm}
            confidence={result.confidence}
            difficulty={result.difficulty}
            phonemes={result.phonemes}
            strengths={result.strengths}
            improvements={result.improvements}
            tip={result.tip}
            comparison={result.comparison}
            source={result.source}
          />
        );
      }
      return (
        <FeedbackCard
          title="Let's hear you first"
          message="Head back to the Practice step and record your attempt — then I'll share your feedback here."
        />
      );

    case "complete":
      return (
        <CompletionCard
          title="Great work!"
          message={section.description}
          nextLessonLabel={nextHref.includes("/lesson/") ? "Continue to next lesson" : "Back to lessons"}
          nextHref={nextHref}
        />
      );

    default:
      return null;
  }
}
