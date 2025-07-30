/**
 * Hub Service Health Endpoint with CND Integration
 * Provides comprehensive ecosystem health monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import CNDHubService from '@/services/cnd-hub';

let hubService: CNDHubService | null = null;

async function getHubService(): Promise<CNDHubService> {
    if (!hubService) {
        hubService = new CNDHubService();
        await hubService.initialize();
    }
    return hubService;
}

export async function GET(request: NextRequest) {
    try {
        const hub = await getHubService();
        const hubStatus = await hub.getHubStatus();

        return NextResponse.json({
            success: true,
            service: 'hub',
            timestamp: new Date().toISOString(),
            ...hubStatus,
        });
    } catch (error) {
        console.error('❌ Hub health check failed:', error);

        return NextResponse.json({
            success: false,
            service: 'hub',
            timestamp: new Date().toISOString(),
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
