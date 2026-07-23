import { learnerProfileService } from "@/lib/learner-profile/learner-profile-service";
import { learnerTimelineService } from "@/lib/learner-timeline/learner-timeline-service";

export type CompleteLessonRequest = {
  learnerId: string;
  displayName: string;
  lessonSlug: string;
  lessonTitle?: string;
  wordsPracticed: number;
};

export class LessonCompletionService {
  async completeLesson(request: CompleteLessonRequest) {
    const beforeProfile = await learnerProfileService.getOrCreateProfile(
      request.learnerId,
      request.displayName
    );

    const profile = await learnerProfileService.recordPractice(
      request.learnerId,
      request.displayName,
      request.wordsPracticed
    );

    const confidenceGain =
      profile.confidenceScore - beforeProfile.confidenceScore;

    const updatedProfile = {
      ...profile,
      lessonsCompleted: profile.lessonsCompleted + 1,
      lastUpdatedAt: new Date().toISOString(),
    };

    await learnerProfileService.saveProfile(request.learnerId, updatedProfile);

    const timeline = await learnerTimelineService.recordLessonCompletion({
      learnerId: request.learnerId,
      lessonSlug: request.lessonSlug,
      lessonTitle: request.lessonTitle || request.lessonSlug,
      wordsPracticed: request.wordsPracticed,
      confidenceGain,
    });

    return {
      success: true,
      lessonSlug: request.lessonSlug,
      profile: updatedProfile,
      timeline,
    };
  }
}

export const lessonCompletionService = new LessonCompletionService();
