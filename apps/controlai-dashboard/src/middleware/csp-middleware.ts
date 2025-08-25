/**
 * @fileoverview Content Security Policy Middleware
 * @description Implements comprehensive CSP headers for controlai-dashboard
 */

import { NextRequest, NextResponse } from 'next/server';

export interface CSPDirectives {
    'default-src': string[];
    'script-src': string[];
    'style-src': string[];
    'img-src': string[];
    'font-src': string[];
    'connect-src': string[];
    'frame-src': string[];
    'object-src': string[];
    'media-src': string[];
    'worker-src': string[];
    'child-src': string[];
    'frame-ancestors': string[];
    'base-uri': string[];
    'form-action': string[];
}

const CSP_DIRECTIVES: CSPDirectives = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'unsafe-inline'", // Consider removing in production
        "'unsafe-eval'", // Required for development, remove in production
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        'https://cdnjs.cloudflare.com'
    ],
    'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
    ],
    'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'https://*.codai.dev'
    ],
    'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net'
    ],
    'connect-src': [
        "'self'",
        'https://api.codai.dev',
        'https://*.codai.dev',
        'wss://*.codai.dev',
        'ws://localhost:*',
        'http://localhost:*'
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'media-src': ["'self'", 'https:'],
    'worker-src': ["'self'", 'blob:'],
    'child-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
};

export function buildCSPHeader(directives: CSPDirectives = CSP_DIRECTIVES): string {
    return Object.entries(directives)
        .map(([directive, values]) => `${directive} ${values.join(' ')}`)
        .join('; ');
}

export function cspMiddleware(request: NextRequest) {
    const response = NextResponse.next();
    
    // Build CSP header
    const cspHeader = buildCSPHeader();
    
    // Set security headers
    const securityHeaders = {
        'Content-Security-Policy': cspHeader,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': [
            'geolocation=()',
            'microphone=()',
            'camera=()',
            'fullscreen=(self)',
            'payment=()'
        ].join(', '),
    };

    // Add HTTPS-only headers in production
    if (process.env.NODE_ENV === 'production') {
        securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
        securityHeaders['Cross-Origin-Embedder-Policy'] = 'require-corp';
        securityHeaders['Cross-Origin-Opener-Policy'] = 'same-origin';
        securityHeaders['Cross-Origin-Resource-Policy'] = 'same-origin';
    }

    // Apply headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export function createNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
}

export function addNonceToCSP(nonce: string): string {
    const directivesWithNonce = {
        ...CSP_DIRECTIVES,
        'script-src': [...CSP_DIRECTIVES['script-src'], `'nonce-${nonce}'`],
        'style-src': [...CSP_DIRECTIVES['style-src'], `'nonce-${nonce}'`]
    };
    
    return buildCSPHeader(directivesWithNonce);
}