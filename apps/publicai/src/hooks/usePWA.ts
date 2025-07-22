'use client';

import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib/logger';
import type {
  BeforeInstallPromptEvent,
  UsePushNotificationsReturn,
  UsePWAReturn,
  UseServiceWorkerReturn,
} from '@/types';

export function usePWA(): UsePWAReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Check if PWA is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('serviceWorker' in navigator);
      setIsOnline(navigator.onLine); // Check if already installed
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches;
      const isIOSInstalled =
        (window.navigator as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone || isIOSInstalled);
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Install PWA
  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt || isInstalling) {
      return false;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
        setDeferredPrompt(null);
        return true;
      }

      return false;
    } catch (error: unknown) {
      logger.error('Error installing PWA', { context: { error } });
      return false;
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt, isInstalling]);

  return {
    isSupported,
    isInstalled,
    isInstallable: canInstall,
    isOnline,
    canInstall,
    install,
    isInstalling,
  };
}

// Hook for registering service worker
export function useServiceWorker(): UseServiceWorkerReturn {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        setIsRegistered(true);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker != null) {
            setIsUpdating(true);
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setHasUpdate(true);
                setIsUpdating(false);
              }
            });
          }
        });

        // Handle controlled by new service worker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      } catch (error: unknown) {
        logger.error('Service worker registration failed', {
          context: { error },
        });
      }
    };

    registerSW();
  }, []);

  const updateServiceWorker = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  }, []);

  const register = useCallback(async () => {
    if (!isSupported) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      setRegistration(reg);
      setIsRegistered(true);
    } catch (error) {
      logger.error('Service worker registration failed', { context: { error } });
    }
  }, [isSupported]);

  const unregister = useCallback(async () => {
    if (!isSupported || !registration) return;

    try {
      await registration.unregister();
      setIsRegistered(false);
      setRegistration(null);
    } catch (error) {
      logger.error('Service worker unregistration failed', { context: { error } });
    }
  }, [isSupported, registration]);

  return {
    isSupported,
    isRegistered,
    isUpdating,
    hasUpdate,
    registration,
    register,
    unregister,
    updateServiceWorker,
  };
}

// Hook for push notifications
export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('Notification' in window && 'PushManager' in window);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === 'granted';
    } catch (error: unknown) {
      logger.error('Error requesting notification permission', {
        context: { error },
      });
      return false;
    }
  }, [isSupported]);
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || permission !== 'granted') return null;

    const vapidKey = process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY'];
    if (vapidKey == null) {
      logger.error('VAPID public key is not configured', {
        context: { env: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY' },
      });
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      setSubscription(sub);
      return sub;
    } catch (error: unknown) {
      logger.error('Error subscribing to push notifications', {
        context: { error },
      });
      return null;
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      return true;
    } catch (error: unknown) {
      logger.error('Error unsubscribing from push notifications', {
        context: { error },
      });
      return false;
    }
  }, [subscription]);

  return {
    isSupported,
    isSubscribed,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
