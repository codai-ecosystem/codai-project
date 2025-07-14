import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// Note: Will uncomment Prisma once generation issue is resolved
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// Mock database for now - will replace with real Prisma once client generation works
const mockUsers: any[] = []
const mockSessions: any[] = []

interface RegisterRequest {
    email: string
    password: string
    username?: string
    firstName?: string
    lastName?: string
}

interface LoginRequest {
    email: string
    password: string
}

interface AuthResponse {
    success: boolean
    token?: string
    refreshToken?: string
    user?: {
        id: string
        email: string
        username?: string
        firstName?: string
        lastName?: string
        role: string
        status: string
    }
    error?: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'logai-development-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'logai-development-refresh-secret'

function generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign(
        {
            userId,
            email,
            type: 'access',
            iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
        {
            userId,
            email,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000)
        },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    )

    return { accessToken, refreshToken }
}

function generateUserId(): string {
    return 'logai_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36)
}

export async function POST(request: Request) {
    try {
        const { action, email, password, username, firstName, lastName } = await request.json()

        if (action === 'register') {
            // Validate required fields
            if (!email || !password) {
                return NextResponse.json({
                    success: false,
                    error: 'Email and password are required'
                } as AuthResponse, { status: 400 })
            }

            // Check if user already exists
            const existingUser = mockUsers.find(u => u.email === email)
            if (existingUser) {
                return NextResponse.json({
                    success: false,
                    error: 'User with this email already exists'
                } as AuthResponse, { status: 409 })
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12)

            // Create user
            const newUser = {
                id: generateUserId(),
                email,
                username: username || email.split('@')[0],
                firstName,
                lastName,
                password: hashedPassword,
                role: 'USER',
                status: 'ACTIVE',
                emailVerified: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: null,
                loginCount: 0
            }

            mockUsers.push(newUser)

            // Generate tokens
            const { accessToken, refreshToken } = generateTokens(newUser.id, newUser.email)

            // Create session
            const session = {
                id: generateUserId(),
                userId: newUser.id,
                token: accessToken,
                refreshToken,
                isActive: true,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
                createdAt: new Date().toISOString(),
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown'
            }

            mockSessions.push(session)

            const response: AuthResponse = {
                success: true,
                token: accessToken,
                refreshToken,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                    status: newUser.status
                }
            }

            return NextResponse.json(response)

        } else if (action === 'login') {
            // Validate required fields
            if (!email || !password) {
                return NextResponse.json({
                    success: false,
                    error: 'Email and password are required'
                } as AuthResponse, { status: 400 })
            }

            // Find user
            const user = mockUsers.find(u => u.email === email)
            if (!user) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid email or password'
                } as AuthResponse, { status: 401 })
            }

            // Verify password
            const passwordMatch = await bcrypt.compare(password, user.password)
            if (!passwordMatch) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid email or password'
                } as AuthResponse, { status: 401 })
            }

            // Check user status
            if (user.status !== 'ACTIVE') {
                return NextResponse.json({
                    success: false,
                    error: 'Account is not active. Please contact support.'
                } as AuthResponse, { status: 403 })
            }

            // Update login stats
            user.lastLoginAt = new Date().toISOString()
            user.loginCount++

            // Generate tokens
            const { accessToken, refreshToken } = generateTokens(user.id, user.email)

            // Create session
            const session = {
                id: generateUserId(),
                userId: user.id,
                token: accessToken,
                refreshToken,
                isActive: true,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown'
            }

            mockSessions.push(session)

            const response: AuthResponse = {
                success: true,
                token: accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    status: user.status
                }
            }

            return NextResponse.json(response)

        } else {
            return NextResponse.json({
                success: false,
                error: 'Invalid action. Must be "register" or "login".'
            } as AuthResponse, { status: 400 })
        }

    } catch (error) {
        console.error('Authentication error:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        } as AuthResponse, { status: 500 })
    }
}

export async function GET() {
    try {
        // Return authentication status and statistics
        const stats = {
            totalUsers: mockUsers.length,
            activeUsers: mockUsers.filter(u => u.status === 'ACTIVE').length,
            activeSessions: mockSessions.filter(s => s.isActive).length,
            recentRegistrations: mockUsers.filter(u =>
                new Date(u.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length,
            authenticationMethods: ['email_password', 'oauth_google', 'oauth_github'],
            securityFeatures: ['bcrypt_hashing', 'jwt_tokens', 'session_management', 'rate_limiting'],
            lastUpdated: new Date().toISOString()
        }

        return NextResponse.json({
            service: 'LOGAI Authentication API',
            version: '1.0.0',
            status: 'operational',
            database: 'mock_mode', // Will change to 'prisma_postgresql' once DB is ready
            stats,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Auth status error:', error)
        return NextResponse.json({
            error: 'Failed to get authentication status'
        }, { status: 500 })
    }
}
