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

// Re-export auth types
export * from './auth';

// Memory and Knowledge Management Types
export interface MemoryEntity {
  id: string;
  content: string;
  type: 'memory' | 'knowledge' | 'note' | 'document';
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  embeddings?: number[];
  importance?: number;
}

export interface MemoryStats {
  totalMemories: number;
  recentMemories: number;
  memoryTypes: Record<string, number>;
  averageImportance?: number;
}

export interface MCPConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  config?: Record<string, any>;
}

// Request/Response Types
export interface QueryRequest {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface QueryResponse {
  results: MemoryEntity[];
  total: number;
  hasMore: boolean;
}

export interface MemoryRequest {
  content: string;
  type?: MemoryEntity['type'];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MemoryResponse {
  success: boolean;
  memory?: MemoryEntity;
  error?: string;
}

// PWA Types
export interface PWAInstallerProps {
  onInstall?: () => void;
  onCancel?: () => void;
  buttonText?: string;
  className?: string;
}

export interface ServiceWorkerProviderProps {
  children: React.ReactNode;
  swUrl?: string;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isInstalling: boolean;
  install: () => Promise<void>;
  canInstall: boolean;
}

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<void>;
  permission: NotificationPermission;
}

export interface UseServiceWorkerReturn {
  isSupported: boolean;
  registration: ServiceWorkerRegistration | null;
  update: () => Promise<void>;
  unregister: () => Promise<boolean>;
}

// Database Configuration
export interface DatabaseConfig {
  url: string;
  provider: 'postgresql' | 'mysql' | 'sqlite';
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
  };
}