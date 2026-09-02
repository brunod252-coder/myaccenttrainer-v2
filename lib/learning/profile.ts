import { prisma } from "@/lib/prisma";

import {
  getLearningMission,
  normalizeLearningLevel,
  type LearningLevel,
  type LearningMission,
} from "./mission";

export interface LearningProfile {
  englishGoal: string | null;
  proficiencyLevel: string | null;
  mission: LearningMission;
  level: LearningLevel;
}

export async function getLearningProfile(
  userId: string,
): Promise<LearningProfile> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      englishGoal: true,
      proficiencyLevel: true,
    },
  });

  return {
    englishGoal: profile?.englishGoal ?? null,
    proficiencyLevel: profile?.proficiencyLevel ?? null,
    mission: getLearningMission(profile?.englishGoal),
    level: normalizeLearningLevel(profile?.proficiencyLevel),
  };
}
