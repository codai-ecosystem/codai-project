import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'logai-development-secret-key'

// Mock data - will replace with real database later
const mockUsers: any[] = []

function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET) as any
    } catch (error) {
        return null
    }
}

interface UserProfile {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    phone?: string
    company?: string
    department?: string
    jobTitle?: string
    bio?: string
    avatar?: string
    role: string
    status: string
    emailVerified: boolean
    phoneVerified: boolean
    twoFactorEnabled: boolean
    lastLoginAt?: string
    loginCount: number
    createdAt: string
    updatedAt: string
}

interface UpdateProfileRequest {
    username?: string
    firstName?: string
    lastName?: string
    phone?: string
    company?: string
    department?: string
    jobTitle?: string
    bio?: string
    avatar?: string
}

interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                error: 'Authorization header required'
            }, { status: 401 })
        }

        const token = authHeader.substring(7)
        const decoded = verifyToken(token)

        if (!decoded) {
            return NextResponse.json({
                error: 'Invalid token'
            }, { status: 401 })
        }

        // Find user
        const user = mockUsers.find(u => u.id === decoded.userId)
        if (!user) {
            return NextResponse.json({
                error: 'User not found'
            }, { status: 404 })
        }

        // Return user profile (exclude password)
        const profile: UserProfile = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            company: user.company,
            department: user.department,
            jobTitle: user.jobTitle,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified || false,
            twoFactorEnabled: user.twoFactorEnabled || false,
            lastLoginAt: user.lastLoginAt,
            loginCount: user.loginCount,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }

        return NextResponse.json({
            profile,
            permissions: ['read:profile', 'write:profile', 'read:sessions'], // Mock permissions
            preferences: {
                theme: 'dark',
                language: 'en',
                timezone: 'UTC',
                notifications: {
                    email: true,
                    push: false,
                    sms: false
                }
            },
            securityInfo: {
                lastPasswordChange: user.passwordChangedAt || user.createdAt,
                loginAttempts: user.failedLoginAttempts || 0,
                lastFailedLogin: user.lastFailedLoginAt,
                activeSessionsCount: 1 // Mock count
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Get profile error:', error)
        return NextResponse.json({
            error: 'Failed to get user profile'
        }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                error: 'Authorization header required'
            }, { status: 401 })
        }

        const token = authHeader.substring(7)
        const decoded = verifyToken(token)

        if (!decoded) {
            return NextResponse.json({
                error: 'Invalid token'
            }, { status: 401 })
        }

        const updateData: UpdateProfileRequest = await request.json()

        // Find user
        const user = mockUsers.find(u => u.id === decoded.userId)
        if (!user) {
            return NextResponse.json({
                error: 'User not found'
            }, { status: 404 })
        }

        // Check if username is taken (if being updated)
        if (updateData.username && updateData.username !== user.username) {
            const existingUser = mockUsers.find(u => u.username === updateData.username && u.id !== user.id)
            if (existingUser) {
                return NextResponse.json({
                    error: 'Username already taken'
                }, { status: 409 })
            }
        }

        // Update user fields
        if (updateData.username) user.username = updateData.username
        if (updateData.firstName !== undefined) user.firstName = updateData.firstName
        if (updateData.lastName !== undefined) user.lastName = updateData.lastName
        if (updateData.phone !== undefined) user.phone = updateData.phone
        if (updateData.company !== undefined) user.company = updateData.company
        if (updateData.department !== undefined) user.department = updateData.department
        if (updateData.jobTitle !== undefined) user.jobTitle = updateData.jobTitle
        if (updateData.bio !== undefined) user.bio = updateData.bio
        if (updateData.avatar !== undefined) user.avatar = updateData.avatar

        user.updatedAt = new Date().toISOString()

        // Return updated profile
        const profile: UserProfile = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            company: user.company,
            department: user.department,
            jobTitle: user.jobTitle,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified || false,
            twoFactorEnabled: user.twoFactorEnabled || false,
            lastLoginAt: user.lastLoginAt,
            loginCount: user.loginCount,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            profile,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Update profile error:', error)
        return NextResponse.json({
            error: 'Failed to update profile'
        }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                error: 'Authorization header required'
            }, { status: 401 })
        }

        const token = authHeader.substring(7)
        const decoded = verifyToken(token)

        if (!decoded) {
            return NextResponse.json({
                error: 'Invalid token'
            }, { status: 401 })
        }

        const { currentPassword, newPassword }: ChangePasswordRequest = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json({
                error: 'Current password and new password are required'
            }, { status: 400 })
        }

        // Find user
        const user = mockUsers.find(u => u.id === decoded.userId)
        if (!user) {
            return NextResponse.json({
                error: 'User not found'
            }, { status: 404 })
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, user.password)
        if (!passwordMatch) {
            return NextResponse.json({
                error: 'Current password is incorrect'
            }, { status: 401 })
        }

        // Validate new password
        if (newPassword.length < 8) {
            return NextResponse.json({
                error: 'New password must be at least 8 characters long'
            }, { status: 400 })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        // Update password
        user.password = hashedPassword
        user.passwordChangedAt = new Date().toISOString()
        user.updatedAt = new Date().toISOString()

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Change password error:', error)
        return NextResponse.json({
            error: 'Failed to change password'
        }, { status: 500 })
    }
}
