/**
 * Cross-Service Communication API Routes
 * Handles service-to-service communication and load balancing
 */

import { NextRequest, NextResponse } from 'next/server';
import CNDHubService from '@/services/cnd-hub';
import { z } from 'zod';

const CrossServiceRequestSchema = z.object({
    targetService: z.string(),
    endpoint: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    data: z.any().optional(),
    headers: z.record(z.string()).default({}),
    timeout: z.number().default(30000),
});

let hubService: CNDHubService | null = null;

async function getHubService(): Promise<CNDHubService> {
    if (!hubService) {
        hubService = new CNDHubService();
        await hubService.initialize();
    }
    return hubService;
}

// POST /api/communication/request - Make cross-service request
export async function POST(request: NextRequest) {
    try {
        const hub = await getHubService();
        const body = await request.json();

        // Validate request body
        const serviceRequest = CrossServiceRequestSchema.parse(body);

        const result = await hub.makeServiceRequest(serviceRequest);

        return NextResponse.json({
            success: true,
            result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Cross-service request failed:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid cross-service request data',
                details: error.errors,
                timestamp: new Date().toISOString(),
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}

// GET /api/communication/healthy-instances/:serviceName - Get healthy service instances
export async function GET(
    request: NextRequest,
    { params }: { params: { serviceName: string } }
) {
    try {
        const hub = await getHubService();
        const { serviceName } = params;

        const instances = await hub.getHealthyServiceInstances(serviceName);

        return NextResponse.json({
            success: true,
            serviceName,
            healthyInstances: instances,
            count: instances.length,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Failed to get healthy instances:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
