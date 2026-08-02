import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import {
  getEnrollmentState,
  getEnrollmentRedirect,
} from "@/lib/auth/enrollment";

export async function requireEnrollment() {
  const token = (await cookies()).get("mat_session")?.value;

  if (!token) {
    redirect("/login");
  }

  let payload;

  try {
    payload = verifyAuthToken(token);
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user) {
    redirect("/login");
  }

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
