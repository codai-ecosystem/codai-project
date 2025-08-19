/**
 * Authentication Routes for MemorAI API
 * Handles user authentication, token validation, and user management
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/environment.js';
import { asyncHandler, ValidationError, UnauthorizedError } from '@/middleware/errorHandler.js';
import { authenticateJWT, optionalAuth, AuthenticatedRequest } from '@/middleware/auth.js';
import { logger } from '@/utils/logger.js';

const router = Router();

interface LoginRequest {
    email: string;
    password?: string;
    authCode?: string;
    provider?: 'codai' | 'oauth2';
}

interface TokenResponse {
    success: boolean;
    data?: {
        token: string;
        refreshToken?: string;
        expiresIn: string;
        user: {
            id: string;
            email: string;
            name: string;
            roles: string[];
        };
    };
    error?: string;
}

/**
 * Authenticate with CODAI ecosystem
 * POST /auth/login
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
    const { email, authCode, provider = 'codai' } = req.body as LoginRequest;

    if (!email || !authCode) {
        throw new ValidationError('Email and auth code are required');
    }

    try {
        // Validate auth code with CODAI identity service
        const authResponse = await fetch(`${config.codaiAuthUrl}/api/auth/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authCode}`
            },
            body: JSON.stringify({
                email,
                clientId: config.codaiClientId
            })
        });

        if (!authResponse.ok) {
            throw new UnauthorizedError('Invalid authentication credentials');
        }

        const authData = await authResponse.json() as any;

        // Fetch user profile from ID service
        const profileResponse = await fetch(`${config.codaiIdUrl}/api/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authCode}`,
                'Content-Type': 'application/json'
            }
        });

        if (!profileResponse.ok) {
            throw new UnauthorizedError('Unable to fetch user profile');
        }

        const userProfile = await profileResponse.json() as any;

        // Create JWT token with user information
        const tokenPayload = {
            sub: userProfile.id,
            email: userProfile.email,
            name: userProfile.name || userProfile.displayName,
            roles: userProfile.roles || ['user'],
            permissions: userProfile.permissions || [],
            provider: 'codai',
            iat: Math.floor(Date.now() / 1000),
            iss: 'memorai-api'
        };

        const token = jwt.sign(tokenPayload, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn
        });

        logger.info('User authentication successful', {
            userId: userProfile.id,
            email: userProfile.email,
            provider,
            ip: req.ip
        });

        const response: TokenResponse = {
            success: true,
            data: {
                token,
                expiresIn: config.jwtExpiresIn,
                user: {
                    id: userProfile.id,
                    email: userProfile.email,
                    name: userProfile.name || userProfile.displayName,
                    roles: userProfile.roles || ['user']
                }
            }
        };

        res.status(200).json(response);
    } catch (error) {
        logger.error('Authentication failed', {
            email,
            provider,
            error: error instanceof Error ? error.message : 'Unknown error',
            ip: req.ip
        });

        if (error instanceof ValidationError || error instanceof UnauthorizedError) {
            throw error;
        }

        throw new UnauthorizedError('Authentication failed');
    }
}));

/**
 * Refresh authentication token
 * POST /auth/refresh
 */
router.post('/refresh', authenticateJWT, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;

    try {
        // Create new JWT token
        const tokenPayload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            permissions: user.permissions,
            provider: 'codai',
            iat: Math.floor(Date.now() / 1000),
            iss: 'memorai-api'
        };

        const newToken = jwt.sign(tokenPayload, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn
        });

        logger.info('Token refreshed successfully', {
            userId: user.id,
            email: user.email,
            ip: req.ip
        });

        const response: TokenResponse = {
            success: true,
            data: {
                token: newToken,
                expiresIn: config.jwtExpiresIn,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    roles: user.roles
                }
            }
        };

        res.status(200).json(response);
    } catch (error) {
        logger.error('Token refresh failed', {
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            ip: req.ip
        });

        throw new UnauthorizedError('Token refresh failed');
    }
}));

/**
 * Validate current token and get user info
 * GET /auth/me
 */
router.get('/me', authenticateJWT, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;

    try {
        // Optionally fetch fresh user data from ID service
        const profileResponse = await fetch(`${config.codaiIdUrl}/api/users/${user.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${req.token}`,
                'Content-Type': 'application/json'
            }
        });

        let userProfile = user;
        if (profileResponse.ok) {
            const freshProfile = await profileResponse.json() as any;
            userProfile = {
                id: freshProfile.id,
                email: freshProfile.email,
                name: freshProfile.name || freshProfile.displayName,
                roles: freshProfile.roles || user.roles,
                permissions: freshProfile.permissions || user.permissions
            };
        }

        logger.debug('User profile retrieved', {
            userId: user.id,
            email: user.email,
            ip: req.ip
        });

        res.status(200).json({
            success: true,
            data: {
                user: userProfile,
                token: {
                    expiresIn: config.jwtExpiresIn,
                    issuedAt: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        logger.error('User profile retrieval failed', {
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            ip: req.ip
        });

        // Return cached user data if ID service is unavailable
        res.status(200).json({
            success: true,
            data: {
                user,
                token: {
                    expiresIn: config.jwtExpiresIn,
                    issuedAt: new Date().toISOString()
                }
            }
        });
    }
}));

/**
 * Logout user (invalidate token)
 * POST /auth/logout
 */
router.post('/logout', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    if (user) {
        logger.info('User logout', {
            userId: user.id,
            email: user.email,
            ip: req.ip
        });
    }

    // In a production system, you might want to blacklist the token
    // For now, we'll just return success and let the client discard the token

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
}));

/**
 * Check authentication status
 * GET /auth/status
 */
router.get('/status', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    res.status(200).json({
        success: true,
        data: {
            authenticated: !!user,
            user: user ? {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles
            } : null,
            timestamp: new Date().toISOString()
        }
    });
}));

/**
 * OAuth2 callback handler
 * POST /auth/oauth/callback
 */
router.post('/oauth/callback', asyncHandler(async (req: Request, res: Response) => {
    const { code, state, error: oauthError } = req.body;

    if (oauthError) {
        logger.warn('OAuth callback error', {
            error: oauthError,
            ip: req.ip
        });

        throw new UnauthorizedError(`OAuth error: ${oauthError}`);
    }

    if (!code) {
        throw new ValidationError('Authorization code is required');
    }

    try {
        // Exchange authorization code for access token
        const tokenResponse = await fetch(`${config.codaiAuthUrl}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${config.codaiClientId}:${config.codaiClientSecret}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${req.protocol}://${req.get('host')}/auth/oauth/callback`
            })
        });

        if (!tokenResponse.ok) {
            throw new UnauthorizedError('Failed to exchange authorization code');
        }

        const tokenData = await tokenResponse.json() as any;

        // Get user info with access token
        const userResponse = await fetch(`${config.codaiIdUrl}/api/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new UnauthorizedError('Failed to fetch user information');
        }

        const userData = await userResponse.json() as any;

        // Create JWT token
        const tokenPayload = {
            sub: userData.id,
            email: userData.email,
            name: userData.name || userData.displayName,
            roles: userData.roles || ['user'],
            permissions: userData.permissions || [],
            provider: 'oauth2',
            iat: Math.floor(Date.now() / 1000),
            iss: 'memorai-api'
        };

        const jwtToken = jwt.sign(tokenPayload, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn
        });

        logger.info('OAuth authentication successful', {
            userId: userData.id,
            email: userData.email,
            ip: req.ip
        });

        const response: TokenResponse = {
            success: true,
            data: {
                token: jwtToken,
                expiresIn: config.jwtExpiresIn,
                user: {
                    id: userData.id,
                    email: userData.email,
                    name: userData.name || userData.displayName,
                    roles: userData.roles || ['user']
                }
            }
        };

        res.status(200).json(response);
    } catch (error) {
        logger.error('OAuth callback failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            code: code ? 'present' : 'missing',
            ip: req.ip
        });

        if (error instanceof ValidationError || error instanceof UnauthorizedError) {
            throw error;
        }

        throw new UnauthorizedError('OAuth authentication failed');
    }
}));

export default router;
