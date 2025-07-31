import { useMemo } from 'react';
import type React from 'react';

import { useNotificationStore } from '@/stores/notifications';
import type { Notification } from '@/types/common';

interface NotifyMethods {
  success: (
    title: string,
    message?: string,
    options?: Partial<Notification>
  ) => void;
  error: (
    title: string,
    message?: string,
    options?: Partial<Notification>
  ) => void;
  warning: (
    title: string,
    message?: string,
    options?: Partial<Notification>
  ) => void;
  info: (
    title: string,
    message?: string,
    options?: Partial<Notification>
  ) => void;
}

interface ToastMethods {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  notify: NotifyMethods;
  toast: ToastMethods;
  remove: (id: string) => void;
  clear: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  } = useNotificationStore();

  const notify = useMemo(
    () => ({
      success: (
        title: string,
        message?: string,
        options?: Partial<Notification>
      ) =>
        addNotification({
          type: 'success',
          title,
          ...(message != null && message.length > 0 && { message }),
          ...options,
        }),

      error: (
        title: string,
        message?: string,
        options?: Partial<Notification>
      ) =>
        addNotification({
          type: 'error',
          title,
          ...(message != null && message.length > 0 && { message }),
          persistent: true,
          ...options,
        }),

      warning: (
        title: string,
        message?: string,
        options?: Partial<Notification>
      ) =>
        addNotification({
          type: 'warning',
          title,
          ...(message != null && message.length > 0 && { message }),
          ...options,
        }),

      info: (
        title: string,
        message?: string,
        options?: Partial<Notification>
      ) =>
        addNotification({
          type: 'info',
          title,
          ...(message != null && message.length > 0 && { message }),
          ...options,
        }),
    }),
    [addNotification]
  );

  const toast = useMemo(
    () => ({
      success: (message: string) =>
        notify.success('Success', message, { duration: 3000 }),
      error: (message: string) => notify.error('Error', message),
      warning: (message: string) => notify.warning('Warning', message),
      info: (message: string) => notify.info('Info', message),
    }),
    [notify]
  );

  return {
    notifications,
    notify,
    toast,
    remove: removeNotification,
    clear: clearNotifications,
  };
}

// Dummy provider for test compatibility - notifications use Zustand store
export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return children as React.ReactElement;
}
