// Hub Service Worker - Advanced PWA Implementation
// Version: 2.0.0 - Week 2 Enhancement

const CACHE_NAME = 'hub-service-v2';
const RUNTIME_CACHE = 'hub-runtime-v2';
const STATIC_CACHE = 'hub-static-v2';
const API_CACHE = 'hub-api-v2';

// Cache Strategies Configuration
const CACHE_STRATEGIES = {
    pages: 'NetworkFirst',
    api: 'NetworkFirst',
    static: 'CacheFirst',
    images: 'CacheFirst'
};

// Assets to precache
const PRECACHE_URLS = [
    '/',
    '/offline.html',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/manifest.json'
];

// Install Event - Cache static assets
self.addEventListener('install', event => {
    console.log('🔧 Hub Service Worker installing...');
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Precaching static assets for Hub service');
                return cache.addAll(PRECACHE_URLS);
            }),
            self.skipWaiting()
        ])
    );
});

// Activate Event - Clean old caches
self.addEventListener('activate', event => {
    console.log('✅ Hub Service Worker activated');
    event.waitUntil(
        Promise.all([
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName =>
                            cacheName.startsWith('hub-') &&
                            !['hub-service-v2', 'hub-runtime-v2', 'hub-static-v2', 'hub-api-v2'].includes(cacheName)
                        )
                        .map(cacheName => {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            self.clients.claim()
        ])
    );
});

// Fetch Event - Handle all requests
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and chrome-extension
    if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
        return;
    }

    // Handle different request types
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
    } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
        event.respondWith(handleStaticRequest(request));
    } else {
        event.respondWith(handlePageRequest(request));
    }
});

// API Request Handler - Network First with offline fallback
async function handleApiRequest(request) {
    const cache = await caches.open(API_CACHE);

    try {
        // Try network first
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache successful responses
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.warn('🌐 Network failed for API request, checking cache:', request.url);

        // Try cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline response for hub endpoints
        if (request.url.includes('/hub/')) {
            return new Response(
                JSON.stringify({
                    error: 'offline',
                    message: 'Hub services unavailable offline. Please check your connection.',
                    offline: true,
                    services: {
                        admin: 'offline',
                        id: 'offline',
                        gateway: 'offline',
                        cbd: 'offline'
                    }
                }),
                {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Generic offline API response
        return new Response(
            JSON.stringify({
                error: 'offline',
                message: 'This feature requires an internet connection.',
                offline: true
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Static Asset Handler - Cache First
async function handleStaticRequest(request) {
    const cache = await caches.open(STATIC_CACHE);

    // Check cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        // Fetch from network and cache
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.warn('🌐 Failed to fetch static asset:', request.url);
        throw error;
    }
}

// Page Request Handler - Network First with offline fallback
async function handlePageRequest(request) {
    const cache = await caches.open(RUNTIME_CACHE);

    try {
        // Try network first
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache the page
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.warn('🌐 Network failed for page, checking cache:', request.url);

        // Try cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page
        const offlineResponse = await cache.match('/offline.html');
        return offlineResponse || new Response('Offline', { status: 503 });
    }
}

// Background Sync - For offline actions
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);

    if (event.tag === 'hub-sync') {
        event.waitUntil(syncHubData());
    }
});

// Sync hub data when online
async function syncHubData() {
    console.log('🔄 Syncing hub data...');
    // Implementation for syncing cached hub requests
}

// Push Notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data?.text() || 'New notification from Hub',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'hub-notification',
        renotify: true,
        actions: [
            { action: 'open', title: 'Open Hub' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('CODAI Hub', options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message Handler - Communication with main thread
self.addEventListener('message', event => {
    console.log('📨 Hub Service Worker received message:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('🎯 Hub Service Worker v2.0.0 loaded successfully');
