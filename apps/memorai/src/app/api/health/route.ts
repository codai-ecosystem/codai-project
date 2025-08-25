import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Basic health check for MemorAI service
        const healthData = {
            status: 'healthy',
            service: 'MemorAI Service',
            serviceId: 'memorai',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            endpoints: {
                health: '/api/health',
                memories: '/api/memories',
                search: '/api/search',
                analytics: '/api/analytics'
            },
            message: 'MemorAI service is running successfully'
        };

        return NextResponse.json(healthData, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                service: 'MemorAI Service',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

export async function HEAD(request: NextRequest) {
    return new NextResponse(null, { status: 200 });
}
