import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Always allow test endpoints for development
    if (pathname.startsWith("/api/test/")) {
        return NextResponse.next();
    }

    // Simple middleware for protected routes
    const isProtectedRoute = pathname.startsWith("/dashboard") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/profile");

    if (isProtectedRoute) {
        // Check for auth token in cookies or headers
        const token = request.cookies.get('next-auth.session-token') ||
            request.headers.get('authorization');

        if (!token) {
            // Allow for demo purposes, just log access
            console.log('Protected route accessed without auth:', pathname);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/settings/:path*",
        "/profile/:path*",
        "/api/:path*"
    ]
};
