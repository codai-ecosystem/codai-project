import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      service: 'MARKETAI',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      features: [
        'marketing-automation',
        'analytics-tracking',
        'campaign-management',
        'lead-generation',
        'social-media-integration'
      ]
    }

    return NextResponse.json(healthData)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'MARKETAI',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
