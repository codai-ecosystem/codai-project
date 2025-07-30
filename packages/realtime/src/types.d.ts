import { z } from 'zod';
export declare const MessageSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    payload: z.ZodAny;
    timestamp: z.ZodNumber;
    sender: z.ZodString;
    target: z.ZodOptional<z.ZodString>;
    channel: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<{
        low: "low";
        normal: "normal";
        high: "high";
        critical: "critical";
    }>>;
}, z.core.$strip>;
export type Message = z.infer<typeof MessageSchema>;
export declare const EventSchema: z.ZodObject<{
    type: z.ZodString;
    data: z.ZodAny;
    source: z.ZodString;
    timestamp: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export type Event = z.infer<typeof EventSchema>;
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
export interface Room {
    id: string;
    name: string;
    type: 'public' | 'private' | 'system';
    participants: string[];
    metadata: Record<string, any>;
    createdAt: number;
    updatedAt: number;
}
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
export interface ConflictResolution {
    strategy: 'last-write-wins' | 'merge' | 'custom' | 'user-choice';
    resolver?: (local: any, remote: any) => any;
}
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
export interface ServerToClientEvents {
    message: (data: Message) => void;
    event: (data: Event) => void;
    sync: (data: SyncData) => void;
    conflict: (data: {
        id: string;
        conflicts: any[];
    }) => void;
    join: (data: {
        roomId: string;
        userId: string;
    }) => void;
    leave: (data: {
        roomId: string;
        userId: string;
    }) => void;
    error: (data: {
        message: string;
        code: string;
    }) => void;
    connected: (data: {
        connectionId: string;
    }) => void;
    disconnected: (data: {
        reason: string;
    }) => void;
    pong: () => void;
}
export interface ClientToServerEvents {
    message: (data: Omit<Message, 'id' | 'timestamp' | 'sender'>) => void;
    subscribe: (data: {
        channels: string[];
    }) => void;
    unsubscribe: (data: {
        channels: string[];
    }) => void;
    sync: (data: Omit<SyncData, 'timestamp'>) => void;
    ping: () => void;
    authenticate: (data: {
        token: string;
    }) => void;
    joinRoom: (data: {
        roomId: string;
    }) => void;
    leaveRoom: (data: {
        roomId: string;
    }) => void;
}
export interface RealtimeService {
    id: string;
    name: string;
    version: string;
    endpoints: string[];
    capabilities: string[];
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
    lastHeartbeat: number;
}
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
//# sourceMappingURL=types.d.ts.map