/**
 * Simple Health Test API Route
 */

import { NextRequest, NextResponse } from 'next/server';

// GET /api/test/health - Simple health test without CND
export async function GET(request: NextRequest) {
    try {
        console.log('🧪 Testing simple health endpoint...');

        // Mock health data without any dependencies
        const mockHealthData = [
            {
                serviceId: 'cbd-universal',
                status: 'healthy',
                lastCheck: new Date(),
                responseTime: 15,
                details: { version: '1.0.0', uptime: '24h' }
            },
            {
                serviceId: 'api-gateway',
                status: 'healthy',
                lastCheck: new Date(),
                responseTime: 25,
                details: { version: '1.0.0', uptime: '24h' }
            },
            {
                serviceId: 'hub-service',
                status: 'healthy',
                lastCheck: new Date(),
                responseTime: 30,
                details: { version: '1.0.0', uptime: '24h' }
            },
            {
                serviceId: 'codai-service',
                status: 'degraded',
                lastCheck: new Date(),
                responseTime: 150,
                details: { version: '1.0.0', issue: 'CND migration in progress' }
            }
        ];

        // Group health by status
        const healthSummary = mockHealthData.reduce((acc, service) => {
            if (!acc[service.status]) {
                acc[service.status] = [];
            }
            acc[service.status].push(service);
            return acc;
        }, {} as Record<string, any[]>);

        const totalServices = mockHealthData.length;
        const healthyCount = healthSummary.healthy?.length || 0;
        const unhealthyCount = healthSummary.unhealthy?.length || 0;
        const degradedCount = healthSummary.degraded?.length || 0;
        const unknownCount = healthSummary.unknown?.length || 0;

        const overallStatus = unhealthyCount > 0 ? 'unhealthy' :
            degradedCount > 0 ? 'degraded' :
                unknownCount > 0 ? 'partial' : 'healthy';

        const result = {
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
            services: mockHealthData,
            timestamp: new Date().toISOString(),
        };

        console.log('✅ Simple health test result:', result);
        return NextResponse.json(result);
    } catch (error) {
        console.error('❌ Simple health test failed:', error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
