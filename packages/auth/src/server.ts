import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

export interface AuthMiddlewareOptions {
  requiredRole?: string
  requiredPermissions?: string[]
  redirectUrl?: string
}

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
    name: string
  }
}

/**
 * Validate token from request
 */
export function validateTokenFromRequest(request: NextRequest): any | null {
  try {
    // Try to get token from cookies first, then Authorization header
    const cookieToken = request.cookies.get('codai_auth_token')?.value
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    const token = cookieToken || bearerToken

    if (!token) {
      return null
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

/**
 * Authentication middleware for API routes
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<any>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest, context?: any) => {
    const user = validateTokenFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check role requirement
    if (options.requiredRole && user.role !== options.requiredRole) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check permission requirements
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const userPermissions = user.permissions || []
      const hasAllPermissions = options.requiredPermissions.every(
        permission => userPermissions.includes(permission)
      )

      if (!hasAllPermissions) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name
    }

    return handler(authenticatedRequest, context)
  }
}

/**
 * Middleware for Next.js middleware.ts file
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  return (request: NextRequest) => {
    const user = validateTokenFromRequest(request)

    if (!user) {
      const redirectUrl = options.redirectUrl || `${process.env.NEXT_PUBLIC_AUTH_URL}/login`
      const loginUrl = new URL(redirectUrl)
      loginUrl.searchParams.set('redirect', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check role requirement
    if (options.requiredRole && user.role !== options.requiredRole) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Add user info to headers for pages/API routes
    const response = NextResponse.next()
    response.headers.set('X-User-ID', user.userId)
    response.headers.set('X-User-Email', user.email)
    response.headers.set('X-User-Role', user.role)
    response.headers.set('X-User-Name', user.name)

    return response
  }
}

/**
 * Get user from request headers (for pages/API routes after middleware)
 */
export function getUserFromHeaders(request: NextRequest): AuthenticatedRequest['user'] | null {
  const userId = request.headers.get('X-User-ID')
  const email = request.headers.get('X-User-Email')
  const role = request.headers.get('X-User-Role')
  const name = request.headers.get('X-User-Name')

  if (!userId || !email || !role || !name) {
    return null
  }

  return { userId, email, role, name }
}

/**
 * Server-side authentication utilities
 */
export const serverAuth = {
  validateToken: validateTokenFromRequest,
  withAuth,
  createMiddleware: createAuthMiddleware,
  getUserFromHeaders
}
