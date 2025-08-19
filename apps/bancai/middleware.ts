/**
 * BancAI Middleware - Secure Route Protection
 * Implements Next.js 15 middleware patterns for banking application security
 * Following Context7 authentication best practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, BANKING_SECURITY_HEADERS } from './src/lib/security/auth';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/api/banking',
  '/accounts',
  '/transactions',
  '/reports',
  '/admin'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/signup',
  '/',
  '/about',
  '/privacy',
  '/terms'
];

// Banking API routes that require special authorization
const bankingApiRoutes = [
  '/api/banking/accounts',
  '/api/banking/transactions',
  '/api/banking/reports',
  '/api/banking/analytics'
];

// Admin routes that require admin role
const adminRoutes = [
  '/admin',
  '/api/admin'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route));
  const isBankingApiRoute = bankingApiRoutes.some(route => path.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route));

  // Start with security headers
  const response = NextResponse.next();

  // Enhanced security headers for banking
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https: wss: ws:; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), fullscreen=(self), sync-xhr=()'
  );

  // Rate limiting check
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Handle API routes
  if (path.startsWith('/api/')) {
    return await handleApiRoute(request, response, path, isBankingApiRoute, isAdminRoute);
  }

  // Handle protected routes
  if (isProtectedRoute) {
    return await handleProtectedRoute(request, response, path, isAdminRoute);
  }

  // Handle public routes - redirect authenticated users from login/signup
  if (isPublicRoute && (path === '/login' || path === '/signup')) {
    const session = await getSessionFromRequest(request);
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', 'https://bancai.codai.ro');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Remove server information
  response.headers.delete('server');
  response.headers.delete('x-powered-by');

  return response;
}

/**
 * Handle API route authentication and authorization
 */
async function handleApiRoute(
  request: NextRequest,
  response: NextResponse,
  path: string,
  isBankingApiRoute: boolean,
  isAdminRoute: boolean
): Promise<NextResponse> {
  // Skip authentication for health checks and public API endpoints
  if (path.includes('/health') || path.includes('/status')) {
    return response;
  }

  const session = await getSessionFromRequest(request);

  // Check authentication for protected API routes
  if (isBankingApiRoute || isAdminRoute) {
    if (!session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...BANKING_SECURITY_HEADERS
          }
        }
      );
    }

    // Check admin authorization
    if (isAdminRoute && session.role !== 'admin') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Admin access required',
          code: 'INSUFFICIENT_PERMISSIONS'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...BANKING_SECURITY_HEADERS
          }
        }
      );
    }

    // Add session info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.userId);
    requestHeaders.set('x-user-role', session.role);
    requestHeaders.set('x-session-id', session.sessionId);

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  return response;
}

/**
 * Handle protected route authentication
 */
async function handleProtectedRoute(
  request: NextRequest,
  response: NextResponse,
  path: string,
  isAdminRoute: boolean
): Promise<NextResponse> {
  const session = await getSessionFromRequest(request);

  // Redirect to login if not authenticated
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access
  if (isAdminRoute && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Add session info to request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.userId);
  requestHeaders.set('x-user-role', session.role);
  requestHeaders.set('x-session-id', session.sessionId);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

/**
 * Extract session from request cookies
 */
async function getSessionFromRequest(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('bancai_session')?.value;

    if (!sessionToken) {
      return null;
    }

    return await verifySessionToken(sessionToken);
  } catch (error) {
    console.error('Session verification failed in middleware:', error);
    return null;
  }
}

/**
 * Rate limiting for API endpoints
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number = 15 * 60 * 1000; // 15 minutes
  private maxRequests: number = 100; // Max requests per window

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || [];

    // Filter out old requests
    const recentRequests = requests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return true;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return false;
  }
}

const rateLimiter = new RateLimiter();

/**
 * Apply rate limiting to request
 */
function applyRateLimit(request: NextRequest): NextResponse | null {
  const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  if (rateLimiter.isRateLimited(identifier)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '900', // 15 minutes
          ...BANKING_SECURITY_HEADERS
        }
      }
    );
  }

  return null;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
