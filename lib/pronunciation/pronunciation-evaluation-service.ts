import { voiceHistoryService } from "@/lib/voice-history/voice-history-service";

export type PronunciationEvaluationRequest = {
  learnerId: string;
  lessonSlug: string;
  word: string;
  recordingFilename: string;
};

export type PronunciationEvaluation = {
  pronunciationScore: number;
  strengths: string[];
  improvements: string[];
  summary: string;
};

export class PronunciationEvaluationService {
  async evaluate(
    request: PronunciationEvaluationRequest
  ): Promise<PronunciationEvaluation> {

    const previousRecording =
      await voiceHistoryService.getLatestRecording(
        request.learnerId,
        request.word
      );

    let summary =
      "Recording successfully received. We are ready to analyze pronunciation in a future sprint.";

    if (previousRecording) {
      summary =
        `Welcome back! I remember you've practiced "${request.word}" before. I'll compare today's pronunciation with your previous attempts as my coaching becomes more advanced.`;
    }

    return {
      pronunciationScore: 82,

      strengths: [
        "Clear pacing",
        "Good recording quality",
      ],

      improvements: [
        `Continue practicing "${request.word}".`,
      ],

      summary,
    };
  }
}

export const pronunciationEvaluationService =
  new PronunciationEvaluationService();
