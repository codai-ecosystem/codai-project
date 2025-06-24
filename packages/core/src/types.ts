// Core TypeScript definitions for Codai ecosystem

export interface CodaiMemoryContext {
    userId: string;
    sessionId: string;
    serviceContext: {
        [serviceName: string]: any;
    };
    sharedContext: any;
}

export interface ServiceDefinition {
    name: string;
    url: string;
    port: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user' | 'developer';
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Session {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
    createdAt: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    collaborators: string[];
    createdAt: string;
    updatedAt: string;
}

export interface MemoryEntry {
    id: string;
    userId: string;
    content: string;
    context: Record<string, any>;
    metadata: {
        importance: number;
        tags: string[];
        type: string;
    };
    createdAt: string;
    updatedAt: string;
}

export type ServiceName = 'aide' | 'memorai' | 'logai' | 'bancai' | 'fabricai';
export type Environment = 'development' | 'production' | 'test';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
