import {
  voiceHistoryRepository,
  VoiceHistoryEntry,
} from "./voice-history-repository";

export class VoiceHistoryService {
  async getLearnerHistory(
    learnerId: string
  ): Promise<VoiceHistoryEntry[]> {
    return voiceHistoryRepository.getHistory(learnerId);
  }

  async addRecording(
    entry: VoiceHistoryEntry
  ) {
    return voiceHistoryRepository.addEntry(entry);
  }

  async getLatestRecording(
    learnerId: string,
    word: string
  ): Promise<VoiceHistoryEntry | null> {
    const history =
      await voiceHistoryRepository.getHistory(learnerId);

    return (
      history
        .filter((entry) => entry.word === word)
        .sort((a, b) =>
          b.recordedAt.localeCompare(a.recordedAt)
        )[0] ?? null
    );
  }
}

export const voiceHistoryService =
  new VoiceHistoryService();
