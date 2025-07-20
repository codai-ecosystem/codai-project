import { z } from 'zod';

// Analytics Event Types
export const AnalyticsEventSchema = z.object({
    id: z.string(),
    type: z.enum(['user_action', 'system_event', 'performance', 'error', 'business', 'security']),
    category: z.string(),
    action: z.string(),
    label: z.string().optional(),
    value: z.number().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    appId: z.string(),
    timestamp: z.number(),
    metadata: z.record(z.string(), z.any()).optional(),
    properties: z.record(z.string(), z.any()).optional(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// Performance Metrics
export interface PerformanceMetrics {
    id: string;
    service: string;
    timestamp: number;
    metrics: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        networkLatency: number;
    };
    tags: Record<string, string>;
}

// User Analytics
export interface UserAnalytics {
    userId: string;
    sessionId: string;
    appId: string;
    events: AnalyticsEvent[];
    session: {
        startTime: number;
        endTime?: number;
        duration?: number;
        pageViews: number;
        interactions: number;
        conversionEvents: string[];
    };
    device: {
        userAgent: string;
        platform: string;
        browser: string;
        screenResolution: string;
        language: string;
        timezone: string;
    };
    location: {
        country?: string;
        region?: string;
        city?: string;
        ip?: string;
    };
}

// Business Intelligence Metrics
export interface BusinessMetrics {
    id: string;
    metric: string;
    value: number;
    unit: string;
    timestamp: number;
    dimensions: Record<string, string>;
    metadata?: Record<string, any>;
}

// Real-time Dashboard Data
export interface DashboardData {
    timestamp: number;
    overview: {
        totalUsers: number;
        activeUsers: number;
        totalSessions: number;
        averageSessionDuration: number;
        conversionRate: number;
        revenue: number;
    };
    performance: {
        averageResponseTime: number;
        errorRate: number;
        throughput: number;
        uptime: number;
    };
    topEvents: Array<{
        event: string;
        count: number;
        trend: 'up' | 'down' | 'stable';
    }>;
    topPages: Array<{
        page: string;
        views: number;
        bounce_rate: number;
    }>;
    alerts: Array<{
        id: string;
        type: 'warning' | 'error' | 'critical';
        message: string;
        timestamp: number;
    }>;
}

// Analytics Configuration
export interface AnalyticsConfig {
    providers: {
        prometheus?: {
            enabled: boolean;
            endpoint: string;
            pushgateway?: string;
        };
        grafana?: {
            enabled: boolean;
            url: string;
            apiKey: string;
        };
        influxdb?: {
            enabled: boolean;
            url: string;
            token: string;
            org: string;
            bucket: string;
        };
        elasticsearch?: {
            enabled: boolean;
            node: string;
            auth?: {
                username: string;
                password: string;
            };
            index: string;
        };
    };
    sampling: {
        events: number; // 0-1, percentage of events to sample
        errors: number; // 0-1, percentage of errors to sample
        performance: number; // 0-1, percentage of performance metrics to sample
    };
    retention: {
        events: number; // days
        metrics: number; // days
        logs: number; // days
    };
    alerts: {
        enabled: boolean;
        channels: string[]; // email, slack, webhook
        thresholds: {
            errorRate: number;
            responseTime: number;
            uptime: number;
        };
    };
}

// Report Types
export interface AnalyticsReport {
    id: string;
    name: string;
    type: 'user_behavior' | 'performance' | 'business' | 'security' | 'custom';
    timeRange: {
        start: number;
        end: number;
    };
    filters: Record<string, any>;
    data: any;
    charts: ReportChart[];
    insights: string[];
    recommendations: string[];
    generatedAt: number;
}

export interface ReportChart {
    id: string;
    type: 'line' | 'bar' | 'pie' | 'heatmap' | 'funnel' | 'table';
    title: string;
    data: any;
    config: Record<string, any>;
}

// Custom Analytics Filters
export interface AnalyticsFilter {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex';
    value: any;
}

export interface AnalyticsQuery {
    timeRange: {
        start: number;
        end: number;
    };
    filters: AnalyticsFilter[];
    groupBy?: string[];
    aggregations?: {
        field: string;
        function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'percentile';
        percentile?: number;
    }[];
    limit?: number;
    offset?: number;
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    }[];
}

// Cohort Analysis
export interface CohortAnalysis {
    id: string;
    name: string;
    cohortType: 'acquisition' | 'behavioral';
    timeUnit: 'day' | 'week' | 'month';
    cohorts: Array<{
        cohortId: string;
        cohortDate: string;
        size: number;
        retention: number[];
    }>;
    generatedAt: number;
}

// A/B Testing
export interface ABTest {
    id: string;
    name: string;
    description: string;
    status: 'draft' | 'running' | 'paused' | 'completed';
    startDate: number;
    endDate?: number;
    variants: Array<{
        id: string;
        name: string;
        allocation: number; // percentage
        config: Record<string, any>;
    }>;
    metrics: Array<{
        name: string;
        type: 'conversion' | 'revenue' | 'engagement';
        goal: 'increase' | 'decrease';
    }>;
    results?: {
        significance: number;
        winner?: string;
        confidence: number;
        lift: Record<string, number>;
    };
}

// Funnel Analysis
export interface FunnelStep {
    id: string;
    name: string;
    event: string;
    filters?: AnalyticsFilter[];
}

export interface FunnelAnalysis {
    id: string;
    name: string;
    steps: FunnelStep[];
    timeRange: {
        start: number;
        end: number;
    };
    results: Array<{
        step: string;
        users: number;
        conversionRate: number;
        dropoffRate: number;
    }>;
    generatedAt: number;
}
