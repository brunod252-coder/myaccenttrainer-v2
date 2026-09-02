import { cookies } from "next/headers";

import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export type MarketingSessionUser = {
  id: string;
  firstName: string | null;
  role: string;
};

export async function getMarketingSessionUser():
  Promise<MarketingSessionUser | null> {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get("mat_session")?.value;

    if (!token) {
      return null;
    }

    const { userId } =
      verifyAuthToken(token);

    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        role: true,
      },
    });
  } catch {
    return null;
  }
}

export function getMarketingDestination(
  user: MarketingSessionUser | null,
) {
  if (!user) {
    return "/register";
  }

  return user.role === "ADMIN"
    ? "/admin"
    : "/dashboard";
}

export function getMarketingCtaLabel(
  user: MarketingSessionUser | null,
) {
  if (!user) {
    return "Start free assessment";
  }

  return user.role === "ADMIN"
    ? "Go to Admin"
    : "Continue learning";
}
