import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyAuthToken } from "@/lib/jwt";
import { toggleBookmark } from "@/lib/lessons/bookmarks";

export const runtime = "nodejs";

const schema = z.object({
  slug: z.string().min(1).max(80),
  kind: z.enum(["favorite", "bookmark"]),
});

// POST /api/lessons/bookmark  { slug, kind } → toggles, returns { active }
export async function POST(request: Request) {
  let userId = "";
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    userId = verifyAuthToken(token).userId;
  } catch {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  let slug = "", kind: "favorite" | "bookmark" = "favorite";
  try {
    const parsed = schema.parse(await request.json());
    slug = parsed.slug;
    kind = parsed.kind;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await toggleBookmark(userId, slug, kind);
  return NextResponse.json(result);
}
