// public/sw.js
'use strict';

const CACHE_VERSION = 'v2';
const CACHE_NAME = `music-player-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
    console.log('[SW] Install event');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS).catch((error) => {
                    console.error('[SW] Precaching failed:', error);
                    return Promise.resolve();
                });
            })
            .then(() => {
                console.log('[SW] Skip waiting');
                return self.skipWaiting();
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName.startsWith('music-player-') && cacheName !== CACHE_NAME ||
                                cacheName.startsWith('runtime-') && cacheName !== RUNTIME_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // CRITICAL: Let audio streaming requests pass through completely
    // Don't use event.respondWith() for streaming - just return and let browser handle it
    if (
        url.pathname.includes('/music/stream/') ||
        url.pathname.includes('/music/stream') ||
        url.pathname.match(/\/music\/stream\/[^/]+/) ||
        request.destination === 'audio' ||
        request.headers.has('range')
    ) {
        console.log('[SW] 🎵 Bypassing service worker for audio stream:', url.pathname);
        // Don't call event.respondWith() - let the request go directly to network
        return;
    }

    // Skip cross-origin requests (except your API domain)
    if (url.origin !== self.location.origin) {
        return;
    }

    // API calls - Network first, fallback to cache (but NOT streaming endpoints)
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/music/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    console.log('[SW] API response:', response.status, url.pathname);

                    // Only cache successful GET requests
                    // if (request.method === 'GET' && response.status === 200) {
                    //     const responseClone = response.clone();
                    //     caches.open(RUNTIME_CACHE).then((cache) => {
                    //         cache.put(request, responseClone);
                    //     });
                    // }
                    return response;
                })
                .catch((error) => {
                    console.error('[SW] API fetch failed:', error);
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('[SW] Serving cached API response:', url.pathname);
                            return cachedResponse;
                        }
                        return new Response(JSON.stringify({ error: 'Offline' }), {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'application/json' }
                        });
                    });
                })
        );
        return;
    }

    // Navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            return caches.match('/index.html');
                        });
                })
        );
        return;
    }

    // Static assets - Cache first
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    fetch(request).then((response) => {
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(RUNTIME_CACHE).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                    }).catch(() => {});

                    return cachedResponse;
                }

                return fetch(request)
                    .then((response) => {
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(RUNTIME_CACHE).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch((error) => {
                        console.error('[SW] Fetch failed:', error);
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Message event
self.addEventListener('message', (event) => {
    if (!event.data) {
        return;
    }

    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CLEAR_CACHE':
            event.waitUntil(
                caches.keys().then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => caches.delete(cacheName))
                    );
                }).then(() => {
                    if (event.ports && event.ports[0]) {
                        event.ports[0].postMessage({ success: true });
                    }
                })
            );
            break;

        default:
            console.warn('[SW] Unknown message type:', event.data.type);
    }
});

console.log('[SW] Service Worker loaded');