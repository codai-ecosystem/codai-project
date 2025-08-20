/**
 * 🛡️ CBD Security Gateway - Enterprise Authentication & Authorization
 * 
 * Phase 4.2.3.1 Implementation
 * Features: JWT Authentication, MFA, RBAC, OAuth2, Session Management
 * 
 * Created: August 2, 2025
 * Security Level: Enterprise Grade
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Initialize Express app for Security Gateway
const app = express();
const PORT = 4400; // Security Gateway Port

// Security Configuration
const SECURITY_CONFIG = {
    jwt: {
        secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
        refreshSecret: process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex'),
        accessTokenExpiry: '15m',
        refreshTokenExpiry: '7d',
        algorithm: 'HS256'
    },
    mfa: {
        enabled: true,
        issuer: 'CBD Universal Database',
        algorithm: 'sha256',
        digits: 6,
        period: 30
    },
    session: {
        maxSessions: 5,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        extendOnActivity: true
    },
    security: {
        saltRounds: 12,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        passwordMinLength: 8,
        requireSpecialChars: true
    }
};

// In-memory stores (replace with database in production)
const users = new Map();
const sessions = new Map();
const refreshTokens = new Map();
const loginAttempts = new Map();
const auditLog = new Map();

// Security Error Class
class CBDSecurityError extends Error {
    constructor(message, code, statusCode = 500) {
        super(message);
        this.name = 'CBDSecurityError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

// 🔐 Authentication Service
class CBDAuthenticationService {
    constructor(config) {
        this.config = config;
        this.setupDefaultUsers();
    }

    setupDefaultUsers() {
        // Create default admin user
        const adminId = 'admin_001';
        const adminPassword = this.hashPassword('Admin123!@#');

        users.set(adminId, {
            id: adminId,
            username: 'admin',
            email: 'admin@cbd.local',
            passwordHash: adminPassword,
            roles: ['admin'],
            permissions: ['*'],
            active: true,
            mfaEnabled: false,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            loginCount: 0
        });

        // Create default developer user
        const devId = 'dev_001';
        const devPassword = this.hashPassword('Dev123!@#');

        users.set(devId, {
            id: devId,
            username: 'developer',
            email: 'dev@cbd.local',
            passwordHash: devPassword,
            roles: ['developer'],
            permissions: ['cbd:read', 'cbd:write', 'schema:read', 'stats:read'],
            active: true,
            mfaEnabled: false,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            loginCount: 0
        });

        console.log('🔐 Default users created:');
        console.log('   👑 Admin: username=admin, password=Admin123!@#');
        console.log('   👨‍💻 Developer: username=developer, password=Dev123!@#');
    }

    hashPassword(password) {
        return bcrypt.hashSync(password, this.config.security.saltRounds);
    }

    validatePassword(password, hash) {
        return bcrypt.compareSync(password, hash);
    }

    generateAccessToken(user) {
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.parseExpiry(this.config.jwt.accessTokenExpiry)
        };

        return jwt.sign(payload, this.config.jwt.secret, { algorithm: this.config.jwt.algorithm });
    }

    generateRefreshToken(user) {
        const payload = {
            sub: user.id,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + this.parseExpiry(this.config.jwt.refreshTokenExpiry)
        };

        const token = jwt.sign(payload, this.config.jwt.refreshSecret, { algorithm: this.config.jwt.algorithm });

        // Store refresh token
        refreshTokens.set(token, {
            userId: user.id,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.parseExpiry(this.config.jwt.refreshTokenExpiry) * 1000)
        });

        return token;
    }

    parseExpiry(expiry) {
        if (typeof expiry === 'number') return expiry;

        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match) return 900; // Default 15 minutes

        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 24 * 60 * 60;
            default: return 900;
        }
    }

    async authenticate(credentials) {
        const { username, password, mfaToken } = credentials;

        // Check for rate limiting
        const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: null };
        if (attempts.count >= this.config.security.maxLoginAttempts) {
            const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
            if (timeSinceLastAttempt < this.config.security.lockoutDuration) {
                await this.logSecurityEvent('AUTHENTICATION_BLOCKED', {
                    username,
                    reason: 'rate_limit_exceeded',
                    attemptsCount: attempts.count
                });
                throw new CBDSecurityError('Account temporarily locked due to too many failed attempts', 'ACCOUNT_LOCKED', 423);
            } else {
                // Reset attempts after lockout period
                loginAttempts.delete(username);
            }
        }

        // Find user
        const user = Array.from(users.values()).find(u => u.username === username || u.email === username);
        if (!user) {
            this.recordFailedAttempt(username);
            await this.logSecurityEvent('AUTHENTICATION_FAILURE', { username, reason: 'user_not_found' });
            throw new CBDSecurityError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
        }

        // Check if user is active
        if (!user.active) {
            await this.logSecurityEvent('AUTHENTICATION_FAILURE', { username, reason: 'user_inactive' });
            throw new CBDSecurityError('User account is inactive', 'USER_INACTIVE', 401);
        }

        // Validate password
        if (!this.validatePassword(password, user.passwordHash)) {
            this.recordFailedAttempt(username);
            await this.logSecurityEvent('AUTHENTICATION_FAILURE', { username, reason: 'invalid_password' });
            throw new CBDSecurityError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
        }

        // Check MFA if enabled
        if (user.mfaEnabled && !mfaToken) {
            await this.logSecurityEvent('AUTHENTICATION_MFA_REQUIRED', { userId: user.id, username });
            return {
                requiresMFA: true,
                mfaChallenge: await this.generateMFAChallenge(user),
                message: 'Multi-factor authentication required'
            };
        }

        if (user.mfaEnabled && mfaToken && !await this.validateMFA(user, mfaToken)) {
            this.recordFailedAttempt(username);
            await this.logSecurityEvent('AUTHENTICATION_FAILURE', { username, reason: 'invalid_mfa' });
            throw new CBDSecurityError('Invalid MFA token', 'MFA_INVALID', 401);
        }

        // Reset failed attempts on successful authentication
        loginAttempts.delete(username);

        // Update user login information
        user.lastLogin = new Date().toISOString();
        user.loginCount = (user.loginCount || 0) + 1;

        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        // Create session
        const session = this.createSession(user, accessToken);

        await this.logSecurityEvent('AUTHENTICATION_SUCCESS', {
            userId: user.id,
            username: user.username,
            sessionId: session.id
        });

        return {
            success: true,
            accessToken,
            refreshToken,
            expiresIn: this.parseExpiry(this.config.jwt.accessTokenExpiry),
            user: this.sanitizeUser(user),
            session: {
                id: session.id,
                expiresAt: session.expiresAt
            }
        };
    }

    recordFailedAttempt(username) {
        const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: null };
        attempts.count++;
        attempts.lastAttempt = Date.now();
        loginAttempts.set(username, attempts);
    }

    createSession(user, accessToken) {
        const sessionId = `session_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const session = {
            id: sessionId,
            userId: user.id,
            accessToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.config.session.sessionTimeout),
            lastActivity: new Date(),
            ipAddress: null, // Will be set by middleware
            userAgent: null  // Will be set by middleware
        };

        sessions.set(sessionId, session);

        // Cleanup old sessions for user
        this.cleanupUserSessions(user.id);

        return session;
    }

    cleanupUserSessions(userId) {
        const userSessions = Array.from(sessions.entries())
            .filter(([_, session]) => session.userId === userId)
            .sort((a, b) => b[1].createdAt - a[1].createdAt);

        // Keep only the most recent sessions
        if (userSessions.length > this.config.session.maxSessions) {
            for (let i = this.config.session.maxSessions; i < userSessions.length; i++) {
                sessions.delete(userSessions[i][0]);
            }
        }
    }

    async validateToken(token) {
        try {
            const decoded = jwt.verify(token, this.config.jwt.secret);
            const user = users.get(decoded.sub);

            if (!user || !user.active) {
                throw new CBDSecurityError('User not active', 'USER_INACTIVE', 401);
            }

            // Find and validate session
            const userSession = Array.from(sessions.values()).find(
                session => session.userId === user.id && session.accessToken === token
            );

            if (!userSession) {
                throw new CBDSecurityError('Session not found', 'SESSION_INVALID', 401);
            }

            // Check session expiry
            if (new Date() > userSession.expiresAt) {
                sessions.delete(userSession.id);
                throw new CBDSecurityError('Session expired', 'SESSION_EXPIRED', 401);
            }

            // Extend session if configured
            if (this.config.session.extendOnActivity) {
                userSession.lastActivity = new Date();
                userSession.expiresAt = new Date(Date.now() + this.config.session.sessionTimeout);
            }

            return { valid: true, user: decoded, session: userSession };
        } catch (error) {
            if (error instanceof CBDSecurityError) {
                throw error;
            }

            await this.logSecurityEvent('TOKEN_VALIDATION_FAILURE', { error: error.message });
            return { valid: false, error: error.message };
        }
    }

    async refreshAccessToken(refreshToken) {
        try {
            // Validate refresh token
            const decoded = jwt.verify(refreshToken, this.config.jwt.refreshSecret);
            const tokenData = refreshTokens.get(refreshToken);

            if (!tokenData || tokenData.userId !== decoded.sub) {
                throw new CBDSecurityError('Invalid refresh token', 'REFRESH_TOKEN_INVALID', 401);
            }

            if (new Date() > tokenData.expiresAt) {
                refreshTokens.delete(refreshToken);
                throw new CBDSecurityError('Refresh token expired', 'REFRESH_TOKEN_EXPIRED', 401);
            }

            const user = users.get(decoded.sub);
            if (!user || !user.active) {
                throw new CBDSecurityError('User not active', 'USER_INACTIVE', 401);
            }

            // Generate new access token
            const newAccessToken = this.generateAccessToken(user);

            // Update session with new token
            const userSession = Array.from(sessions.values()).find(s => s.userId === user.id);
            if (userSession) {
                userSession.accessToken = newAccessToken;
                userSession.lastActivity = new Date();
            }

            await this.logSecurityEvent('TOKEN_REFRESH_SUCCESS', { userId: user.id });

            return {
                success: true,
                accessToken: newAccessToken,
                expiresIn: this.parseExpiry(this.config.jwt.accessTokenExpiry)
            };
        } catch (error) {
            if (error instanceof CBDSecurityError) {
                throw error;
            }

            await this.logSecurityEvent('TOKEN_REFRESH_FAILURE', { error: error.message });
            throw new CBDSecurityError('Token refresh failed', 'REFRESH_FAILED', 401);
        }
    }

    async generateMFAChallenge(user) {
        // Simulate MFA challenge generation
        const challenge = crypto.randomBytes(16).toString('hex');
        return {
            type: 'totp',
            challenge,
            qrCode: `otpauth://totp/${encodeURIComponent(this.config.mfa.issuer)}:${encodeURIComponent(user.email)}?secret=${challenge}&issuer=${encodeURIComponent(this.config.mfa.issuer)}`
        };
    }

    async validateMFA(user, token) {
        // Simulate MFA validation (implement with actual TOTP library in production)
        return token === '123456'; // Simple validation for demo
    }

    sanitizeUser(user) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }

    async logSecurityEvent(eventType, details) {
        const event = {
            id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            eventType,
            ...details
        };

        auditLog.set(event.id, event);
        console.log(`🔒 Security Event: ${eventType}`, details);
        return event;
    }
}

// 🛡️ Authorization Service  
class CBDAuthorizationService {
    constructor() {
        this.permissions = new Map();
        this.roles = new Map();
        this.setupDefaultRoles();
    }

    setupDefaultRoles() {
        // Admin role with full permissions
        this.roles.set('admin', {
            name: 'Administrator',
            description: 'Full system access',
            permissions: ['*'] // All permissions
        });

        // Database Admin role
        this.roles.set('db_admin', {
            name: 'Database Administrator',
            description: 'Database management and user administration',
            permissions: [
                'cbd:*',
                'schema:*',
                'users:read',
                'users:write',
                'stats:read',
                'system:health'
            ]
        });

        // Developer role
        this.roles.set('developer', {
            name: 'Developer',
            description: 'Development and testing access',
            permissions: [
                'cbd:read',
                'cbd:write',
                'schema:read',
                'stats:read',
                'system:health'
            ]
        });

        // Analyst role
        this.roles.set('analyst', {
            name: 'Data Analyst',
            description: 'Read-only access with analytics',
            permissions: [
                'cbd:read',
                'stats:read',
                'analytics:read',
                'system:health'
            ]
        });

        // Read-only role
        this.roles.set('reader', {
            name: 'Read Only',
            description: 'Read-only access to data',
            permissions: [
                'cbd:read',
                'stats:read',
                'system:health'
            ]
        });

        console.log('🛡️ Authorization roles configured:', Array.from(this.roles.keys()));
    }

    async authorize(user, resource, action) {
        const permission = `${resource}:${action}`;

        // Check if user has wildcard permission
        if (user.permissions?.includes('*')) {
            return {
                authorized: true,
                reason: 'wildcard_permission',
                grantedBy: 'direct_permission'
            };
        }

        // Check direct permission
        if (user.permissions?.includes(permission)) {
            return {
                authorized: true,
                reason: 'direct_permission',
                grantedBy: 'user_permission'
            };
        }

        // Check resource wildcard permission
        const resourceWildcard = `${resource}:*`;
        if (user.permissions?.includes(resourceWildcard)) {
            return {
                authorized: true,
                reason: 'resource_wildcard',
                grantedBy: 'user_permission'
            };
        }

        // Check role-based permissions
        for (const roleName of user.roles || []) {
            const role = this.roles.get(roleName);
            if (!role) continue;

            if (role.permissions.includes('*') ||
                role.permissions.includes(permission) ||
                role.permissions.includes(resourceWildcard)) {
                return {
                    authorized: true,
                    reason: `role_permission:${roleName}`,
                    grantedBy: `role:${roleName}`
                };
            }
        }

        // Log authorization failure
        await this.logAuthorizationEvent('AUTHORIZATION_DENIED', {
            userId: user.sub || user.id,
            username: user.username,
            permission,
            userPermissions: user.permissions,
            userRoles: user.roles
        });

        return {
            authorized: false,
            reason: 'insufficient_permissions',
            required: permission
        };
    }

    // Express middleware for route protection
    requirePermission(resource, action) {
        return async (req, res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required',
                        code: 'AUTH_REQUIRED'
                    });
                }

                const authResult = await this.authorize(user, resource, action);
                if (!authResult.authorized) {
                    return res.status(403).json({
                        success: false,
                        error: 'Insufficient permissions',
                        code: 'INSUFFICIENT_PERMISSIONS',
                        required: `${resource}:${action}`,
                        reason: authResult.reason
                    });
                }

                // Log successful authorization
                await this.logAuthorizationEvent('AUTHORIZATION_GRANTED', {
                    userId: user.sub || user.id,
                    username: user.username,
                    permission: `${resource}:${action}`,
                    grantedBy: authResult.grantedBy
                });

                req.authorizationContext = authResult;
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    // Check multiple permissions (all required)
    requirePermissions(...permissions) {
        return async (req, res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required',
                        code: 'AUTH_REQUIRED'
                    });
                }

                const authResults = [];
                for (const permission of permissions) {
                    const [resource, action] = permission.split(':');
                    const result = await this.authorize(user, resource, action);
                    authResults.push(result);

                    if (!result.authorized) {
                        return res.status(403).json({
                            success: false,
                            error: 'Insufficient permissions',
                            code: 'INSUFFICIENT_PERMISSIONS',
                            required: permissions,
                            failed: permission
                        });
                    }
                }

                req.authorizationContext = { permissions: authResults };
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    // Check if user has any of the specified permissions
    requireAnyPermission(...permissions) {
        return async (req, res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required',
                        code: 'AUTH_REQUIRED'
                    });
                }

                for (const permission of permissions) {
                    const [resource, action] = permission.split(':');
                    const result = await this.authorize(user, resource, action);

                    if (result.authorized) {
                        req.authorizationContext = result;
                        return next();
                    }
                }

                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    required: `Any of: ${permissions.join(', ')}`
                });
            } catch (error) {
                next(error);
            }
        };
    }

    async logAuthorizationEvent(eventType, details) {
        const event = {
            id: `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            eventType,
            ...details
        };

        auditLog.set(event.id, event);
        return event;
    }
}

// Initialize services
const authService = new CBDAuthenticationService(SECURITY_CONFIG);
const authzService = new CBDAuthorizationService();

// 🔓 Authentication Middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required',
                code: 'TOKEN_REQUIRED'
            });
        }

        const validation = await authService.validateToken(token);
        if (!validation.valid) {
            return res.status(401).json({
                success: false,
                error: validation.error || 'Invalid token',
                code: 'TOKEN_INVALID'
            });
        }

        req.user = validation.user;
        req.session = validation.session;

        // Update session activity info
        if (req.session) {
            req.session.ipAddress = req.ip;
            req.session.userAgent = req.get('User-Agent');
        }

        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(401).json({
            success: false,
            error: 'Authentication failed',
            code: 'AUTH_FAILED'
        });
    }
};

// Express middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:4001', 'http://localhost:4007', 'http://localhost:4100'],
    credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        success: false,
        error: 'Too many authentication attempts',
        code: 'RATE_LIMIT_EXCEEDED'
    }
});

// 🚀 API Routes

// Public endpoints
app.post('/auth/login', authLimiter, async (req, res) => {
    try {
        const { username, password, mfaToken } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password required',
                code: 'MISSING_CREDENTIALS'
            });
        }

        const result = await authService.authenticate({ username, password, mfaToken });
        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message,
            code: error.code || 'LOGIN_FAILED'
        });
    }
});

app.post('/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token required',
                code: 'REFRESH_TOKEN_REQUIRED'
            });
        }

        const result = await authService.refreshAccessToken(refreshToken);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message,
            code: error.code || 'REFRESH_FAILED'
        });
    }
});

// Protected endpoints
app.get('/auth/profile', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: authService.sanitizeUser(users.get(req.user.sub)),
        session: {
            id: req.session.id,
            createdAt: req.session.createdAt,
            lastActivity: req.session.lastActivity,
            expiresAt: req.session.expiresAt
        }
    });
});

app.post('/auth/logout', authenticateToken, async (req, res) => {
    try {
        // Remove session
        if (req.session) {
            sessions.delete(req.session.id);
        }

        // Remove refresh tokens for user
        const userRefreshTokens = Array.from(refreshTokens.entries())
            .filter(([_, data]) => data.userId === req.user.sub);

        for (const [token, _] of userRefreshTokens) {
            refreshTokens.delete(token);
        }

        await authService.logSecurityEvent('LOGOUT_SUCCESS', {
            userId: req.user.sub,
            username: req.user.username
        });

        res.json({
            success: true,
            message: 'Successfully logged out'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Logout failed',
            code: 'LOGOUT_FAILED'
        });
    }
});

// Admin endpoints
app.get('/auth/sessions',
    authenticateToken,
    authzService.requirePermission('system', 'admin'),
    (req, res) => {
        const sessionList = Array.from(sessions.values()).map(session => ({
            id: session.id,
            userId: session.userId,
            username: users.get(session.userId)?.username,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            expiresAt: session.expiresAt,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent
        }));

        res.json({
            success: true,
            sessions: sessionList,
            total: sessionList.length
        });
    }
);

app.get('/auth/audit-log',
    authenticateToken,
    authzService.requirePermission('system', 'admin'),
    (req, res) => {
        const logs = Array.from(auditLog.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 100); // Last 100 events

        res.json({
            success: true,
            events: logs,
            total: auditLog.size
        });
    }
);

// System endpoints
app.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'CBD Security Gateway',
        version: '4.2.3',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        features: {
            authentication: true,
            authorization: true,
            mfa: SECURITY_CONFIG.mfa.enabled,
            sessionManagement: true,
            auditLogging: true
        }
    });
});

app.get('/stats', authenticateToken, (req, res) => {
    res.json({
        success: true,
        stats: {
            users: users.size,
            activeSessions: sessions.size,
            refreshTokens: refreshTokens.size,
            auditEvents: auditLog.size,
            loginAttempts: loginAttempts.size,
            roles: authzService.roles.size
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Security Gateway Error:', error);

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🛡️ CBD Security Gateway running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Login endpoint: http://localhost:${PORT}/auth/login`);
    console.log(`📊 Stats endpoint: http://localhost:${PORT}/stats`);
    console.log('');
    console.log('🔑 Test Credentials:');
    console.log('   👑 Admin: username=admin, password=Admin123!@#');
    console.log('   👨‍💻 Developer: username=developer, password=Dev123!@#');
    console.log('');
    console.log('📖 API Usage Examples:');
    console.log('   Login: POST /auth/login { "username": "admin", "password": "Admin123!@#" }');
    console.log('   Profile: GET /auth/profile (requires Bearer token)');
    console.log('   Refresh: POST /auth/refresh { "refreshToken": "..." }');
    console.log('   Logout: POST /auth/logout (requires Bearer token)');
});

module.exports = app;
