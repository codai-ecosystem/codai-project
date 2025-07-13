/**
 * Next.js Global Middleware for Security
 *
 * This middleware runs on every request and applies security measures
 * including CSP headers, rate limiting, and request validation.
 */

import { NextRequest, NextResponse } from 'next/server';

import {
  applySecurityHeaders,
  getClientIP,
  checkRateLimit,
} from './src/lib/security/middleware';

// Routes that require special handling
const API_ROUTES = /^\/api\//;
const AUTH_ROUTES = /^\/api\/auth\//;
const STATIC_ROUTES = /^\/(_next\/static|\/favicon\.ico|\/images|\/icons)/;

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files
  if (STATIC_ROUTES.test(pathname)) {
    return NextResponse.next();
  }

  // Get client IP
  const clientIP = getClientIP(request);

  // Create response
  let response = NextResponse.next();

  // Apply rate limiting for API routes
  if (API_ROUTES.test(pathname)) {
    const rateLimitType = AUTH_ROUTES.test(pathname) ? 'login' : 'api';
    const isAllowed = checkRateLimit(clientIP, rateLimitType);

    if (!isAllowed) {
      response = NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: '60 seconds',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': rateLimitType === 'login' ? '5' : '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + 60000).toString(),
          },
        }
      );
    }
  }

  // Apply security headers to all responses
  response = applySecurityHeaders(response);

  // Add additional security headers
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Timestamp', new Date().toISOString());

  // CORS handling for API routes
  if (API_ROUTES.test(pathname)) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env['NEXT_PUBLIC_APP_URL'],
      'http://localhost:3000',
      'https://localhost:3000',
    ].filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-CSRF-Token, X-Requested-With'
      );
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
  }

  return response;
}

/**
 * Configure which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
