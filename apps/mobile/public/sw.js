/**
 * Service Worker for CODAI Mobile PWA
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'codai-mobile-v1.0.0';
const OFFLINE_CACHE = 'codai-offline-v1.0.0';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/portfolio',
  '/api/user/profile',
  '/api/watchlist',
  '/api/positions'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

async function handleApiRequest(request) {
  const cacheName = OFFLINE_CACHE;

  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API request');

    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for API
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Network unavailable. Some data may be outdated.',
        cached: true
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Offline': 'true'
        }
      }
    );
  }
}

async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Navigation failed, serving cached app shell');

    // Serve cached app shell
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }

    // Serve offline page if app shell not available
    return caches.match('/offline.html');
  }
}

async function handleStaticRequest(request) {
  // Cache first for static assets
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch static asset:', request.url);

    // Return fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }

    throw error;
  }
}

// Background sync for important actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');

  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    // Handle queued actions when connection is restored
    const syncData = await getStoredSyncData();

    for (const action of syncData) {
      try {
        await fetch(action.url, {
          method: action.method,
          body: action.data,
          headers: action.headers
        });

        // Remove successful action from queue
        await removeSyncData(action.id);

        console.log('Service Worker: Background sync completed for:', action.id);
      } catch (error) {
        console.error('Service Worker: Background sync failed for:', action.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync error:', error);
  }
}

async function getStoredSyncData() {
  // Mock implementation - would use IndexedDB in production
  return [];
}

async function removeSyncData(id) {
  // Mock implementation - would remove from IndexedDB in production
  console.log('Removing sync data:', id);
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  const options = {
    body: 'You have new updates in your CODAI portfolio',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'codai-notification',
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Portfolio',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    data: {
      url: '/portfolio',
      timestamp: Date.now()
    }
  };

  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }

  event.waitUntil(
    self.registration.showNotification('CODAI Mobile', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  const url = action === 'view' ? data.url : '/';

  event.waitUntil(
    clients.openWindow(url)
  );
});

console.log('Service Worker: Script loaded');
