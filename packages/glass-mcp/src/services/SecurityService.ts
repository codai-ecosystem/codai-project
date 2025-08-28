import crypto from 'crypto';
import { EventEmitter } from 'events';
import {
    SecurityModule,
    AuthenticationConfig,
    AuthProvider,
    AuthorizationConfig,
    Role,
    Permission,
    AuditConfig,
    AuditCategory,
    EncryptionConfig,
    KeyManagementConfig,
    RateLimitConfig,
    PasswordPolicy
} from '../types/index.js';

/**
 * Comprehensive Security Service for ControlAI MCP
 * Provides enterprise-grade authentication, authorization, auditing, and encryption
 */
export class SecurityService extends EventEmitter {
    private config: SecurityModule;
    private auditLog: AuditEvent[] = [];
    private rateLimitMap: Map<string, RateLimitEntry> = new Map();
    private encryptionKey: string;
    private failedLoginAttempts: Map<string, LoginAttemptEntry> = new Map();

    constructor(config?: Partial<SecurityModule>) {
        super();

        this.config = {
            authentication: {
                providers: [
                    {
                        name: 'local',
                        type: 'local',
                        config: {},
                        enabled: true,
                        priority: 1
                    }
                ],
                sessionTimeout: 480, // 8 hours
                maxFailedAttempts: 5,
                lockoutDuration: 30, // 30 minutes
                requireMFA: false,
                passwordPolicy: {
                    minLength: 8,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireSpecialChars: true,
                    preventReuse: 5
                }
            },
            authorization: {
                rbacEnabled: true,
                roles: [
                    {
                        id: 'admin',
                        name: 'Administrator',
                        description: 'Full system access',
                        permissions: ['*'],
                        inheritsFrom: [],
                        isSystem: true
                    },
                    {
                        id: 'user',
                        name: 'User',
                        description: 'Standard user access',
                        permissions: ['read', 'execute'],
                        inheritsFrom: [],
                        isSystem: true
                    }
                ],
                permissions: [
                    {
                        id: 'read',
                        name: 'Read',
                        description: 'Read access to resources',
                        resource: '*',
                        action: 'read'
                    },
                    {
                        id: 'write',
                        name: 'Write',
                        description: 'Write access to resources',
                        resource: '*',
                        action: 'write'
                    },
                    {
                        id: 'execute',
                        name: 'Execute',
                        description: 'Execute actions',
                        resource: '*',
                        action: 'execute'
                    }
                ],
                defaultRole: 'user',
                inheritanceEnabled: true
            },
            auditLogging: {
                enabled: true,
                retentionDays: 90,
                categories: [
                    {
                        name: 'authentication',
                        enabled: true,
                        logLevel: 'info',
                        includePayload: false
                    },
                    {
                        name: 'authorization',
                        enabled: true,
                        logLevel: 'warn',
                        includePayload: false
                    },
                    {
                        name: 'data_access',
                        enabled: true,
                        logLevel: 'info',
                        includePayload: true
                    }
                ],
                realTimeAlerts: true,
                exportFormats: ['json', 'csv']
            },
            dataEncryption: {
                algorithm: 'aes-256-gcm',
                keySize: 256,
                rotationInterval: 90,
                encryptAtRest: true,
                encryptInTransit: true,
                keyManagement: {
                    provider: 'local',
                    config: {},
                    backupEnabled: true
                }
            },
            rateAbusePrevention: {
                enabled: true,
                windowMs: 60000, // 1 minute
                maxRequests: 100,
                skipSuccessfulRequests: false,
                skipFailedRequests: false
            },
            ...config
        };

        this.encryptionKey = this.generateEncryptionKey();
        this.setupCleanupTasks();
    }

    /**
     * Authentication Methods
     */
    async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
        const startTime = Date.now();

        try {
            // Check rate limiting
            if (!this.checkRateLimit(credentials.identifier)) {
                await this.auditLog.push({
                    timestamp: new Date(),
                    category: 'authentication',
                    action: 'login_rate_limited',
                    userId: credentials.identifier,
                    success: false,
                    details: { reason: 'Rate limit exceeded' }
                });

                return {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.',
                    token: null,
                    user: null
                };
            }

            // Check account lockout
            if (this.isAccountLocked(credentials.identifier)) {
                await this.auditEvent('authentication', 'login_blocked', credentials.identifier, false, {
                    reason: 'Account locked due to failed attempts'
                });

                return {
                    success: false,
                    error: 'Account is temporarily locked due to multiple failed login attempts.',
                    token: null,
                    user: null
                };
            }

            // Validate credentials
            const user = await this.validateCredentials(credentials);

            if (!user) {
                await this.recordFailedLogin(credentials.identifier);
                await this.auditEvent('authentication', 'login_failed', credentials.identifier, false, {
                    reason: 'Invalid credentials'
                });

                return {
                    success: false,
                    error: 'Invalid credentials.',
                    token: null,
                    user: null
                };
            }

            // Generate JWT token
            const token = this.generateJWT(user);

            // Clear failed login attempts
            this.failedLoginAttempts.delete(credentials.identifier);

            await this.auditEvent('authentication', 'login_success', user.id, true, {
                loginDuration: Date.now() - startTime,
                userAgent: credentials.userAgent
            });

            return {
                success: true,
                error: null,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles,
                    permissions: await this.getUserPermissions(user.roles)
                }
            };

        } catch (error) {
            await this.auditEvent('authentication', 'login_error', credentials.identifier, false, {
                error: (error as Error).message
            });

            return {
                success: false,
                error: 'Authentication failed due to system error.',
                token: null,
                user: null
            };
        }
    }

    async validateToken(token: string): Promise<TokenValidationResult> {
        try {
            const decoded = this.verifyJWT(token);

            // Check if token is expired
            if (decoded.exp && decoded.exp < Date.now() / 1000) {
                return {
                    valid: false,
                    error: 'Token expired',
                    user: null
                };
            }

            // Get user permissions
            const permissions = await this.getUserPermissions(decoded.roles);

            return {
                valid: true,
                error: null,
                user: {
                    id: decoded.userId,
                    name: decoded.name,
                    email: decoded.email,
                    roles: decoded.roles,
                    permissions
                }
            };

        } catch (error) {
            return {
                valid: false,
                error: 'Invalid token',
                user: null
            };
        }
    }

    /**
     * Authorization Methods
     */
    async authorize(user: UserInfo, resource: string, action: string): Promise<AuthorizationResult> {
        try {
            if (!this.config.authorization.rbacEnabled) {
                return { authorized: true, reason: 'RBAC disabled' };
            }

            // Check if user has wildcard permission
            if (user.permissions.includes('*')) {
                await this.auditEvent('authorization', 'access_granted', user.id, true, {
                    resource,
                    action,
                    reason: 'Wildcard permission'
                });
                return { authorized: true, reason: 'Wildcard permission' };
            }

            // Check specific permissions
            const requiredPermission = `${resource}:${action}`;
            const hasPermission = user.permissions.some(permission =>
                permission === requiredPermission ||
                permission === `${resource}:*` ||
                permission === `*:${action}`
            );

            if (hasPermission) {
                await this.auditEvent('authorization', 'access_granted', user.id, true, {
                    resource,
                    action,
                    permission: requiredPermission
                });
                return { authorized: true, reason: 'Permission granted' };
            }

            await this.auditEvent('authorization', 'access_denied', user.id, false, {
                resource,
                action,
                requiredPermission,
                userPermissions: user.permissions
            });

            return {
                authorized: false,
                reason: `Insufficient permissions for ${resource}:${action}`
            };

        } catch (error) {
            await this.auditEvent('authorization', 'access_error', user.id, false, {
                resource,
                action,
                error: (error as Error).message
            });

            return {
                authorized: false,
                reason: 'Authorization check failed'
            };
        }
    }

    /**
     * Data Encryption Methods
     */
    encrypt(data: string): EncryptionResult {
        try {
            const iv = crypto.randomBytes(16);
            const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

            let encrypted = cipher.update(data, 'utf8', 'base64');
            encrypted += cipher.final('base64');

            const authTag = cipher.getAuthTag();

            return {
                success: true,
                encryptedData: encrypted,
                iv: iv.toString('base64'),
                authTag: authTag.toString('base64'),
                error: null
            };

        } catch (error) {
            return {
                success: false,
                encryptedData: null,
                iv: null,
                authTag: null,
                error: (error as Error).message
            };
        }
    }

    decrypt(encryptedData: string, ivString: string, authTagString?: string): DecryptionResult {
        try {
            const iv = Buffer.from(ivString, 'base64');
            const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

            if (authTagString) {
                const authTag = Buffer.from(authTagString, 'base64');
                decipher.setAuthTag(authTag);
            }

            let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
            decrypted += decipher.final('utf8');

            return {
                success: true,
                decryptedData: decrypted,
                error: null
            };

        } catch (error) {
            return {
                success: false,
                decryptedData: null,
                error: (error as Error).message
            };
        }
    }

    /**
     * Audit Logging Methods
     */
    private async auditEvent(
        category: string,
        action: string,
        userId: string,
        success: boolean,
        details?: any
    ): Promise<void> {
        const event: AuditEvent = {
            timestamp: new Date(),
            category,
            action,
            userId,
            success,
            details
        };

        this.auditLog.push(event);

        // Emit real-time alert if enabled
        if (this.config.auditLogging.realTimeAlerts) {
            this.emit('auditEvent', event);
        }

        // Check for suspicious activity
        if (!success) {
            await this.checkSuspiciousActivity(userId, action);
        }
    }

    async getAuditLogs(filters?: AuditFilters): Promise<AuditEvent[]> {
        let logs = [...this.auditLog];

        if (filters) {
            if (filters.category) {
                logs = logs.filter(log => log.category === filters.category);
            }
            if (filters.userId) {
                logs = logs.filter(log => log.userId === filters.userId);
            }
            if (filters.startDate) {
                logs = logs.filter(log => log.timestamp >= filters.startDate!);
            }
            if (filters.endDate) {
                logs = logs.filter(log => log.timestamp <= filters.endDate!);
            }
            if (filters.success !== undefined) {
                logs = logs.filter(log => log.success === filters.success);
            }
        }

        return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    /**
     * Security Health Check
     */
    async securityHealthCheck(): Promise<SecurityHealthReport> {
        const report: SecurityHealthReport = {
            timestamp: new Date(),
            overallScore: 0,
            issues: [],
            recommendations: [],
            metrics: {
                totalAuditEvents: this.auditLog.length,
                failedLogins: this.auditLog.filter(e => e.action === 'login_failed').length,
                lockedAccounts: this.failedLoginAttempts.size,
                rateLimitViolations: this.auditLog.filter(e => e.action === 'login_rate_limited').length
            }
        };

        // Check for security issues
        const recentFailures = this.auditLog.filter(e =>
            !e.success &&
            e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (recentFailures.length > 10) {
            report.issues.push({
                severity: 'high',
                type: 'authentication',
                description: `High number of authentication failures (${recentFailures.length}) in the last 24 hours`,
                recommendation: 'Review authentication logs and consider implementing additional security measures'
            });
        }

        // Calculate overall security score
        let score = 100;
        score -= Math.min(recentFailures.length * 2, 40);
        score -= this.failedLoginAttempts.size * 5;

        report.overallScore = Math.max(0, score);

        if (report.overallScore < 70) {
            report.recommendations.push('Review security configuration and monitoring');
        }

        return report;
    }

    /**
     * Private Helper Methods
     */
    private checkRateLimit(identifier: string): boolean {
        const now = Date.now();
        const entry = this.rateLimitMap.get(identifier);

        if (!entry) {
            this.rateLimitMap.set(identifier, {
                count: 1,
                resetTime: now + this.config.rateAbusePrevention.windowMs
            });
            return true;
        }

        if (now > entry.resetTime) {
            entry.count = 1;
            entry.resetTime = now + this.config.rateAbusePrevention.windowMs;
            return true;
        }

        entry.count++;
        return entry.count <= this.config.rateAbusePrevention.maxRequests;
    }

    private isAccountLocked(identifier: string): boolean {
        const entry = this.failedLoginAttempts.get(identifier);

        if (!entry) return false;

        const now = Date.now();
        return entry.count >= this.config.authentication.maxFailedAttempts &&
            now < entry.lockoutUntil;
    }

    private async recordFailedLogin(identifier: string): Promise<void> {
        const entry = this.failedLoginAttempts.get(identifier) || { count: 0, lockoutUntil: 0 };

        entry.count++;

        if (entry.count >= this.config.authentication.maxFailedAttempts) {
            entry.lockoutUntil = Date.now() + (this.config.authentication.lockoutDuration * 60 * 1000);
        }

        this.failedLoginAttempts.set(identifier, entry);
    }

    private async validateCredentials(credentials: AuthCredentials): Promise<UserRecord | null> {
        // Simplified validation - in production, this would check against a user database
        if (credentials.identifier === 'admin' && credentials.password === 'admin123') {
            return {
                id: 'admin-user',
                name: 'Administrator',
                email: 'admin@controlai.com',
                roles: ['admin'],
                hashedPassword: await this.hashPassword('admin123')
            };
        }

        return null;
    }

    private generateJWT(user: UserRecord): string {
        const payload: JWTPayload = {
            userId: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (this.config.authentication.sessionTimeout * 60)
        };

        return this.signJWT(payload);
    }

    private signJWT(payload: JWTPayload): string {
        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

        const signature = crypto
            .createHmac('sha256', this.getJWTSecret())
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64url');

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    private verifyJWT(token: string): JWTPayload {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }

        const [encodedHeader, encodedPayload, signature] = parts;

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', this.getJWTSecret())
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64url');

        if (signature !== expectedSignature) {
            throw new Error('Invalid token signature');
        }

        // Decode payload
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
        return payload as JWTPayload;
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(password, salt, 64).toString('hex');
        return `${salt}:${hash}`;
    }

    private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        const [salt, hash] = hashedPassword.split(':');
        const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
        return hash === verifyHash;
    }

    private getJWTSecret(): string {
        return process.env.JWT_SECRET || 'controlai-mcp-default-secret-change-in-production';
    }

    private async getUserPermissions(roles: string[]): Promise<string[]> {
        const permissions = new Set<string>();

        for (const roleName of roles) {
            const role = this.config.authorization.roles.find(r => r.id === roleName);
            if (role) {
                role.permissions.forEach(permission => permissions.add(permission));
            }
        }

        return Array.from(permissions);
    }

    private generateEncryptionKey(): string {
        return process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    }

    private async checkSuspiciousActivity(userId: string, action: string): Promise<void> {
        const recentFailures = this.auditLog.filter(e =>
            e.userId === userId &&
            !e.success &&
            e.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
        );

        if (recentFailures.length >= 5) {
            this.emit('suspiciousActivity', {
                userId,
                action,
                failureCount: recentFailures.length,
                timeWindow: '1 hour'
            });
        }
    }

    private setupCleanupTasks(): void {
        // Clean up old audit logs
        setInterval(() => {
            const cutoffDate = new Date(Date.now() - (this.config.auditLogging.retentionDays * 24 * 60 * 60 * 1000));
            this.auditLog = this.auditLog.filter(log => log.timestamp > cutoffDate);
        }, 24 * 60 * 60 * 1000); // Daily cleanup

        // Clean up rate limit entries
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.rateLimitMap.entries()) {
                if (now > entry.resetTime) {
                    this.rateLimitMap.delete(key);
                }
            }
        }, 60 * 1000); // Every minute
    }
}

// Type definitions
interface AuthCredentials {
    identifier: string;
    password: string;
    userAgent?: string;
}

interface AuthResult {
    success: boolean;
    error: string | null;
    token: string | null;
    user: UserInfo | null;
}

interface TokenValidationResult {
    valid: boolean;
    error: string | null;
    user: UserInfo | null;
}

interface UserInfo {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
}

interface UserRecord {
    id: string;
    name: string;
    email: string;
    roles: string[];
    hashedPassword: string;
}

interface JWTPayload {
    userId: string;
    name: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
}

interface AuthorizationResult {
    authorized: boolean;
    reason: string;
}

interface EncryptionResult {
    success: boolean;
    encryptedData: string | null;
    iv: string | null;
    authTag: string | null;
    error: string | null;
}

interface DecryptionResult {
    success: boolean;
    decryptedData: string | null;
    error: string | null;
}

interface AuditEvent {
    timestamp: Date;
    category: string;
    action: string;
    userId: string;
    success: boolean;
    details?: any;
}

interface AuditFilters {
    category?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface LoginAttemptEntry {
    count: number;
    lockoutUntil: number;
}

interface SecurityHealthReport {
    timestamp: Date;
    overallScore: number;
    issues: SecurityIssue[];
    recommendations: string[];
    metrics: SecurityMetrics;
}

interface SecurityIssue {
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    description: string;
    recommendation: string;
}

interface SecurityMetrics {
    totalAuditEvents: number;
    failedLogins: number;
    lockedAccounts: number;
    rateLimitViolations: number;
}
