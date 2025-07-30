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

// PWA-related types
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAInstallerProps {
  onInstallSuccess?: () => void;
  onInstallError?: (error: Error) => void;
}

export interface ServiceWorkerProviderProps {
  children: React.ReactNode;
  registration?: ServiceWorkerRegistration;
}

export interface UsePWAReturn {
  canInstall: boolean;
  isInstalling: boolean;
  isInstalled: boolean;
  installPWA: () => Promise<void>;
}

export interface UseServiceWorkerReturn {
  registration: ServiceWorkerRegistration | null;
  isSupported: boolean;
  update: () => void;
}

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  subscription: PushSubscription | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}