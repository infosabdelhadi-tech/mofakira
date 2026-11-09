// PWA Service Worker for Offline Caching (v2.2)
// Designed for both root domain and subpaths (e.g. GitHub Pages /mofakira/)
const CACHE_NAME = 'mofakira-cache-v2.2';

// Cache core assets relatively based on registration scope
self.addEventListener('install', (event) => {
  const scope = self.registration.scope;
  const assets = [
    scope,
    `${scope}index.html`,
    `${scope}manifest.json`,
    `${scope}mofakkira-icon.svg`,
    `${scope}icon-192.png`,
    `${scope}icon-512.png`,
    `${scope}favicon.svg`
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets.map(url => new Request(url, { cache: 'reload' }))).catch(err => {
        console.warn('Cache addAll non-blocking warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache successful basic responses for offline navigation
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback to cached scope index.html when offline
      return caches.match(self.registration.scope) || caches.match(`${self.registration.scope}index.html`);
    })
  );
});
