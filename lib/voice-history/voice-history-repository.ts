import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type VoiceHistoryEntry = {
  id: string;
  learnerId: string;
  lessonSlug: string;
  word: string;
  filename: string;
  recordedAt: string;
};

export class VoiceHistoryRepository {
  private readonly directory = path.join(
    process.cwd(),
    "data",
    "voice-history"
  );

  async getHistory(learnerId: string): Promise<VoiceHistoryEntry[]> {
    try {
      const file = await readFile(
        path.join(this.directory, `${learnerId}.json`),
        "utf8"
      );

      return JSON.parse(file);
    } catch {
      return [];
    }
  }

  async addEntry(entry: VoiceHistoryEntry) {
    await mkdir(this.directory, { recursive: true });

    const history = await this.getHistory(entry.learnerId);

    history.unshift(entry);

    await writeFile(
      path.join(this.directory, `${entry.learnerId}.json`),
      JSON.stringify(history, null, 2)
    );

    return history;
  }
}

export const voiceHistoryRepository =
  new VoiceHistoryRepository();
