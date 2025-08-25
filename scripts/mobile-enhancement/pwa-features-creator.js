/**
 * @fileoverview PWA Features Creator
 * @description Creates Progressive Web App features for mobile optimization
 */

const fs = require('fs');
const path = require('path');

function createPWAFeatures(appDir) {
    createManifest(appDir);
    createServiceWorker(appDir);
    updateNextConfig(appDir);
    createPWAComponents(appDir);
}

function createManifest(appDir) {
    const publicDir = path.join(appDir, 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const manifestPath = path.join(publicDir, 'manifest.json');
    const appName = path.basename(appDir);

    const manifest = {
        name: `CODAI ${appName.charAt(0).toUpperCase() + appName.slice(1)}`,
        short_name: `CODAI ${appName}`,
        description: `CODAI ${appName} - Advanced AI-powered application`,
        start_url: "/",
        display: "standalone",
        orientation: "portrait-primary",
        theme_color: "#3B82F6",
        background_color: "#ffffff",
        categories: ["productivity", "business", "utilities"],
        lang: "en",
        dir: "ltr",
        icons: [
            {
                src: "/icons/icon-72x72.png",
                sizes: "72x72",
                type: "image/png",
                purpose: "maskable any"
            },
            {
                src: "/icons/icon-96x96.png",
                sizes: "96x96",
                type: "image/png",
                purpose: "maskable any"
            },
            {
                src: "/icons/icon-128x128.png",
                sizes: "128x128",
                type: "image/png",
                purpose: "maskable any"
            },
            {
                src: "/icons/icon-144x144.png",
                sizes: "144x144",
                type: "image/png",
                purpose: "maskable any"
            },
            {
                src: "/icons/icon-152x152.png",
                sizes: "152x152",
                type: "image/png",
                purpose: "maskable any"
            },
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable any"
            },
            {
                src: "/icons/icon-384x384.png",
                sizes: "384x384",
                type: "image/png",
                purpose: "maskable any"
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable any"
            }
        ],
        shortcuts: [
            {
                name: "Dashboard",
                short_name: "Dashboard",
                description: "Access main dashboard",
                url: "/",
                icons: [{ src: "/icons/shortcut-dashboard.png", sizes: "96x96" }]
            }
        ],
        screenshots: [
            {
                src: "/screenshots/mobile-screenshot-1.png",
                sizes: "640x1136",
                type: "image/png",
                form_factor: "narrow"
            },
            {
                src: "/screenshots/desktop-screenshot-1.png",
                sizes: "1280x720",
                type: "image/png",
                form_factor: "wide"
            }
        ],
        related_applications: [],
        prefer_related_applications: false,
        scope: "/",
        id: `codai-${appName}`,
        launch_handler: {
            client_mode: ["focus-existing", "auto"]
        },
        edge_side_panel: {
            preferred_width: 400
        }
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function createServiceWorker(appDir) {
    const publicDir = path.join(appDir, 'public');
    const swPath = path.join(publicDir, 'sw.js');

    const serviceWorker = `// CODAI Service Worker for PWA functionality
const CACHE_NAME = 'codai-app-v1';
const STATIC_CACHE = 'codai-static-v1';
const DYNAMIC_CACHE = 'codai-dynamic-v1';

// URLs to cache on install
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('Service Worker: Cache failed', err))
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (!url.origin.includes(self.location.origin)) return;

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cache dynamic content
                        if (shouldCache(request)) {
                            const responseToCache = response.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => cache.put(request, responseToCache));
                        }

                        return response;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (request.destination === 'document') {
                            return caches.match('/offline');
                        }
                        
                        // Return placeholder for images
                        if (request.destination === 'image') {
                            return new Response(
                                '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280">Image unavailable</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                    });
            })
    );
});

// Helper function to determine if request should be cached
function shouldCache(request) {
    const url = new URL(request.url);
    
    // Cache API responses
    if (url.pathname.startsWith('/api/')) {
        return true;
    }
    
    // Cache static assets
    if (request.destination === 'script' || 
        request.destination === 'style' || 
        request.destination === 'image') {
        return true;
    }
    
    return false;
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle background sync logic here
            console.log('Service Worker: Background sync triggered')
        );
    }
});

// Push notifications
self.addEventListener('push', event => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: data.data,
        actions: [
            {
                action: 'explore',
                title: 'Open App',
                icon: '/icons/action-open.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/action-close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Notification already closed
        return;
    } else {
        // Default action - open app
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(clientList => {
                    if (clientList.length > 0) {
                        return clientList[0].focus();
                    }
                    return clients.openWindow('/');
                })
        );
    }
});`;

    fs.writeFileSync(swPath, serviceWorker);
}

function updateNextConfig(appDir) {
    const nextConfigPath = path.join(appDir, 'next.config.js');

    if (fs.existsSync(nextConfigPath)) {
        let content = fs.readFileSync(nextConfigPath, 'utf8');

        // Add PWA configuration if not exists
        if (!content.includes('withPWA')) {
            // Add PWA import at the top
            if (!content.includes('const withPWA')) {
                content = `const withPWA = require('next-pwa')({\n  dest: 'public',\n  disable: process.env.NODE_ENV === 'development',\n  register: true,\n  skipWaiting: true,\n  runtimeCaching: [\n    {\n      urlPattern: /^https?.*/,\n      handler: 'NetworkFirst',\n      options: {\n        cacheName: 'offlineCache',\n        expiration: {\n          maxEntries: 200,\n        },\n      },\n    },\n  ],\n});\n\n${content}`;
            }

            // Wrap module.exports with withPWA
            content = content.replace(
                'module.exports = ',
                'module.exports = withPWA('
            );

            // Add closing parenthesis
            content = content.replace(/};$/, '});');

            fs.writeFileSync(nextConfigPath, content);
        }
    }
}

function createPWAComponents(appDir) {
    const componentsDir = path.join(appDir, 'src', 'components', 'pwa');
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    createInstallPrompt(componentsDir);
    createOfflinePage(appDir);
    createPWAProvider(componentsDir);
}

function createInstallPrompt(componentsDir) {
    const installPromptContent = `'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            
            setDeferredPrompt(null);
            setShowInstallPrompt(false);
        } catch (error) {
            console.error('Error during install prompt:', error);
        }
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        // Hide for 24 hours
        localStorage.setItem('installPromptDismissed', Date.now().toString());
    };

    if (isInstalled || !showInstallPrompt || !deferredPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-4 z-50">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Install App
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Add to your home screen for quick access
                    </p>
                    <div className="mt-3 flex space-x-2">
                        <button
                            onClick={handleInstallClick}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors touch-target"
                        >
                            Install
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-3 py-1.5 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors touch-target"
                        >
                            Not now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}`;

    fs.writeFileSync(path.join(componentsDir, 'InstallPrompt.tsx'), installPromptContent);
}

function createOfflinePage(appDir) {
    const pagesDir = path.join(appDir, 'src', 'app');
    const offlineDir = path.join(pagesDir, 'offline');

    if (!fs.existsSync(offlineDir)) {
        fs.mkdirSync(offlineDir, { recursive: true });
    }

    const offlinePageContent = `export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.75A9.25 9.25 0 002.75 12a9.25 9.25 0 009.25 9.25A9.25 9.25 0 0021.25 12 9.25 9.25 0 0012 2.75z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        You're Offline
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please check your internet connection and try again.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors touch-target"
                    >
                        Try Again
                    </button>
                    
                    <button
                        onClick={() => window.history.back()}
                        className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors touch-target"
                    >
                        Go Back
                    </button>
                </div>
                
                <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
                    <p>Some features may still be available while offline.</p>
                </div>
            </div>
        </div>
    );
}`;

    fs.writeFileSync(path.join(offlineDir, 'page.tsx'), offlinePageContent);
}

function createPWAProvider(componentsDir) {
    const pwaProviderContent = `'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
    isOnline: boolean;
    isInstalled: boolean;
    canInstall: boolean;
    install: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(true);
    const [isInstalled, setIsInstalled] = useState(false);
    const [canInstall, setCanInstall] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }

        // Check if app is installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        // Handle online/offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Handle install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                setIsInstalled(true);
                setCanInstall(false);
            }
            
            setDeferredPrompt(null);
        } catch (error) {
            console.error('Install failed:', error);
        }
    };

    const value: PWAContextType = {
        isOnline,
        isInstalled,
        canInstall,
        install
    };

    return (
        <PWAContext.Provider value={value}>
            {children}
        </PWAContext.Provider>
    );
}

export function usePWA() {
    const context = useContext(PWAContext);
    if (!context) {
        throw new Error('usePWA must be used within a PWAProvider');
    }
    return context;
}`;

    fs.writeFileSync(path.join(componentsDir, 'PWAProvider.tsx'), pwaProviderContent);
}

module.exports = createPWAFeatures;