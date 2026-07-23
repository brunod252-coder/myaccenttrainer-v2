import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";

export class LearnerRepository {
  private readonly learnerDir = path.join(
    process.cwd(),
    "data",
    "learner-profiles"
  );

  async save(id: string, profile: unknown) {
    await mkdir(this.learnerDir, { recursive: true });

    await writeFile(
      path.join(this.learnerDir, `${id}.json`),
      JSON.stringify(profile, null, 2)
    );
  }

  async findById(id: string) {
    const file = await readFile(
      path.join(this.learnerDir, `${id}.json`),
      "utf8"
    );

    return JSON.parse(file);
  }
}

export const learnerRepository = new LearnerRepository();
