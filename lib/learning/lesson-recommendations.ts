import type { LearningMission } from "./mission";

export interface LearningLesson {
  focus: string;
  slug: string;
  label: string;
}

export interface LearningLessonRecommendation extends LearningLesson {
  source: "preferred" | "fallback";
}

export const FOCUS_LESSON: Readonly<
  Record<string, { slug: string; label: string }>
> = {
  r: { slug: "american-r", label: "The American R" },
  l: { slug: "american-l", label: "The American L" },
  th: { slug: "th-voiceless", label: "The TH sound" },
  v: { slug: "v-and-w", label: "V versus W" },
  w: { slug: "v-and-w", label: "V versus W" },
  sh: { slug: "sh-sound", label: "The SH sound" },
  ee: { slug: "ship-sheep", label: "Ship vs. Sheep" },
  stress: { slug: "word-stress", label: "Word stress" },
  endings: { slug: "final-consonants", label: "Final consonants" },
  linking: { slug: "linking", label: "Linking words" },
};

export const DEFAULT_STARTER_FOCUSES = ["r", "th", "v"] as const;

export function getLessonRecommendationForFocus(
  focus: string,
): LearningLesson | null {
  const lesson = FOCUS_LESSON[focus];

  if (!lesson) return null;

  return {
    focus,
    slug: lesson.slug,
    label: lesson.label,
  };
}

export function getMissionLessonRecommendations(
  mission: LearningMission,
  limit = 3,
): LearningLessonRecommendation[] {
  const focuses =
    mission.key === "general"
      ? DEFAULT_STARTER_FOCUSES
      : mission.preferredFocuses;

  const recommendations: LearningLessonRecommendation[] = [];

  for (const focus of focuses) {
    if (recommendations.length >= limit) break;

    const recommendation = getLessonRecommendationForFocus(focus);

    if (
      recommendation &&
      !recommendations.some(
        (existing) => existing.slug === recommendation.slug,
      )
    ) {
      recommendations.push({
        ...recommendation,
        source: "preferred",
      });
    }
  }

  // Defensive fallback if a future mission references focuses that
  // do not yet have corresponding pronunciation lessons.
  for (const focus of DEFAULT_STARTER_FOCUSES) {
    if (recommendations.length >= limit) break;

    const recommendation = getLessonRecommendationForFocus(focus);

    if (
      recommendation &&
      !recommendations.some(
        (existing) => existing.slug === recommendation.slug,
      )
    ) {
      recommendations.push({
        ...recommendation,
        source: "fallback",
      });
    }
  }

  return recommendations;
}
