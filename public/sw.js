// MyAccentTrainer service-worker cleanup.
// This intentionally removes the previous offline service worker and caches.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.registration.unregister(),
      caches.keys().then((names) =>
        Promise.all(names.map((name) => caches.delete(name))),
      ),
      self.clients.claim(),
    ]),
  );
});
