'use client'

import React from 'react';

import { Download, WifiOff } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui';
import { usePWA, useServiceWorker } from '@/hooks/usePWA';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/stores/notifications';
import type { PWAInstallerProps, ServiceWorkerProviderProps } from '@/types';

export function PWAInstaller({
  className,
}: PWAInstallerProps): JSX.Element | null {
  const { canInstall, install, isInstalling, isOnline } = usePWA();
  const { hasUpdate, updateServiceWorker } = useServiceWorker();
  const { addNotification } = useNotificationStore();

  // Show update notification
  useEffect(() => {
    if (hasUpdate === true) {
      addNotification({
        type: 'info',
        title: 'App Update Available',
        message: 'A new version of the app is available. Click to update.',
        persistent: true,
        action: {
          label: 'Update',
          onClick: updateServiceWorker,
        },
      });

      logger.info('PWA update available', {
        context: { timestamp: new Date().toISOString() },
      });
    }
  }, [hasUpdate, addNotification, updateServiceWorker]);

  // Show install prompt
  if (canInstall === true) {
    return (
      <Button
        onClick={() => {
          void install();
        }}
        variant="outline"
        size="sm"
        isLoading={isInstalling}
        className={cn('fixed bottom-4 right-4 z-50 shadow-lg', className)}
        data-testid="pwa-installer"
      >
        {!isInstalling && <Download className="mr-2 h-4 w-4" />}
        Install App
      </Button>
    );
  }

  // Show connection status (only when offline)
  if (isOnline === false) {
    return (
      <div
        className={cn(
          'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-destructive px-3 py-2 text-destructive-foreground shadow-lg',
          className
        )}
        role="status"
        aria-live="polite"
        data-testid="pwa-installer"
      >
        <WifiOff className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    );
  }

  return null;
}

// Service Worker Registration Component
export function ServiceWorkerProvider({
  children,
}: ServiceWorkerProviderProps): JSX.Element {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', event => {
        if (
          event.data !== undefined &&
          event.data !== null &&
          event.data.type === 'CACHE_UPDATED'
        ) {
          logger.info('Service Worker cache updated', {
            context: { updatedResources: event.data.updatedResources },
          });
        }
      });

      // Register service worker
      const registerServiceWorker = async (): Promise<void> => {
        try {
          const registration = await navigator.serviceWorker.register(
            '/sw.js',
            {
              scope: '/',
              updateViaCache: 'none', // Prevent automatic updates via browser cache
            }
          );

          logger.info('Service Worker registered successfully', {
            context: { scope: registration.scope },
          });

          // Check for updates immediately
          if (registration.waiting) {
            logger.info('New Service Worker waiting to activate');
          }

          // Setup periodic checks for updates (every 6 hours)
          const checkInterval = 6 * 60 * 60 * 1000;
          setInterval(() => {
            registration.update().catch((err: unknown) => {
              logger.error('Service Worker update check failed', {
                context: {
                  error: err instanceof Error ? err.message : String(err),
                },
              });
            });
          }, checkInterval);
        } catch (error) {
          logger.error('Service Worker registration failed', {
            context: {
              error: error instanceof Error ? error.message : String(error),
            },
          });
        }
      };

      void registerServiceWorker();
    }
  }, []);

  return <div data-testid="service-worker-provider">{children}</div>;
}

