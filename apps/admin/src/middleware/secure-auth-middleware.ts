/**
 * @fileoverview Secure Authentication Middleware
 * @description Comprehensive authentication and authorization middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { SessionSecurityManager, SecurityContext, DeviceFingerprinting } from '../utils/session-security';
import { AuthenticationService } from '../utils/auth-utils';
import { MultiFactorAuth } from '../utils/multi-factor-auth';

export interface AuthConfig {
    requireAuth: boolean;
    requireMFA: boolean;
    requiredPermissions?: string[];
    requiredRoles?: string[];
    allowPublicAccess?: boolean;
    requireSecureConnection?: boolean;
    enableSessionSecurity?: boolean;
    enableDeviceFingerprinting?: boolean;
}

const defaultAuthConfig: AuthConfig = {
    requireAuth: true,
    requireMFA: false,
    allowPublicAccess: false,
    requireSecureConnection: process.env.NODE_ENV === 'production',
    enableSessionSecurity: true,
    enableDeviceFingerprinting: true
};

export class SecureAuthMiddleware {
    private sessionManager: SessionSecurityManager;
    private authService: AuthenticationService;
    private mfaService: MultiFactorAuth;
    private config: AuthConfig;

    constructor(config: Partial<AuthConfig> = {}) {
        this.config = { ...defaultAuthConfig, ...config };
        this.sessionManager = new SessionSecurityManager();
        this.authService = new AuthenticationService();
        this.mfaService = new MultiFactorAuth();
    }

    /**
     * Main authentication middleware
     */
    async authenticate(request: NextRequest, config?: Partial<AuthConfig>): Promise<NextResponse | null> {
        const currentConfig = { ...this.config, ...config };

        try {
            // 1. Check if public access is allowed
            if (currentConfig.allowPublicAccess && !this.hasAuthHeader(request)) {
                return null; // Allow public access
            }

            // 2. Require secure connection in production
            if (currentConfig.requireSecureConnection && !this.isSecureConnection(request)) {
                return this.errorResponse('HTTPS required', 426);
            }

            // 3. Extract and validate authentication
            const authResult = await this.validateAuthentication(request, currentConfig);
            if (authResult.error) {
                return authResult.error;
            }

            // 4. Session security validation
            if (currentConfig.enableSessionSecurity && authResult.sessionId) {
                const securityContext = this.buildSecurityContext(request);
                const session = await this.sessionManager.validateSession(authResult.sessionId, securityContext);
                
                if (!session) {
                    return this.errorResponse('Session invalid or expired', 401);
                }

                // Check for high-risk session
                const riskScore = this.sessionManager.calculateSessionRisk(session, securityContext);
                if (riskScore > 0.8) {
                    return this.errorResponse('Session security risk detected', 403);
                }
            }

            // 5. MFA validation
            if (currentConfig.requireMFA) {
                const mfaResult = await this.validateMFA(request, authResult.user);
                if (mfaResult) {
                    return mfaResult;
                }
            }

            // 6. Permission and role checks
            if (currentConfig.requiredPermissions || currentConfig.requiredRoles) {
                const authzResult = this.checkAuthorization(authResult.user, currentConfig);
                if (authzResult) {
                    return authzResult;
                }
            }

            // Authentication successful
            return null;
        } catch (error) {
            console.error('Authentication middleware error:', error);
            return this.errorResponse('Authentication failed', 500);
        }
    }

    private async validateAuthentication(
        request: NextRequest,
        config: AuthConfig
    ): Promise<{ user?: any; sessionId?: string; error?: NextResponse }> {
        // Check for JWT in Authorization header
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            try {
                const user = await this.authService.verifyToken(token);
                return { user };
            } catch (error) {
                if (config.requireAuth) {
                    return { error: this.errorResponse('Invalid token', 401) };
                }
            }
        }

        // Check for session cookie
        const sessionId = request.cookies.get('session-id')?.value;
        if (sessionId) {
            const securityContext = this.buildSecurityContext(request);
            const session = await this.sessionManager.validateSession(sessionId, securityContext);
            
            if (session) {
                return { user: session, sessionId };
            } else if (config.requireAuth) {
                return { error: this.errorResponse('Session invalid', 401) };
            }
        }

        // No authentication provided
        if (config.requireAuth) {
            return { error: this.errorResponse('Authentication required', 401) };
        }

        return {};
    }

    private async validateMFA(request: NextRequest, user: any): Promise<NextResponse | null> {
        const mfaToken = request.headers.get('x-mfa-token');
        const sessionMFAVerified = request.cookies.get('mfa-verified')?.value;

        if (!mfaToken && !sessionMFAVerified) {
            return NextResponse.json({
                error: 'MFA verification required',
                mfaRequired: true,
                challenge: 'mfa_required'
            }, { status: 403 });
        }

        // Validate MFA token if provided
        if (mfaToken) {
            try {
                const decoded = await this.authService.verifyToken(mfaToken);
                if (decoded.type !== 'mfa' || decoded.sub !== user.sub) {
                    return this.errorResponse('Invalid MFA token', 403);
                }
            } catch {
                return this.errorResponse('Invalid MFA token', 403);
            }
        }

        return null;
    }

    private checkAuthorization(user: any, config: AuthConfig): NextResponse | null {
        // Check required roles
        if (config.requiredRoles) {
            if (!this.authService.hasRole(user.role, config.requiredRoles)) {
                return this.errorResponse('Insufficient role permissions', 403);
            }
        }

        // Check required permissions
        if (config.requiredPermissions) {
            const hasAllPermissions = config.requiredPermissions.every(permission =>
                this.authService.hasPermission(user.permissions, permission)
            );

            if (!hasAllPermissions) {
                return this.errorResponse('Insufficient permissions', 403);
            }
        }

        return null;
    }

    private buildSecurityContext(request: NextRequest): SecurityContext {
        const ipAddress = this.getClientIP(request);
        const userAgent = request.headers.get('user-agent') || '';
        
        let deviceFingerprint;
        if (this.config.enableDeviceFingerprinting) {
            const additionalData = {
                acceptLanguage: request.headers.get('accept-language'),
                acceptEncoding: request.headers.get('accept-encoding')
            };
            deviceFingerprint = DeviceFingerprinting.generateFingerprint(userAgent, additionalData);
        }

        return {
            ipAddress,
            userAgent,
            deviceFingerprint,
            riskScore: 0.1 // Calculate based on various factors
        };
    }

    private hasAuthHeader(request: NextRequest): boolean {
        return !!(request.headers.get('authorization') || request.cookies.get('session-id'));
    }

    private isSecureConnection(request: NextRequest): boolean {
        return request.url.startsWith('https://') || 
               request.headers.get('x-forwarded-proto') === 'https';
    }

    private getClientIP(request: NextRequest): string {
        const forwarded = request.headers.get('x-forwarded-for');
        const real = request.headers.get('x-real-ip');
        
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        
        if (real) {
            return real;
        }
        
        return 'unknown';
    }

    private errorResponse(message: string, status: number): NextResponse {
        return NextResponse.json(
            {
                error: message,
                timestamp: new Date().toISOString(),
                status
            },
            { status }
        );
    }
}

// Middleware factory functions
export function createAuthMiddleware(config?: Partial<AuthConfig>) {
    const middleware = new SecureAuthMiddleware(config);
    
    return async (request: NextRequest): Promise<NextResponse | null> => {
        return middleware.authenticate(request);
    };
}

export function requireAuthentication(config?: Partial<AuthConfig>) {
    return createAuthMiddleware({ requireAuth: true, ...config });
}

export function requireMFA(config?: Partial<AuthConfig>) {
    return createAuthMiddleware({ requireAuth: true, requireMFA: true, ...config });
}

export function requireRole(roles: string[], config?: Partial<AuthConfig>) {
    return createAuthMiddleware({ requireAuth: true, requiredRoles: roles, ...config });
}

export function requirePermissions(permissions: string[], config?: Partial<AuthConfig>) {
    return createAuthMiddleware({ requireAuth: true, requiredPermissions: permissions, ...config });
}

// Wrapper for Next.js API routes
export function withSecureAuth<T extends (...args: any[]) => any>(
    handler: T,
    config?: Partial<AuthConfig>
): T {
    const middleware = new SecureAuthMiddleware(config);
    
    return (async (req: any, res: any, ...args: any[]) => {
        const request = req as NextRequest;
        const authResult = await middleware.authenticate(request);
        
        if (authResult) {
            // Authentication failed, return error response
            return res.status(authResult.status).json(await authResult.json());
        }
        
        // Authentication successful, proceed to handler
        return handler(req, res, ...args);
    }) as T;
}