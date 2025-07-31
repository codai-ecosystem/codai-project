import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            status: 'healthy',
            service: 'id',
            timestamp: new Date().toISOString(),
            port: 4004,
            version: '1.0.0',
            features: [
                'authentication',
                'authorization',
                'user-management',
                'oauth2',
                'sso'
            ]
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                service: 'id',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function HEAD(request: NextRequest) {
    try {
        return new NextResponse(null, { status: 200 });
    } catch (error) {
        return new NextResponse(null, { status: 500 });
    }
}
