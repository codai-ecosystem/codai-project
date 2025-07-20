/**
 * CODAI Ecosystem API Standards
 * Universal API standards for consistent implementation across all services
 * Phase 5.1.1: Define universal API standards for ecosystem
 */

import { z } from 'zod';

// Universal API Response Format
export interface CodaiApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: CodaiApiError;
    meta?: CodaiApiMeta;
    timestamp: string;
}

// Standardized Error Format
export interface CodaiApiError {
    code: string;
    message: string;
    details?: any;
    field?: string;
    traceId?: string;
}

// Response Metadata
export interface CodaiApiMeta {
    version: string;
    service: string;
    requestId: string;
    duration?: number;
    pagination?: CodaiPagination;
}

// Pagination Standards
export interface CodaiPagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Universal API Endpoints Structure
export const CODAI_API_STANDARDS = {
    // HTTP Methods and their purposes
    methods: {
        GET: 'Retrieve resources (idempotent, safe)',
        POST: 'Create resources or trigger actions',
        PUT: 'Update entire resources (idempotent)',
        PATCH: 'Partial resource updates',
        DELETE: 'Remove resources (idempotent)',
    },

    // Standard Status Codes
    statusCodes: {
        // Success
        200: 'OK - Request successful',
        201: 'Created - Resource created successfully',
        202: 'Accepted - Request accepted for processing',
        204: 'No Content - Request successful, no content to return',

        // Client Errors
        400: 'Bad Request - Invalid request format',
        401: 'Unauthorized - Authentication required',
        403: 'Forbidden - Access denied',
        404: 'Not Found - Resource not found',
        409: 'Conflict - Resource already exists',
        422: 'Unprocessable Entity - Validation failed',
        429: 'Too Many Requests - Rate limit exceeded',

        // Server Errors
        500: 'Internal Server Error - Server error',
        502: 'Bad Gateway - Upstream service error',
        503: 'Service Unavailable - Service temporarily unavailable',
        504: 'Gateway Timeout - Upstream service timeout',
    },

    // Standard Headers
    headers: {
        required: [
            'Content-Type',
            'X-Request-ID',
            'X-Service-Name',
            'X-API-Version',
        ],
        optional: [
            'X-User-ID',
            'X-Session-ID',
            'X-Trace-ID',
            'X-Client-Version',
            'X-Rate-Limit-Remaining',
        ],
    },

    // Standard URL Patterns
    urlPatterns: {
        // Resource patterns
        collection: '/api/v{version}/{resources}',
        resource: '/api/v{version}/{resources}/{id}',
        nested: '/api/v{version}/{resources}/{id}/{subresources}',
        action: '/api/v{version}/{resources}/{id}/actions/{action}',

        // Health and system endpoints
        health: '/health',
        ready: '/ready',
        metrics: '/metrics',
        docs: '/docs',
    },

    // Authentication Standards
    authentication: {
        bearer: 'Authorization: Bearer <token>',
        cookie: 'Authentication via HttpOnly cookies',
        apiKey: 'X-API-Key: <api-key>',
    },

    // Rate Limiting Standards
    rateLimiting: {
        default: '1000 requests per hour',
        authenticated: '10000 requests per hour',
        premium: '100000 requests per hour',
        headers: [
            'X-Rate-Limit-Limit',
            'X-Rate-Limit-Remaining',
            'X-Rate-Limit-Reset',
        ],
    },
} as const;

// Service Registry - All CODAI services
export const CODAI_SERVICES = {
    // Core Infrastructure Services
    ID: { name: 'id', port: 4001, baseUrl: '/api/v1', description: 'Authentication and Identity Service' },
    MEMORAI: { name: 'memorai', port: 4002, baseUrl: '/api/v1', description: 'Memory and Database Service' },
    HUB: { name: 'hub', port: 4003, baseUrl: '/api/v1', description: 'Service Discovery Hub' },
    LOGAI: { name: 'logai', port: 4004, baseUrl: '/api/v1', description: 'Logging and Analytics Service' },
    ADMIN: { name: 'admin', port: 4005, baseUrl: '/api/v1', description: 'Administrative Interface' },
    GLASS: { name: 'glass', port: 4006, baseUrl: '/api/v1', description: 'Transparent Proxy Service' },

    // Business Platform Services
    CODAI: { name: 'codai', port: 4010, baseUrl: '/api/v1', description: 'Development Platform' },
    BANCAI: { name: 'bancai', port: 4033, baseUrl: '/api/v1', description: 'Financial Services' },
    CUMPARAI: { name: 'cumparai', port: 4030, baseUrl: '/api/v1', description: 'E-commerce Platform' },
    MARKETAI: { name: 'marketai', port: 4031, baseUrl: '/api/v1', description: 'Marketing Automation' },
    FABRICAI: { name: 'fabricai', port: 4032, baseUrl: '/api/v1', description: 'Content Creation' },
    ROMAI: { name: 'romai', port: 4034, baseUrl: '/api/v1', description: 'Romanian Intelligence' },
    ANALIZAI: { name: 'analizai', port: 4035, baseUrl: '/api/v1', description: 'Analytics Platform' },
    WALLET: { name: 'wallet', port: 4036, baseUrl: '/api/v1', description: 'Payment Processing' },

    // Specialized Services (24 apps)
    ACASAI: { name: 'acasai', port: 4040, baseUrl: '/api/v1', description: 'Real Estate Platform' },
    AIDE: { name: 'aide', port: 4041, baseUrl: '/api/v1', description: 'AI Development Assistant' },
    AJUTAI: { name: 'ajutai', port: 4042, baseUrl: '/api/v1', description: 'Help and Support' },
    CONVERSAI: { name: 'conversai', port: 4043, baseUrl: '/api/v1', description: 'Conversation Intelligence' },
    CURTAI: { name: 'curtai', port: 4044, baseUrl: '/api/v1', description: 'Legal Court Assistant' },
    DASH: { name: 'dash', port: 4045, baseUrl: '/api/v1', description: 'Dashboard Service' },
    DEXAI: { name: 'dexai', port: 4046, baseUrl: '/api/v1', description: 'Dictionary and Language' },
    DOCS: { name: 'docs', port: 4047, baseUrl: '/api/v1', description: 'Documentation Platform' },
    DONAI: { name: 'donai', port: 4048, baseUrl: '/api/v1', description: 'Donation Platform' },
    EXPLORER: { name: 'explorer', port: 4049, baseUrl: '/api/v1', description: 'Data Explorer' },
    JUCAI: { name: 'jucai', port: 4050, baseUrl: '/api/v1', description: 'Gaming Platform' },
    KODEX: { name: 'kodex', port: 4051, baseUrl: '/api/v1', description: 'Code Documentation' },
    LEGALIZAI: { name: 'legalizai', port: 4052, baseUrl: '/api/v1', description: 'Legal Services' },
    METU: { name: 'metu', port: 4053, baseUrl: '/api/v1', description: 'Metrics and Monitoring' },
    MOBILE: { name: 'mobile', port: 4054, baseUrl: '/api/v1', description: 'Mobile Services' },
    MOD: { name: 'mod', port: 4055, baseUrl: '/api/v1', description: 'Moderation Platform' },
    MUZICAI: { name: 'muzicai', port: 4056, baseUrl: '/api/v1', description: 'Music Platform' },
    PREZENTAI: { name: 'prezentai', port: 4057, baseUrl: '/api/v1', description: 'Presentation Platform' },
    PUBLICAI: { name: 'publicai', port: 4058, baseUrl: '/api/v1', description: 'Public Services' },
    SOCIAI: { name: 'sociai', port: 4059, baseUrl: '/api/v1', description: 'Social Media Management' },
    STOCAI: { name: 'stocai', port: 4060, baseUrl: '/api/v1', description: 'Storage and Analytics' },
    STUDIAI: { name: 'studiai', port: 4061, baseUrl: '/api/v1', description: 'Educational Platform' },
    SUNAI: { name: 'sunai', port: 4062, baseUrl: '/api/v1', description: 'Solar Energy Management' },
    TALENTAI: { name: 'talentai', port: 4063, baseUrl: '/api/v1', description: 'Talent Management' },
    TOOLS: { name: 'tools', port: 4064, baseUrl: '/api/v1', description: 'Development Tools' },
    X: { name: 'x', port: 4065, baseUrl: '/api/v1', description: 'Social Network Platform' },
} as const;

// Validation Schemas
export const CodaiApiRequestSchema = z.object({
    headers: z.record(z.string()).optional(),
    query: z.record(z.any()).optional(),
    body: z.any().optional(),
});

export const CodaiApiResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
        field: z.string().optional(),
        traceId: z.string().optional(),
    }).optional(),
    meta: z.object({
        version: z.string(),
        service: z.string(),
        requestId: z.string(),
        duration: z.number().optional(),
        pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            pages: z.number(),
            hasNext: z.boolean(),
            hasPrev: z.boolean(),
        }).optional(),
    }).optional(),
    timestamp: z.string(),
});

// Environment Configuration
export interface CodaiApiConfig {
    environment: 'development' | 'staging' | 'production';
    apiVersion: string;
    serviceName: string;
    port: number;
    corsOrigins: string[];
    rateLimit: {
        windowMs: number;
        max: number;
    };
    auth: {
        jwtSecret: string;
        tokenExpiry: string;
        refreshTokenExpiry: string;
    };
}

export const createStandardApiConfig = (serviceName: string, port: number): CodaiApiConfig => ({
    environment: (process.env.NODE_ENV as any) || 'development',
    apiVersion: 'v1',
    serviceName,
    port,
    corsOrigins: [
        'http://localhost:3000',
        'http://localhost:4000',
        'https://*.codai.ro',
        'https://*.vercel.app',
    ],
    rateLimit: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 1000, // 1000 requests per hour
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'codai-ecosystem-secret',
        tokenExpiry: '15m',
        refreshTokenExpiry: '7d',
    },
});

// Export service URLs helper
export const getServiceUrl = (serviceName: string, endpoint: string = '') => {
    const service = Object.values(CODAI_SERVICES).find(s => s.name === serviceName);
    if (!service) throw new Error(`Service ${serviceName} not found`);

    const baseUrl = `http://localhost:${service.port}${service.baseUrl}`;
    return endpoint ? `${baseUrl}${endpoint}` : baseUrl;
};

// API Route Helpers
export const createStandardRoutes = (serviceName: string) => ({
    // Health endpoints
    health: `/health`,
    ready: `/ready`,
    metrics: `/metrics`,
    docs: `/docs`,

    // Service-specific base
    base: `/api/v1`,

    // Common resource patterns
    resources: (resource: string) => `/api/v1/${resource}`,
    resource: (resource: string, id: string) => `/api/v1/${resource}/${id}`,
    nested: (resource: string, id: string, subresource: string) =>
        `/api/v1/${resource}/${id}/${subresource}`,
    action: (resource: string, id: string, action: string) =>
        `/api/v1/${resource}/${id}/actions/${action}`,
});

export type CodaiServiceName = keyof typeof CODAI_SERVICES;
export type CodaiService = typeof CODAI_SERVICES[CodaiServiceName];
