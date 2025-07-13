/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'dexai-v1.1.0';
const OFFLINE_URL = '/offline.html';
const STATIC_CACHE_NAME = 'dexai-static-v1.1.0';
const DYNAMIC_CACHE_NAME = 'dexai-dynamic-v1.1.0';
const DICTIONARY_CACHE = 'dexai-dictionary-v1.1.0';

// Resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  '/dictionary',
  '/dashboard',
  '/favorites',
  '/search',
  '/auth/login',
  '/auth/register',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

// Resources to cache on first access
const RUNTIME_CACHE_URLS = [
  '/search',
  '/profile',
  '/auth/login',
  '/auth/register',
  '/api/dictionary',
  '/api/search'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install DEXAI v1.1.0');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[ServiceWorker] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        console.log('[ServiceWorker] Initializing dynamic cache');
        return Promise.resolve();
      })
    ]).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate DEXAI');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== DICTIONARY_CACHE) {
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

  // Special handling for dictionary API requests
  if (event.request.url.includes('/api/dictionary') || event.request.url.includes('/api/search')) {
    event.respondWith(handleDictionaryRequest(event.request));
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

          // For API requests, return cached dictionary data if available
          if (event.request.url.includes('/api/')) {
            return new Response(JSON.stringify({
              error: 'Offline',
              message: 'Funcția este disponibilă doar online'
            }), {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' },
            });
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

  if (event.tag === 'word-search') {
    event.waitUntil(syncOfflineSearches());
  } else if (event.tag === 'user-progress') {
    event.waitUntil(syncUserProgress());
  } else if (event.tag === 'comments-ratings') {
    event.waitUntil(syncCommentsAndRatings());
  }
});

// Push notification handler for word of the day, achievements, etc.
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push received:', event);

  let notificationData = {
    title: 'DEXAI',
    body: 'Ai o notificare nouă',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'DEXAI',
        body: data.body || data.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: data,
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    ...notificationData,
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'explore',
        title: 'Deschide DEXAI',
        icon: '/icons/icon-192x192.png',
      },
      {
        action: 'close',
        title: 'Închide',
        icon: '/icons/icon-192x192.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(notificationData.title, options));
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification click received:', event);

  event.notification.close();

  if (event.action === 'explore') {
    // Open specific page based on notification data
    const url = event.notification.data?.url || '/';
    event.waitUntil(self.clients.openWindow(url));
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

// Handle dictionary API requests with offline fallback
async function handleDictionaryRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);

    if (response.ok) {
      // Cache successful dictionary responses
      const cache = await caches.open(DICTIONARY_CACHE);
      cache.put(request, response.clone());
      return response;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    // Fallback to cached dictionary data
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline message for dictionary requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Căutarea în dicționar necesită conexiune la internet',
      offline: true,
      cachedWords: await getCachedWords()
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Sync offline searches when back online
async function syncOfflineSearches() {
  try {
    const offlineSearches = await getOfflineSearches();

    for (const search of offlineSearches) {
      try {
        // Re-execute search when online
        await fetch(`/api/search?q=${encodeURIComponent(search.query)}`);
        await removeOfflineSearch(search.id);
      } catch (error) {
        console.log('[ServiceWorker] Failed to sync search:', error);
      }
    }
  } catch (error) {
    console.log('[ServiceWorker] Search sync failed:', error);
  }
}

// Sync user progress when back online
async function syncUserProgress() {
  try {
    const offlineProgress = await getOfflineProgress();

    for (const progress of offlineProgress) {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progress)
        });
        await removeOfflineProgress(progress.id);
      } catch (error) {
        console.log('[ServiceWorker] Failed to sync progress:', error);
      }
    }
  } catch (error) {
    console.log('[ServiceWorker] Progress sync failed:', error);
  }
}

// Sync comments and ratings when back online
async function syncCommentsAndRatings() {
  try {
    const offlineActions = await getOfflineCommentsAndRatings();

    for (const action of offlineActions) {
      try {
        await fetch(action.url, action.options);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.log('[ServiceWorker] Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.log('[ServiceWorker] Comments/ratings sync failed:', error);
  }
}

// IndexedDB helpers for offline storage
async function getCachedWords() {
  // Get list of cached words from dictionary cache
  try {
    const cache = await caches.open(DICTIONARY_CACHE);
    const requests = await cache.keys();
    return requests.map(req => {
      const url = new URL(req.url);
      return url.searchParams.get('q');
    }).filter(Boolean);
  } catch (error) {
    return [];
  }
}

async function getOfflineSearches() {
  // Implementation for getting offline searches from IndexedDB
  return [];
}

async function removeOfflineSearch(id) {
  // Implementation for removing offline search from IndexedDB
  return Promise.resolve();
}

async function getOfflineProgress() {
  // Implementation for getting offline progress from IndexedDB
  return [];
}

async function removeOfflineProgress(id) {
  // Implementation for removing offline progress from IndexedDB
  return Promise.resolve();
}

async function getOfflineCommentsAndRatings() {
  // Implementation for getting offline actions from IndexedDB
  return [];
}

async function removeOfflineAction(id) {
  // Implementation for removing offline action from IndexedDB
  return Promise.resolve();
}
