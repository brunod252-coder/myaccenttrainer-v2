import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { consumeToken } from "@/lib/auth/tokens";

export const runtime = "nodejs";

const schema = z.object({ token: z.string().min(10), password: z.string().min(8) });

// POST /api/auth/reset-password { token, password }
export async function POST(req: Request) {
  let token = "", password = "";
  try {
    const parsed = schema.parse(await req.json());
    token = parsed.token;
    password = parsed.password;
  } catch {
    return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
  }

  const userId = await consumeToken(token, "reset");
  if (!userId) {
    return NextResponse.json(
      { message: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await hashPassword(password);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return NextResponse.json({ message: "Your password has been reset. You can now log in." });
  } catch {
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
