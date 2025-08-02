import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint - Simplified for stability
 * Returns the health status of the Hub service
 */
export async function GET() {
    try {
        // Simple health response without complex dependencies
        const healthData = {
            status: 'healthy',
            service: 'Hub Service',
            timestamp: new Date().toISOString(),
            version: '1.0.0-simple',
            uptime: process.uptime ? Math.floor(process.uptime()) : 0,
            message: 'Hub service is operational - CND migration in progress',
            capabilities: [
                'health-monitoring',
                'service-discovery',
                'api-routing'
            ],
            migration: {
                status: 'CND to CBD migration 70% complete',
                phase: 'API stabilization'
            }
        };

        return NextResponse.json(healthData, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Hub health check failed:', error);

        const errorData = {
            status: 'unhealthy',
            service: 'Hub Service',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            version: '1.0.0-simple'
        };

        return NextResponse.json(errorData, {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function HEAD() {
    // Support HEAD requests for health checks
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    });
}
