// ── Admin guard ──────────────────────────────────────────────────────
// Ensures the current session belongs to an ADMIN; otherwise redirects.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export type AdminUser = { id: string; email: string; firstName: string | null; lastName: string | null; role: string };

export async function requireAdmin(): Promise<AdminUser> {
  const token = (await cookies()).get("mat_session")?.value;
  if (!token) redirect("/login");
  let userId = "";
  try {
    userId = verifyAuthToken(token).userId;
  } catch {
    redirect("/login");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

// Non-redirecting admin check for API routes. Returns true if the caller is an ADMIN.
export async function isAdminRequest(): Promise<boolean> {
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return false;
    const { userId } = verifyAuthToken(token);
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    return u?.role === "ADMIN";
  } catch {
    return false;
  }
}
