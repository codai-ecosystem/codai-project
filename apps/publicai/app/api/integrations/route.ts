// publicai Integration API Routes
// Auto-generated for 110% Power Achievement

import { NextRequest, NextResponse } from 'next/server';
import { PublicaiIntegrationManager } from '../../../src/lib/integrations/publicai';

const integrationManager = new PublicaiIntegrationManager(
    process.env.PUBLICAI_API_KEY || 'demo-key',
    process.env.PUBLICAI_BASE_URL
);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const service = searchParams.get('service');

        if (!service) {
            return NextResponse.json({ error: 'Service parameter required' }, { status: 400 });
        }

        const isConnected = await integrationManager.connect();
        const status = await integrationManager.getStatus();

        return NextResponse.json({
            service,
            connected: isConnected,
            status: status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Integration GET error:', error);
        return NextResponse.json({ error: 'Integration check failed' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { service, data } = body;

        if (!service || !data) {
            return NextResponse.json({ error: 'Service and data required' }, { status: 400 });
        }

        const result = await integrationManager.processRequest(data);

        return NextResponse.json({
            success: true,
            service,
            result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Integration POST error:', error);
        return NextResponse.json({ error: 'Integration processing failed' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const connectionStatus = await integrationManager.connect();

        return NextResponse.json({
            allConnected: connectionStatus,
            services: ['publicai'], // Static list since PublicaiIntegrationManager handles publicai service
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Integration PUT error:', error);
        return NextResponse.json({ error: 'Integration connection failed' }, { status: 500 });
    }
}
