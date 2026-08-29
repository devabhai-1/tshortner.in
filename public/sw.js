// Service Worker — TShortner PWA
// Bump CACHE_NAME on each deploy so activate() drops old Cache Storage buckets.
const CACHE_NAME = 'tshortner-v7-shell';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-192x192-maskable.png',
  '/icon-512x512-maskable.png',
];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isFirebaseOrExternal(url) {
  const u = url.href;
  return (
    u.includes('firebase') ||
    u.includes('googleapis') ||
    u.includes('gstatic') ||
    (u.startsWith('http') && !u.startsWith(self.location.origin))
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(PRECACHE_URLS.map((path) => new Request(path, { cache: 'reload' })))
      )
      .catch((err) => console.error('SW precache failed', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!isSameOrigin(url) || isFirebaseOrExternal(url)) {
    return;
  }

  const path = url.pathname;

  // Vite build output — never serve stale hashed bundles from Cache Storage
  if (path.startsWith('/assets/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Service worker self — always network
  if (path === '/sw.js') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Full page loads: always network so deploy / refresh picks latest index.html (offline: precached shell)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html').then((r) => r || caches.match('/'))
      )
    );
    return;
  }

  // Other same-origin GET: cache-first for precached shell files only; do not cache arbitrary routes
  const precachePath = PRECACHE_URLS.includes(path) || path === '/index.html';
  if (!precachePath) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      });
    })
  );
});
