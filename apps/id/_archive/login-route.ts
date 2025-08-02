import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createAuthContext,
  handleEnhancedLogin,
  setAuthCookies,
  addSecurityHeaders
} from '@/lib/auth-middleware'

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

    // Create enhanced authentication context
    const authContext = await createAuthContext(request)

    // Perform enhanced authentication
    const authResult = await handleEnhancedLogin(email, password, authContext)

    if (!authResult.success) {
      const response = NextResponse.json(
        {
          success: false,
          error: authResult.error,
          remainingAttempts: authResult.remainingAttempts
        },
        { status: 401 }
      )

      // Add security headers
      addSecurityHeaders(response, authResult.securityMetadata)
      return response
    }

    // Create successful response with enhanced security data
    const responseData: any = {
      success: true,
      user: authResult.user,
      token: authResult.token,
      refreshToken: authResult.refreshToken
    }

    // Add MFA flag if required (for future MFA implementation)
    if (authResult.mfaRequired) {
      responseData.mfaRequired = true
    }

    const response = NextResponse.json(responseData)

    // Set secure authentication cookies
    if (authResult.token) {
      setAuthCookies(response, authResult.token, authResult.refreshToken)
    }

    // Add security headers
    addSecurityHeaders(response, authResult.securityMetadata)

    return response

  } catch (error: any) {
    console.error('Enhanced login error:', error)

    if (error.name === 'ZodError') {
      const response = NextResponse.json(
        {
          success: false,
          error: error.errors[0].message
        },
        { status: 400 }
      )
      addSecurityHeaders(response)
      return response
    }

    const response = NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
    addSecurityHeaders(response)
    return response
  }
}
