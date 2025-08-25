import { NextRequest, NextResponse } from 'next/server';

// Simple health endpoint for kodex service
const FeatureStatus = {
    OPERATIONAL: 'operational',
    DEGRADED: 'degraded',
    DOWN: 'down',
    MAINTENANCE: 'maintenance'
} as const;

export async function GET(request: NextRequest): Promise<NextResponse> {
    return NextResponse.json({
        service: 'Kodex Code Analysis & Documentation',
        version: '1.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        features: {
            codeAnalysis: FeatureStatus.OPERATIONAL,
            documentation: FeatureStatus.OPERATIONAL,
            blockchain: FeatureStatus.OPERATIONAL
        }
    });
}

export async function HEAD(request: NextRequest): Promise<NextResponse> {
    return new NextResponse(null, { status: 200 });
}