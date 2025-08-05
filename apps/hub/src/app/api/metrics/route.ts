/**
 * System Metrics API Routes
 * Handles metrics collection, recording, and retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import CBDHubService from '@/services/cbd-hub';
import { z } from 'zod';

const MetricSchema = z.object({
    metricName: z.string(),
    value: z.number(),
    labels: z.record(z.any()).default({}),
});

let hubService: CBDHubService | null = null;

async function getHubService(): Promise<CBDHubService> {
    if (!hubService) {
        hubService = new CBDHubService();
        await hubService.initialize();
    }
    return hubService;
}

// GET /api/metrics - Get system metrics
export async function GET(request: NextRequest) {
    try {
        const hub = await getHubService();
        const { searchParams } = new URL(request.url);
        const metricName = searchParams.get('metricName');
        const timeWindow = searchParams.get('timeWindow');

        const metrics = await hub.getSystemMetrics(
            metricName || undefined,
            timeWindow || undefined
        );

        return NextResponse.json({
            success: true,
            metrics,
            count: metrics.length,
            filters: {
                metricName: metricName || 'all',
                timeWindow: timeWindow || 'all',
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Failed to get metrics:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}

// POST /api/metrics - Record a metric
export async function POST(request: NextRequest) {
    try {
        const hub = await getHubService();
        const body = await request.json();

        // Validate request body
        const metric = MetricSchema.parse(body);

        await hub.recordMetric(metric.metricName, metric.value, metric.labels);

        return NextResponse.json({
            success: true,
            message: `Metric ${metric.metricName} recorded successfully`,
            metric: {
                name: metric.metricName,
                value: metric.value,
                labels: metric.labels,
            },
            timestamp: new Date().toISOString(),
        }, { status: 201 });
    } catch (error) {
        console.error('❌ Failed to record metric:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid metric data',
                details: error.errors,
                timestamp: new Date().toISOString(),
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
