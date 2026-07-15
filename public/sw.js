// Minimal PWA app-shell service worker.
//
// Scope, deliberately: cache the static app shell (JS/CSS/fonts/icons) so
// the app installs and repeat visits load instantly, and show a friendly
// offline page for full navigations that fail with no network. It does NOT
// cache API responses or attempt background sync of mutations made while
// offline — see docs/ROADMAP.md ("Full offline sync engine") for why that's
// a much bigger, deliberately deferred project (conflict resolution for
// concurrent attendance/hostel/library writes has to be designed per
// module, not bolted on generically here).

const CACHE_VERSION = "jnv-smart-connect-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never touch API calls — they carry auth/session state and must always
  // hit the network (or fail visibly), never serve stale cached data.
  if (url.pathname.startsWith("/api")) return;

  // Full-page navigations: try the network first, fall back to the cached
  // shell/offline page if it fails.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((res) => res ?? Response.error()))
    );
    return;
  }

  // Static assets (Next.js build output, icons, fonts): cache-first, then
  // fill the cache from the network in the background.
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});
