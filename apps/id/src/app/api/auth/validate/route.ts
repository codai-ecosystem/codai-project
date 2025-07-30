import { NextRequest, NextResponse } from 'next/server'
import { SimpleAuthService } from '@/services/simple-auth'

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

    // Initialize auth service
    const authService = new SimpleAuthService()
    await authService.ensureInitialized()

    // Validate token
    const validationResult = await authService.validateToken(token)

    if (!validationResult.success || !validationResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token', isValid: false },
        { status: 401 }
      )
    }

    // Return user data (without password)
    const userData = {
      id: validationResult.user.id,
      name: validationResult.user.profile?.name || validationResult.user.username,
      email: validationResult.user.email,
      username: validationResult.user.username,
      profile: validationResult.user.profile
    }

    return NextResponse.json({
      isValid: true,
      user: userData
    })

  } catch (error: any) {
    console.error('Token validation error:', error)

    return NextResponse.json(
      { error: 'Internal server error', isValid: false },
      { status: 500 }
    )
  }
}
