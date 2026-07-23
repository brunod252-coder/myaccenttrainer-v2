import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyAuthToken } from "@/lib/jwt";
import { redeemPromo } from "@/lib/payments/wallet";

export const runtime = "nodejs";

const schema = z.object({ code: z.string().min(2).max(40) });

// POST /api/wallet/redeem  { code }
export async function POST(request: Request) {
  let userId = "";
  try {
    const token = (await cookies()).get("mat_session")?.value;
    if (!token) return NextResponse.json({ ok: false, error: "Please log in first." }, { status: 401 });
    userId = verifyAuthToken(token).userId;
  } catch {
    return NextResponse.json({ ok: false, error: "Please log in first." }, { status: 401 });
  }

  let code = "";
  try {
    const parsed = schema.parse(await request.json());
    code = parsed.code;
  } catch {
    return NextResponse.json({ ok: false, error: "Enter a valid code." }, { status: 400 });
  }

  const result = await redeemPromo(userId, code);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
