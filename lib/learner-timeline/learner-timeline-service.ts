import {
  learnerTimelineRepository,
  TimelineEntry,
} from "@/lib/learner-timeline/learner-timeline-repository";

export type RecordLessonCompletionRequest = {
  learnerId: string;
  lessonSlug: string;
  lessonTitle: string;
  wordsPracticed: number;
  confidenceGain: number;
};

export class LearnerTimelineService {
  async recordLessonCompletion(
    request: RecordLessonCompletionRequest
  ): Promise<TimelineEntry[]> {
    return learnerTimelineRepository.addEntry(request.learnerId, {
      id: crypto.randomUUID(),
      lessonSlug: request.lessonSlug,
      lessonTitle: request.lessonTitle,
      wordsPracticed: request.wordsPracticed,
      confidenceGain: request.confidenceGain,
      completedAt: new Date().toISOString(),
    });
  }

  async getTimeline(learnerId: string) {
    return learnerTimelineRepository.getTimeline(learnerId);
  }
}

export const learnerTimelineService =
  new LearnerTimelineService();
