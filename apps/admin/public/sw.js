// CODAI Service Worker v2.0
// Advanced PWA implementation with offline support

const CACHE_NAME = 'codai-v2.0.0';
const OFFLINE_URL = '/offline.html';

// Define cache strategies by resource type
const CACHE_STRATEGIES = {
    pages: 'NetworkFirst',
    assets: 'CacheFirst',
    api: 'NetworkOnly',
    images: 'CacheFirst'
};

// Critical resources to cache for offline functionality
const CRITICAL_CACHE_URLS = [
    '/',
    '/offline.html',
    '/static/css/main.css',
    '/static/js/main.js',
    '/favicon.ico'
];

// API endpoints that should work offline
const OFFLINE_API_CACHE = [
    '/api/health',
    '/api/status'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
    console.log('🚀 CODAI Service Worker v2.0 installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching critical resources');
                return cache.addAll(CRITICAL_CACHE_URLS);
            })
            .then(() => {
                console.log('✅ Critical resources cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Cache installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 CODAI Service Worker v2.0 activating...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle page requests
    if (request.mode === 'navigate') {
        event.respondWith(handlePageRequest(request));
        return;
    }

    // Handle static assets
    if (isStaticAsset(request)) {
        event.respondWith(handleAssetRequest(request));
        return;
    }

    // Default network first strategy
    event.respondWith(
        fetch(request).catch(() => {
            return caches.match(request);
        })
    );
});

// Network First strategy for API requests
async function handleApiRequest(request) {
    const url = new URL(request.url);

    try {
        // Try network first
        const networkResponse = await fetch(request);

        // Cache successful responses for offline access
        if (networkResponse.ok && OFFLINE_API_CACHE.some(path => url.pathname.includes(path))) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Fallback to cache for offline support
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline indicator for API calls
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'This request requires internet connection',
                timestamp: new Date().toISOString()
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Network First strategy for page requests
async function handlePageRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);

        // Cache successful page responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Fallback to cached version
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Fallback to offline page
        return caches.match(OFFLINE_URL);
    }
}

// Cache First strategy for static assets
async function handleAssetRequest(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('❌ Asset fetch failed:', request.url, error);
        throw error;
    }
}

// Check if request is for static asset
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(processBackgroundSync());
    }
});

// Process queued offline actions
async function processBackgroundSync() {
    try {
        // Get queued actions from IndexedDB or localStorage
        const queuedActions = await getQueuedActions();

        for (const action of queuedActions) {
            try {
                await fetch(action.url, action.options);
                await removeQueuedAction(action.id);
                console.log('✅ Synced offline action:', action.url);
            } catch (error) {
                console.error('❌ Failed to sync action:', action.url, error);
            }
        }
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    console.log('📬 Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/icon-explore.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('CODAI Update', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('🖱️ Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Utility functions for offline queue management
async function getQueuedActions() {
    // Implementation would use IndexedDB or localStorage
    return [];
}

async function removeQueuedAction(id) {
    // Implementation would remove from IndexedDB or localStorage
    console.log('Removed queued action:', id);
}

console.log('🚀 CODAI Service Worker v2.0 loaded successfully');
