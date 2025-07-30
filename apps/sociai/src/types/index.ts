// Common types for CODAI ecosystem apps
export interface AppConfig {
  name: string;
  version: string;
  description: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

// PWA Types
export interface PWAInstallerProps {
  className?: string;
}

export interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface UsePWAReturn {
  isSupported: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  isInstalling: boolean;
  install: () => Promise<boolean>;
}

export interface UseServiceWorkerReturn {
  isRegistered: boolean;
  isUpdating: boolean;
  hasUpdate: boolean;
  updateServiceWorker: () => void;
}

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
}