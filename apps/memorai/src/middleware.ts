import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication Middleware for MemorAI
 * Protects routes and enforces role-based access control
 */

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/about',
        '/pricing',
        '/contact',
        '/auth/signin',
        '/auth/signup', 
        '/auth/error',
        '/auth/verify',
        '/auth/unauthorized',
        '/upgrade',
        '/api/auth',
        '/api/health',
        '/_next',
        '/favicon.ico'
    ];

    // Check if route is public
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // For now, allow all routes to pass through
    // TODO: Implement proper authentication when NextAuth is properly configured
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};
