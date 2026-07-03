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