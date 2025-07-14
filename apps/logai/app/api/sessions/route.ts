import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'logai-development-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'logai-development-refresh-secret'

// Mock data - will replace with real database later
const mockSessions: any[] = []
const mockUsers: any[] = []

interface SessionInfo {
    id: string
    userId: string
    isActive: boolean
    createdAt: string
    expiresAt: string
    ipAddress: string
    userAgent: string
    location?: string
    deviceInfo?: any
}

function verifyToken(token: string, secret: string) {
    try {
        return jwt.verify(token, secret) as any
    } catch (error) {
        return null
    }
}

function generateAccessToken(userId: string, email: string) {
    return jwt.sign(
        {
            userId,
            email,
            type: 'access',
            iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { expiresIn: '15m' }
    )
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
        const decoded = verifyToken(token, JWT_SECRET)

        if (!decoded) {
            return NextResponse.json({
                error: 'Invalid token'
            }, { status: 401 })
        }

        // Get user sessions
        const userSessions = mockSessions.filter(s => s.userId === decoded.userId)

        const sessionInfo: SessionInfo[] = userSessions.map(session => ({
            id: session.id,
            userId: session.userId,
            isActive: session.isActive,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            location: session.location,
            deviceInfo: session.deviceInfo
        }))

        return NextResponse.json({
            currentSession: {
                userId: decoded.userId,
                email: decoded.email,
                tokenType: decoded.type,
                issuedAt: new Date(decoded.iat * 1000).toISOString(),
                expiresAt: new Date(decoded.exp * 1000).toISOString()
            },
            allSessions: sessionInfo,
            sessionCount: sessionInfo.length,
            activeSessions: sessionInfo.filter(s => s.isActive).length,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Session info error:', error)
        return NextResponse.json({
            error: 'Failed to get session information'
        }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { action, refreshToken, sessionId } = await request.json()

        if (action === 'refresh') {
            if (!refreshToken) {
                return NextResponse.json({
                    error: 'Refresh token required'
                }, { status: 400 })
            }

            const decoded = verifyToken(refreshToken, JWT_REFRESH_SECRET)
            if (!decoded || decoded.type !== 'refresh') {
                return NextResponse.json({
                    error: 'Invalid refresh token'
                }, { status: 401 })
            }

            // Find the session
            const session = mockSessions.find(s => s.refreshToken === refreshToken && s.isActive)
            if (!session) {
                return NextResponse.json({
                    error: 'Session not found or expired'
                }, { status: 401 })
            }

            // Generate new access token
            const newAccessToken = generateAccessToken(decoded.userId, decoded.email)

            // Update session
            session.token = newAccessToken
            session.expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

            return NextResponse.json({
                success: true,
                token: newAccessToken,
                expiresAt: session.expiresAt,
                refreshToken: refreshToken // Keep same refresh token
            })

        } else if (action === 'revoke') {
            const authHeader = request.headers.get('authorization')

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return NextResponse.json({
                    error: 'Authorization header required'
                }, { status: 401 })
            }

            const token = authHeader.substring(7)
            const decoded = verifyToken(token, JWT_SECRET)

            if (!decoded) {
                return NextResponse.json({
                    error: 'Invalid token'
                }, { status: 401 })
            }

            if (sessionId) {
                // Revoke specific session
                const session = mockSessions.find(s => s.id === sessionId && s.userId === decoded.userId)
                if (session) {
                    session.isActive = false
                    session.revokedAt = new Date().toISOString()
                }
            } else {
                // Revoke all sessions for user
                mockSessions
                    .filter(s => s.userId === decoded.userId)
                    .forEach(s => {
                        s.isActive = false
                        s.revokedAt = new Date().toISOString()
                    })
            }

            return NextResponse.json({
                success: true,
                message: sessionId ? 'Session revoked' : 'All sessions revoked',
                timestamp: new Date().toISOString()
            })

        } else {
            return NextResponse.json({
                error: 'Invalid action. Must be "refresh" or "revoke".'
            }, { status: 400 })
        }

    } catch (error) {
        console.error('Session management error:', error)
        return NextResponse.json({
            error: 'Failed to manage session'
        }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                error: 'Authorization header required'
            }, { status: 401 })
        }

        const token = authHeader.substring(7)
        const decoded = verifyToken(token, JWT_SECRET)

        if (!decoded) {
            return NextResponse.json({
                error: 'Invalid token'
            }, { status: 401 })
        }

        // Logout current session
        const currentSession = mockSessions.find(s => s.token === token)
        if (currentSession) {
            currentSession.isActive = false
            currentSession.revokedAt = new Date().toISOString()
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully logged out',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json({
            error: 'Failed to logout'
        }, { status: 500 })
    }
}
