import { lessons } from "./lesson-data";
import { listCustomLessons, toLesson } from "./custom";
import type { Lesson } from "./lesson-types";

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getAllLessons() {
  return lessons;
}

// Merged view: built-in lessons plus any published admin-authored lessons.
export async function getMergedLessons(): Promise<Lesson[]> {
  const custom = (await listCustomLessons()).map(toLesson);
  return [...lessons, ...custom];
}

export async function getMergedLesson(slug: string): Promise<Lesson | undefined> {
  const found = lessons.find((l) => l.slug === slug);
  if (found) return found;
  const custom = await listCustomLessons();
  const row = custom.find((r) => r.slug === slug);
  return row ? toLesson(row) : undefined;
}
