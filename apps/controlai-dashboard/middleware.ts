import { NextRequest, NextResponse } from 'next/server';
import { cspMiddleware } from './src/middleware/csp-middleware';

export function middleware(request: NextRequest) {
    // Apply security middleware
    const response = cspMiddleware(request);
    
    // Add additional security measures
    const pathname = request.nextUrl.pathname;
    
    // Protect admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        const token = request.headers.get('authorization');
        if (!token || !isValidAdminToken(token)) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }
    
    // Rate limiting check
    if (pathname.startsWith('/api/')) {
        const rateLimitResult = checkRateLimit(request);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429 }
            );
        }
    }
    
    return response;
}

function isValidAdminToken(token: string): boolean {
    // Implement your token validation logic
    return token.startsWith('Bearer ') && token.length > 50;
}

function checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number } {
    // Implement rate limiting logic
    // This is a simplified version - use Redis or memory store in production
    return { allowed: true, remaining: 100 };
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};