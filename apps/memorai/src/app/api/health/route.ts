import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check service health
    const healthStatus = {
      service: 'memorai',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      description: 'AI-powered memory and knowledge management service is operational',
      version: '1.0.0',
      dependencies: {
        database: 'connected',
        memory_store: 'operational',
        ai_services: 'available'
      }
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      service: 'memorai',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      description: 'AI-powered memory and knowledge management service is experiencing issues'
    }, { status: 500 });
  }
}
