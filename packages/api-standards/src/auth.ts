/**
 * Authentication Middleware for CODAI API Standards
 * JWT and session-based authentication
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CodaiResponseBuilder } from './response';

export interface CodaiJwtPayload {
    userId: string;
    email: string;
    roles: string[];
    sessionId: string;
    iat?: number;
    exp?: number;
}

export interface AuthConfig {
    jwtSecret: string;
    cookieName?: string;
    skipPaths?: string[];
}

/**
 * Extract JWT token from request
 */
const extractToken = (req: Request): string | null => {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Check cookie
    const cookieToken = req.cookies?.codai_session;
    if (cookieToken) {
        return cookieToken;
    }

    return null;
};

/**
 * JWT Authentication Middleware
 */
export const jwtAuthMiddleware = (config: AuthConfig) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Skip authentication for certain paths
            if (config.skipPaths?.some(path => req.path.startsWith(path))) {
                return next();
            }

            const token = extractToken(req);

            if (!token) {
                const response = req.responseBuilder.authError('Authentication token required');
                return res.status(401).json(response);
            }

            // Verify JWT token
            const decoded = jwt.verify(token, config.jwtSecret) as CodaiJwtPayload;

            // Attach user info to request
            req.user = {
                id: decoded.userId,
                email: decoded.email,
                roles: decoded.roles || [],
            };

            next();
        } catch (error: any) {
            const response = req.responseBuilder.authError(
                error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
            );
            return res.status(401).json(response);
        }
    };
};

/**
 * Optional JWT Authentication Middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalJwtAuthMiddleware = (config: AuthConfig) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = extractToken(req);

            if (token) {
                const decoded = jwt.verify(token, config.jwtSecret) as CodaiJwtPayload;
                req.user = {
                    id: decoded.userId,
                    email: decoded.email,
                    roles: decoded.roles || [],
                };
            }

            next();
        } catch (error) {
            // If token is invalid, just continue without user info
            next();
        }
    };
};

/**
 * Role-based Authorization Middleware
 */
export const requireRole = (roles: string | string[]) => {
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            const response = req.responseBuilder.authError('Authentication required');
            return res.status(401).json(response);
        }

        const hasRequiredRole = requiredRoles.some(role => req.user!.roles.includes(role));

        if (!hasRequiredRole) {
            const response = req.responseBuilder.forbiddenError('Insufficient permissions');
            return res.status(403).json(response);
        }

        next();
    };
};

/**
 * API Key Authentication Middleware
 */
export const apiKeyAuthMiddleware = (validApiKeys: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            const response = req.responseBuilder.authError('API key required');
            return res.status(401).json(response);
        }

        if (!validApiKeys.includes(apiKey)) {
            const response = req.responseBuilder.authError('Invalid API key');
            return res.status(401).json(response);
        }

        next();
    };
};

/**
 * Service-to-Service Authentication
 * For internal CODAI service communication
 */
export const serviceAuthMiddleware = (serviceSecret: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const serviceAuth = req.headers['x-service-auth'] as string;

        if (!serviceAuth) {
            const response = req.responseBuilder.authError('Service authentication required');
            return res.status(401).json(response);
        }

        if (serviceAuth !== serviceSecret) {
            const response = req.responseBuilder.authError('Invalid service credentials');
            return res.status(401).json(response);
        }

        next();
    };
};
