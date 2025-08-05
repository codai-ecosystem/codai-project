/**
 * Service Registry API Routes
 * Manages service registration, discovery, and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import CBDHubService from '@/services/cbd-hub';

// Simple validation function instead of zod
function validateServiceRegistration(data: any) {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Request body must be an object' };
    }

    if (!data.serviceId || typeof data.serviceId !== 'string') {
        return { valid: false, error: 'serviceId is required and must be string' };
    }

    if (!data.serviceName || typeof data.serviceName !== 'string') {
        return { valid: false, error: 'serviceName is required and must be string' };
    }

    if (!data.version || typeof data.version !== 'string') {
        return { valid: false, error: 'version is required and must be string' };
    }

    if (!data.host || typeof data.host !== 'string') {
        return { valid: false, error: 'host is required and must be string' };
    }

    if (!data.port || typeof data.port !== 'number') {
        return { valid: false, error: 'port is required and must be number' };
    }

    if (!data.protocol || !['http', 'https', 'ws', 'wss'].includes(data.protocol)) {
        return { valid: false, error: 'protocol must be one of: http, https, ws, wss' };
    }

    if (data.endpoints && !Array.isArray(data.endpoints)) {
        return { valid: false, error: 'endpoints must be array if provided' };
    }

    if (data.tags && !Array.isArray(data.tags)) {
        return { valid: false, error: 'tags must be array if provided' };
    }

    // Set defaults
    const validated = {
        ...data,
        healthCheckPath: data.healthCheckPath || '/health',
        tags: Array.isArray(data.tags) ? data.tags : [],
        metadata: data.metadata && typeof data.metadata === 'object' ? data.metadata : {},
        endpoints: Array.isArray(data.endpoints) ? data.endpoints : []
    };

    return { valid: true, data: validated };
}

let hubService: CBDHubService | null = null;

async function getHubService(): Promise<CBDHubService> {
    if (!hubService) {
        hubService = new CBDHubService();
        await hubService.initialize();
    }
    return hubService;
}

// GET /api/services - Get all registered services
export async function GET(request: NextRequest) {
    try {
        // Input validation and sanitization
        const { searchParams } = new URL(request.url);
        const tag = searchParams.get('tag');

        // Validate and sanitize tag parameter
        let sanitizedTag: string | null = null;
        if (tag && typeof tag === 'string') {
            sanitizedTag = tag.replace(/[<>'"&;]/g, '').trim();
            if (sanitizedTag.length === 0 || sanitizedTag.length > 50) {
                sanitizedTag = null;
            }
        }

        const hub = await getHubService();

        let services;
        if (sanitizedTag) {
            services = await hub.findServicesByTag(sanitizedTag);
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
            error: 'Failed to retrieve services',
            message: 'An error occurred while fetching service registry',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}

// POST /api/services - Register a new service
export async function POST(request: NextRequest) {
    try {
        // Input validation
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid JSON payload',
                message: 'Request body must be valid JSON',
                timestamp: new Date().toISOString(),
            }, { status: 400 });
        }

        // Basic input sanitization before validation
        if (typeof body !== 'object' || body === null) {
            return NextResponse.json({
                success: false,
                error: 'Invalid request body',
                message: 'Request body must be an object',
                timestamp: new Date().toISOString(),
            }, { status: 400 });
        }

        const hub = await getHubService();

        // Validate request body
        const validation = validateServiceRegistration(body);
        if (!validation.valid) {
            return NextResponse.json({
                success: false,
                error: validation.error,
                timestamp: new Date().toISOString(),
            }, { status: 400 });
        }

        await hub.registerService(validation.data);

        return NextResponse.json({
            success: true,
            message: `Service ${validation.data.serviceName} registered successfully`,
            serviceId: validation.data.serviceId,
            timestamp: new Date().toISOString(),
        }, { status: 201 });
    } catch (error) {
        console.error('❌ Failed to register service:', error);

        return NextResponse.json({
            success: false,
            error: 'Service registration failed',
            message: 'An error occurred while registering the service',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
