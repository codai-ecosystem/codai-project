/**
 * Ecosystem Health API Routes
 * Provides comprehensive health monitoring for all services
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

// GET /api/ecosystem/health - Get health status of all services
export async function GET(request: NextRequest) {
    try {
        const hub = await getHubService();
        const healthStatus = await hub.getServiceHealth();

        // Group health by status
        const healthSummary = Array.isArray(healthStatus) ? healthStatus.reduce((acc, service) => {
            if (!acc[service.status]) {
                acc[service.status] = [];
            }
            acc[service.status].push(service);
            return acc;
        }, {} as Record<string, any[]>) : {};

        const totalServices = Array.isArray(healthStatus) ? healthStatus.length : 0;
        const healthyCount = healthSummary.healthy?.length || 0;
        const unhealthyCount = healthSummary.unhealthy?.length || 0;
        const degradedCount = healthSummary.degraded?.length || 0;
        const unknownCount = healthSummary.unknown?.length || 0;

        const overallStatus = unhealthyCount > 0 ? 'unhealthy' :
            degradedCount > 0 ? 'degraded' :
                unknownCount > 0 ? 'partial' : 'healthy';

        return NextResponse.json({
            success: true,
            ecosystem: {
                overallStatus,
                totalServices,
                summary: {
                    healthy: healthyCount,
                    unhealthy: unhealthyCount,
                    degraded: degradedCount,
                    unknown: unknownCount,
                },
                healthPercentage: totalServices > 0 ? Math.round((healthyCount / totalServices) * 100) : 0,
            },
            services: healthStatus,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Failed to get ecosystem health:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
