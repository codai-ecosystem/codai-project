/**
 * API Key Authentication Middleware for CBD Universal Database
 * Validates API keys for protected endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ApiKeyStorage, ApiKeyScope } from '../models/ApiKey.js';

export interface AuthenticatedRequest extends Request {
    apiKey?: {
        id: string;
        projectId: string;
        scopes: ApiKeyScope[];
        ownerId: string;
    };
}

export class ApiKeyMiddleware {
    constructor(private apiKeyStorage: ApiKeyStorage) { }

    /**
     * Create middleware that validates API keys
     */
    validateApiKey(requiredScopes?: ApiKeyScope[]) {
        return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
            try {
                // Get API key from header
                const apiKeyHeader = req.headers['x-api-key'] as string;

                if (!apiKeyHeader) {
                    return res.status(401).json({
                        success: false,
                        error: 'API key required',
                        message: 'Please provide an API key in the X-API-Key header'
                    });
                }

                // Validate API key
                const validation = await this.apiKeyStorage.validateApiKey(apiKeyHeader, requiredScopes);

                if (!validation.valid) {
                    return res.status(401).json({
                        success: false,
                        error: 'Invalid API key',
                        message: validation.error,
                        rateLimit: validation.rateLimit
                    });
                }

                // Check rate limit
                if (validation.rateLimit && !validation.rateLimit.allowed) {
                    return res.status(429).json({
                        success: false,
                        error: 'Rate limit exceeded',
                        message: 'Too many requests',
                        rateLimit: validation.rateLimit
                    });
                }

                // Add API key info to request for downstream use
                if (validation.apiKey) {
                    req.apiKey = {
                        id: validation.apiKey.id,
                        projectId: validation.apiKey.projectId,
                        scopes: validation.apiKey.scopes,
                        ownerId: 'owner' // TODO: Extract from JWT payload
                    };

                    // Add rate limit headers
                    if (validation.rateLimit) {
                        res.set({
                            'X-RateLimit-Remaining-Minute': validation.rateLimit.remaining.minute.toString(),
                            'X-RateLimit-Remaining-Hour': validation.rateLimit.remaining.hour.toString(),
                            'X-RateLimit-Reset-Minute': new Date(validation.rateLimit.resetTime.minute).toISOString(),
                            'X-RateLimit-Reset-Hour': new Date(validation.rateLimit.resetTime.hour).toISOString()
                        });
                    }
                }

                next();
            } catch (error) {
                console.error('API key validation error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Authentication error',
                    message: 'Failed to validate API key'
                });
            }
        };
    }

    /**
     * Optional API key middleware - allows requests without API key but validates if present
     */
    optionalApiKey() {
        return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
            try {
                const apiKeyHeader = req.headers['x-api-key'] as string;

                if (apiKeyHeader) {
                    const validation = await this.apiKeyStorage.validateApiKey(apiKeyHeader);

                    if (validation.valid && validation.apiKey) {
                        req.apiKey = {
                            id: validation.apiKey.id,
                            projectId: validation.apiKey.projectId,
                            scopes: validation.apiKey.scopes,
                            ownerId: 'owner' // TODO: Extract from JWT payload
                        };

                        // Add rate limit headers
                        if (validation.rateLimit) {
                            res.set({
                                'X-RateLimit-Remaining-Minute': validation.rateLimit.remaining.minute.toString(),
                                'X-RateLimit-Remaining-Hour': validation.rateLimit.remaining.hour.toString()
                            });
                        }
                    }
                }

                next();
            } catch (error) {
                // For optional middleware, continue even if validation fails
                console.warn('Optional API key validation failed:', error);
                next();
            }
        };
    }
}
