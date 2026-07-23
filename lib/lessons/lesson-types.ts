export type LessonSectionType =
  | "listen"
  | "practice"
  | "feedback"
  | "complete";

export interface LessonSection {
  id: string;
  type: LessonSectionType;
  title: string;
  description: string;
  buttonLabel?: string;
  audioUrl?: string;
  // The phrase the learner records in a "practice" step, and the lesson's
  // focus sound (e.g. "r") — used for real pronunciation scoring + Nina's tip.
  referenceText?: string;
  focus?: string;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  course: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  sections: LessonSection[];
  nextLessonSlug?: string;
}
