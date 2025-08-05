import { NextRequest, NextResponse } from 'next/server'
import { getCNDAdminService } from '../../../../services/cnd-admin'

export async function GET(request: NextRequest) {
    try {
        const adminService = getCNDAdminService()
        await adminService.initialize()

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '100')

        const auditLogs = await adminService.getAuditLogs(limit)

        return NextResponse.json({
            success: true,
            data: auditLogs,
            meta: {
                total: auditLogs.length,
                limit
            }
        })
    } catch (error) {
        console.error('Admin audit logs API error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch audit logs'
        }, { status: 500 })
    }
}
