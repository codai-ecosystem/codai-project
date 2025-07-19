import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'MEMORAI',
      version: '1.0.0',
      port: process.env.PORT || '5001',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      checks: {
        database: 'pending', // TODO: Add database health check
        api: 'healthy',
        memory_core: 'healthy',
        mcp_server: 'pending', // TODO: Add MCP server health check
      }
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error('MEMORAI health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'MEMORAI',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function HEAD() {
  // Simple health check for load balancers
  return new Response(null, { status: 200 });
}
