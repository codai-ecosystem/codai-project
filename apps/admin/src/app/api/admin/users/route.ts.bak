import { NextRequest, NextResponse } from 'next/server'
import { getCNDAdminService } from '../../../../services/cnd-admin'

export async function GET(request: NextRequest) {
    try {
        const adminService = getCNDAdminService()
        await adminService.initialize()

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '100')
        const userId = searchParams.get('userId')

        if (userId) {
            // Get specific user
            const user = await adminService.getAdminUser(userId)
            if (!user) {
                return NextResponse.json({
                    success: false,
                    error: 'User not found'
                }, { status: 404 })
            }

            return NextResponse.json({
                success: true,
                data: user
            })
        } else {
            // Get all users
            const users = await adminService.getAllAdminUsers(limit)

            return NextResponse.json({
                success: true,
                data: users,
                meta: {
                    total: users.length,
                    limit
                }
            })
        }
    } catch (error) {
        console.error('Admin users API error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch users'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const adminService = getCNDAdminService()
        await adminService.initialize()

        const userData = await request.json()

        // Validate required fields
        if (!userData.username || !userData.email || !userData.name || !userData.role) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: username, email, name, role'
            }, { status: 400 })
        }

        const newUser = await adminService.createAdminUser({
            username: userData.username,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            permissions: userData.permissions || [],
            department: userData.department,
            status: userData.status || 'active',
            preferences: userData.preferences || {},
            metadata: userData.metadata || {}
        })

        return NextResponse.json({
            success: true,
            data: newUser,
            message: 'User created successfully'
        }, { status: 201 })
    } catch (error) {
        console.error('Admin user creation error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create user'
        }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const adminService = getCNDAdminService()
        await adminService.initialize()

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'User ID is required'
            }, { status: 400 })
        }

        const updates = await request.json()

        const updatedUser = await adminService.updateAdminUser(userId, updates)

        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                error: 'User not found'
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        })
    } catch (error) {
        console.error('Admin user update error:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update user'
        }, { status: 500 })
    }
}
