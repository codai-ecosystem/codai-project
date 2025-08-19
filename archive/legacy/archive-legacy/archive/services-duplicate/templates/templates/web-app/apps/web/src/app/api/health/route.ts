import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * GET /api/health
 */
export function GET(): NextResponse {
  try {
    const version = process.env['npm_package_version'];

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: version ?? '1.0.0',
      environment: process.env['NODE_ENV'],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
