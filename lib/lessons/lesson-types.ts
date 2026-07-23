export type LessonSectionType =
  | "listen"
  | "practice"
  | "feedback"
  | "complete";

export type LessonAudioSet = {
  normal?: string;
  slow?: string;
  slower?: string;
};

export interface LessonSection {
  id: string;
  type: LessonSectionType;
  title: string;
  description: string;
  buttonLabel?: string;
  audio?: LessonAudioSet;
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
