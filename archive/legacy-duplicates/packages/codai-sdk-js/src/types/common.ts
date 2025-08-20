/**
 * Common types used across the CODAI SDK
 */

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    message?: string;
    timestamp: string;
}

export interface ErrorResponse {
    error: string;
    status: number;
    message: string;
    timestamp: string;
    details?: any;
}

export interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    service: string;
    version?: string;
    timestamp: string;
    uptime?: number;
    dependencies?: Record<string, string>;
    metadata?: any;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface ServiceInfo {
    name: string;
    version: string;
    description?: string;
    port: number;
    status: 'healthy' | 'unhealthy' | 'degraded';
    endpoints?: string[];
}
