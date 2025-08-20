/**
 * Service-specific types
 */

// CBD Database Types
export interface CbdDocument {
    id?: string;
    collection: string;
    data: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
}

export interface CbdQuery {
    collection: string;
    filter?: Record<string, any>;
    projection?: string[];
    sort?: Record<string, 1 | -1>;
    limit?: number;
    skip?: number;
}

export interface CbdVectorQuery {
    vector: number[];
    topK?: number;
    filter?: Record<string, any>;
}

// Hub Service Types
export interface HubRoute {
    id: string;
    path: string;
    method: string;
    target: string;
    description?: string;
    enabled: boolean;
}

export interface HubServiceRegistration {
    name: string;
    url: string;
    port: number;
    healthPath?: string;
    tags?: string[];
}

// Admin Service Types
export interface AdminDashboardData {
    services: ServiceInfo[];
    metrics: SystemMetrics;
    alerts: Alert[];
    logs: LogEntry[];
}

export interface SystemMetrics {
    cpu: number;
    memory: number;
    disk: number;
    network: NetworkMetrics;
    uptime: number;
}

export interface NetworkMetrics {
    bytesIn: number;
    bytesOut: number;
    requestsPerSecond: number;
    responseTime: number;
}

export interface Alert {
    id: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
    service?: string;
    resolved: boolean;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    service: string;
    metadata?: Record<string, any>;
}
