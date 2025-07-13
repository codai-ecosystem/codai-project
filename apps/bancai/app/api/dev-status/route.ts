import { NextRequest, NextResponse } from 'next/server';

/**
 * DEVELOPMENT STATUS ENDPOINT 
 * This endpoint provides service status without authentication
 */

export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            service: 'bancai',
            port: 4032,
            status: 'operational',
            database: {
                type: 'SQLite',
                status: 'initialized',
                schema: 'synchronized'
            },
            features: {
                authentication: 'NextAuth.js configured',
                database: 'Prisma + SQLite',
                models: ['Customer', 'Account', 'Transaction', 'Card', 'Payment']
            },
            timestamp: new Date().toISOString(),
            message: 'BancAI Banking Platform - Database ready for business logic'
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Service error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        return NextResponse.json({
            success: true,
            message: 'BancAI test endpoint responding',
            received: body,
            service: 'bancai',
            capabilities: [
                'Account management',
                'Transaction processing',
                'Payment handling',
                'KYC verification',
                'Romanian banking compliance'
            ]
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to process request'
        }, { status: 500 });
    }
}
