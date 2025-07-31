import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
} from 'firebase/messaging';
import { useCallback, useEffect } from 'react';

import { useNotifications } from '@/hooks/useNotifications';
import { logger } from '@/lib/logger';
import { useAuthStore } from '@/stores/auth';

type MessagePayload = {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
  from: string;
  // ... other fields
};

interface UseFirebaseMessagingReturn {
  requestPermission: () => Promise<string | null>;
}

// Save the Firebase messaging instance
let messaging: Messaging | null = null;

// Initialize Firebase messaging
export const initMessaging = (): Messaging | null => {
  try {
    const app = getApps().length
      ? getApp()
      : initializeApp({
          apiKey: process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] ?? '',
          authDomain: process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? '',
          projectId: process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] ?? '',
          storageBucket:
            process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] ?? '',
          messagingSenderId:
            process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? '',
          appId: process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] ?? '',
          measurementId:
            process.env['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'] ?? '',
        });

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
      return messaging;
    }

    return null;
  } catch (error: unknown) {
    logger.error('Firebase messaging initialization error:', error);
    return null;
  }
};

export function useFirebaseMessaging(): UseFirebaseMessagingReturn {
  const { toast } = useNotifications();
  const { user } = useAuthStore();

  const requestPermission = useCallback(async () => {
    try {
      if (!messaging) initMessaging();
      if (!messaging) return null;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }
      const currentToken = await getToken(messaging, {
        vapidKey: process.env['NEXT_PUBLIC_FIREBASE_VAPID_KEY'] ?? '',
      });

      if (currentToken.length === 0) {
        throw new Error('No registration token available');
      } // Here you would typically send this token to your server
      logger.info('FCM Token obtained successfully');
      return currentToken;
    } catch (error: unknown) {
      logger.error('Error getting FCM token:', error);
      toast.error('Failed to enable notifications. Please try again.');
      return null;
    }
  }, [toast]);

  const handleForegroundMessage = useCallback(
    (payload: MessagePayload) => {
      const { notification } = payload;

      if (notification != null) {
        toast.info(notification.body ?? 'You have a new notification');
      }
    },
    [toast]
  );

  useEffect(() => {
    if (
      !user ||
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator)
    )
      return;

    let unsubscribe: (() => void) | null = null;

    const setupMessaging = () => {
      try {
        if (!messaging) initMessaging();
        if (!messaging) return; // Handle messages when the app is in the foreground
        unsubscribe = onMessage(messaging, handleForegroundMessage);
      } catch (error: unknown) {
        logger.error('Error setting up Firebase messaging:', error);
      }
    };

    setupMessaging();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, handleForegroundMessage]);

  return {
    requestPermission,
  };
}
