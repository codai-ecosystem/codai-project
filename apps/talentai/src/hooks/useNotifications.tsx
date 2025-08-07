'use client'

import React from 'react';

import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const toast = useCallback((notification: Omit<Notification, 'id'>) => {
    return addNotification(notification);
  }, [addNotification]);

  const toastError = useCallback((message: string) => {
    return addNotification({ type: 'error', title: 'Error', message });
  }, [addNotification]);

  const toastSuccess = useCallback((message: string) => {
    return addNotification({ type: 'success', title: 'Success', message });
  }, [addNotification]);

  // Add convenience methods to toast
  toast.error = toastError;
  toast.success = toastSuccess;

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    toast,
  };
}

