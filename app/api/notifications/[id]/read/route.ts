import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";
import { markNotificationRead } from "@/lib/notifications/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
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

  const { id } = await context.params;

  const updated =
    await markNotificationRead(
      userId,
      id,
    );

  if (!updated) {
    return NextResponse.json(
      {
        message:
          "Notification was not found or is already read.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
  });
}
