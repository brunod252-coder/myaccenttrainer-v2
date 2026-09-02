import { redirect } from "next/navigation";

import {
  getEnrollmentRedirect,
  getEnrollmentState,
} from "@/lib/auth/enrollment";
import { requireAuthenticatedUser } from "@/lib/auth/requireAuthenticatedUser";
import { prisma } from "@/lib/prisma";

export async function requirePremiumAccess() {
  const user = await requireAuthenticatedUser();

  const profile = await prisma.userProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      englishGoal: true,
      proficiencyLevel: true,
    },
  });

  const enrollmentState = getEnrollmentState({
    emailVerified: user.emailVerified,
    englishGoal: profile?.englishGoal,
    proficiencyLevel: profile?.proficiencyLevel,
    subscriptionStatus: user.subscriptionStatus,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
  });

  const destination = getEnrollmentRedirect(enrollmentState);

  if (destination) {
    redirect(destination);
  }

  return {
    user,
    enrollmentState,
  };
}
