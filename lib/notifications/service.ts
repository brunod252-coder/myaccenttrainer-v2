import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  metadata?: Prisma.InputJsonValue;
  dedupeKey?: string | null;
};

export async function createNotification(
  input: CreateNotificationInput,
) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      metadata: input.metadata,
      dedupeKey: input.dedupeKey ?? null,
    },
  });
}

export async function getNotifications(
  userId: string,
  limit = 30,
) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: Math.min(Math.max(limit, 1), 100),
  });
}

export async function getUnreadNotificationCount(
  userId: string,
) {
  return prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
) {
  const result =
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

  return result.count > 0;
}

export async function markAllNotificationsRead(
  userId: string,
) {
  const result =
    await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

  return result.count;
}

export async function createNotificationOnce(
  input: CreateNotificationInput & {
    dedupeKey: string;
  },
) {
  const existing =
    await prisma.notification.findUnique({
      where: {
        dedupeKey: input.dedupeKey,
      },
    });

  if (existing) {
    return {
      notification: existing,
      created: false,
    };
  }

  try {
    const notification =
      await createNotification(input);

    return {
      notification,
      created: true,
    };
  } catch (error) {
    /*
     * Protect against two copies of the same external event
     * arriving concurrently. The unique database index is the
     * final authority.
     */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const notification =
        await prisma.notification.findUnique({
          where: {
            dedupeKey: input.dedupeKey,
          },
        });

      if (notification) {
        return {
          notification,
          created: false,
        };
      }
    }

    throw error;
  }
}

