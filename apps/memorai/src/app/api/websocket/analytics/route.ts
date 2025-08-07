/**
 * Real-time Analytics API Endpoint (HTTP-based streaming)
 * Provides HTTP endpoints for real-time analytics data
 * Compatible with Next.js API routes
 * 
 * Endpoints:
 * GET /api/websocket/analytics - Service status and data retrieval
 * POST /api/websocket/analytics - Client management and subscriptions
 * DELETE /api/websocket/analytics - Service management
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Simple analytics service for HTTP-based real-time updates
class HTTPRealtimeAnalyticsService {
    private static instance: HTTPRealtimeAnalyticsService;
    private clients: Set<string> = new Set();
    private subscriptions: Map<string, Set<string>> = new Map(); // clientId -> subscriptions
    private lastData: Map<string, any> = new Map(); // stream -> latest data
    private isRunning = false;

    static getInstance(): HTTPRealtimeAnalyticsService {
        if (!HTTPRealtimeAnalyticsService.instance) {
            HTTPRealtimeAnalyticsService.instance = new HTTPRealtimeAnalyticsService();
        }
        return HTTPRealtimeAnalyticsService.instance;
    }

    startService() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.generateSampleData();
        }
    }

    stopService() {
        this.isRunning = false;
        this.clients.clear();
        this.subscriptions.clear();
        this.lastData.clear();
    }

    registerClient(clientId: string): void {
        this.clients.add(clientId);
        this.subscriptions.set(clientId, new Set());
    }

    unregisterClient(clientId: string): void {
        this.clients.delete(clientId);
        this.subscriptions.delete(clientId);
    }

    subscribe(clientId: string, streams: string[]): void {
        if (!this.subscriptions.has(clientId)) {
            this.subscriptions.set(clientId, new Set());
        }

        const clientSubs = this.subscriptions.get(clientId)!;
        streams.forEach(stream => clientSubs.add(stream));
    }

    unsubscribe(clientId: string, streams: string[]): void {
        const clientSubs = this.subscriptions.get(clientId);
        if (clientSubs) {
            streams.forEach(stream => clientSubs.delete(stream));
        }
    }

    getLatestData(stream: string): any {
        return this.lastData.get(stream);
    }

    getAllLatestData(): Record<string, any> {
        const data: Record<string, any> = {};
        this.lastData.forEach((value, key) => {
            data[key] = value;
        });
        return data;
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            connectedClients: this.clients.size,
            totalSubscriptions: Array.from(this.subscriptions.values())
                .reduce((total, subs) => total + subs.size, 0),
            availableStreams: ['performance', 'memory', 'alerts', 'system'],
            lastDataTimestamp: new Date().toISOString()
        };
    }

    private generateSampleData() {
        if (!this.isRunning) return;

        // Generate sample performance data
        const performanceData = {
            timestamp: new Date().toISOString(),
            metrics: {
                responseTime: Math.floor(50 + Math.random() * 200),
                cpuUsage: Math.floor(20 + Math.random() * 60),
                memoryUsage: Math.floor(30 + Math.random() * 50),
                throughput: Math.floor(10 + Math.random() * 90)
            },
            systemResources: {
                cpuPercent: Math.floor(15 + Math.random() * 70),
                memoryPercent: Math.floor(25 + Math.random() * 65),
                diskPercent: Math.floor(10 + Math.random() * 40),
                networkBytesIn: Math.floor(1024 * 1024 * Math.random() * 100),
                networkBytesOut: Math.floor(1024 * 1024 * Math.random() * 50)
            },
            status: Math.random() > 0.8 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'healthy'
        };

        // Generate sample memory data
        const memoryData = {
            timestamp: new Date().toISOString(),
            totalMemories: Math.floor(1000 + Math.random() * 5000),
            recentAdditions: Math.floor(Math.random() * 50),
            searchActivity: Math.floor(Math.random() * 100),
            activeAgents: Math.floor(1 + Math.random() * 10)
        };

        // Generate sample alerts (occasionally)
        const alerts = [];
        if (Math.random() > 0.9) {
            alerts.push({
                id: `alert-${Date.now()}`,
                title: 'High CPU Usage Detected',
                message: `CPU usage is at ${performanceData.metrics.cpuUsage}% for the past 5 minutes`,
                type: performanceData.metrics.cpuUsage > 80 ? 'critical' : 'warning',
                source: 'performance',
                timestamp: new Date().toISOString(),
                recommendations: [
                    'Consider optimizing memory-intensive operations',
                    'Review recent memory additions for efficiency',
                    'Monitor system resource usage patterns'
                ]
            });
        }

        // Store latest data
        this.lastData.set('performance', performanceData);
        this.lastData.set('memory', memoryData);
        this.lastData.set('alerts', alerts);
        this.lastData.set('system', {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        });

        // Schedule next update
        setTimeout(() => this.generateSampleData(), 2000); // Update every 2 seconds
    }
}

// Validation schemas
const SubscribeSchema = z.object({
    action: z.literal('subscribe'),
    clientId: z.string(),
    streams: z.array(z.enum(['performance', 'memory', 'alerts', 'system'])),
    agentId: z.string().optional()
});

const UnsubscribeSchema = z.object({
    action: z.literal('unsubscribe'),
    clientId: z.string(),
    streams: z.array(z.enum(['performance', 'memory', 'alerts', 'system']))
});

const ConnectSchema = z.object({
    action: z.literal('connect'),
    clientId: z.string(),
    agentId: z.string().optional()
});

const DisconnectSchema = z.object({
    action: z.literal('disconnect'),
    clientId: z.string()
});

const PostRequestSchema = z.union([
    SubscribeSchema,
    UnsubscribeSchema,
    ConnectSchema,
    DisconnectSchema
]);

// GET endpoint - Service status and data retrieval
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'status';
        const clientId = searchParams.get('clientId');
        const stream = searchParams.get('stream');

        const service = HTTPRealtimeAnalyticsService.getInstance();

        switch (action) {
            case 'status':
                return NextResponse.json({
                    success: true,
                    status: service.getStatus(),
                    timestamp: new Date().toISOString()
                });

            case 'data':
                if (stream) {
                    const data = service.getLatestData(stream);
                    return NextResponse.json({
                        success: true,
                        stream,
                        data,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    const allData = service.getAllLatestData();
                    return NextResponse.json({
                        success: true,
                        data: allData,
                        timestamp: new Date().toISOString()
                    });
                }

            case 'start-service':
                service.startService();
                return NextResponse.json({
                    success: true,
                    message: 'Real-time analytics service started',
                    status: service.getStatus()
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Real-time Analytics GET API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

// POST endpoint - Client management and subscriptions
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = PostRequestSchema.parse(body);

        const service = HTTPRealtimeAnalyticsService.getInstance();

        switch (validatedData.action) {
            case 'connect':
                service.registerClient(validatedData.clientId);
                service.startService(); // Auto-start service when first client connects
                return NextResponse.json({
                    success: true,
                    message: 'Client connected',
                    clientId: validatedData.clientId,
                    status: service.getStatus()
                });

            case 'disconnect':
                service.unregisterClient(validatedData.clientId);
                return NextResponse.json({
                    success: true,
                    message: 'Client disconnected',
                    clientId: validatedData.clientId
                });

            case 'subscribe':
                service.subscribe(validatedData.clientId, validatedData.streams);
                return NextResponse.json({
                    success: true,
                    message: 'Subscribed to streams',
                    clientId: validatedData.clientId,
                    streams: validatedData.streams
                });

            case 'unsubscribe':
                service.unsubscribe(validatedData.clientId, validatedData.streams);
                return NextResponse.json({
                    success: true,
                    message: 'Unsubscribed from streams',
                    clientId: validatedData.clientId,
                    streams: validatedData.streams
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request format',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        console.error('Real-time Analytics POST API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// DELETE endpoint - Service management
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'stop-service';

        const service = HTTPRealtimeAnalyticsService.getInstance();

        switch (action) {
            case 'stop-service':
                service.stopService();
                return NextResponse.json({
                    success: true,
                    message: 'Real-time analytics service stopped'
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Real-time Analytics DELETE API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
