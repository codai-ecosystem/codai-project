import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const cookieToken = request.cookies.get('codai_auth_token')?.value
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    const token = cookieToken || bearerToken

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided', isValid: false },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    if (!decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token format', isValid: false },
        { status: 401 }
      )
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        preferences: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', isValid: false },
        { status: 401 }
      )
    }

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferences: user.preferences
    }

    return NextResponse.json({
      isValid: true,
      user: userData
    })

  } catch (error: any) {
    console.error('Token validation error:', error)

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid token', isValid: false },
        { status: 401 }
      )
    }

    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Token expired', isValid: false },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', isValid: false },
      { status: 500 }
    )
  }
}
