/**
 * Authentication Middleware for MemorAI API
 * Handles JWT token validation and user authentication
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/environment.js';
import { logger } from '@/utils/logger.js';

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
}

export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
    token?: string;
}

/**
 * JWT Authentication Middleware
 */
export const authenticateJWT = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : req.cookies?.['auth-token'];

        if (!token) {
            logger.warn('Authentication failed: No token provided', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path
            });
            res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
            return;
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret) as any;

            // Validate token structure
            if (!decoded.sub || !decoded.email) {
                throw new Error('Invalid token structure');
            }

            // Create authenticated user object
            const user: AuthenticatedUser = {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name || decoded.email,
                roles: decoded.roles || ['user'],
                permissions: decoded.permissions || []
            };

            req.user = user;
            req.token = token;

            logger.info('Authentication successful', {
                userId: user.id,
                email: user.email,
                roles: user.roles,
                ip: req.ip,
                path: req.path
            });

            next();
        } catch (jwtError) {
            logger.warn('Authentication failed: Invalid token', {
                error: jwtError instanceof Error ? jwtError.message : 'Unknown JWT error',
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path
            });

            res.status(401).json({
                success: false,
                error: 'Access denied. Invalid token.'
            });
            return;
        }
    } catch (error) {
        logger.error('Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal authentication error'
        });
        return;
    }
};

/**
 * Optional JWT Authentication Middleware
 * Populates user if token is valid, but doesn't require it
 */
export const optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : req.cookies?.['auth-token'];

        if (!token) {
            next();
            return;
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret) as any;

            if (decoded.sub && decoded.email) {
                const user: AuthenticatedUser = {
                    id: decoded.sub,
                    email: decoded.email,
                    name: decoded.name || decoded.email,
                    roles: decoded.roles || ['user'],
                    permissions: decoded.permissions || []
                };

                req.user = user;
                req.token = token;

                logger.info('Optional authentication successful', {
                    userId: user.id,
                    email: user.email,
                    path: req.path
                });
            }
        } catch (jwtError) {
            // Ignore JWT errors for optional auth
            logger.debug('Optional authentication failed: Invalid token', {
                error: jwtError instanceof Error ? jwtError.message : 'Unknown JWT error',
                path: req.path
            });
        }

        next();
    } catch (error) {
        logger.error('Optional authentication middleware error:', error);
        next(); // Continue without authentication for optional auth
    }
};

/**
 * Role-based Authorization Middleware
 */
export const requireRole = (requiredRoles: string | string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }

        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        const hasRole = roles.some(role => req.user!.roles.includes(role));

        if (!hasRole) {
            logger.warn('Authorization failed: Insufficient role', {
                userId: req.user.id,
                requiredRoles: roles,
                userRoles: req.user.roles,
                path: req.path
            });

            res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.'
            });
            return;
        }

        logger.info('Authorization successful', {
            userId: req.user.id,
            requiredRoles: roles,
            userRoles: req.user.roles,
            path: req.path
        });

        next();
    };
};

/**
 * Permission-based Authorization Middleware
 */
export const requirePermission = (requiredPermissions: string | string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }

        const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
        const hasPermission = permissions.some(permission => req.user!.permissions.includes(permission));

        if (!hasPermission) {
            logger.warn('Authorization failed: Insufficient permissions', {
                userId: req.user.id,
                requiredPermissions: permissions,
                userPermissions: req.user.permissions,
                path: req.path
            });

            res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.'
            });
            return;
        }

        logger.info('Permission authorization successful', {
            userId: req.user.id,
            requiredPermissions: permissions,
            userPermissions: req.user.permissions,
            path: req.path
        });

        next();
    };
};

/**
 * Rate Limiting by User ID
 */
export const userRateLimit = (maxRequests: number, windowMs: number) => {
    const userRequests = new Map<string, { count: number; resetTime: number }>();

    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            next();
            return;
        }

        const userId = req.user.id;
        const now = Date.now();
        const userLimit = userRequests.get(userId);

        if (!userLimit || now > userLimit.resetTime) {
            userRequests.set(userId, {
                count: 1,
                resetTime: now + windowMs
            });
            next();
            return;
        }

        if (userLimit.count >= maxRequests) {
            logger.warn('Rate limit exceeded', {
                userId,
                requestCount: userLimit.count,
                maxRequests,
                path: req.path
            });

            res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
            });
            return;
        }

        userLimit.count++;
        next();
    };
};

/**
 * API Key Authentication Middleware
 */
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
        res.status(401).json({
            success: false,
            error: 'API key required'
        });
        return;
    }

    // Validate API key format and check against configured keys
    if (!config.apiKeys?.includes(apiKey)) {
        logger.warn('API key authentication failed', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path
        });

        res.status(401).json({
            success: false,
            error: 'Invalid API key'
        });
        return;
    }

    logger.info('API key authentication successful', {
        ip: req.ip,
        path: req.path
    });

    next();
};

/**
 * Development-only bypass middleware
 */
export const devBypass = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (config.nodeEnv === 'development' && req.headers['x-dev-bypass'] === 'true') {
        // Create a mock user for development
        req.user = {
            id: 'dev-user-123',
            email: 'dev@memorai.ro',
            name: 'Development User',
            roles: ['user', 'admin'],
            permissions: ['read', 'write', 'admin']
        };

        logger.warn('Development bypass activated', {
            ip: req.ip,
            path: req.path
        });
    }

    next();
};

export default {
    authenticateJWT,
    optionalAuth,
    requireRole,
    requirePermission,
    userRateLimit,
    authenticateApiKey,
    devBypass
};
