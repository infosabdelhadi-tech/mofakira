// PWA Service Worker for Offline Caching and Desktop/Mobile Standalone Reliability (v3.0)
// Designed for root domain and subpaths (e.g. GitHub Pages /mofakira/)
const CACHE_NAME = 'mofakira-cache-v3.0';

// Cache essential static shell assets during install
self.addEventListener('install', (event) => {
  const scope = self.registration.scope;
  const shellAssets = [
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
      return cache.addAll(shellAssets.map(url => new Request(url, { cache: 'reload' }))).catch(err => {
        console.warn('Cache addAll non-blocking warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Remove older cache versions on activation and immediately claim clients
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

// Intelligent fetch handling:
// 1. Navigation requests (HTML document): Network-First, falling back to cached index.html
// 2. Static Assets (JS, CSS, fonts, images): Cache-First with runtime caching
// 3. CRITICAL: Never return index.html for non-navigation requests (prevents syntax/MIME error blank screens)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isNavigate = event.request.mode === 'navigate';
  const isSameOrigin = url.origin === self.location.origin;

  // 1. Navigation Mode (HTML Document)
  if (isNavigate) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
              // Also update scope root cache
              cache.put(self.registration.scope, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback exclusively for navigation
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const rootCached = await caches.match(self.registration.scope);
          if (rootCached) return rootCached;
          const indexCached = await caches.match(`${self.registration.scope}index.html`);
          if (indexCached) return indexCached;
          return new Response('Offline: Page not available in cache', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts, Audio, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Cache-Hit: return immediately, update cache in background if same-origin
        if (isSameOrigin) {
          fetch(event.request).then((freshResponse) => {
            if (freshResponse && freshResponse.status === 200 && freshResponse.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, freshResponse);
              });
            }
          }).catch(() => {
            // Ignore background fetch errors in offline mode
          });
        }
        return cachedResponse;
      }

      // Cache-Miss: fetch from network and store in cache
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((fetchErr) => {
        // DO NOT return index.html for scripts/styles!
        console.warn('Asset fetch failed and not in cache:', event.request.url, fetchErr);
        return new Response('', { status: 404, statusText: 'Not Found' });
      });
    })
  );
});
