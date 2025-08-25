import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Analytics event interfaces
 */
export interface AnalyticsEvent {
    id?: string;
    event: string;
    userId?: string;
    sessionId?: string;
    timestamp: string;
    properties?: Record<string, any>;
    context?: {
        userAgent?: string;
        ip?: string;
        referrer?: string;
        page?: string;
        device?: 'mobile' | 'tablet' | 'desktop';
        os?: string;
        browser?: string;
    };
}

export interface AnalyticsQuery {
    event?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
    metrics?: string[];
}

export interface AnalyticsResponse {
    events?: AnalyticsEvent[];
    metrics?: Record<string, number | string>;
    total?: number;
    page?: number;
    limit?: number;
    timeRange?: {
        start: string;
        end: string;
    };
}

export interface MetricsRequest {
    metrics: string[];
    filters?: Record<string, any>;
    groupBy?: string[];
    timeRange?: {
        start: string;
        end: string;
    };
}

/**
 * Validation schemas
 */
export const analyticsEventSchema = z.object({
    event: z.string().min(1, 'Event name is required'),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    properties: z.record(z.any()).optional(),
    timestamp: z.string().datetime().optional()
});

export const analyticsQuerySchema = z.object({
    event: z.string().optional(),
    userId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(1000).default(100),
    groupBy: z.enum(['hour', 'day', 'week', 'month']).optional(),
    metrics: z.array(z.string()).optional()
});

export const metricsRequestSchema = z.object({
    metrics: z.array(z.string()).min(1, 'At least one metric is required'),
    filters: z.record(z.any()).optional(),
    groupBy: z.array(z.string()).optional(),
    timeRange: z.object({
        start: z.string().datetime(),
        end: z.string().datetime()
    }).optional()
});

/**
 * Analytics repository interface for dependency injection
 */
export interface AnalyticsRepository {
    track(event: AnalyticsEvent): Promise<void>;
    query(query: AnalyticsQuery): Promise<AnalyticsResponse>;
    getMetrics(request: MetricsRequest): Promise<Record<string, any>>;
    getUserActivity(userId: string, days?: number): Promise<AnalyticsEvent[]>;
    getPopularEvents(limit?: number): Promise<Array<{
        event: string;
        count: number;
    }>>;
}

/**
 * Create POST /api/analytics/track endpoint
 */
export function createAnalyticsTrackEndpoint(analyticsRepo: AnalyticsRepository) {
    return async function POST(request: NextRequest): Promise<NextResponse> {
        try {
            const body = await request.json();

            // Validate event data
            const validationResult = analyticsEventSchema.safeParse(body);
            if (!validationResult.success) {
                return NextResponse.json(
                    {
                        error: 'Validation failed',
                        details: validationResult.error.issues
                    },
                    { status: 400 }
                );
            }

            const eventData = validationResult.data;

            // Enrich event with request context
            const enrichedEvent: AnalyticsEvent = {
                ...eventData,
                id: crypto.randomUUID(),
                timestamp: eventData.timestamp || new Date().toISOString(),
                userId: eventData.userId || (request.headers.get('x-user-id') ?? undefined),
                context: {
                    userAgent: request.headers.get('user-agent') || undefined,
                    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
                    referrer: request.headers.get('referer') || undefined,
                    ...extractDeviceInfo(request.headers.get('user-agent') ?? undefined)
                }
            };

            await analyticsRepo.track(enrichedEvent);

            return NextResponse.json({
                success: true,
                eventId: enrichedEvent.id
            });

        } catch (error) {
            console.error('Analytics track error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create GET /api/analytics/events endpoint
 */
export function createAnalyticsQueryEndpoint(
    analyticsRepo: AnalyticsRepository,
    requireAdmin = true
) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        try {
            // Check permissions
            if (requireAdmin) {
                const userRoles = JSON.parse(request.headers.get('x-user-roles') || '[]');
                if (!userRoles.includes('admin')) {
                    return NextResponse.json(
                        { error: 'Access denied' },
                        { status: 403 }
                    );
                }
            }

            const { searchParams } = new URL(request.url);
            const queryValidation = analyticsQuerySchema.safeParse({
                event: searchParams.get('event'),
                userId: searchParams.get('userId'),
                startDate: searchParams.get('startDate'),
                endDate: searchParams.get('endDate'),
                page: searchParams.get('page'),
                limit: searchParams.get('limit'),
                groupBy: searchParams.get('groupBy'),
                metrics: searchParams.get('metrics')?.split(',')
            });

            if (!queryValidation.success) {
                return NextResponse.json(
                    {
                        error: 'Invalid query parameters',
                        details: queryValidation.error.issues
                    },
                    { status: 400 }
                );
            }

            const result = await analyticsRepo.query(queryValidation.data);
            return NextResponse.json(result);

        } catch (error) {
            console.error('Analytics query error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create POST /api/analytics/metrics endpoint
 */
export function createAnalyticsMetricsEndpoint(
    analyticsRepo: AnalyticsRepository,
    requireAdmin = true
) {
    return async function POST(request: NextRequest): Promise<NextResponse> {
        try {
            // Check permissions
            if (requireAdmin) {
                const userRoles = JSON.parse(request.headers.get('x-user-roles') || '[]');
                if (!userRoles.includes('admin')) {
                    return NextResponse.json(
                        { error: 'Access denied' },
                        { status: 403 }
                    );
                }
            }

            const body = await request.json();

            // Validate metrics request
            const validationResult = metricsRequestSchema.safeParse(body);
            if (!validationResult.success) {
                return NextResponse.json(
                    {
                        error: 'Validation failed',
                        details: validationResult.error.issues
                    },
                    { status: 400 }
                );
            }

            const metrics = await analyticsRepo.getMetrics(validationResult.data);
            return NextResponse.json({ metrics });

        } catch (error) {
            console.error('Analytics metrics error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create GET /api/analytics/user/[userId] endpoint
 */
export function createUserAnalyticsEndpoint(analyticsRepo: AnalyticsRepository) {
    return async function GET(
        request: NextRequest,
        { params }: { params: { userId: string } }
    ): Promise<NextResponse> {
        try {
            const { userId } = params;
            const currentUserId = request.headers.get('x-user-id');
            const userRoles = JSON.parse(request.headers.get('x-user-roles') || '[]');

            // Check if user can access this data
            if (userId !== currentUserId && !userRoles.includes('admin')) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }

            const { searchParams } = new URL(request.url);
            const days = parseInt(searchParams.get('days') || '30');

            const activity = await analyticsRepo.getUserActivity(userId, days);

            return NextResponse.json({
                userId,
                activity,
                timeRange: {
                    days,
                    start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
                    end: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('User analytics error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create GET /api/analytics/popular endpoint
 */
export function createPopularEventsEndpoint(
    analyticsRepo: AnalyticsRepository,
    requireAdmin = false
) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        try {
            // Check permissions if required
            if (requireAdmin) {
                const userRoles = JSON.parse(request.headers.get('x-user-roles') || '[]');
                if (!userRoles.includes('admin')) {
                    return NextResponse.json(
                        { error: 'Access denied' },
                        { status: 403 }
                    );
                }
            }

            const { searchParams } = new URL(request.url);
            const limit = parseInt(searchParams.get('limit') || '10');

            const popularEvents = await analyticsRepo.getPopularEvents(limit);
            return NextResponse.json({ events: popularEvents });

        } catch (error) {
            console.error('Popular events error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Analytics utilities
 */
export const analyticsUtils = {
    /**
     * Create standard page view event
     */
    createPageViewEvent(page: string, userId?: string, sessionId?: string): Omit<AnalyticsEvent, 'timestamp'> {
        return {
            event: 'page_view',
            userId,
            sessionId,
            properties: { page }
        };
    },

    /**
     * Create user action event
     */
    createActionEvent(
        action: string,
        target?: string,
        userId?: string,
        properties?: Record<string, any>
    ): Omit<AnalyticsEvent, 'timestamp'> {
        return {
            event: 'user_action',
            userId,
            properties: {
                action,
                target,
                ...properties
            }
        };
    },

    /**
     * Create conversion event
     */
    createConversionEvent(
        type: string,
        value?: number,
        userId?: string,
        properties?: Record<string, any>
    ): Omit<AnalyticsEvent, 'timestamp'> {
        return {
            event: 'conversion',
            userId,
            properties: {
                type,
                value,
                ...properties
            }
        };
    },

    /**
     * Generate session ID
     */
    generateSessionId(): string {
        return crypto.randomUUID();
    },

    /**
     * Sanitize event properties
     */
    sanitizeProperties(properties: Record<string, any>): Record<string, any> {
        const sanitized: Record<string, any> = {};

        for (const [key, value] of Object.entries(properties)) {
            // Remove sensitive fields
            if (key.toLowerCase().includes('password') ||
                key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('secret')) {
                continue;
            }

            // Truncate long strings
            if (typeof value === 'string' && value.length > 1000) {
                sanitized[key] = value.substring(0, 1000) + '...';
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }
};

/**
 * Extract device info from user agent
 */
function extractDeviceInfo(userAgent?: string): {
    device?: 'mobile' | 'tablet' | 'desktop';
    os?: string;
    browser?: string;
} {
    if (!userAgent) return {};

    const ua = userAgent.toLowerCase();

    // Device detection
    let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/tablet|ipad/.test(ua)) {
        device = 'tablet';
    } else if (/mobile|android|iphone/.test(ua)) {
        device = 'mobile';
    }

    // OS detection
    let os: string | undefined;
    if (/windows/.test(ua)) os = 'Windows';
    else if (/macintosh|mac os/.test(ua)) os = 'macOS';
    else if (/linux/.test(ua)) os = 'Linux';
    else if (/android/.test(ua)) os = 'Android';
    else if (/ios|iphone|ipad/.test(ua)) os = 'iOS';

    // Browser detection
    let browser: string | undefined;
    if (/chrome/.test(ua) && !/chromium|edge/.test(ua)) browser = 'Chrome';
    else if (/firefox/.test(ua)) browser = 'Firefox';
    else if (/safari/.test(ua) && !/chrome/.test(ua)) browser = 'Safari';
    else if (/edge/.test(ua)) browser = 'Edge';

    return { device, os, browser };
}