import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      service: 'LogAI - AI Logging & Analytics Platform',
      port: 4037
    };

    return NextResponse.json(health, { status: 200 });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      service: 'LogAI - AI Logging & Analytics Platform'
    }, { status: 503 });
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
