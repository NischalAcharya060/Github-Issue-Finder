/**
 * Service worker for GitHub Issue Finder (PWA).
 *
 * Strategy:
 *  - App shell + offline page are precached on install.
 *  - Navigations: network-first, falling back to cache, then the offline page.
 *  - Static assets (icons, fonts, images, _next/static): stale-while-revalidate.
 *  - GitHub API requests: always go to the network (never cached — data must be live).
 *
 * Bump CACHE_VERSION to invalidate old caches on deploy.
 */

const CACHE_VERSION = "v1"
const CACHE_NAME = `issue-finder-${CACHE_VERSION}`
const OFFLINE_URL = "/offline.html"

const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/favicon/site.webmanifest",
  "/favicon/favicon-32x32.png",
  "/favicon/android-chrome-192x192.png",
  "/favicon/android-chrome-512x512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// Allow the page to trigger an immediate activation after an update.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting()
})

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/favicon/") ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|css|js)$/.test(url.pathname)
  )
}

self.addEventListener("fetch", (event) => {
  const { request } = event

  // Only handle GET; let the browser deal with everything else.
  if (request.method !== "GET") return

  const url = new URL(request.url)

  // Never intercept cross-origin requests (e.g. GitHub API, avatars). Live only.
  if (url.origin !== self.location.origin) return

  // App-shell navigations: network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || caches.match(OFFLINE_URL)
        })
    )
    return
  }

  // Static assets: stale-while-revalidate.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          })
          .catch(() => cached)
        return cached || network
      })
    )
  }
})
