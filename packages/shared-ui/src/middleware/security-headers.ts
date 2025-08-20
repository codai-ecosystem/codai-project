/**
 * Security Headers Middleware
 * Implements comprehensive security headers for all Next.js applications
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export interface SecurityHeadersConfig {
    contentSecurityPolicy?: string;
    frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    contentTypeOptions?: boolean;
    xssProtection?: boolean;
    strictTransportSecurity?: string;
    referrerPolicy?: string;
    permissionsPolicy?: string;
    hideXPoweredBy?: boolean;
}

const DEFAULT_SECURITY_CONFIG: Required<SecurityHeadersConfig> = {
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://localhost:* ws://localhost:*; frame-ancestors 'none';",
    frameOptions: 'DENY',
    contentTypeOptions: true,
    xssProtection: true,
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'geolocation=(), microphone=(), camera=(), fullscreen=(self)',
    hideXPoweredBy: true
};

export function createSecurityHeaders(config: SecurityHeadersConfig = {}): HeadersInit {
    const finalConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };

    const headers: HeadersInit = {};

    if (finalConfig.contentSecurityPolicy) {
        headers['Content-Security-Policy'] = finalConfig.contentSecurityPolicy;
    }

    if (finalConfig.frameOptions) {
        headers['X-Frame-Options'] = finalConfig.frameOptions;
    }

    if (finalConfig.contentTypeOptions) {
        headers['X-Content-Type-Options'] = 'nosniff';
    }

    if (finalConfig.xssProtection) {
        headers['X-XSS-Protection'] = '1; mode=block';
    }

    if (finalConfig.strictTransportSecurity) {
        headers['Strict-Transport-Security'] = finalConfig.strictTransportSecurity;
    }

    if (finalConfig.referrerPolicy) {
        headers['Referrer-Policy'] = finalConfig.referrerPolicy;
    }

    if (finalConfig.permissionsPolicy) {
        headers['Permissions-Policy'] = finalConfig.permissionsPolicy;
    }

    return headers;
}

export function applySecurityHeaders(
    response: NextResponse,
    config: SecurityHeadersConfig = {}
): NextResponse {
    const headers = createSecurityHeaders(config);

    Object.entries(headers).forEach(([key, value]) => {
        if (value) {
            response.headers.set(key, value);
        }
    });

    // Remove X-Powered-By header for security
    if (config.hideXPoweredBy !== false) {
        response.headers.delete('X-Powered-By');
    }

    return response;
}

export function securityMiddleware(
    request: NextRequest,
    config: SecurityHeadersConfig = {}
) {
    const response = NextResponse.next();
    return applySecurityHeaders(response, config);
}
