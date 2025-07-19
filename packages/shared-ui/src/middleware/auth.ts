import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/profile',
  '/analytics',
  '/admin'
]

// Define public routes that should redirect to dashboard if authenticated
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password'
]

// Routes that are always accessible
const openRoutes = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/logo.png',
  '/images'
]

export function createAuthMiddleware(config?: {
  loginUrl?: string
  dashboardUrl?: string
  publicRoutes?: string[]
  protectedRoutes?: string[]
}) {
  const loginUrl = config?.loginUrl || '/auth/login'
  const dashboardUrl = config?.dashboardUrl || '/dashboard'
  const customPublicRoutes = config?.publicRoutes || publicRoutes
  const customProtectedRoutes = config?.protectedRoutes || protectedRoutes

  return function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for open routes
    if (openRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Get authentication token from cookies
    const authToken = request.cookies.get('auth-token')?.value
    const isAuthenticated = !!authToken && isValidToken(authToken)

    // Handle protected routes
    if (customProtectedRoutes.some(route => pathname.startsWith(route))) {
      if (!isAuthenticated) {
        // Redirect to login with return URL
        const loginUrlWithReturn = new URL(loginUrl, request.url)
        loginUrlWithReturn.searchParams.set('returnUrl', pathname)
        return NextResponse.redirect(loginUrlWithReturn)
      }
    }

    // Handle public auth routes (redirect authenticated users to dashboard)
    if (customPublicRoutes.some(route => pathname.startsWith(route))) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
    }

    // Handle root route based on authentication status
    if (pathname === '/') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
      // If not authenticated, show landing page (no redirect needed)
    }

    return NextResponse.next()
  }
}

// Simple token validation (you should implement proper JWT validation)
function isValidToken(token: string): boolean {
  try {
    // Basic JWT structure check
    const parts = token.split('.')
    if (parts.length !== 3) return false

    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]))
    const currentTime = Math.floor(Date.now() / 1000)

    return payload.exp > currentTime
  } catch {
    return false
  }
}

// Export default middleware for CODAI ecosystem
export default createAuthMiddleware({
  loginUrl: '/auth/login',
  dashboardUrl: '/dashboard',
  publicRoutes: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password'
  ],
  protectedRoutes: [
    '/dashboard',
    '/settings',
    '/profile',
    '/analytics',
    '/admin',
    '/api/protected'
  ]
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|logo.png).*)',
  ],
}
