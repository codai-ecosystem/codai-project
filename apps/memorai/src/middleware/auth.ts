/**
 * 🔐 Authentication Middleware for MemorAI Production
 * 
 * Implements secure API key authentication to protect sensitive endpoints
 * from unauthorized access during production deployment.
 */

import { NextRequest, NextResponse } from 'next/server';

// Production API keys - In real production, these would be in encrypted environment variables
const VALID_API_KEYS = new Set([
    'memorai-prod-key-2025-secure',
    'memorai-admin-key-2025-secure',
    'memorai-test-key-2025-secure'
]);

export interface AuthResult {
    success: boolean;
    userId?: string;
    error?: string;
}

/**
 * Validates API key from request headers
 */
export function validateAPIKey(apiKey: string): AuthResult {
    if (!apiKey) {
        return { success: false, error: 'API key is required' };
    }

    // Remove 'Bearer ' prefix if present
    const cleanApiKey = apiKey.replace(/^Bearer\s+/i, '').trim();

    if (!VALID_API_KEYS.has(cleanApiKey)) {
        return { success: false, error: 'Invalid API key' };
    }

    // In production, derive userId from API key
    // For now, return mock user ID
    return {
        success: true,
        userId: 'authenticated-user-' + cleanApiKey.slice(-8)
    };
}

/**
 * Authentication middleware for API routes
 * Checks for valid API key in headers
 */
export function authenticateAPI(request: NextRequest): NextResponse | null {
    const apiKey = request.headers.get('x-api-key') ||
        request.headers.get('authorization');

    if (!apiKey) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'API key required. Please provide a valid API key in the x-api-key header.',
                documentation: 'https://docs.memorai.com/authentication'
            }
        }, { status: 401 });
    }

    const authResult = validateAPIKey(apiKey);

    if (!authResult.success) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: authResult.error || 'Invalid API key',
                documentation: 'https://docs.memorai.com/authentication'
            }
        }, { status: 403 });
    }

    // Authentication successful - add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-authenticated-user', authResult.userId!);
    return null; // Allow request to continue
}

/**
 * Extract authenticated user ID from request
 * Should be called after authentication middleware
 */
export function getAuthenticatedUserId(request: NextRequest): string {
    const userId = request.headers.get('x-authenticated-user');
    return userId || 'anonymous-user';
}

/**
 * Check if request has admin privileges
 */
export function hasAdminAccess(request: NextRequest): boolean {
    const apiKey = request.headers.get('x-api-key') ||
        request.headers.get('authorization');

    if (!apiKey) return false;

    const cleanApiKey = apiKey.replace(/^Bearer\s+/i, '').trim();
    return cleanApiKey === 'memorai-admin-key-2025-secure';
}

/**
 * Admin-only authentication middleware
 */
export function authenticateAdmin(request: NextRequest): NextResponse | null {
    const authResponse = authenticateAPI(request);
    if (authResponse) return authResponse; // Failed basic auth

    if (!hasAdminAccess(request)) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'INSUFFICIENT_PRIVILEGES',
                message: 'Admin access required for this operation',
            }
        }, { status: 403 });
    }

    return null; // Allow request to continue
}

/**
 * Security headers for all API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}
