import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";
import {
  getNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
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

  const [notifications, unreadCount] =
    await Promise.all([
      getNotifications(userId, 30),
      getUnreadNotificationCount(userId),
    ]);

  return NextResponse.json({
    unreadCount,
    notifications: notifications.map(
      (notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        href: notification.href,
        metadata: notification.metadata,
        readAt:
          notification.readAt?.toISOString() ??
          null,
        createdAt:
          notification.createdAt.toISOString(),
      }),
    ),
  });
}
