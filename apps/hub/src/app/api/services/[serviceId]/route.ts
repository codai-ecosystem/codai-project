/**
 * Individual Service Management API Routes
 * Handles specific service operations and unregistration
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

// DELETE /api/services/[serviceId] - Unregister a service
export async function DELETE(
    request: NextRequest,
    { params }: { params: { serviceId: string } }
) {
    try {
        const hub = await getHubService();
        const { serviceId } = params;

        await hub.unregisterService(serviceId);

        return NextResponse.json({
            success: true,
            message: `Service ${serviceId} unregistered successfully`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Failed to unregister service:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}

// GET /api/services/[serviceId]/health - Get specific service health
export async function GET(
    request: NextRequest,
    { params }: { params: { serviceId: string } }
) {
    try {
        const hub = await getHubService();
        const { serviceId } = params;

        const health = await hub.getServiceHealth(serviceId);

        return NextResponse.json({
            success: true,
            serviceId,
            health,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Failed to get service health:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
