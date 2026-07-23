import { mkdir, writeFile, readFile, readdir } from "fs/promises";
import path from "path";

export type PublishedLesson = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  course: string;
  difficulty: string;
  estimatedMinutes: number;
  status: string;
  publishedAt: string;
  words: {
    word: string;
    audio: {
      normal: string;
      slow: string;
      slower: string;
    };
  }[];
};

export class LessonRepository {
  private readonly lessonDir = path.join(
    process.cwd(),
    "data",
    "published-lessons"
  );

  async save(slug: string, lesson: unknown) {
    await mkdir(this.lessonDir, { recursive: true });

    await writeFile(
      path.join(this.lessonDir, `${slug}.json`),
      JSON.stringify(lesson, null, 2)
    );
  }

  async findBySlug(slug: string): Promise<PublishedLesson | null> {
    try {
      const file = await readFile(
        path.join(this.lessonDir, `${slug}.json`),
        "utf8"
      );

      return JSON.parse(file);
    } catch {
      return null;
    }
  }

  async findAll() {
    try {
      const files = await readdir(this.lessonDir);
      return files.filter((file) => file.endsWith(".json"));
    } catch {
      return [];
    }
  }
}

export const lessonRepository = new LessonRepository();
