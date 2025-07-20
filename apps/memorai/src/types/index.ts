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

// Memory and Knowledge Management Types - Compatible with MemoryService
export interface MemoryEntity {
  id: string;
  type: 'project' | 'global' | 'agent' | 'conversation' | 'personal' | 'memory' | 'knowledge' | 'note' | 'document';
  title: string;
  content: string;
  tags: string[];
  created: string; // ISO string
  updated: string; // ISO string
  relevance: number; // 0-1 scale
  connections: number;
  size: number; // Size in KB
  agentId: string;
  contextWindow: number;
  metadata: Record<string, any>;
  // Additional fields for backward compatibility
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  embeddings?: number[];
  importance?: number;
}

export interface MemoryStats {
  totalMemories?: number; // Legacy field
  recentMemories?: number; // Legacy field
  memoryTypes?: Record<string, number>; // Legacy field
  averageImportance?: number; // Legacy field
  // Current MemoryService fields
  totalEntities: number;
  totalSize: number;
  activeConnections: number;
  queryCount: number;
  avgRelevance: number;
  memoryUsage: number;
  activeAgents: number;
  mcpConnections: number;
}

export interface MCPConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  config?: Record<string, any>;
}

// Query and Memory Management Types - Compatible with MemoryService
export interface QueryRequest {
  agentId: string;
  query: string;
  type?: string;
  limit?: number;
  contextSize?: number;
  // Additional fields for backward compatibility
  filters?: Record<string, any>;
  offset?: number;
}

export interface QueryResponse {
  success: boolean;
  memories: MemoryEntity[];
  totalFound: number;
  queryTime: number;
  relevanceThreshold: number;
  // Additional fields for backward compatibility
  results?: MemoryEntity[];
  total?: number;
  hasMore?: boolean;
}

export interface MemoryRequest {
  agentId: string;
  title?: string;
  content: string;
  type: MemoryEntity['type'];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MemoryResponse {
  success: boolean;
  memoryId?: string;
  message: string;
  memory?: MemoryEntity;
  error?: string;
}

// Database Configuration
export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'sqlite';
  url?: string;
  provider?: 'postgresql' | 'mysql' | 'sqlite';
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
  };
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