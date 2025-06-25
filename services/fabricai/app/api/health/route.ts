/**
 * Health Check API Route
 * Service monitoring and health status
 */

import { NextResponse } from 'next/server';
import { checkServiceHealth, getCodaiService } from '@/lib/services';
import type { HealthCheck } from '@/lib/services';

export async function GET() {
  try {
    const startTime = Date.now();

    // Check ecosystem service health
    const serviceStatus = await checkServiceHealth();
    const responseTime = Date.now() - startTime;

    // Get system metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const healthData: HealthCheck = {
      status: determineOverallHealth(serviceStatus),
      timestamp: new Date().toISOString(),
      metrics: {
        uptime: uptime,
        memory: memoryUsage.heapUsed / 1024 / 1024, // MB
        cpu: 0, // Would need additional monitoring
        responseTime: responseTime,
      },
      services: serviceStatus,
    };

    // Report health to Codai central if configured
    try {
      const codaiService = getCodaiService();
      await codaiService.sendHealthCheck(healthData);
    } catch (error) {
      console.warn('Failed to report health to Codai central:', error);
    }

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}

function determineOverallHealth(
  services: any
): 'healthy' | 'unhealthy' | 'degraded' {
  const healthyServices = Object.values(services).filter(Boolean).length;
  const totalServices = Object.keys(services).length;

  if (healthyServices === totalServices) {
    return 'healthy';
  } else if (healthyServices > 0) {
    return 'degraded';
  } else {
    return 'unhealthy';
  }
}
