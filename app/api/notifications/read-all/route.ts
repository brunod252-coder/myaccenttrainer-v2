import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";
import { markAllNotificationsRead } from "@/lib/notifications/service";

export const runtime = "nodejs";

export async function POST() {
  const token =
    (await cookies()).get("mat_session")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Please log in." },
      { status: 401 },
    );
  }

  let userId: string;

  try {
    userId = verifyAuthToken(token).userId;
  } catch {
    return NextResponse.json(
      { message: "Your session has expired." },
      { status: 401 },
    );
  }

  const updatedCount =
    await markAllNotificationsRead(userId);

  return NextResponse.json({
    ok: true,
    updatedCount,
  });
}
