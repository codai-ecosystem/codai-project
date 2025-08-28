import { NextRequest, NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  performance: {
    memoryUsage: NodeJS.MemoryUsage;
    loadAverage: number[];
  };
  services: {
    database: 'connected' | 'disconnected' | 'not_applicable';
    external_apis: 'available' | 'unavailable' | 'not_applicable';
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<HealthStatus>> {
  try {
    const healthData: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      performance: {
        memoryUsage: process.memoryUsage(),
        loadAverage: process.platform === 'darwin' || process.platform === 'linux'
          ? (await import('os')).loadavg()
          : [0, 0, 0],
      },
      services: {
        database: 'not_applicable', // No database for static site
        external_apis: 'not_applicable', // No external APIs required
      },
    };

    // Check memory usage - warn if over 500MB
    const memoryUsageMB = healthData.performance.memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 500) {
      healthData.status = 'unhealthy';
    }

    const statusCode = healthData.status === 'healthy' ? 200 : 503;

    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    const errorData: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      performance: {
        memoryUsage: process.memoryUsage(),
        loadAverage: [0, 0, 0],
      },
      services: {
        database: 'not_applicable',
        external_apis: 'not_applicable',
      },
    };

    return NextResponse.json(errorData, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}