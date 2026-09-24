/**
 * SERVICE WORKER: makes the app open and work with no internet.
 *
 * How it works, in plain words:
 *  - On first visit, it saves the main screens, icons, and songs on the device.
 *  - App code and songs: served from the saved copy first (fast, offline).
 *  - Pages: tries the internet first for the freshest version, and falls
 *    back to the saved copy when offline.
 *
 * After changing which screens exist, bump VERSION so phones refresh their copy.
 */
const VERSION = "rhythm-v4";

const CORE = [
  "/",
  "/wheel",
  "/rhythm",
  "/moments",
  "/music",
  "/settings",
  "/welcome",
  // One page per dimension. Keep in sync with dimensions in app.config.ts.
  "/dimension/career",
  "/dimension/health",
  "/dimension/relationships",
  "/dimension/joy",
  "/dimension/growth",
  "/dimension/stillness",
  "/dimension/environment",
  "/dimension/finances",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/audio/golden-hour.wav",
  "/audio/morning-tide.wav",
  "/audio/still-water.wav",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      // Save each one separately so a single failure never blocks the rest.
      .then((cache) => Promise.all(CORE.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  // Remove copies saved by older versions.
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/audio/") ||
  url.pathname.startsWith("/icons/");

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Let the browser handle partial audio requests (seeking) directly.
  if (request.headers.has("range")) return;

  if (isStaticAsset(url)) {
    // Saved copy first, internet only if we have never seen it.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Everything else: internet first, saved copy when offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request, { ignoreSearch: request.mode === "navigate" });
        if (cached) return cached;
        if (request.mode === "navigate") return (await caches.match("/")) || Response.error();
        return Response.error();
      }),
  );
});
