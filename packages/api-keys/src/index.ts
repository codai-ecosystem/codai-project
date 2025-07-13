/**
 * @codai/api-keys
 * 
 * Universal API Key Management System
 * Secure API key generation, validation, and management across the CODAI ecosystem
 */

import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import NodeCache from 'node-cache';
import Redis from 'redis';
import { EventEmitter } from 'events';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ApiKeyConfig {
  id: string;
  name: string;
  keyType: 'service' | 'user' | 'admin' | 'system';
  permissions: string[];
  scopes: string[];
  environment: 'development' | 'staging' | 'production';
  expiresAt?: Date;
  rateLimits?: RateLimitConfig;
  metadata?: Record<string, any>;
  tags?: string[];
  createdBy: string;
  serviceId?: string;
  userId?: string;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstAllowance?: number;
  windowSizeMs?: number;
}

export interface ApiKeyData {
  config: ApiKeyConfig;
  keyHash: string;
  prefix: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  isActive: boolean;
  rotationHistory: KeyRotation[];
}

export interface KeyRotation {
  oldKeyId: string;
  newKeyId: string;
  rotatedAt: Date;
  reason: string;
  rotatedBy: string;
}

export interface ApiKeyValidation {
  isValid: boolean;
  keyData?: ApiKeyData | undefined;
  error?: string | undefined;
  permissions: string[];
  scopes: string[];
  rateLimitStatus: RateLimitStatus;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalRequests: number;
}

export interface KeyUsageMetrics {
  keyId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastUsed: Date;
  rateLimitHits: number;
  geographicUsage: Record<string, number>;
}

// ============================================================================
// API Key Manager Core
// ============================================================================

export class ApiKeyManager extends EventEmitter {
  private keys = new Map<string, ApiKeyData>();
  private rateLimitCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL
  private usageMetrics = new Map<string, KeyUsageMetrics>();
  private redisClient?: Redis.RedisClientType;
  private encryptionKey: string;
  private jwtSecret: string;
  private defaultSaltRounds = 12;

  constructor(
    private config: {
      encryptionKey?: string;
      jwtSecret?: string;
      redis?: {
        host: string;
        port: number;
        password?: string;
      };
      persistentStorage?: boolean;
    } = {}
  ) {
    super();

    // Initialize encryption keys
    this.encryptionKey = config.encryptionKey || this.generateSecureKey();
    this.jwtSecret = config.jwtSecret || this.generateSecureKey();

    // Initialize Redis if configured
    if (config.redis) {
      this.initializeRedis();
    }

    console.log('🔐 ApiKeyManager initialized');
  }

  // ========================================================================
  // Key Generation
  // ========================================================================

  public async generateApiKey(config: Omit<ApiKeyConfig, 'id'>): Promise<{
    keyId: string;
    apiKey: string;
    keyData: ApiKeyData;
  }> {
    this.validateKeyConfig(config);

    const keyId = uuidv4();
    const rawKey = this.generateRawKey();
    const apiKey = this.formatApiKey(rawKey, config.keyType);
    const keyHash = await this.hashKey(rawKey);

    const keyData: ApiKeyData = {
      config: { ...config, id: keyId },
      keyHash,
      prefix: this.getKeyPrefix(config.keyType),
      createdAt: new Date(),
      usageCount: 0,
      isActive: true,
      rotationHistory: []
    };

    // Store key data
    this.keys.set(keyId, keyData);

    // Initialize usage metrics
    this.usageMetrics.set(keyId, {
      keyId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastUsed: new Date(),
      rateLimitHits: 0,
      geographicUsage: {}
    });

    // Persist to Redis if enabled
    if (this.redisClient) {
      await this.persistKeyData(keyId, keyData);
    }

    this.emit('key:generated', { keyId, config: keyData.config });

    console.log(`🔑 API Key generated: ${config.name} (${keyId})`);

    return { keyId, apiKey, keyData };
  }

  private generateRawKey(): string {
    return randomBytes(32).toString('hex');
  }

  private formatApiKey(rawKey: string, type: ApiKeyConfig['keyType']): string {
    const prefix = this.getKeyPrefix(type);
    return `${prefix}_${rawKey}`;
  }

  private getKeyPrefix(type: ApiKeyConfig['keyType']): string {
    const prefixes = {
      service: 'ck_svc',
      user: 'ck_usr',
      admin: 'ck_adm',
      system: 'ck_sys'
    };
    return prefixes[type];
  }

  private generateSecureKey(): string {
    return randomBytes(64).toString('hex');
  }

  // ========================================================================
  // Key Validation
  // ========================================================================

  public async validateApiKey(
    apiKey: string,
    requiredPermissions: string[] = [],
    requiredScopes: string[] = [],
    clientInfo?: { ip?: string; userAgent?: string; region?: string }
  ): Promise<ApiKeyValidation> {
    try {
      // Extract raw key from formatted API key
      const rawKey = this.extractRawKey(apiKey);
      if (!rawKey) {
        return this.createValidationResult(false, 'Invalid API key format');
      }

      // Find key by comparing hashes
      const keyData = await this.findKeyByHash(rawKey);
      if (!keyData) {
        return this.createValidationResult(false, 'API key not found');
      }

      // Check if key is active
      if (!keyData.isActive) {
        return this.createValidationResult(false, 'API key is inactive');
      }

      // Check expiration
      if (keyData.config.expiresAt && keyData.config.expiresAt < new Date()) {
        return this.createValidationResult(false, 'API key has expired');
      }

      // Check permissions
      if (!this.hasRequiredPermissions(keyData.config.permissions, requiredPermissions)) {
        return this.createValidationResult(false, 'Insufficient permissions');
      }

      // Check scopes
      if (!this.hasRequiredScopes(keyData.config.scopes, requiredScopes)) {
        return this.createValidationResult(false, 'Insufficient scopes');
      }

      // Check rate limits
      const rateLimitStatus = await this.checkRateLimit(keyData);
      if (!rateLimitStatus.allowed) {
        this.recordMetric(keyData.config.id, 'rateLimitHit');
        return this.createValidationResult(false, 'Rate limit exceeded', keyData, rateLimitStatus);
      }

      // Update usage tracking
      await this.updateUsageTracking(keyData, clientInfo);

      this.emit('key:validated', {
        keyId: keyData.config.id,
        success: true,
        permissions: keyData.config.permissions,
        scopes: keyData.config.scopes
      });

      return this.createValidationResult(
        true,
        undefined,
        keyData,
        rateLimitStatus
      );

    } catch (error) {
      console.error('API key validation error:', error);
      return this.createValidationResult(false, 'Validation error');
    }
  }

  private extractRawKey(apiKey: string): string | null {
    const parts = apiKey.split('_');
    if (parts.length !== 3) return null;
    return parts[2];
  }

  private async findKeyByHash(rawKey: string): Promise<ApiKeyData | null> {
    const targetHash = await this.hashKey(rawKey);

    for (const keyData of this.keys.values()) {
      if (keyData.keyHash === targetHash) {
        return keyData;
      }
    }

    // Check Redis if available
    if (this.redisClient) {
      return await this.findKeyInRedis(targetHash);
    }

    return null;
  }

  private hasRequiredPermissions(keyPermissions: string[], required: string[]): boolean {
    if (required.length === 0) return true;
    if (keyPermissions.includes('*')) return true;
    return required.every(perm => keyPermissions.includes(perm));
  }

  private hasRequiredScopes(keyScopes: string[], required: string[]): boolean {
    if (required.length === 0) return true;
    if (keyScopes.includes('*')) return true;
    return required.every(scope => keyScopes.includes(scope));
  }

  // ========================================================================
  // Rate Limiting
  // ========================================================================

  private async checkRateLimit(keyData: ApiKeyData): Promise<RateLimitStatus> {
    if (!keyData.config.rateLimits) {
      return {
        allowed: true,
        remaining: Number.MAX_SAFE_INTEGER,
        resetTime: new Date(Date.now() + 60000),
        totalRequests: 0
      };
    }

    const limits = keyData.config.rateLimits;
    const now = Date.now();
    const windowStart = Math.floor(now / (limits.windowSizeMs || 60000));
    const cacheKey = `rate_limit:${keyData.config.id}:${windowStart}`;

    let currentCount = this.rateLimitCache.get<number>(cacheKey) || 0;

    // Check against per-minute limit
    if (currentCount >= limits.requestsPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date((windowStart + 1) * (limits.windowSizeMs || 60000)),
        totalRequests: currentCount
      };
    }

    // Increment count
    currentCount++;
    this.rateLimitCache.set(cacheKey, currentCount, Math.ceil((limits.windowSizeMs || 60000) / 1000));

    return {
      allowed: true,
      remaining: limits.requestsPerMinute - currentCount,
      resetTime: new Date((windowStart + 1) * (limits.windowSizeMs || 60000)),
      totalRequests: currentCount
    };
  }

  // ========================================================================
  // Key Management
  // ========================================================================

  public async rotateApiKey(keyId: string, reason: string, rotatedBy: string): Promise<{
    oldKeyId: string;
    newKeyId: string;
    newApiKey: string;
  }> {
    const existingKey = this.keys.get(keyId);
    if (!existingKey) {
      throw new Error(`API key not found: ${keyId}`);
    }

    // Generate new key with same configuration
    const { keyId: newKeyId, apiKey: newApiKey, keyData: newKeyData } =
      await this.generateApiKey(existingKey.config);

    // Add rotation history to new key
    const rotation: KeyRotation = {
      oldKeyId: keyId,
      newKeyId,
      rotatedAt: new Date(),
      reason,
      rotatedBy
    };

    newKeyData.rotationHistory = [...existingKey.rotationHistory, rotation];

    // Deactivate old key
    existingKey.isActive = false;

    this.emit('key:rotated', { oldKeyId: keyId, newKeyId, reason });

    console.log(`🔄 API Key rotated: ${existingKey.config.name} (${keyId} → ${newKeyId})`);

    return { oldKeyId: keyId, newKeyId, newApiKey };
  }

  public async revokeApiKey(keyId: string, reason: string, revokedBy: string): Promise<void> {
    const keyData = this.keys.get(keyId);
    if (!keyData) {
      throw new Error(`API key not found: ${keyId}`);
    }

    keyData.isActive = false;
    keyData.config.metadata = {
      ...keyData.config.metadata,
      revokedAt: new Date(),
      revokedBy,
      revocationReason: reason
    };

    this.emit('key:revoked', { keyId, reason, revokedBy });

    console.log(`❌ API Key revoked: ${keyData.config.name} (${keyId})`);
  }

  public async updateApiKey(keyId: string, updates: Partial<ApiKeyConfig>): Promise<void> {
    const keyData = this.keys.get(keyId);
    if (!keyData) {
      throw new Error(`API key not found: ${keyId}`);
    }

    // Validate updates
    this.validateKeyConfig({ ...keyData.config, ...updates });

    // Apply updates
    keyData.config = { ...keyData.config, ...updates };

    // Persist changes
    if (this.redisClient) {
      await this.persistKeyData(keyId, keyData);
    }

    this.emit('key:updated', { keyId, updates });

    console.log(`🔄 API Key updated: ${keyData.config.name} (${keyId})`);
  }

  // ========================================================================
  // Usage Tracking & Metrics
  // ========================================================================

  private async updateUsageTracking(
    keyData: ApiKeyData,
    clientInfo?: { ip?: string; userAgent?: string; region?: string }
  ): Promise<void> {
    // Update key data
    keyData.lastUsed = new Date();
    keyData.usageCount++;

    // Update metrics
    const metrics = this.usageMetrics.get(keyData.config.id);
    if (metrics) {
      metrics.totalRequests++;
      metrics.lastUsed = new Date();

      if (clientInfo?.region) {
        metrics.geographicUsage[clientInfo.region] =
          (metrics.geographicUsage[clientInfo.region] || 0) + 1;
      }
    }
  }

  private recordMetric(keyId: string, metricType: 'success' | 'failure' | 'rateLimitHit'): void {
    const metrics = this.usageMetrics.get(keyId);
    if (!metrics) return;

    switch (metricType) {
      case 'success':
        metrics.successfulRequests++;
        break;
      case 'failure':
        metrics.failedRequests++;
        break;
      case 'rateLimitHit':
        metrics.rateLimitHits++;
        break;
    }
  }

  public getKeyMetrics(keyId: string): KeyUsageMetrics | null {
    return this.usageMetrics.get(keyId) || null;
  }

  public getAllMetrics(): KeyUsageMetrics[] {
    return Array.from(this.usageMetrics.values());
  }

  // ========================================================================
  // Storage & Persistence
  // ========================================================================

  private async initializeRedis(): Promise<void> {
    if (!this.config.redis) return;

    try {
      this.redisClient = Redis.createClient({
        socket: {
          host: this.config.redis.host,
          port: this.config.redis.port
        },
        ...(this.config.redis.password && { password: this.config.redis.password })
      });

      await this.redisClient.connect();
      console.log('✅ Redis connected for API key storage');

    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
    }
  }

  private async persistKeyData(keyId: string, keyData: ApiKeyData): Promise<void> {
    if (!this.redisClient) return;

    try {
      const encrypted = this.encryptSensitiveData(JSON.stringify(keyData));
      await this.redisClient.setEx(`api_key:${keyId}`, 86400, encrypted); // 24h TTL

    } catch (error) {
      console.error('Failed to persist key data:', error);
    }
  }

  private async findKeyInRedis(targetHash: string): Promise<ApiKeyData | null> {
    if (!this.redisClient) return null;

    try {
      const keys = await this.redisClient.keys('api_key:*');

      for (const redisKey of keys) {
        const encrypted = await this.redisClient.get(redisKey);
        if (!encrypted) continue;

        const decrypted = this.decryptSensitiveData(encrypted);
        const keyData: ApiKeyData = JSON.parse(decrypted);

        if (keyData.keyHash === targetHash) {
          // Cache in memory for faster access
          this.keys.set(keyData.config.id, keyData);
          return keyData;
        }
      }

    } catch (error) {
      console.error('Error searching Redis for key:', error);
    }

    return null;
  }

  // ========================================================================
  // Encryption & Security
  // ========================================================================

  private async hashKey(rawKey: string): Promise<string> {
    return await bcrypt.hash(rawKey, this.defaultSaltRounds);
  }

  private encryptSensitiveData(data: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  private decryptSensitiveData(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // ========================================================================
  // JWT Token Management
  // ========================================================================

  public generateJwtToken(
    payload: Record<string, any>,
    expiresIn: string = '1h'
  ): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn } as jwt.SignOptions);
  }

  public validateJwtToken(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
      const payload = jwt.verify(token, this.jwtSecret);
      return { valid: true, payload };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token'
      };
    }
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  private validateKeyConfig(config: Partial<ApiKeyConfig>): void {
    const schema = Joi.object({
      id: Joi.string(),
      name: Joi.string().required(),
      keyType: Joi.string().valid('service', 'user', 'admin', 'system').required(),
      permissions: Joi.array().items(Joi.string()).required(),
      scopes: Joi.array().items(Joi.string()).required(),
      environment: Joi.string().valid('development', 'staging', 'production').required(),
      expiresAt: Joi.date(),
      rateLimits: Joi.object({
        requestsPerMinute: Joi.number().positive(),
        requestsPerHour: Joi.number().positive(),
        requestsPerDay: Joi.number().positive(),
        burstAllowance: Joi.number().positive(),
        windowSizeMs: Joi.number().positive()
      }),
      metadata: Joi.object(),
      tags: Joi.array().items(Joi.string()),
      createdBy: Joi.string().required(),
      serviceId: Joi.string(),
      userId: Joi.string()
    });

    const { error } = schema.validate(config);
    if (error) {
      throw new Error(`Invalid key configuration: ${error.message}`);
    }
  }

  private createValidationResult(
    isValid: boolean,
    error?: string,
    keyData?: ApiKeyData,
    rateLimitStatus?: RateLimitStatus
  ): ApiKeyValidation {
    return {
      isValid,
      keyData,
      error,
      permissions: keyData?.config.permissions || [],
      scopes: keyData?.config.scopes || [],
      rateLimitStatus: rateLimitStatus || {
        allowed: true,
        remaining: Number.MAX_SAFE_INTEGER,
        resetTime: new Date(),
        totalRequests: 0
      }
    };
  }

  public listApiKeys(filter?: {
    keyType?: ApiKeyConfig['keyType'];
    environment?: string;
    isActive?: boolean;
    createdBy?: string;
  }): ApiKeyData[] {
    const keys = Array.from(this.keys.values());

    if (!filter) return keys;

    return keys.filter(key => {
      if (filter.keyType && key.config.keyType !== filter.keyType) return false;
      if (filter.environment && key.config.environment !== filter.environment) return false;
      if (filter.isActive !== undefined && key.isActive !== filter.isActive) return false;
      if (filter.createdBy && key.config.createdBy !== filter.createdBy) return false;
      return true;
    });
  }

  public async shutdown(): Promise<void> {
    console.log('⏹️ Shutting down ApiKeyManager...');

    if (this.redisClient) {
      await this.redisClient.quit();
    }

    this.keys.clear();
    this.usageMetrics.clear();
    this.rateLimitCache.flushAll();

    console.log('✅ ApiKeyManager shutdown complete');
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function createDefaultRateLimit(type: ApiKeyConfig['keyType']): RateLimitConfig {
  const limits = {
    service: { requestsPerMinute: 1000, requestsPerHour: 10000, requestsPerDay: 100000 },
    user: { requestsPerMinute: 100, requestsPerHour: 1000, requestsPerDay: 10000 },
    admin: { requestsPerMinute: 500, requestsPerHour: 5000, requestsPerDay: 50000 },
    system: { requestsPerMinute: 10000, requestsPerHour: 100000, requestsPerDay: 1000000 }
  };

  return {
    ...limits[type],
    burstAllowance: Math.floor(limits[type].requestsPerMinute * 0.1),
    windowSizeMs: 60000 // 1 minute
  };
}

export function generateKeyId(prefix: string = 'key'): string {
  return `${prefix}_${Date.now()}_${randomBytes(8).toString('hex')}`;
}

// ============================================================================
// Error Classes
// ============================================================================

export class ApiKeyError extends Error {
  constructor(
    public code: string,
    message: string,
    public keyId?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiKeyError';
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default ApiKeyManager;
