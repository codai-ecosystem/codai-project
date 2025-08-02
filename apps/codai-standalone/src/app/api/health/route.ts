import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString()

  // Basic health checks
  const healthData = {
    status: 'healthy',
    service: 'codai-platform',
    version: '1.0.0',
    timestamp,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    dependencies: {
      next: '15.1.8',
      react: '19.1.0',
      node: process.version
    },
    features: {
      ai_agents: 'active',
      project_management: 'active',
      collaboration: 'active',
      analytics: 'active'
    }
  }

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  })
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
}
