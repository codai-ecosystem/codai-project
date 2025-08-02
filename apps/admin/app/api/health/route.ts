/**
 * 🏥 Health Check API Route
 * Simple health monitoring endpoint using Next.js App Router
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering for real-time health data
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'CODAI Admin Dashboard',
            version: '2.0.0',
            port: 4007,
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
        };

        return NextResponse.json(healthData, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });

    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json(
            {
                status: 'error',
                timestamp: new Date().toISOString(),
                service: 'CODAI Admin Dashboard',
                error: error instanceof Error ? error.message : 'Unknown error',
                port: 4007,
            },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                }
            }
        );
    }
}

// Database health check
async function checkDatabase(): Promise<any> {
    // Simulate database connection check
    await new Promise(resolve => setTimeout(resolve, 10));

    return {
        connection: 'active',
        latency: '< 50ms',
        queries: 'operational',
    };
}

// External services health check
async function checkExternalServices(): Promise<any> {
    // Simulate external services check
    await new Promise(resolve => setTimeout(resolve, 5));

    return {
        apis: 'responsive',
        authentication: 'active',
        cdn: 'operational',
    };
}

// System resources health check
async function checkSystemResources(): Promise<any> {
    const memoryUsage = process.memoryUsage();

    return {
        memory: {
            used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        },
        cpu: 'normal',
        disk: 'available',
    };
}

// Check external service health
async function checkServiceHealth(url: string): Promise<{ status: string; responseTime?: string; error?: string }> {
    try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'CODAI-Admin-Health-Check/2.0.0',
            },
        });

        clearTimeout(timeoutId);
        const endTime = Date.now();

        if (response.ok) {
            return {
                status: 'healthy',
                responseTime: `${endTime - startTime}ms`,
            };
        } else {
            return {
                status: 'unhealthy',
                error: `HTTP ${response.status}: ${response.statusText}`,
            };
        }
    } catch (error) {
        return {
            status: 'unreachable',
            error: error instanceof Error ? error.message : 'Connection failed',
        };
    }
}
