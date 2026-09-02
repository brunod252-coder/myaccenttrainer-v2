import { LEARNING_MISSIONS } from "@/lib/learning/mission";

export type LearningRecommendation = {
  eyebrow: string;
  title: string;
  summary: string;
  priorities: string[];
  firstFocus: string;
};

const GOAL_RECOMMENDATIONS: Record<
  string,
  Omit<LearningRecommendation, "firstFocus">
> = {
  [LEARNING_MISSIONS.EVERYDAY_CONVERSATION]: {
    eyebrow: "Everyday Conversation",
    title: "Build confidence for real conversations.",
    summary:
      "Your path should focus on speaking clearly and comfortably in the situations you encounter every day—not memorizing English you rarely use.",
    priorities: [
      "Natural everyday speaking practice",
      "Clear pronunciation of high-impact sounds",
      "Listening and responding without overthinking",
    ],
  },

  [LEARNING_MISSIONS.TOEFL_IELTS]: {
    eyebrow: "TOEFL / IELTS Speaking",
    title: "Train for clear, organized test-day speaking.",
    summary:
      "Your path should combine pronunciation and fluency with the ability to organize an answer quickly and deliver it clearly under time pressure.",
    priorities: [
      "Timed speaking responses",
      "Clear pronunciation and pacing",
      "Organizing ideas into strong spoken answers",
    ],
  },

  [LEARNING_MISSIONS.INTERVIEWS]: {
    eyebrow: "Interview Preparation",
    title: "Prepare to sound confident when the stakes are high.",
    summary:
      "Your path should help you answer interview questions naturally, explain your experience clearly, and speak with confidence when every answer matters.",
    priorities: [
      "Common interview questions and responses",
      "Professional clarity and pronunciation",
      "Confident spontaneous speaking",
    ],
  },

  [LEARNING_MISSIONS.PROFESSIONAL]: {
    eyebrow: "Professional English",
    title: "Strengthen the English you use at work.",
    summary:
      "Your path should focus on clear professional communication so you can contribute comfortably in meetings, conversations, and workplace situations.",
    priorities: [
      "Workplace conversations and meetings",
      "Professional pronunciation and clarity",
      "Speaking with confidence and precision",
    ],
  },

  [LEARNING_MISSIONS.PRESENTATIONS]: {
    eyebrow: "Presentations & Public Speaking",
    title: "Make your spoken English easier to follow.",
    summary:
      "Your path should help you present ideas with clear pronunciation, controlled pacing, and the confidence to hold an audience's attention.",
    priorities: [
      "Presentation delivery and pacing",
      "Clear emphasis and pronunciation",
      "Speaking confidently to groups",
    ],
  },

  [LEARNING_MISSIONS.ACADEMIC]: {
    eyebrow: "Academic English",
    title: "Participate more confidently in academic settings.",
    summary:
      "Your path should help you express ideas clearly in class, respond during discussions, and speak comfortably in academic conversations.",
    priorities: [
      "Classroom discussion and participation",
      "Academic speaking confidence",
      "Clear pronunciation and explanation",
    ],
  },
};

const DEFAULT_RECOMMENDATION: Omit<
  LearningRecommendation,
  "firstFocus"
> = {
  eyebrow: "Personalized English",
  title: "Build clearer, more confident spoken English.",
  summary:
    "Your path will combine practical speaking with focused pronunciation work, then adapt as Nina learns more from your practice.",
  priorities: [
    "Practical speaking confidence",
    "Clear pronunciation",
    "Practice that adapts to your results",
  ],
};

function levelFocus(level: string) {
  switch (level) {
    case "Beginner":
      return "Start with short, useful speaking patterns and foundational pronunciation so progress feels manageable from day one.";

    case "Intermediate":
      return "Start by turning the English you already know into faster, clearer, more confident speech.";

    case "Advanced":
      return "Start with precision: refine pronunciation, pacing, and natural delivery so strong English becomes polished English.";

    default:
      return "Start with a focused speaking baseline so Nina can refine your practice as she learns from your results.";
  }
}

export function getLearningRecommendation(
  englishGoal: string,
  proficiencyLevel: string,
): LearningRecommendation {
  const recommendation =
    GOAL_RECOMMENDATIONS[englishGoal] ??
    DEFAULT_RECOMMENDATION;

  return {
    ...recommendation,
    firstFocus: levelFocus(proficiencyLevel),
  };
}
