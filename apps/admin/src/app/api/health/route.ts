import { NextResponse } from 'next/server';

export async function GET() {
    try {
        return NextResponse.json({
            status: 'healthy',
            service: 'CODAI Admin Dashboard',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            features: [
                'Service Management',
                'User Administration',
                'System Analytics',
                'Alert Management',
                'Role-based Access Control',
                'Ecosystem Integration'
            ]
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                service: 'CODAI Admin Dashboard',
                error: 'Health check failed'
            },
            { status: 500 }
        );
    }
}
