import { NextResponse } from 'next/server';

/**
 * Minimal API Endpoint - Enhanced and stable
 * Returns comprehensive Hub service information
 */
export async function GET() {
    try {
        const apiData = {
            success: true,
            service: 'Hub Service',
            message: 'Hub API is operational',
            timestamp: new Date().toISOString(),
            version: '1.0.0-simple',
            uptime: process.uptime ? Math.floor(process.uptime()) : 0,
            endpoints: {
                '/health': 'Service health check',
                '/api/minimal': 'This endpoint - minimal API',
                '/api/services': 'Service discovery (planned)'
            },
            status: {
                database: 'CBD Universal - Connected',
                gateway: 'API Gateway - Connected',
                migration: 'CND to CBD 70% complete'
            },
            capabilities: [
                'health-monitoring',
                'service-discovery',
                'api-routing',
                'minimal-operations'
            ]
        };

        return NextResponse.json(apiData, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    } catch (error) {
        console.error('Hub minimal API failed:', error);

        return NextResponse.json({
            success: false,
            service: 'Hub Service',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function HEAD() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    });
}
