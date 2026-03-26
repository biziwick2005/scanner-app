const CACHE_NAME = 'edureg-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/attendance.html',
  '/about.html',
  '/style.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip external resources (Firebase, CDNs, etc.)
  if (url.origin !== self.location.origin) {
    // For CDNs and external resources, try network first
    if (url.hostname.includes('gstatic') || 
        url.hostname.includes('googleapis') ||
        url.hostname.includes('firebase') ||
        url.hostname.includes('cloudflare') ||
        url.hostname.includes('cdn.jsdelivr')) {
      event.respondWith(fetch(event.request));
      return;
    }
    return;
  }
  
  // For internal assets: cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }).catch(() => {
      // Fallback to index.html for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
      return new Response('Offline content not available', { status: 404 });
    })
  );
});
