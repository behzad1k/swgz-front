const CACHE_NAME = 'swgz-music-v1';
const urlsToCache = ['/', '/offline.html'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip cross-origin requests entirely - let the browser handle them normally
    if (url.origin !== location.origin) {
        return; // Don't call event.respondWith() - let browser handle CORS
    }

    // Handle same-origin requests
    if (event.request.url.includes('/music/stream/')) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) return response;

                return fetch(event.request).then((response) => {
                    if (!response || response.status !== 200) return response;

                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                });
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((response) =>
                response || fetch(event.request)
            )
        );
    }
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
                })
            )
        )
    );
});