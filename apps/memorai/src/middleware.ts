import { auth } from '@/lib/auth';
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

    // Get the session
    const session = await auth();

    // If no session and not a public route, redirect to signin
    if (!session) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Check role-based access for specific routes
    const token = session as any;

    // Admin routes - require admin role
    if (pathname.startsWith('/admin')) {
        if (!token?.roles?.includes('admin')) {
            return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
        }
    }

    // MemorAI specific routes - require MemorAI access
    if (pathname.startsWith('/memorai') || pathname.startsWith('/memories')) {
        if (!token?.permissions?.includes('memorai:read')) {
            return NextResponse.redirect(new URL('/upgrade', request.url));
        }
    }

    // Write operations - require write permissions
    if (pathname.startsWith('/api/memories') && request.method !== 'GET') {
        if (!token?.permissions?.includes('memorai:write')) {
            return NextResponse.redirect(new URL('/upgrade', request.url));
        }
    }

    // Dashboard access - already authenticated, allow
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
