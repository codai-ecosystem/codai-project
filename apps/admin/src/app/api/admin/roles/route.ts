import { NextRequest, NextResponse } from 'next/server'
import { getCNDAdminService } from '../../../../services/cnd-admin'

export async function GET(request: NextRequest) {
    try {
        const adminService = getCNDAdminService()
        await adminService.initialize()

        const roles = await adminService.getAllRoles()

        return NextResponse.json({
            success: true,
            data: roles
        })
    } catch (error) {
        console.error('Admin roles API error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch roles'
        }, { status: 500 })
    }
}
