import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRequest } from "@/lib/auth/admin";
import { createCourse, deleteCourse, toggleCourse } from "@/lib/content/content";

export const runtime = "nodejs";

const schema = z.object({
  action: z.enum(["create", "delete", "toggle"]),
  id: z.string().optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  isPublished: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = schema.parse(await req.json());
    if (b.action === "create" && b.title) await createCourse(b.title, b.description || "");
    else if (b.action === "delete" && b.id) await deleteCourse(b.id);
    else if (b.action === "toggle" && b.id) await toggleCourse(b.id, Boolean(b.isPublished));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
