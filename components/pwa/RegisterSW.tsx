"use client";

import { useEffect } from "react";

/**
 * Temporary PWA cleanup.
 *
 * Removes the previous service worker and its cached offline fallback so
 * normal Next.js navigation always reaches the live application.
 */
export default function RegisterSW() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    async function removeOldWorker() {
      try {
        const registrations =
          await navigator.serviceWorker.getRegistrations();

        await Promise.all(
          registrations.map((registration) =>
            registration.unregister(),
          ),
        );

        if ("caches" in window) {
          const cacheNames = await caches.keys();

          await Promise.all(
            cacheNames.map((name) => caches.delete(name)),
          );
        }
      } catch (error) {
        console.error("SERVICE_WORKER_CLEANUP_ERROR", error);
      }
    }

    removeOldWorker();
  }, []);

  return null;
}
