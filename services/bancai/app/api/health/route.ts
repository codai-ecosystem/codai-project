import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'bancai',
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3003,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      dependencies: {
        memorai: process.env.MEMORAI_API_URL ? 'configured' : 'not_configured',
        logai: process.env.LOGAI_API_URL ? 'configured' : 'not_configured',
      },
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
