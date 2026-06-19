const OFFLINE_CACHE = 'quickmate-offline-v1.0.2';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/icons/quickmate-icon-192.png',
  '/icons/quickmate-icon-512.png',
  '/icons/quickmate-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => undefined),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('quickmate-offline-') && cacheName !== OFFLINE_CACHE)
          .map((cacheName) => caches.delete(cacheName)),
      )),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => (
      caches.match(OFFLINE_URL).then((cachedResponse) => (
        cachedResponse || new Response('QuickMate is offline.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      ))
    )),
  );
});
