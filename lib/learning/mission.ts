export const LEARNING_MISSIONS = {
  EVERYDAY_CONVERSATION: "Everyday conversation",
  TOEFL_IELTS: "IELTS / TOEFL speaking",
  INTERVIEWS: "University interviews",
  PROFESSIONAL: "Career & professional",
  PRESENTATIONS: "Seminars & presentations",
  ACADEMIC: "Class participation",
} as const;

export type LearningMissionValue =
  (typeof LEARNING_MISSIONS)[keyof typeof LEARNING_MISSIONS];

export type LearningMissionKey =
  | "everyday"
  | "toefl"
  | "interviews"
  | "professional"
  | "presentations"
  | "academic"
  | "general";

export type LearningLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export interface LearningMission {
  key: LearningMissionKey;
  storedValue: string;
  label: string;
  shortLabel: string;
  headline: string;
  description: string;
  priorities: readonly string[];
  preferredFocuses: readonly string[];
}

const GENERAL_MISSION: LearningMission = {
  key: "general",
  storedValue: "",
  label: "Clear, confident English",
  shortLabel: "English",
  headline: "Build clearer, more confident English",
  description:
    "Strengthen pronunciation, clarity, rhythm, and confidence across everyday spoken English.",
  priorities: [
    "clear pronunciation",
    "natural rhythm",
    "confident speaking",
  ],
  preferredFocuses: ["r", "th", "v", "w", "stress", "linking", "endings"],
};

const MISSIONS: Record<LearningMissionKey, LearningMission> = {
  everyday: {
    key: "everyday",
    storedValue: LEARNING_MISSIONS.EVERYDAY_CONVERSATION,
    label: "Everyday Conversation",
    shortLabel: "Conversation",
    headline: "Speak naturally in everyday conversations",
    description:
      "Build comfortable, natural speech for the situations and conversations you meet every day.",
    priorities: [
      "natural conversation",
      "smooth connected speech",
      "clear everyday pronunciation",
    ],
    preferredFocuses: ["linking", "stress", "r", "l", "th"],
  },

  toefl: {
    key: "toefl",
    storedValue: LEARNING_MISSIONS.TOEFL_IELTS,
    label: "TOEFL / IELTS Speaking",
    shortLabel: "TOEFL / IELTS",
    headline: "Build clear, organized test-day speaking",
    description:
      "Practice speaking with the clarity, pacing, and organization needed for strong TOEFL and IELTS responses.",
    priorities: [
      "timed speaking responses",
      "pronunciation and pacing",
      "organized spoken answers",
    ],
    preferredFocuses: ["stress", "endings", "linking", "th", "r"],
  },

  interviews: {
    key: "interviews",
    storedValue: LEARNING_MISSIONS.INTERVIEWS,
    label: "Job & University Interviews",
    shortLabel: "Interviews",
    headline: "Speak clearly and confidently in interviews",
    description:
      "Develop composed, understandable answers for interviews and other high-stakes conversations.",
    priorities: [
      "confident answers",
      "clear key words",
      "controlled pacing",
    ],
    preferredFocuses: ["stress", "endings", "r", "th", "linking"],
  },

  professional: {
    key: "professional",
    storedValue: LEARNING_MISSIONS.PROFESSIONAL,
    label: "Career & Professional English",
    shortLabel: "Professional English",
    headline: "Communicate clearly in professional settings",
    description:
      "Strengthen the clarity and confidence you need for meetings, workplace conversations, and professional communication.",
    priorities: [
      "professional clarity",
      "confident workplace speech",
      "precise pronunciation",
    ],
    preferredFocuses: ["stress", "endings", "v", "w", "r"],
  },

  presentations: {
    key: "presentations",
    storedValue: LEARNING_MISSIONS.PRESENTATIONS,
    label: "Presentations & Public Speaking",
    shortLabel: "Presentations",
    headline: "Make your spoken ideas clear and easy to follow",
    description:
      "Practice the pacing, emphasis, and pronunciation that help an audience follow you confidently.",
    priorities: [
      "word emphasis",
      "controlled pacing",
      "audience clarity",
    ],
    preferredFocuses: ["stress", "linking", "endings", "r", "th"],
  },

  academic: {
    key: "academic",
    storedValue: LEARNING_MISSIONS.ACADEMIC,
    label: "Academic / Classroom English",
    shortLabel: "Academic English",
    headline: "Speak clearly in academic settings",
    description:
      "Build confidence for class participation, discussions, explanations, and academic speaking.",
    priorities: [
      "clear explanations",
      "classroom confidence",
      "academic pronunciation",
    ],
    preferredFocuses: ["stress", "endings", "th", "r", "linking"],
  },

  general: GENERAL_MISSION,
};

export function getLearningMission(
  englishGoal: string | null | undefined,
): LearningMission {
  const normalized = englishGoal?.trim().toLowerCase();

  if (!normalized) return GENERAL_MISSION;

  if (
    normalized === LEARNING_MISSIONS.EVERYDAY_CONVERSATION.toLowerCase() ||
    normalized === "everyday conversation"
  ) {
    return MISSIONS.everyday;
  }

  if (
    normalized === LEARNING_MISSIONS.TOEFL_IELTS.toLowerCase() ||
    normalized === "toefl / ielts speaking" ||
    normalized === "ielts / toefl speaking"
  ) {
    return MISSIONS.toefl;
  }

  if (
    normalized === LEARNING_MISSIONS.INTERVIEWS.toLowerCase() ||
    normalized === "job & university interviews"
  ) {
    return MISSIONS.interviews;
  }

  if (
    normalized === LEARNING_MISSIONS.PROFESSIONAL.toLowerCase() ||
    normalized === "career & professional english"
  ) {
    return MISSIONS.professional;
  }

  if (
    normalized === LEARNING_MISSIONS.PRESENTATIONS.toLowerCase() ||
    normalized === "presentations & public speaking"
  ) {
    return MISSIONS.presentations;
  }

  if (
    normalized === LEARNING_MISSIONS.ACADEMIC.toLowerCase() ||
    normalized === "academic / classroom english"
  ) {
    return MISSIONS.academic;
  }

  return {
    ...GENERAL_MISSION,
    storedValue: englishGoal?.trim() || "",
  };
}

export function normalizeLearningLevel(
  proficiencyLevel: string | null | undefined,
): LearningLevel {
  switch (proficiencyLevel?.trim().toLowerCase()) {
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    default:
      return "Beginner";
  }
}
