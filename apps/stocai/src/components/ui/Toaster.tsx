import React from 'react'
import type { JSX } from 'react';
('use client');

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastTitle,
} from '@/components/ui/Toast';
import { useToast } from '@/providers/ToastProvider';

export function Toaster(): JSX.Element {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          variant={toast.type === 'error' ? 'destructive' : toast.type}
        >
          <div className="flex gap-3">
            <ToastIcon
              variant={toast.type === 'error' ? 'destructive' : toast.type}
            />
            <div className="grid w-full gap-1">
              {toast.title !== undefined ? (
                <ToastTitle>{toast.title}</ToastTitle>
              ) : null}
              <ToastDescription>{toast.message}</ToastDescription>
            </div>
          </div>
          {toast.action !== undefined ? (
            <ToastAction onClick={toast.action.onClick}>
              {toast.action.label}
            </ToastAction>
          ) : null}
          <ToastClose onClick={() => removeToast(toast.id)} />
        </Toast>
      ))}
    </div>
  );
}

