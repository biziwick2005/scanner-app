const CACHE_NAME = 'edureg-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/attendance.html',
  '/parent.html',
  '/about.html',
  '/style.css',
  '/manifest.json',
  '/firebase-config.js',
  '/biometric.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (url.origin !== self.location.origin) {
    if (url.hostname.includes('cdn') || url.hostname.includes('gstatic') || url.hostname.includes('googleapis')) {
      event.respondWith(
        fetch(event.request).catch(() => {
          return new Response('Resource not available offline', { status: 404 });
        })
      );
      return;
    }
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
  );
});