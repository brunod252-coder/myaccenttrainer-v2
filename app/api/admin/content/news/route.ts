import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRequest } from "@/lib/auth/admin";
import { createNews, deleteNews, toggleNews } from "@/lib/content/content";

export const runtime = "nodejs";

const schema = z.object({
  action: z.enum(["create", "delete", "toggle"]),
  id: z.string().optional(),
  title: z.string().max(200).optional(),
  excerpt: z.string().max(1000).optional(),
  dateLabel: z.string().max(60).optional(),
  published: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = schema.parse(await req.json());
    if (b.action === "create" && b.title && b.excerpt) await createNews(b.title, b.excerpt, b.dateLabel || "");
    else if (b.action === "delete" && b.id) await deleteNews(b.id);
    else if (b.action === "toggle" && b.id) await toggleNews(b.id, Boolean(b.published));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
