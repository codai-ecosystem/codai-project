export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    destructive: string;
    warning: string;
    success: string;
  };
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

export interface LocaleContextType {
  locale: 'en' | 'ro';
  setLocale: (locale: 'en' | 'ro') => void;
  t: (key: string, options?: Record<string, unknown>) => string;
  dir: 'ltr' | 'rtl';
}

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt'>
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  createdAt: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}
