import { Lesson } from "./lesson-types";

export const lessons: Lesson[] = [
  {
    id: "lesson-007",
    slug: "american-r",
    title: "Lesson 7",
    subtitle: "The American R",
    description:
      "Today we'll practice one of the most recognizable sounds in American English: the R sound.",
    course: "Basic Pronunciation",
    difficulty: "Beginner",
    estimatedMinutes: 12,

    sections: [

      {
        id: "listen",
        type: "listen",
        title: "Listen",
        description:
          "Listen carefully to Nina's model pronunciation before practicing.",
        buttonLabel: "Play Native Speaker",
        audio: {
          normal: "/audio/pronunciation/american-r-normal.mp3",
          slow: "/audio/pronunciation/american-r-slow.mp3",
          slower: "/audio/pronunciation/american-r-slower.mp3",
        },
      },

      {
        id: "practice",
        type: "practice",
        title: "Practice",
        description:
          "Repeat the sound several times before recording yourself.",
        buttonLabel: "Start Practice",
      },
      {
        id: "feedback",
        type: "feedback",
        title: "Feedback",
        description:
          "Nina analyzes your pronunciation and suggests improvements.",
      },
      {
        id: "complete",
        type: "complete",
        title: "Complete",
        description:
          "Congratulations! Continue to the next lesson.",
      },
    ],

    nextLessonSlug: "american-l",
  },
];
