import { NextRequest, NextResponse } from 'next/server'
import { getCNDAdminService } from '../../../../services/cnd-admin'

export async function GET(request: NextRequest) {
    try {
        const adminService = getCNDAdminService()
        await adminService.initialize()

        const statistics = await adminService.getSystemStatistics()
        const metrics = await adminService.getServiceMetrics()

        return NextResponse.json({
            success: true,
            data: {
                statistics,
                metrics,
                timestamp: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error('Admin statistics API error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch statistics'
        }, { status: 500 })
    }
}
