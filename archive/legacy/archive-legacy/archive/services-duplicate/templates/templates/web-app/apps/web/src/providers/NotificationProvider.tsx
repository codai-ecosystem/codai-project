'use client';

import type { JSX } from 'react';
import { createContext, useContext, type ReactNode } from 'react';

import { useNotifications } from '@/hooks/useNotifications';
import type { ToastType } from '@/types/common';

interface NotificationContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotificationContext must be used within a NotificationProvider'
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({
  children,
}: NotificationProviderProps): JSX.Element {
  const notifications = useNotifications();

  const contextValue: NotificationContextType = {
    toast: (message: string, type: ToastType = 'info') => {
      switch (type) {
        case 'success':
          return notifications.toast.success(message);
        case 'error':
          return notifications.toast.error(message);
        case 'warning':
          return notifications.toast.warning(message);
        case 'info':
        default:
          return notifications.toast.info(message);
      }
    },
    success: (message: string) => notifications.toast.success(message),
    error: (message: string) => notifications.toast.error(message),
    warning: (message: string) => notifications.toast.warning(message),
    info: (message: string) => notifications.toast.info(message),
    clearAll: notifications.clear,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
