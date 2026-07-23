import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRequest } from "@/lib/auth/admin";
import { createFaq, deleteFaq, toggleFaq } from "@/lib/content/content";

export const runtime = "nodejs";

const schema = z.object({
  action: z.enum(["create", "delete", "toggle"]),
  id: z.string().optional(),
  question: z.string().max(300).optional(),
  answer: z.string().max(2000).optional(),
  published: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = schema.parse(await req.json());
    if (b.action === "create" && b.question && b.answer) await createFaq(b.question, b.answer);
    else if (b.action === "delete" && b.id) await deleteFaq(b.id);
    else if (b.action === "toggle" && b.id) await toggleFaq(b.id, Boolean(b.published));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
