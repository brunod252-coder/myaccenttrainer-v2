import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRequest } from "@/lib/auth/admin";
import { setSetting } from "@/lib/content/content";

export const runtime = "nodejs";

const schema = z.object({ key: z.string().min(1).max(60), value: z.string().max(500) });

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = schema.parse(await req.json());
    await setSetting(b.key, b.value);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
