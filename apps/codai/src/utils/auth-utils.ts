/**
 * @fileoverview API Authentication Utilities
 * @description JWT, API key management, and authentication helpers
 */

import crypto from 'crypto';

export interface User {
    id: string;
    email: string;
    role: string;
    permissions: string[];
    lastLogin?: Date;
    isActive: boolean;
}

export interface JWTPayload {
    sub: string; // subject (user ID)
    email: string;
    role: string;
    permissions: string[];
    iat: number; // issued at
    exp: number; // expiration
    jti: string; // JWT ID for revocation
}

export interface APIKey {
    id: string;
    key: string;
    name: string;
    userId: string;
    permissions: string[];
    expiresAt?: Date;
    lastUsed?: Date;
    isActive: boolean;
    rateLimit?: {
        maxRequests: number;
        windowMs: number;
    };
}

export class AuthenticationService {
    private jwtSecret: string;
    private jwtExpiration: string;
    private refreshTokenExpiration: string;
    private revokedTokens = new Set<string>();

    constructor(
        jwtSecret: string = process.env.JWT_SECRET || 'default-secret',
        jwtExpiration: string = '24h',
        refreshTokenExpiration: string = '7d'
    ) {
        this.jwtSecret = jwtSecret;
        this.jwtExpiration = jwtExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    /**
     * Generate JWT token for user
     */
    async generateToken(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const jwt = await import('jsonwebtoken');
        const jti = crypto.randomUUID();
        
        const payload: JWTPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.parseExpiration(this.jwtExpiration),
            jti
        };

        const accessToken = jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiration,
            issuer: 'codai',
            audience: 'codai-api'
        });

        const refreshPayload = {
            sub: user.id,
            type: 'refresh',
            jti: crypto.randomUUID()
        };

        const refreshToken = jwt.sign(refreshPayload, this.jwtSecret, {
            expiresIn: this.refreshTokenExpiration,
            issuer: 'codai',
            audience: 'codai-api'
        });

        return { accessToken, refreshToken };
    }

    /**
     * Verify and decode JWT token
     */
    async verifyToken(token: string): Promise<JWTPayload> {
        const jwt = await import('jsonwebtoken');
        
        try {
            const decoded = jwt.verify(token, this.jwtSecret, {
                issuer: 'codai',
                audience: 'codai-api'
            }) as JWTPayload;

            // Check if token is revoked
            if (this.revokedTokens.has(decoded.jti)) {
                throw new Error('Token has been revoked');
            }

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token has expired');
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

    /**
     * Revoke a JWT token
     */
    revokeToken(jti: string): void {
        this.revokedTokens.add(jti);
        
        // Clean up old revoked tokens periodically
        if (this.revokedTokens.size > 10000) {
            this.cleanupRevokedTokens();
        }
    }

    /**
     * Generate API key
     */
    generateAPIKey(userId: string, name: string, permissions: string[]): APIKey {
        const key = `${appName}_${crypto.randomBytes(32).toString('hex')}`;
        
        return {
            id: crypto.randomUUID(),
            key,
            name,
            userId,
            permissions,
            isActive: true,
            rateLimit: {
                maxRequests: 1000,
                windowMs: 60 * 60 * 1000 // 1 hour
            }
        };
    }

    /**
     * Validate API key
     */
    async validateAPIKey(key: string): Promise<APIKey | null> {
        // This would typically query a database
        // For now, returning null as placeholder
        return null;
    }

    /**
     * Hash API key for storage
     */
    hashAPIKey(key: string): string {
        return crypto.createHash('sha256').update(key).digest('hex');
    }

    /**
     * Check permissions
     */
    hasPermission(userPermissions: string[], requiredPermission: string): boolean {
        return userPermissions.includes('*') || userPermissions.includes(requiredPermission);
    }

    /**
     * Check role-based access
     */
    hasRole(userRole: string, allowedRoles: string[]): boolean {
        return allowedRoles.includes(userRole) || userRole === 'admin';
    }

    /**
     * Generate secure password reset token
     */
    generatePasswordResetToken(userId: string): { token: string; expiresAt: Date } {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        return { token, expiresAt };
    }

    /**
     * Generate email verification token
     */
    generateEmailVerificationToken(email: string): { token: string; expiresAt: Date } {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        return { token, expiresAt };
    }

    private parseExpiration(expiration: string): number {
        const unit = expiration.slice(-1);
        const value = parseInt(expiration.slice(0, -1));
        
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 24 * 60 * 60;
            default: return 24 * 60 * 60; // default 24 hours
        }
    }

    private cleanupRevokedTokens(): void {
        // Keep only recent tokens (this is simplified - in production use Redis with TTL)
        this.revokedTokens.clear();
    }
}

// Authentication middleware factory
export function requireAuth(permissions: string[] = []) {
    return async (req: any, res: any, next: any) => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const token = authHeader.substring(7);
            const auth = new AuthenticationService();
            const decoded = await auth.verifyToken(token);

            // Check permissions if specified
            if (permissions.length > 0) {
                const hasPermission = permissions.some(permission => 
                    auth.hasPermission(decoded.permissions, permission)
                );
                
                if (!hasPermission) {
                    return res.status(403).json({ error: 'Insufficient permissions' });
                }
            }

            // Attach user info to request
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    };
}

// API key authentication middleware
export function requireAPIKey(permissions: string[] = []) {
    return async (req: any, res: any, next: any) => {
        try {
            const apiKey = req.headers['x-api-key'];
            
            if (!apiKey) {
                return res.status(401).json({ error: 'API key required' });
            }

            const auth = new AuthenticationService();
            const keyData = await auth.validateAPIKey(apiKey);

            if (!keyData || !keyData.isActive) {
                return res.status(401).json({ error: 'Invalid API key' });
            }

            // Check permissions
            if (permissions.length > 0) {
                const hasPermission = permissions.some(permission => 
                    auth.hasPermission(keyData.permissions, permission)
                );
                
                if (!hasPermission) {
                    return res.status(403).json({ error: 'Insufficient permissions' });
                }
            }

            req.apiKey = keyData;
            next();
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    };
}