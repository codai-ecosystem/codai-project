import { create } from 'zustand';

import { generateId } from '@/lib/utils';
import type { Notification } from '@/types/common';

interface NotificationState {
  notifications: Notification[];

  // Actions
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt'>
  ) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: notification => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
    };

    set(state => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration (if not persistent)
    if (notification.persistent !== true) {
      const duration = notification.duration ?? 5000;
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }

    return id;
  },

  removeNotification: id => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  updateNotification: (id, updates) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, ...updates } : n
      ),
    }));
  },
}));
