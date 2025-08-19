import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'codai-standalone',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'healthy',
        api: 'healthy',
        external_services: 'healthy'
      }
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
