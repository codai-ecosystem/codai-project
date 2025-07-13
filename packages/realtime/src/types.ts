import { z } from 'zod';

// Message Types
export const MessageSchema = z.object({
  id: z.string(),
  type: z.string(),
  payload: z.any(),
  timestamp: z.number(),
  sender: z.string(),
  target: z.string().optional(),
  channel: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
});

export type Message = z.infer<typeof MessageSchema>;

// Event Types
export const EventSchema = z.object({
  type: z.string(),
  data: z.any(),
  source: z.string(),
  timestamp: z.number(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Event = z.infer<typeof EventSchema>;

// Connection Types
export interface ConnectionInfo {
  id: string;
  userId?: string;
  appId: string;
  roles: string[];
  permissions: string[];
  connectedAt: number;
  lastActivity: number;
  metadata: Record<string, any>;
}

// Room/Channel Types
export interface Room {
  id: string;
  name: string;
  type: 'public' | 'private' | 'system';
  participants: string[];
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

// Synchronization Types
export interface SyncData {
  id: string;
  type: string;
  operation: 'create' | 'update' | 'delete' | 'patch';
  data: any;
  version: number;
  timestamp: number;
  author: string;
  path?: string[];
}

// Conflict Resolution Types
export interface ConflictResolution {
  strategy: 'last-write-wins' | 'merge' | 'custom' | 'user-choice';
  resolver?: (local: any, remote: any) => any;
}

// Real-time Configuration
export interface RealtimeConfig {
  server: {
    port: number;
    host: string;
    cors: {
      origin: string | string[];
      credentials: boolean;
    };
    redis?: {
      host: string;
      port: number;
      password?: string;
      db?: number;
    };
  };
  auth: {
    secret: string;
    tokenExpiry: number;
  };
  channels: {
    maxConnections: number;
    messageHistory: number;
    retentionTime: number;
  };
  sync: {
    batchSize: number;
    conflictResolution: ConflictResolution;
    enableVersioning: boolean;
  };
}

// WebSocket Events
export interface ServerToClientEvents {
  message: (data: Message) => void;
  event: (data: Event) => void;
  sync: (data: SyncData) => void;
  conflict: (data: { id: string; conflicts: any[] }) => void;
  join: (data: { roomId: string; userId: string }) => void;
  leave: (data: { roomId: string; userId: string }) => void;
  error: (data: { message: string; code: string }) => void;
  connected: (data: { connectionId: string }) => void;
  disconnected: (data: { reason: string }) => void;
  pong: () => void;
}

export interface ClientToServerEvents {
  message: (data: Omit<Message, 'id' | 'timestamp' | 'sender'>) => void;
  subscribe: (data: { channels: string[] }) => void;
  unsubscribe: (data: { channels: string[] }) => void;
  sync: (data: Omit<SyncData, 'timestamp'>) => void;
  ping: () => void;
  authenticate: (data: { token: string }) => void;
  joinRoom: (data: { roomId: string }) => void;
  leaveRoom: (data: { roomId: string }) => void;
}

// Service Types
export interface RealtimeService {
  id: string;
  name: string;
  version: string;
  endpoints: string[];
  capabilities: string[];
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  lastHeartbeat: number;
}

// Analytics Types
export interface RealtimeMetrics {
  connections: {
    active: number;
    total: number;
    byApp: Record<string, number>;
  };
  messages: {
    sent: number;
    received: number;
    failed: number;
    rate: number;
  };
  latency: {
    average: number;
    p95: number;
    p99: number;
  };
  errors: {
    count: number;
    rate: number;
    types: Record<string, number>;
  };
}
