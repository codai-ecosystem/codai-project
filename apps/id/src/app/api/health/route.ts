/**
 * CND-Enhanced Health Check for ID Service
 * Phase 2 Implementation: Service health monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { CNDAuthService } from '@/services/cnd-auth';

let cndAuthService: CNDAuthService | null = null;

async function getCNDAuthService(): Promise<CNDAuthService> {
  if (!cndAuthService) {
    cndAuthService = new CNDAuthService();
    await cndAuthService.initialize();
  }
  return cndAuthService;
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Basic service info
    const serviceInfo = {
      service: 'id-service',
      version: '2.0.0-cnd',
      description: 'CODAI Identity and Authentication Service - CND Enhanced',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    // Check CND Auth Service health
    let cndHealth;
    let authServiceStatus = 'unknown';

    try {
      const authService = await getCNDAuthService();
      cndHealth = await authService.getHealthStatus();
      authServiceStatus = cndHealth.status;
    } catch (error) {
      cndHealth = {
        status: 'error',
        error: error.message
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
        cndAuth: {
          status: authServiceStatus,
          details: cndHealth
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
          loadAverage: process.platform !== 'win32' ? process.loadavg() : [0, 0, 0]
        }
      },
      features: [
        'cnd-authentication',
        'user-management',
        'session-management',
        'audit-logging',
        'metrics-monitoring',
        'jwt-tokens',
        'oauth2-ready'
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
    response.headers.set('X-Health-Check', 'CND-Enhanced');
    response.headers.set('X-Service-Name', 'id-service');
    response.headers.set('X-Service-Version', '2.0.0-cnd');
    response.headers.set('X-CND-Status', authServiceStatus);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return response;

  } catch (error: any) {
    console.error('Health check error:', error);

    const errorResponse = {
      service: 'id-service',
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime(),
      checks: {
        cndAuth: {
          status: 'error',
          error: error.message
        }
      }
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

// HEAD request for simple health ping
export async function HEAD(request: NextRequest) {
  try {
    const authService = await getCNDAuthService();
    const health = await authService.getHealthStatus();

    const isHealthy = health.status === 'healthy';
    const response = new NextResponse(null, {
      status: isHealthy ? 200 : 503
    });

    response.headers.set('X-Health-Status', health.status);
    response.headers.set('X-Service-Name', 'id-service');
    response.headers.set('X-CND-Enhanced', 'true');

    return response;
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
