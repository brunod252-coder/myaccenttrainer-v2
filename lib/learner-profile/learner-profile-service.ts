import { learnerRepository } from "@/lib/learner-repository/learner-repository";

export type LearnerProfile = {
  id: string;
  displayName: string;
  currentLevel: string;
  nativeLanguage: string;
  targetAccent: string;
  confidenceScore: number;
  lessonsCompleted: number;
  wordsPracticed: number;
  wordsPracticedToday: number;
  confidenceGainedToday: number;
  lastPracticedAt?: string;
  focusAreas: string[];
  strengths: string[];
  lastUpdatedAt: string;
};

function isSameDay(dateA?: string, dateB = new Date()) {
  if (!dateA) return false;

  const a = new Date(dateA);

  return (
    a.getFullYear() === dateB.getFullYear() &&
    a.getMonth() === dateB.getMonth() &&
    a.getDate() === dateB.getDate()
  );
}

export class LearnerProfileService {
  async getOrCreateProfile(id: string, displayName: string) {
    try {
      const profile = await learnerRepository.findById(id);

      return {
        wordsPracticedToday: 0,
        confidenceGainedToday: 0,
        ...profile,
      };
    } catch {
      const profile: LearnerProfile = {
        id,
        displayName,
        currentLevel: "Beginner",
        nativeLanguage: "Not set",
        targetAccent: "American English",
        confidenceScore: 0,
        lessonsCompleted: 0,
        wordsPracticed: 0,
        wordsPracticedToday: 0,
        confidenceGainedToday: 0,
        focusAreas: ["American R", "TH sounds"],
        strengths: [],
        lastUpdatedAt: new Date().toISOString(),
      };

      await learnerRepository.save(id, profile);

      return profile;
    }
  }

  async saveProfile(id: string, profile: LearnerProfile) {
    await learnerRepository.save(id, profile);

    return profile;
  }

  async recordPractice(
    id: string,
    displayName: string,
    wordsPracticed: number
  ) {
    const profile = await this.getOrCreateProfile(id, displayName);

    const now = new Date();
    const practicedToday = isSameDay(profile.lastPracticedAt, now);

    const confidenceGain = Math.max(1, wordsPracticed * 0.2);

    const updatedProfile: LearnerProfile = {
      ...profile,
      wordsPracticed: profile.wordsPracticed + wordsPracticed,
      wordsPracticedToday: practicedToday
        ? profile.wordsPracticedToday + wordsPracticed
        : wordsPracticed,
      confidenceScore: Math.min(100, profile.confidenceScore + confidenceGain),
      confidenceGainedToday: practicedToday
        ? profile.confidenceGainedToday + confidenceGain
        : confidenceGain,
      lastPracticedAt: now.toISOString(),
      lastUpdatedAt: now.toISOString(),
    };

    await learnerRepository.save(id, updatedProfile);

    return updatedProfile;
  }
}

export const learnerProfileService = new LearnerProfileService();
