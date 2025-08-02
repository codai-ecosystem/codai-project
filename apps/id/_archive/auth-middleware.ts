/**
 * Enhanced Authentication Middleware for Next.js API Routes
 * Provides centralized authentication logic with enterprise security features
 */

import { NextRequest } from 'next/server';
import { EnhancedAuthService } from '@/services/enhanced-auth';

export interface AuthContext {
    ip: string;
    userAgent: string;
    authService: EnhancedAuthService;
}

export interface SecurityResponse {
    success: boolean;
    user?: any;
    token?: string;
    refreshToken?: string;
    mfaRequired?: boolean;
    remainingAttempts?: number;
    riskScore?: number;
    securityAlerts?: string[];
    error?: string;
    securityMetadata?: {
        ipAddress: string;
        suspiciousActivity: boolean;
        rateLimit: {
            attempts: number;
            remaining: number;
            resetTime: Date;
        };
    };
}

/**
 * Extract client IP address from Next.js request with proxy support
 */
export function extractClientIP(request: NextRequest): string {
    // Check for IP from load balancer or proxy
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        // Take the first IP if multiple are present
        return forwarded.split(',')[0].trim();
    }

    // Check for real IP header
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback to request IP or unknown
    return request.ip || 'unknown';
}

/**
 * Extract user agent from request headers
 */
export function extractUserAgent(request: NextRequest): string {
    return request.headers.get('user-agent') || 'Unknown';
}

/**
 * Create authentication context for API routes
 */
export async function createAuthContext(request: NextRequest): Promise<AuthContext> {
    const ip = extractClientIP(request);
    const userAgent = extractUserAgent(request);

    // Initialize enhanced authentication service
    const authService = new EnhancedAuthService();
    await authService.ensureInitialized();

    return {
        ip,
        userAgent,
        authService
    };
}

/**
 * Enhanced login handler with security features
 */
export async function handleEnhancedLogin(
    email: string,
    password: string,
    context: AuthContext
): Promise<SecurityResponse> {
    try {
        const { authService, ip, userAgent } = context;

        // Authenticate user with enhanced security
        const authResult = await authService.authenticateUser(
            { email, password },
            { ip: ip, userAgent }
        );

        if (!authResult.success || !authResult.user) {
            return {
                success: false,
                error: authResult.error || 'Invalid email or password',
                remainingAttempts: authResult.remainingAttempts,
                securityMetadata: {
                    ipAddress: ip,
                    suspiciousActivity: authResult.suspiciousActivity || false,
                    rateLimit: {
                        attempts: authResult.attempts || 0,
                        remaining: authResult.remainingAttempts || 0,
                        resetTime: authResult.resetTime || new Date()
                    }
                }
            };
        }

        // Generate tokens
        const tokenResult = await authService.generateToken(authResult.user.id);
        if (!tokenResult.success || !tokenResult.token) {
            return {
                success: false,
                error: 'Failed to generate authentication token',
                securityMetadata: {
                    ipAddress: ip,
                    suspiciousActivity: false,
                    rateLimit: {
                        attempts: 0,
                        remaining: 5,
                        resetTime: new Date()
                    }
                }
            };
        }

        // Create enhanced session
        const sessionResult = await authService.createSession(authResult.user.id, {
            userAgent,
            ipAddress: ip
        });

        // Prepare secure user data (without password)
        const userData = {
            id: authResult.user.id,
            email: authResult.user.email,
            username: authResult.user.username,
            profile: authResult.user.profile,
            createdAt: authResult.user.createdAt,
            updatedAt: authResult.user.updatedAt
        };

        return {
            success: true,
            user: userData,
            token: tokenResult.token,
            refreshToken: tokenResult.refreshToken || null,
            mfaRequired: authResult.mfaRequired || false,
            riskScore: sessionResult.session?.riskScore || 0,
            securityMetadata: {
                ipAddress: ip,
                suspiciousActivity: authResult.suspiciousActivity || false,
                rateLimit: {
                    attempts: 0,
                    remaining: 5,
                    resetTime: new Date()
                }
            }
        };

    } catch (error: any) {
        console.error('Enhanced login error:', error);
        return {
            success: false,
            error: 'Internal server error',
            securityMetadata: {
                ipAddress: context.ip,
                suspiciousActivity: false,
                rateLimit: {
                    attempts: 0,
                    remaining: 5,
                    resetTime: new Date()
                }
            }
        };
    }
}

/**
 * Enhanced registration handler with password strength validation
 */
export async function handleEnhancedRegistration(
    userData: {
        email: string;
        username: string;
        password: string;
        profile?: any;
    },
    context: AuthContext
): Promise<SecurityResponse> {
    try {
        const { authService, ip, userAgent } = context;

        // Check if user already exists
        const existingUser = await authService.findUserByEmail(userData.email);
        if (existingUser) {
            return {
                success: false,
                error: 'User with this email already exists',
                securityMetadata: {
                    ipAddress: ip,
                    suspiciousActivity: false,
                    rateLimit: {
                        attempts: 0,
                        remaining: 5,
                        resetTime: new Date()
                    }
                }
            };
        }

        // Create user with enhanced security (includes password strength validation)
        const user = await authService.createUser({
            email: userData.email,
            username: userData.username,
            password: userData.password,
            profile: userData.profile || { name: userData.username }
        });

        if (!user) {
            return {
                success: false,
                error: 'Failed to create user',
                securityMetadata: {
                    ipAddress: ip,
                    suspiciousActivity: false,
                    rateLimit: {
                        attempts: 0,
                        remaining: 5,
                        resetTime: new Date()
                    }
                }
            };
        }

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                profile: user.profile,
                createdAt: user.createdAt
            },
            securityMetadata: {
                ipAddress: ip,
                suspiciousActivity: false,
                rateLimit: {
                    attempts: 0,
                    remaining: 5,
                    resetTime: new Date()
                }
            }
        };

    } catch (error: any) {
        console.error('Enhanced registration error:', error);

        // Handle password strength validation errors
        if (error.message && error.message.includes('password')) {
            return {
                success: false,
                error: error.message,
                securityMetadata: {
                    ipAddress: context.ip,
                    suspiciousActivity: false,
                    rateLimit: {
                        attempts: 0,
                        remaining: 5,
                        resetTime: new Date()
                    }
                }
            };
        }

        return {
            success: false,
            error: 'Internal server error',
            securityMetadata: {
                ipAddress: context.ip,
                suspiciousActivity: false,
                rateLimit: {
                    attempts: 0,
                    remaining: 5,
                    resetTime: new Date()
                }
            }
        };
    }
}

/**
 * Set secure authentication cookies
 */
export function setAuthCookies(
    response: any,
    token: string,
    refreshToken?: string
): void {
    // Set main authentication token
    response.cookies.set('codai_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 900, // 15 minutes
        domain: process.env.NODE_ENV === 'production' ? '.codai.ro' : undefined
    });

    // Set refresh token if provided
    if (refreshToken) {
        response.cookies.set('codai_refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 604800, // 7 days
            domain: process.env.NODE_ENV === 'production' ? '.codai.ro' : undefined
        });
    }
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(
    response: any,
    securityMetadata?: SecurityResponse['securityMetadata']
): void {
    if (securityMetadata) {
        // Add rate limiting headers
        response.headers.set('X-RateLimit-Remaining', securityMetadata.rateLimit.remaining.toString());
        response.headers.set('X-RateLimit-Reset', securityMetadata.rateLimit.resetTime.toISOString());

        // Add security indicators (without exposing sensitive data)
        if (securityMetadata.suspiciousActivity) {
            response.headers.set('X-Security-Alert', 'true');
        }
    }

    // Always add standard security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
}
