/**
 * Real Authentication Health Check for ID Service
 * Using SimpleAuthService with real data storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { SimpleAuthService } from '@/services/simple-auth';

let authService: SimpleAuthService | null = null;

async function getAuthService(): Promise<SimpleAuthService> {
  if (!authService) {
    authService = new SimpleAuthService();
    await authService.initialize();
  }
  return authService;
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Basic service info
    const serviceInfo = {
      service: 'id-service',
      version: '2.0.0-real',
      description: 'CODAI Identity and Authentication Service - Real Implementation',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    // Check Auth Service health
    let authHealth;
    let authServiceStatus = 'unknown';

    try {
      const authService = await getAuthService();
      authHealth = await authService.getHealthStatus();
      authServiceStatus = authHealth.status;
    } catch (error) {
      authHealth = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      authServiceStatus = 'error';
    }

    // Overall health determination
    const isHealthy = authServiceStatus === 'healthy';
    const responseTime = Date.now() - startTime;

    const healthData = {
      ...serviceInfo,
      status: isHealthy ? 'healthy' : 'unhealthy',
      responseTime,
      checks: {
        auth: {
          status: authServiceStatus,
          details: authHealth
        },
        memory: {
          status: 'healthy',
          usage: process.memoryUsage(),
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
        },
        cpu: {
          status: 'healthy',
          usage: process.cpuUsage(),
          loadAverage: process.platform !== 'win32' && 'loadavg' in process ? (process as any).loadavg() : [0, 0, 0]
        }
      },
      features: [
        'real-authentication',
        'user-management',
        'session-management',
        'audit-logging',
        'metrics-monitoring',
        'file-based-storage',
        'jwt-tokens'
      ],
      endpoints: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        validate: '/api/auth/validate',
        health: '/api/health'
      }
    };

    const statusCode = isHealthy ? 200 : 503;
    const response = NextResponse.json(healthData, { status: statusCode });

    // Add health check headers
    response.headers.set('X-Health-Check', 'Real-Auth-Service');
    response.headers.set('X-Service-Name', 'id-service');
    response.headers.set('X-Service-Version', '2.0.0-real');
    response.headers.set('X-Auth-Status', authServiceStatus);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return response;

  } catch (error: any) {
    console.error('Health check error:', error);

    const errorResponse = {
      service: 'id-service',
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
      checks: {
        auth: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

// HEAD request for simple health ping
export async function HEAD(request: NextRequest) {
  try {
    const authService = await getAuthService();
    const health = await authService.getHealthStatus();

    const isHealthy = health.status === 'healthy';
    const response = new NextResponse(null, {
      status: isHealthy ? 200 : 503
    });

    response.headers.set('X-Health-Status', health.status);
    response.headers.set('X-Service-Name', 'id-service');
    response.headers.set('X-Real-Auth', 'true');

    return response;
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
