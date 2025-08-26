import { NextRequest, NextResponse } from 'next/server';

// Simple health endpoint implementation
function createSimpleHealthEndpoint(serviceName: string, version: string) {
  return async function GET(request: NextRequest) {
    return NextResponse.json({
      service: serviceName,
      version: version,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  };
}

// CODAI Development Environment specific health configuration
const GET = createSimpleHealthEndpoint('CODAI Development Environment', '1.0.0');

// Use the same function for HEAD requests
const HEAD = GET;

export { GET, HEAD };