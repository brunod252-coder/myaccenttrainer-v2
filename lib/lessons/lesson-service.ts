import { lessons } from "./lesson-data";

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getAllLessons() {
  return lessons;
}