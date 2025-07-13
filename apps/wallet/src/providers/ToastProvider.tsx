'use client';

import type { JSX } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastTitle,
} from '@/components/ui/Toast';
import type { ToastType } from '@/types/common';

interface ToastData {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): JSX.Element {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2);
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration ?? 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
  };

  if (!mounted) {
    return (
      <ToastContext.Provider value={contextValue}>
        {children}
      </ToastContext.Provider>
    );
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(<ToastContainer />, document.body)}
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed right-0 top-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastData;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const getVariant = ():
    | 'default'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'info' => {
    switch (toast.type) {
      case 'error':
        return 'destructive';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Toast variant={getVariant()} className="group">
      <div className="flex items-start gap-3">
        <ToastIcon variant={getVariant()} />

        <div className="flex-1 space-y-1">
          {toast.title !== undefined && toast.title.length > 0 ? (
            <ToastTitle>{toast.title}</ToastTitle>
          ) : null}
          <ToastDescription>{toast.message}</ToastDescription>

          {toast.action ? (
            <ToastAction onClick={toast.action.onClick}>
              {toast.action.label}
            </ToastAction>
          ) : null}
        </div>
      </div>

      <ToastClose onClick={onClose} />
    </Toast>
  );
}
