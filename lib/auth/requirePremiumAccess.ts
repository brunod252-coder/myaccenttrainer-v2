import { redirect } from "next/navigation";

import {
  getEnrollmentRedirect,
  getEnrollmentState,
} from "@/lib/auth/enrollment";
import { requireAuthenticatedUser } from "@/lib/auth/requireAuthenticatedUser";

export async function requirePremiumAccess() {
  const user = await requireAuthenticatedUser();

  const enrollmentState = getEnrollmentState({
    emailVerified: user.emailVerified,
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
