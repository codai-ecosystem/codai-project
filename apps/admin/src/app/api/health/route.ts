import { NextResponse } from 'next/server'
import { getCNDAdminService } from '../../../services/cnd-admin'

export async function GET() {
  try {
    const adminService = getCNDAdminService()
    await adminService.initialize()

    const cndHealthStatus = await adminService.getHealthStatus()
    const adminMetrics = await adminService.getServiceMetrics()

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'codai-admin-service',
      port: process.env.PORT || '4002',
      version: '1.0.0',
      framework: 'Next.js 15',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      cnd: cndHealthStatus,
      admin: adminMetrics,
      features: {
        userManagement: true,
        roleBasedAccess: true,
        permissionSystem: true,
        auditLogging: true,
        systemMonitoring: true,
        enterpriseFeatures: true
      }
    }

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Admin service health check failed:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'codai-admin-service',
      error: error instanceof Error ? error.message : 'Unknown error',
      framework: 'Next.js 15',
      environment: process.env.NODE_ENV || 'development'
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
