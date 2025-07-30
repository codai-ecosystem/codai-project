import React from 'react';

// Simple mock exports for PWA components to fix test imports
export function PWAInstaller() {
  return React.createElement('div', { 'data-testid': 'pwa-installer' }, 'PWA Installer Mock');
}

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  return React.createElement('div', { 'data-testid': 'service-worker-provider' }, children);
}
