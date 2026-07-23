import { lessonRepository } from "@/lib/lesson-repository/lesson-repository";

export type PublishLessonRequest = {
  title: string;
  subtitle: string;
  description: string;
  difficulty: string;
  estimatedMinutes: string;
  generatedWords: {
    word: string;
    audio: {
      normal: string;
      slow: string;
      slower: string;
    };
  }[];
};

function slugifyText(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export class LessonPublisherService {
  async publish(request: PublishLessonRequest) {
    const slug = slugifyText(request.title);

    const publishedLesson = {
      id: `lesson-${slug}`,
      slug,
      title: request.title,
      subtitle: request.subtitle,
      description: request.description,
      course: "Nina Studio",
      difficulty: request.difficulty,
      estimatedMinutes: Number(request.estimatedMinutes) || 10,
      status: "published",
      publishedAt: new Date().toISOString(),
      words: request.generatedWords,
    };

    await lessonRepository.save(slug, publishedLesson);

    return {
      success: true,
      lesson: publishedLesson,
      filePath: `data/published-lessons/${slug}.json`,
    };
  }
}

export const lessonPublisherService = new LessonPublisherService();
