"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Bell } from "@/components/ui/icons";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  metadata: unknown;
  readAt: string | null;
  createdAt: string;
};

type NotificationResponse = {
  unreadCount: number;
  notifications: NotificationItem[];
};

function formatNotificationTime(value: string) {
  const date = new Date(value);

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);
  const [error, setError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          "Could not load notifications.",
        );
      }

      const data =
        (await response.json()) as NotificationResponse;

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setError("");
    } catch {
      setError(
        "We could not load your notifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  async function markRead(
    notificationId: string,
  ) {
    const notification =
      notifications.find(
        (item) => item.id === notificationId,
      );

    if (!notification || notification.readAt) {
      return;
    }

    const response = await fetch(
      `/api/notifications/${notificationId}/read`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "same-origin",
      },
    );

    if (!response.ok) {
      return;
    }

    const readAt = new Date().toISOString();

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              readAt,
            }
          : item,
      ),
    );

    setUnreadCount((current) =>
      Math.max(0, current - 1),
    );
  }

  async function markAllRead() {
    const response = await fetch(
      "/api/notifications/read-all",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "same-origin",
      },
    );

    if (!response.ok) {
      return;
    }

    const readAt = new Date().toISOString();

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        readAt: item.readAt ?? readAt,
      })),
    );

    setUnreadCount(0);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-[#e9f8f3]"
      >
        <Bell className="h-[18px] w-[18px]" />

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#d1495b] px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="font-semibold text-[#17223b]">
                Notifications
              </p>

              <p className="mt-0.5 text-xs text-gray-500">
                {unreadCount === 0
                  ? "You're all caught up."
                  : `${unreadCount} unread`}
              </p>
            </div>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  void markAllRead();
                }}
                className="text-xs font-semibold text-[#168c56] hover:text-[#127548]"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#b54708]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    void loadNotifications();
                  }}
                  className="mt-3 text-sm font-semibold text-[#168c56]"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f8f3] text-[#168c56]">
                  <Bell className="h-5 w-5" />
                </div>

                <p className="mt-3 font-semibold text-[#17223b]">
                  No notifications yet
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Important account, learning, and billing updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const unread = !notification.readAt;

                const content = (
                  <div
                    className={[
                      "relative border-b border-gray-100 px-4 py-4 transition last:border-b-0",
                      unread
                        ? "bg-[#f3fbf7] hover:bg-[#ebf8f2]"
                        : "bg-white hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex gap-3">
                      <div className="pt-1">
                        <span
                          className={[
                            "block h-2.5 w-2.5 rounded-full",
                            unread
                              ? "bg-[#20ad68]"
                              : "bg-gray-200",
                          ].join(" ")}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p
                            className={[
                              "text-sm text-[#17223b]",
                              unread
                                ? "font-semibold"
                                : "font-medium",
                            ].join(" ")}
                          >
                            {notification.title}
                          </p>

                          <span className="shrink-0 text-[11px] text-gray-400">
                            {formatNotificationTime(
                              notification.createdAt,
                            )}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-5 text-gray-500">
                          {notification.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                if (notification.href) {
                  return (
                    <Link
                      key={notification.id}
                      href={notification.href}
                      onClick={() => {
                        void markRead(
                          notification.id,
                        );
                        setOpen(false);
                      }}
                      className="block"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      void markRead(
                        notification.id,
                      );
                    }}
                    className="block w-full text-left"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
