import { voiceService, type VoiceSpeed } from "@/lib/voice/voice-service";

const speeds: VoiceSpeed[] = ["normal", "slow", "slower"];

export type GenerateLessonAudioRequest = {
  title: string;
  subtitle: string;
  description: string;
  difficulty: string;
  estimatedMinutes: string;
  words: string[];
};

export type GeneratedWordAudio = {
  word: string;
  audio: Record<VoiceSpeed, string>;
};

export type GenerateLessonAudioResponse = {
  success: boolean;
  lesson: {
    title: string;
    subtitle: string;
    description: string;
    difficulty: string;
    estimatedMinutes: string;
  };
  generatedWords: GeneratedWordAudio[];
  totalFiles: number;
};

export class LessonBuilderService {
  async generateLessonAudio(
    request: GenerateLessonAudioRequest
  ): Promise<GenerateLessonAudioResponse> {
    const generatedWords: GeneratedWordAudio[] = [];

    for (const word of request.words) {
      const audio = {
        normal: "",
        slow: "",
        slower: "",
      };

      for (const speed of speeds) {
        const result = await voiceService.generate({
          text: word,
          speed,
        });

        audio[speed] = result.audioUrl || "";
      }

      generatedWords.push({
        word,
        audio,
      });
    }

    return {
      success: true,
      lesson: {
        title: request.title,
        subtitle: request.subtitle,
        description: request.description,
        difficulty: request.difficulty,
        estimatedMinutes: request.estimatedMinutes,
      },
      generatedWords,
      totalFiles: generatedWords.length * speeds.length,
    };
  }
}

export const lessonBuilderService = new LessonBuilderService();
