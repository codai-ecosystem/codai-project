/**
 * API Key Model for CBD Universal Database
 * Handles API key generation, validation, and management for external projects
 */

import { createHash, randomBytes } from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface ApiKey {
    id: string;
    projectId: string;
    name: string;
    key: string; // JWT token
    keyHash: string; // Hash for validation
    scopes: ApiKeyScope[];
    rateLimit: {
        requestsPerMinute: number;
        requestsPerHour: number;
        currentMinute: {
            count: number;
            resetTime: number;
        };
        currentHour: {
            count: number;
            resetTime: number;
        };
    };
    status: 'active' | 'revoked' | 'expired';
    expiresAt?: Date;
    lastUsed?: Date;
    usageStats: {
        totalRequests: number;
        lastRequest?: Date;
        lastIP?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, any>;
}

export type ApiKeyScope =
    | 'read' | 'write' | 'admin'
    | 'document:read' | 'document:write' | 'document:admin'
    | 'vector:read' | 'vector:write' | 'vector:admin'
    | 'graph:read' | 'graph:write' | 'graph:admin'
    | 'kv:read' | 'kv:write' | 'kv:admin'
    | 'timeseries:read' | 'timeseries:write' | 'timeseries:admin'
    | 'files:read' | 'files:write' | 'files:admin'
    | 'ai:read' | 'ai:write' | 'ai:admin';

export interface ApiKeyCreateRequest {
    projectId: string;
    name: string;
    scopes: ApiKeyScope[];
    rateLimit?: {
        requestsPerMinute?: number;
        requestsPerHour?: number;
    };
    expiresAt?: Date;
    metadata?: Record<string, any>;
}

export interface ApiKeyValidationResult {
    valid: boolean;
    apiKey?: ApiKey;
    error?: string;
    rateLimit?: {
        allowed: boolean;
        remaining: {
            minute: number;
            hour: number;
        };
        resetTime: {
            minute: number;
            hour: number;
        };
    };
}

/**
 * In-memory API key storage for Phase 1 implementation
 * TODO: Replace with proper database storage in Phase 2
 */
export class ApiKeyStorage {
    private apiKeys: Map<string, ApiKey> = new Map();
    private keyHashIndex: Map<string, string> = new Map(); // hash -> keyId
    private projectIndex: Map<string, string[]> = new Map(); // projectId -> keyIds[]
    private jwtSecret: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'cbd-universal-secret-key-development';
    }

    async createApiKey(ownerId: string, request: ApiKeyCreateRequest): Promise<{ apiKey: ApiKey; plainKey: string }> {
        const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const plainKey = this.generateSecureKey();
        const keyHash = this.hashKey(plainKey);

        // Create JWT token with embedded metadata
        const defaultExpiration = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now
        const jwtPayload = {
            keyId,
            projectId: request.projectId,
            ownerId,
            scopes: request.scopes,
            iat: Math.floor(Date.now() / 1000),
            exp: request.expiresAt ? Math.floor(request.expiresAt.getTime() / 1000) : Math.floor(defaultExpiration.getTime() / 1000)
        };

        const jwtToken = jwt.sign(jwtPayload, this.jwtSecret, {
            algorithm: 'HS256',
            issuer: 'cbd-universal-database',
            audience: 'cbd-api-clients'
        });

        const now = Date.now();
        const apiKey: ApiKey = {
            id: keyId,
            projectId: request.projectId,
            name: request.name,
            key: jwtToken,
            keyHash,
            scopes: request.scopes,
            rateLimit: {
                requestsPerMinute: request.rateLimit?.requestsPerMinute ?? 1000,
                requestsPerHour: request.rateLimit?.requestsPerHour ?? 50000,
                currentMinute: {
                    count: 0,
                    resetTime: now + 60000 // 1 minute
                },
                currentHour: {
                    count: 0,
                    resetTime: now + 3600000 // 1 hour
                }
            },
            status: 'active',
            expiresAt: request.expiresAt,
            usageStats: {
                totalRequests: 0
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: request.metadata || {}
        };

        // Store in maps
        this.apiKeys.set(keyId, apiKey);
        this.keyHashIndex.set(keyHash, keyId);

        // Update project index
        const projectKeys = this.projectIndex.get(request.projectId) || [];
        projectKeys.push(keyId);
        this.projectIndex.set(request.projectId, projectKeys);

        return { apiKey, plainKey: jwtToken };
    }

    async validateApiKey(token: string, requiredScopes?: ApiKeyScope[]): Promise<ApiKeyValidationResult> {
        try {
            // Verify JWT token
            const decoded = jwt.verify(token, this.jwtSecret, {
                issuer: 'cbd-universal-database',
                audience: 'cbd-api-clients'
            }) as JwtPayload;

            if (!decoded.keyId) {
                return { valid: false, error: 'Invalid token format' };
            }

            // Get API key from storage
            const apiKey = this.apiKeys.get(decoded.keyId);
            if (!apiKey) {
                return { valid: false, error: 'API key not found' };
            }

            // Check if key is active
            if (apiKey.status !== 'active') {
                return { valid: false, error: `API key is ${apiKey.status}` };
            }

            // Check expiration
            if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
                // Mark as expired
                apiKey.status = 'expired';
                apiKey.updatedAt = new Date();
                this.apiKeys.set(apiKey.id, apiKey);
                return { valid: false, error: 'API key has expired' };
            }

            // Check scopes
            if (requiredScopes && requiredScopes.length > 0) {
                const hasRequiredScopes = requiredScopes.every(scope =>
                    apiKey.scopes.includes(scope) ||
                    apiKey.scopes.includes('admin') ||
                    this.checkScopeHierarchy(apiKey.scopes, scope)
                );

                if (!hasRequiredScopes) {
                    return { valid: false, error: 'Insufficient permissions' };
                }
            }

            // Check rate limits
            const rateLimitResult = this.checkRateLimit(apiKey);
            if (!rateLimitResult.allowed) {
                return {
                    valid: false,
                    error: 'Rate limit exceeded',
                    rateLimit: rateLimitResult
                };
            }

            // Update usage stats
            apiKey.usageStats.totalRequests++;
            apiKey.usageStats.lastRequest = new Date();
            apiKey.lastUsed = new Date();
            apiKey.updatedAt = new Date();
            this.apiKeys.set(apiKey.id, apiKey);

            return {
                valid: true,
                apiKey,
                rateLimit: rateLimitResult
            };

        } catch (error) {
            return { valid: false, error: 'Invalid token' };
        }
    }

    async getApiKey(keyId: string): Promise<ApiKey | null> {
        return this.apiKeys.get(keyId) || null;
    }

    async getApiKeysByProject(projectId: string): Promise<ApiKey[]> {
        const keyIds = this.projectIndex.get(projectId) || [];
        return keyIds
            .map(id => this.apiKeys.get(id))
            .filter((key): key is ApiKey => key !== undefined);
    }

    async revokeApiKey(keyId: string): Promise<boolean> {
        const apiKey = this.apiKeys.get(keyId);
        if (!apiKey) return false;

        apiKey.status = 'revoked';
        apiKey.updatedAt = new Date();
        this.apiKeys.set(keyId, apiKey);

        // Remove from hash index
        this.keyHashIndex.delete(apiKey.keyHash);

        return true;
    }

    async updateApiKey(keyId: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
        const apiKey = this.apiKeys.get(keyId);
        if (!apiKey) return null;

        const updatedKey = {
            ...apiKey,
            ...updates,
            updatedAt: new Date()
        };

        this.apiKeys.set(keyId, updatedKey);
        return updatedKey;
    }

    async getApiKeyStats(): Promise<{
        total: number;
        active: number;
        revoked: number;
        expired: number;
        totalRequests: number;
        byProject: Record<string, number>;
    }> {
        const keys = Array.from(this.apiKeys.values());

        return {
            total: keys.length,
            active: keys.filter(k => k.status === 'active').length,
            revoked: keys.filter(k => k.status === 'revoked').length,
            expired: keys.filter(k => k.status === 'expired').length,
            totalRequests: keys.reduce((sum, k) => sum + k.usageStats.totalRequests, 0),
            byProject: keys.reduce((acc, k) => {
                acc[k.projectId] = (acc[k.projectId] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    }

    private generateSecureKey(): string {
        // Generate a secure random key
        const prefix = 'cbd';
        const randomPart = randomBytes(32).toString('hex');
        const timestamp = Date.now().toString(36);
        return `${prefix}_${timestamp}_${randomPart}`;
    }

    private hashKey(key: string): string {
        return createHash('sha256').update(key).digest('hex');
    }

    private checkScopeHierarchy(userScopes: ApiKeyScope[], requiredScope: ApiKeyScope): boolean {
        // Check if user has admin scope
        if (userScopes.includes('admin')) return true;

        // Check specific scope hierarchies
        const [domain, action] = requiredScope.split(':');
        if (action) {
            // Check if user has domain admin
            if (userScopes.includes(`${domain}:admin` as ApiKeyScope)) return true;

            // Check if user has general read/write permissions
            if (action === 'read' && userScopes.includes('read')) return true;
            if (action === 'write' && (userScopes.includes('write') || userScopes.includes('read'))) return true;
        }

        return false;
    }

    private checkRateLimit(apiKey: ApiKey): {
        allowed: boolean;
        remaining: { minute: number; hour: number };
        resetTime: { minute: number; hour: number };
    } {
        const now = Date.now();

        // Reset minute counter if needed
        if (now > apiKey.rateLimit.currentMinute.resetTime) {
            apiKey.rateLimit.currentMinute.count = 0;
            apiKey.rateLimit.currentMinute.resetTime = now + 60000;
        }

        // Reset hour counter if needed
        if (now > apiKey.rateLimit.currentHour.resetTime) {
            apiKey.rateLimit.currentHour.count = 0;
            apiKey.rateLimit.currentHour.resetTime = now + 3600000;
        }

        // Check limits
        const minuteExceeded = apiKey.rateLimit.currentMinute.count >= apiKey.rateLimit.requestsPerMinute;
        const hourExceeded = apiKey.rateLimit.currentHour.count >= apiKey.rateLimit.requestsPerHour;

        if (!minuteExceeded && !hourExceeded) {
            // Increment counters
            apiKey.rateLimit.currentMinute.count++;
            apiKey.rateLimit.currentHour.count++;
        }

        return {
            allowed: !minuteExceeded && !hourExceeded,
            remaining: {
                minute: Math.max(0, apiKey.rateLimit.requestsPerMinute - apiKey.rateLimit.currentMinute.count),
                hour: Math.max(0, apiKey.rateLimit.requestsPerHour - apiKey.rateLimit.currentHour.count)
            },
            resetTime: {
                minute: apiKey.rateLimit.currentMinute.resetTime,
                hour: apiKey.rateLimit.currentHour.resetTime
            }
        };
    }
}
