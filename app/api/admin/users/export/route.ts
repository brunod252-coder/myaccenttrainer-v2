import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { listUsersForExport } from "@/lib/admin/stats";

export const runtime = "nodejs";

// GET /api/admin/users/export → CSV of all users (admin only).
export async function GET() {
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    const { userId } = verifyAuthToken(token);
    const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!me || me.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rows = await listUsersForExport();
  const lines = ["Email,Name,Role,Created"];
  for (const r of rows) {
    lines.push(`${r.email},"${r.name.replaceAll('"', '""')}",${r.role},${r.created}`);
  }
  return new NextResponse(lines.join("\r\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="myaccenttrainer-users.csv"',
    },
  });
}
