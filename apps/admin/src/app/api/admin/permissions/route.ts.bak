import { NextRequest, NextResponse } from 'next/server'
import { getCNDAdminService } from '../../../../services/cnd-admin'

export async function GET(request: NextRequest) {
    try {
        const adminService = getCNDAdminService()
        await adminService.initialize()

        const permissions = await adminService.getAllPermissions()

        return NextResponse.json({
            success: true,
            data: permissions
        })
    } catch (error) {
        console.error('Admin permissions API error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch permissions'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const adminService = getCNDAdminService()
        await adminService.initialize()

        const { userId, permission } = await request.json()

        if (!userId || !permission) {
            return NextResponse.json({
                success: false,
                error: 'User ID and permission are required'
            }, { status: 400 })
        }

        const hasPermission = await adminService.hasPermission(userId, permission)

        return NextResponse.json({
            success: true,
            data: {
                userId,
                permission,
                hasPermission
            }
        })
    } catch (error) {
        console.error('Permission check error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to check permission'
        }, { status: 500 })
    }
}
