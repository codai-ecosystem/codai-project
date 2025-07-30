import { NextRequest, NextResponse } from 'next/server'
import { SimpleAuthService } from '@/services/simple-auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

    // Initialize auth service
    const authService = new SimpleAuthService()
    await authService.ensureInitialized()

    // Authenticate user
    const authResult = await authService.authenticateUser(email, password)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

    // Generate tokens
    const tokenResult = await authService.generateToken(authResult.user.id)
    if (!tokenResult.success || !tokenResult.token) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to generate authentication token' 
        },
        { status: 500 }
      )
    }

    // Create session
    const sessionResult = await authService.createSession(authResult.user.id, {
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ipAddress: request.ip || 'Unknown'
    })

    // Prepare user data (without password)
    const userData = {
      id: authResult.user.id,
      email: authResult.user.email,
      username: authResult.user.username,
      profile: authResult.user.profile,
      createdAt: authResult.user.createdAt,
      updatedAt: authResult.user.updatedAt
    }

    // Set cookies
    const response = NextResponse.json({
      success: true,
      user: userData,
      token: tokenResult.token,
      refreshToken: tokenResult.refreshToken || null
    })

    response.cookies.set('codai_auth_token', tokenResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900, // 15 minutes
      domain: process.env.NODE_ENV === 'production' ? '.codai.ro' : undefined
    })

    if (tokenResult.refreshToken) {
      response.cookies.set('codai_refresh_token', tokenResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800, // 7 days
        domain: process.env.NODE_ENV === 'production' ? '.codai.ro' : undefined
      })
    }

    return response

  } catch (error: any) {
    console.error('Login error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false,
          error: error.errors[0].message 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
