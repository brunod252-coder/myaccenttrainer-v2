import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyAuthToken } from "@/lib/jwt";
import { setGoal } from "@/lib/nina/goals";

export const runtime = "nodejs";

const schema = z.object({
  weeklyTarget: z.number().int().min(1).max(7),
  clarityTarget: z.number().int().min(50).max(100).nullable().optional(),
});

// POST /api/coaching/goal { weeklyTarget, clarityTarget? }
export async function POST(request: Request) {
  let userId = "";
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    userId = verifyAuthToken(token).userId;
  } catch {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  try {
    const { weeklyTarget, clarityTarget } = schema.parse(await request.json());
    const goal = await setGoal(userId, weeklyTarget, clarityTarget ?? null);
    return NextResponse.json({ ok: true, goal });
  } catch {
    return NextResponse.json({ error: "Invalid goal." }, { status: 400 });
  }
}
