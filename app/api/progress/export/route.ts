import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";
import { getAttemptRowsForExport, getAnalytics } from "@/lib/analytics/insights";

export const runtime = "nodejs";

// GET /api/progress/export  → downloads a CSV report of the learner's attempts.
export async function GET() {
  let userId = "";
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    userId = verifyAuthToken(token).userId;
  } catch {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const [rows, analytics] = await Promise.all([
    getAttemptRowsForExport(userId),
    getAnalytics(userId),
  ]);

  const lines: string[] = [];
  lines.push("MyAccentTrainer — Progress Report");
  lines.push(`Generated,${new Date().toISOString()}`);
  lines.push(`Total recordings,${analytics.totalAttempts}`);
  lines.push(`Days practiced,${analytics.daysPracticed}`);
  lines.push(`Sounds worked on,${analytics.distinctSounds}`);
  lines.push(`Speaking time (minutes),${analytics.speakingMinutes}`);
  lines.push("");
  lines.push("Date,Sound,Score");
  for (const r of rows) {
    const sound = `"${r.sound.replaceAll('"', '""')}"`;
    lines.push(`${r.date},${sound},${r.score}`);
  }

  const csv = lines.join("\r\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="myaccenttrainer-progress.csv"`,
    },
  });
}
