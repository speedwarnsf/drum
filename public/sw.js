/**
 * Service Worker for RepoDrum
 * v2.0.0 — hardened offline support
 *
 * Strategies:
 *   - Precache: app shell routes + key assets (install-time)
 *   - Static assets (/_next/static, images, fonts): cache-first, stale-while-revalidate
 *   - HTML navigations: network-first with offline fallback
 *   - API requests: network-first with cached fallback + offline JSON error
 *   - Auth/admin APIs: network-only
 */

const CACHE_VERSION = "v2.0.0";
const PRECACHE = `drum-precache-${CACHE_VERSION}`;
const RUNTIME  = `drum-runtime-${CACHE_VERSION}`;

// App shell — precached at install time
const PRECACHE_URLS = [
  "/drum",
  "/drum/today",
  "/drum/practice-enhanced",
  "/drum/patterns",
  "/drum/progress",
  "/drum/journal",
  "/drum/offline",
  "/manifest.json",
  "/media/repodrumlogo.gif",
];

// Never cache these
const NETWORK_ONLY_PATTERNS = [
  /\/api\/auth\//,
  /\/api\/admin\//,
  /\/api\/webhooks\//,
  /supabase\.co/,
];

// ----- Install -----
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ----- Activate -----
self.addEventListener("activate", (event) => {
  const currentCaches = new Set([PRECACHE, RUNTIME]);
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => !currentCaches.has(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ----- Fetch -----
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin (except same host)
  if (url.origin !== self.location.origin) return;

  // Network-only patterns
  if (NETWORK_ONLY_PATTERNS.some((re) => re.test(url.href))) return;

  // Decide strategy
  if (isImmutableAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (request.destination === "document" || request.mode === "navigate") {
    event.respondWith(networkFirstNav(request));
  } else if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstAPI(request));
  } else {
    // Everything else: stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request));
  }
});

// ----- Helpers -----

function isImmutableAsset(pathname) {
  // Next.js hashed static assets and common media
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/media/") ||
    /\.(woff2?|ttf|otf)$/.test(pathname)
  );
}

/** Cache-first — great for hashed/immutable assets */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 408 });
  }
}

/** Network-first for HTML navigations with offline fallback */
async function networkFirstNav(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Try cached version of this page
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fall back to the precached offline page
    const offlinePage = await caches.match("/drum/offline");
    if (offlinePage) return offlinePage;

    return new Response("<h1>Offline</h1>", {
      status: 503,
      headers: { "Content-Type": "text/html" },
    });
  }
}

/** Network-first for API calls with cached fallback */
async function networkFirstAPI(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    return new Response(
      JSON.stringify({ error: "offline", message: "No internet connection" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

/** Stale-while-revalidate for general assets */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        caches.open(RUNTIME).then((cache) => cache.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || new Response("", { status: 408 });
}

// ----- Messages -----
self.addEventListener("message", (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "GET_VERSION":
      event.ports?.[0]?.postMessage({ version: CACHE_VERSION });
      break;

    case "CLEAR_CACHE":
      caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
        .then(() => event.ports?.[0]?.postMessage({ success: true }));
      break;
  }
});

// ----- Push Notifications -----
self.addEventListener("push", (event) => {
  const defaults = {
    body: "Time for your daily drum practice! 🥁",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: { url: "/drum/today" },
    tag: "practice-reminder",
  };

  let options = defaults;
  if (event.data) {
    try {
      const data = event.data.json();
      options = { ...defaults, ...data };
    } catch { /* use defaults */ }
  }

  event.waitUntil(
    self.registration.showNotification("RepoDrum", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/drum/today";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((list) => {
      for (const client of list) {
        if (client.url.includes("/drum") && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
