import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Returns the health status of the Hub service
 */
export async function GET() {
    try {
        // Return basic health status
        return NextResponse.json(
            {
                status: 'healthy',
                service: 'hub',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                message: 'Hub service is operational'
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json(
            {
                status: 'unhealthy',
                service: 'hub',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function HEAD() {
    // Support HEAD requests for health checks
    return new Response(null, { status: 200 });
}
