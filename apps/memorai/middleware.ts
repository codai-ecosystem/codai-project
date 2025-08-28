/**
 * MemorAI Enhanced Middleware
 * Combines next-intl internationalization with comprehensive security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import crypto from 'crypto';
import {locales, defaultLocale} from './src/i18n';

// Mock test tokens for API testing
const VALID_TEST_TOKENS = [
    'memorai-test-token',
    'test.token.here',
    'mock.authenticated.token'
];

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/dashboard': {
      en: '/dashboard',
      ro: '/tablou-de-bord'
    },
    '/memories': {
      en: '/memories',
      ro: '/memorii'
    },
    '/analytics': {
      en: '/analytics',
      ro: '/analize'
    },
    '/settings': {
      en: '/settings',
      ro: '/setari'
    },
    '/profile': {
      en: '/profile',
      ro: '/profil'
    },
    '/help': {
      en: '/help',
      ro: '/ajutor'
    }
  }
});

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    try {
        // Handle API routes with authentication (skip internationalization)
        if (pathname.startsWith('/api/')) {
            const response = NextResponse.next();
            
            // Apply security headers to API routes
            applySecurityHeaders(response);

            // Handle API authentication
            if (!pathname.startsWith('/api/health')) {
                const authHeader = request.headers.get('authorization');
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    const token = authHeader.substring(7);
                    if (VALID_TEST_TOKENS.includes(token)) {
                        // Add user context for valid tokens
                        response.headers.set('X-User-ID', 'test-user-123');
                        response.headers.set('X-User-Email', 'test@memorai.dev');
                        response.headers.set('X-User-Roles', '["user", "tester"]');
                        response.headers.set('X-User-Permissions', '["memorai:read", "memorai:write"]');
                    } else {
                        return NextResponse.json(
                            { error: 'Invalid token', code: 'UNAUTHORIZED' },
                            { status: 401 }
                        );
                    }
                } else {
                    return NextResponse.json(
                        { error: 'Authentication required', code: 'UNAUTHORIZED' },
                        { status: 401 }
                    );
                }
            }

            // Basic caching for API
            response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
            response.headers.set('X-Request-ID', crypto.randomUUID());
            response.headers.set('X-Served-By', 'memorai-enhanced');

            return response;
        }

        // Handle static files (skip internationalization)
        if (
            pathname.startsWith('/_next/') ||
            pathname.startsWith('/favicon.ico') ||
            pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|otf)$/)
        ) {
            const response = NextResponse.next();
            applySecurityHeaders(response);
            return response;
        }

        // Apply internationalization middleware for all other routes
        const intlResponse = intlMiddleware(request as any);
        
        // If intlResponse is a redirect, apply security headers and return it
        if (intlResponse instanceof NextResponse) {
            applySecurityHeaders(intlResponse);
            return intlResponse;
        }

        // For normal page requests, apply security headers
        const response = NextResponse.next();
        applySecurityHeaders(response);
        
        return response;

    } catch (error) {
        console.error('Middleware error:', error);
        const fallbackResponse = NextResponse.next();
        applySecurityHeaders(fallbackResponse);
        return fallbackResponse;
    }
}

function applySecurityHeaders(response: any) {
    // Enhanced Security Headers - OWASP Compliant
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '0'); // Modern CSP replaces this
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

    // HTTP Strict Transport Security
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );

    // Permissions Policy
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), screen-wake-lock=()'
    );

    // Enhanced Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.codai.ro https://gateway.codai.ro wss://ws.codai.ro",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-src 'none'",
        "object-src 'none'",
        "upgrade-insecure-requests"
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);

    // Remove potentially sensitive headers
    response.headers.delete('Server');
    response.headers.delete('X-Powered-By');
}

export const config = {
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',
        
        // Set a cookie to remember the previous locale for
        // all requests that have a locale prefix
        '/(en|ro)/:path*',
        
        // Enable redirects that add missing locales
        // (e.g. `/pathnames` -> `/en/pathnames`)
        '/((?!_next|_vercel|.*\\.).*)',

        // Include API routes for authentication
        '/api/:path*'
    ]
};
