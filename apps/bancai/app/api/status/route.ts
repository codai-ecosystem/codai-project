import { NextResponse } from 'next/server';

export async function GET() {
    try {
        return NextResponse.json({
            status: 'healthy',
            service: 'BancAI',
            description: 'AI Banking Platform',
            port: 4034,
            type: 'finance',
            category: 'business',
            timestamp: new Date().toISOString(),
            features: {
                authentication: 'active',
                payments: 'enabled',
                kyc: 'available',
                compliance: 'enforced'
            }
        });
    } catch (error) {
        return NextResponse.json(
            { status: 'error', message: 'Service unhealthy' },
            { status: 500 }
        );
    }
}
