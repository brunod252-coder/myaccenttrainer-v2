import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type TimelineEntry = {
  id: string;
  lessonSlug: string;
  lessonTitle: string;
  wordsPracticed: number;
  confidenceGain: number;
  completedAt: string;
};

export class LearnerTimelineRepository {
  private readonly timelineDir = path.join(
    process.cwd(),
    "data",
    "learner-timelines"
  );

  async getTimeline(learnerId: string): Promise<TimelineEntry[]> {
    try {
      const file = await readFile(
        path.join(this.timelineDir, `${learnerId}.json`),
        "utf8"
      );

      return JSON.parse(file);
    } catch {
      return [];
    }
  }

  async addEntry(
    learnerId: string,
    entry: TimelineEntry
  ): Promise<TimelineEntry[]> {
    await mkdir(this.timelineDir, { recursive: true });

    const timeline = await this.getTimeline(learnerId);

    timeline.unshift(entry);

    await writeFile(
      path.join(this.timelineDir, `${learnerId}.json`),
      JSON.stringify(timeline, null, 2)
    );

    return timeline;
  }
}

export const learnerTimelineRepository =
  new LearnerTimelineRepository();
