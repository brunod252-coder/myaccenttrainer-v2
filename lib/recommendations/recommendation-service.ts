import type { LearnerProfile } from "@/lib/learner-profile/learner-profile-service";
import type { TimelineEntry } from "@/lib/learner-timeline/learner-timeline-repository";
import { determineNextLesson } from "@/lib/recommendation/learning-strategy";

export type Recommendation = {
  title: string;
  reason: string;
  estimatedMinutes: number;
  lessonSlug: string;
};

const LESSONS: Record<
  string,
  Omit<Recommendation, "lessonSlug">
> = {
  "the-american-th": {
    title: "The American TH",
    reason:
      "A strong foundation in the TH sounds will make many everyday English words clearer and more natural.",
    estimatedMinutes: 12,
  },

  "american-r": {
    title: "Mastering the American R",
    reason:
      "Excellent work on TH. You're now ready to strengthen one of the most recognizable American English sounds.",
    estimatedMinutes: 15,
  },

  linking: {
    title: "Linking Words",
    reason:
      "Now that your individual sounds are improving, it's time to make your speech flow more naturally.",
    estimatedMinutes: 14,
  },

  intonation: {
    title: "American Intonation",
    reason:
      "You're ready to focus on melody, rhythm, and natural speech patterns.",
    estimatedMinutes: 16,
  },

  "conversation-practice": {
    title: "Conversation Practice",
    reason:
      "You've built a solid pronunciation foundation. Let's apply it in real conversations.",
    estimatedMinutes: 20,
  },
};

export class RecommendationService {
  getRecommendation(
    profile: LearnerProfile,
    timeline: TimelineEntry[]
  ): Recommendation {
    const lessonSlug = determineNextLesson(timeline);

    const lesson = LESSONS[lessonSlug];

    if (lesson) {
      return {
        lessonSlug,
        ...lesson,
      };
    }

    return {
      lessonSlug: "daily-review",
      title: "Daily Pronunciation Review",
      reason:
        "A short review session will reinforce your recent progress and keep your momentum going.",
      estimatedMinutes: 10,
    };
  }
}

export const recommendationService = new RecommendationService();
