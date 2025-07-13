/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'metu-template-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
];

// Resources to cache on first access
const RUNTIME_CACHE_URLS = ['/dashboard', '/profile', '/auth/login'];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[ServiceWorker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip requests to different origins
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[ServiceWorker] Found in cache:', event.request.url);
        return cachedResponse;
      }

      console.log('[ServiceWorker] Fetching from network:', event.request.url);
      return fetch(event.request)
        .then(response => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // Cache runtime resources
          if (shouldCacheRequest(event.request)) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }

          // For other requests, return a basic offline response
          return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' },
          });
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Background sync:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      syncOfflineActions()
    );
  }
});

// Push notification handler
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push received:', event);

  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-192x192.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('METU Template', options));
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification click received:', event);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(self.clients.openWindow('/'));
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(self.clients.openWindow('/'));
  }
});

// Helper functions
function shouldCacheRequest(request) {
  const url = new URL(request.url);

  // Cache runtime URLs
  if (RUNTIME_CACHE_URLS.some(path => url.pathname.startsWith(path))) {
    return true;
  }

  // Cache static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2)$/)) {
    return true;
  }

  return false;
}

async function syncOfflineActions() {
  try {
    // Get stored offline actions from IndexedDB
    const offlineActions = await getOfflineActions();

    for (const action of offlineActions) {
      try {
        // Replay the action
        await fetch(action.url, action.options);
        // Remove from offline storage on success
        await removeOfflineAction(action.id);
      } catch (error) {
        console.log('[ServiceWorker] Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.log('[ServiceWorker] Sync failed:', error);
  }
}

// IndexedDB helpers (simplified)
async function getOfflineActions() {
  // Implementation for getting offline actions from IndexedDB
  return [];
}

async function removeOfflineAction(id) {
  // Implementation for removing offline action from IndexedDB
  return Promise.resolve();
}
