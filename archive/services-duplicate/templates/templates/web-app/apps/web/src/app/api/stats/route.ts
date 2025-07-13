import { NextResponse } from 'next/server';

/**
 * API Route: /api/stats
 *
 * Provides basic application statistics and health information
 */
export async function GET() {
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      version: process.env['npm_package_version'] || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        usage: process.memoryUsage(),
        heap: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
        },
      },
      system: {
        platform: process.platform,
        node: process.version,
        cpu: process.cpuUsage(),
      },
    };

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error generating stats:', error);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Failed to generate statistics',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

export async function HEAD() {
  // Health check endpoint - just return 200 OK
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
