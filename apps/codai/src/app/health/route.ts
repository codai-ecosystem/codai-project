import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            status: 'healthy',
            service: 'codai',
            timestamp: new Date().toISOString(),
            port: 4001,
            version: '1.0.0',
            features: [
                'ai-assistant',
                'code-generation',
                'natural-language-processing',
                'intelligent-automation'
            ]
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                service: 'codai',
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
