/**
 * Service Registry API Routes
 * Manages service registration, discovery, and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import CNDHubService from '@/services/cnd-hub';
import { z } from 'zod';

const ServiceRegistrationSchema = z.object({
    serviceId: z.string(),
    serviceName: z.string(),
    version: z.string(),
    host: z.string(),
    port: z.number(),
    protocol: z.enum(['http', 'https', 'ws', 'wss']),
    endpoints: z.array(z.object({
        path: z.string(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
        description: z.string().optional(),
    })),
    healthCheckPath: z.string().default('/health'),
    tags: z.array(z.string()).default([]),
    metadata: z.record(z.any()).default({}),
});

let hubService: CNDHubService | null = null;

async function getHubService(): Promise<CNDHubService> {
    if (!hubService) {
        hubService = new CNDHubService();
        await hubService.initialize();
    }
    return hubService;
}

// GET /api/services - Get all registered services
export async function GET(request: NextRequest) {
    try {
        const hub = await getHubService();
        const { searchParams } = new URL(request.url);
        const tag = searchParams.get('tag');

        let services;
        if (tag) {
            services = await hub.findServicesByTag(tag);
        } else {
            services = await hub.getRegisteredServices();
        }

        return NextResponse.json({
            success: true,
            count: services.length,
            services,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Failed to get services:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}

// POST /api/services - Register a new service
export async function POST(request: NextRequest) {
    try {
        const hub = await getHubService();
        const body = await request.json();

        // Validate request body
        const registration = ServiceRegistrationSchema.parse(body);

        await hub.registerService(registration);

        return NextResponse.json({
            success: true,
            message: `Service ${registration.serviceName} registered successfully`,
            serviceId: registration.serviceId,
            timestamp: new Date().toISOString(),
        }, { status: 201 });
    } catch (error) {
        console.error('❌ Failed to register service:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid service registration data',
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
