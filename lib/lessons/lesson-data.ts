import { Lesson, LessonSection } from "./lesson-types";

// Standard Nina lesson rhythm: listen → practice → feedback → complete.
// The listen step carries the phrase so Nina can speak it (browser voice).
export function buildSections(referenceText: string, focus: string): LessonSection[] {
  return [
    {
      id: "listen",
      type: "listen",
      title: "Listen",
      description: "Listen to Nina say the phrase, then continue to practice.",
      buttonLabel: "Continue",
      referenceText,
    },
    {
      id: "practice",
      type: "practice",
      title: "Practice",
      description: `When you're ready, record yourself saying: “${referenceText}” Nina will listen and give you feedback.`,
      buttonLabel: "Record my attempt",
      referenceText,
      focus,
    },
    {
      id: "feedback",
      type: "feedback",
      title: "Feedback",
      description: "Nina analyzes your pronunciation and suggests improvements.",
    },
    {
      id: "complete",
      type: "complete",
      title: "Complete",
      description: "Congratulations! Continue to the next lesson.",
    },
  ];
}

export const lessons: Lesson[] = [
  {
    id: "lesson-007",
    slug: "american-r",
    title: "Lesson 7",
    subtitle: "The American R",
    description:
      "One of the most recognizable sounds in American English. We'll practice the R sound at the start, middle, and end of words.",
    course: "Basic Pronunciation",
    difficulty: "Beginner",
    estimatedMinutes: 12,
    sections: buildSections("The red car raced around the ring.", "r"),
    nextLessonSlug: "american-l",
  },
  {
    id: "lesson-008",
    slug: "american-l",
    title: "Lesson 8",
    subtitle: "The American L",
    description:
      "The L sound trips up many learners. We'll place the tongue correctly and keep the sound clear and light.",
    course: "Basic Pronunciation",
    difficulty: "Beginner",
    estimatedMinutes: 11,
    sections: buildSections("Please call Lily later at the little mall.", "l"),
    nextLessonSlug: "th-voiceless",
  },
  {
    id: "lesson-009",
    slug: "th-voiceless",
    title: "Lesson 9",
    subtitle: "The Voiceless TH",
    description:
      "The soft, airy TH in words like think and three. We'll get the tongue between the teeth and push gentle air.",
    course: "Basic Pronunciation",
    difficulty: "Intermediate",
    estimatedMinutes: 10,
    sections: buildSections("I think three things are worth it.", "th"),
    nextLessonSlug: "th-voiced",
  },
  {
    id: "lesson-010",
    slug: "th-voiced",
    title: "Lesson 10",
    subtitle: "The Voiced TH",
    description:
      "The buzzing TH in this, that, and mother. Same tongue position as the voiceless TH, but with your voice added.",
    course: "Basic Pronunciation",
    difficulty: "Intermediate",
    estimatedMinutes: 10,
    sections: buildSections("This is the mother of that brother.", "th"),
    nextLessonSlug: "v-and-w",
  },
  {
    id: "lesson-011",
    slug: "v-and-w",
    title: "Lesson 11",
    subtitle: "V versus W",
    description:
      "Two sounds that are easy to mix up. We'll separate the teeth-on-lip V from the rounded-lip W.",
    course: "Basic Pronunciation",
    difficulty: "Intermediate",
    estimatedMinutes: 12,
    sections: buildSections("We were very worried about the wet weather.", "w"),
    nextLessonSlug: "sh-sound",
  },
  {
    id: "lesson-012",
    slug: "sh-sound",
    title: "Lesson 12",
    subtitle: "The SH Sound",
    description:
      "A smooth, full SH. We'll round the lips and pull the tongue back so it doesn't collapse into a plain S.",
    course: "Basic Pronunciation",
    difficulty: "Intermediate",
    estimatedMinutes: 9,
    sections: buildSections("She sells sheep by the seashore.", "sh"),
    nextLessonSlug: "ship-sheep",
  },
  {
    id: "lesson-013",
    slug: "ship-sheep",
    title: "Lesson 13",
    subtitle: "Ship vs. Sheep",
    description:
      "The short and long vowels that change meaning. We'll hear and feel the difference between ship and sheep.",
    course: "Basic Pronunciation",
    difficulty: "Intermediate",
    estimatedMinutes: 10,
    sections: buildSections("Please sit in this seat and eat.", "ee"),
    nextLessonSlug: "word-stress",
  },
  {
    id: "lesson-014",
    slug: "word-stress",
    title: "Lesson 14",
    subtitle: "Word Stress",
    description:
      "Stress can change meaning entirely. We'll practice stressing the right syllable, the way natives do.",
    course: "Basic Pronunciation",
    difficulty: "Advanced",
    estimatedMinutes: 11,
    sections: buildSections("I'd like to present this present.", "stress"),
    nextLessonSlug: "final-consonants",
  },
  {
    id: "lesson-015",
    slug: "final-consonants",
    title: "Lesson 15",
    subtitle: "Final Consonants",
    description:
      "Endings often get dropped. We'll release final consonants clearly so every word lands.",
    course: "Basic Pronunciation",
    difficulty: "Advanced",
    estimatedMinutes: 10,
    sections: buildSections("Ask for the best test results.", "endings"),
    nextLessonSlug: "linking",
  },
  {
    id: "lesson-016",
    slug: "linking",
    title: "Lesson 16",
    subtitle: "Linking Words",
    description:
      "Natural English flows word to word. We'll link endings to beginnings so your speech sounds smooth.",
    course: "Basic Pronunciation",
    difficulty: "Advanced",
    estimatedMinutes: 12,
    sections: buildSections("Turn it off and pick it up.", "linking"),
  },
];
