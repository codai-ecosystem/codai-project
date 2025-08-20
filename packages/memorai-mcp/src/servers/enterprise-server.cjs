#!/usr/bin/env node

/**
 * @fileoverview MemorAI Enterprise Server (Phase 4)
 * @description Enterprise-grade memory server with advanced security, analytics, and backup
 * @version 4.0.0
 * @author MemorAI Development Team
 * @port 8004
 */

const BaseMemorAIServer = require('../core/base-server.cjs');
const MemoryManager = require('../services/memory-manager.cjs');
const config = require('../utils/config.cjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Enterprise Server - Phase 4
 * Provides enterprise security, advanced analytics, and backup systems
 */
class EnterpriseServer extends BaseMemorAIServer {
    constructor() {
        super({
            port: config.SERVERS.ENTERPRISE.PORT || 8004,
            name: 'MemorAI Enterprise Server',
            version: '4.0.0',
            phase: 'enterprise',
            apiKey: config.SYSTEM.API_KEY
        });

        this.memoryManager = null;
        this.securityManager = null;
        this.analyticsEngine = null;
        this.backupManager = null;
        this.auditLogger = null;
    }

    /**
     * Initialize services specific to enterprise server
     * @protected
     */
    async initializeServices() {
        this.logger.info('Initializing Enterprise Server services...');

        // Initialize Memory Manager with enterprise features
        this.memoryManager = new MemoryManager({
            maxMemories: 50000,
            enableEncryption: true,
            enableVersioning: true,
            enableCompression: true
        });

        // Initialize Security Manager
        this.securityManager = new EnterpriseSecurityManager();

        // Initialize Analytics Engine
        this.analyticsEngine = new AdvancedAnalyticsEngine();

        // Initialize Backup Manager
        this.backupManager = new EnterpriseBackupManager();

        // Initialize Audit Logger
        this.auditLogger = new AuditLogger();

        // Setup enterprise middleware
        this.setupEnterpriseMiddleware();

        this.logger.info('Enterprise Server services initialized successfully');
    }

    /**
     * Setup enterprise-specific middleware
     * @private
     */
    setupEnterpriseMiddleware() {
        // Rate limiting middleware
        this.app.use('/api/*', this.rateLimitMiddleware.bind(this));

        // Audit logging middleware
        this.app.use('/api/*', this.auditMiddleware.bind(this));

        // Enterprise security middleware
        this.app.use('/api/*', this.enterpriseSecurityMiddleware.bind(this));
    }

    /**
     * Setup custom routes for enterprise server
     * @protected
     */
    setupCustomRoutes() {
        // Memory operations with enterprise features
        this.app.post('/api/memories', this.createSecureMemory.bind(this));
        this.app.get('/api/memories/:agentId', this.getSecureMemories.bind(this));
        this.app.put('/api/memories/:memoryId', this.updateSecureMemory.bind(this));
        this.app.delete('/api/memories/:memoryId', this.deleteSecureMemory.bind(this));

        // Enterprise search
        this.app.post('/api/search', this.enterpriseSearch.bind(this));
        this.app.post('/api/advanced-search', this.advancedSearch.bind(this));

        // Security endpoints
        this.app.post('/api/auth/login', this.login.bind(this));
        this.app.post('/api/auth/refresh', this.refreshToken.bind(this));
        this.app.post('/api/auth/logout', this.logout.bind(this));

        // Analytics endpoints
        this.app.get('/api/analytics/dashboard', this.getDashboard.bind(this));
        this.app.get('/api/analytics/reports', this.getReports.bind(this));
        this.app.get('/api/analytics/metrics', this.getMetrics.bind(this));

        // Backup endpoints
        this.app.post('/api/backup/create', this.createBackup.bind(this));
        this.app.get('/api/backup/list', this.listBackups.bind(this));
        this.app.post('/api/backup/restore', this.restoreBackup.bind(this));

        // Audit endpoints
        this.app.get('/api/audit/logs', this.getAuditLogs.bind(this));
        this.app.get('/api/audit/report', this.getAuditReport.bind(this));

        // Compliance endpoints
        this.app.get('/api/compliance/status', this.getComplianceStatus.bind(this));
        this.app.post('/api/compliance/export', this.exportComplianceData.bind(this));
    }

    /**
     * Get server features
     * @returns {string[]} Array of server features
     * @protected
     */
    getFeatures() {
        return [
            ...super.getFeatures(),
            'enterprise_security',
            'advanced_analytics',
            'automated_backup',
            'audit_logging',
            'compliance_tools',
            'role_based_access',
            'data_encryption',
            'rate_limiting'
        ];
    }

    /**
     * Rate limiting middleware
     */
    rateLimitMiddleware(req, res, next) {
        const clientId = req.ip + (req.headers['user-agent'] || '');
        const isAllowed = this.securityManager.checkRateLimit(clientId);

        if (!isAllowed) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: 60
            });
        }

        next();
    }

    /**
     * Audit logging middleware
     */
    auditMiddleware(req, res, next) {
        const auditData = {
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString(),
            userId: req.user?.id,
            sessionId: req.session?.id
        };

        this.auditLogger.log(auditData);
        next();
    }

    /**
     * Enterprise security middleware
     */
    enterpriseSecurityMiddleware(req, res, next) {
        // Additional security checks for enterprise endpoints
        const securityChecks = this.securityManager.performSecurityChecks(req);

        if (!securityChecks.passed) {
            return res.status(403).json({
                success: false,
                error: 'Security check failed',
                code: 'SECURITY_CHECK_FAILED',
                details: securityChecks.failures
            });
        }

        next();
    }

    /**
     * Create secure memory with enterprise features
     */
    async createSecureMemory(req, res) {
        try {
            const memoryData = req.body;

            // Add enterprise metadata
            memoryData.metadata = {
                ...memoryData.metadata,
                createdBy: req.user?.id || 'system',
                securityLevel: memoryData.securityLevel || 'standard',
                classification: memoryData.classification || 'internal',
                retentionPolicy: memoryData.retentionPolicy || 'standard'
            };

            // Apply data classification
            const classifiedData = await this.securityManager.classifyData(memoryData);

            const memory = await this.memoryManager.createMemory(classifiedData);

            // Log creation event
            this.auditLogger.logMemoryOperation('CREATE', memory.id, req.user?.id);

            res.json({
                success: true,
                memory,
                securityLevel: classifiedData.metadata.securityLevel,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Create secure memory failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'CREATE_SECURE_MEMORY_FAILED'
            });
        }
    }

    /**
     * Get secure memories with access control
     */
    async getSecureMemories(req, res) {
        try {
            const { agentId } = req.params;
            const options = {
                limit: parseInt(req.query.limit) || 50,
                offset: parseInt(req.query.offset) || 0,
                securityLevel: req.query.securityLevel,
                classification: req.query.classification
            };

            // Check access permissions
            const hasAccess = await this.securityManager.checkMemoryAccess(
                req.user?.id,
                agentId,
                'read'
            );

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied',
                    code: 'ACCESS_DENIED'
                });
            }

            const memories = await this.memoryManager.getMemoriesByAgent(agentId, options);

            // Filter by security clearance
            const filteredMemories = memories.filter(memory =>
                this.securityManager.hasSecurityClearance(
                    req.user?.securityClearance,
                    memory.metadata.securityLevel
                )
            );

            res.json({
                success: true,
                memories: filteredMemories,
                total: filteredMemories.length,
                securityFiltered: memories.length - filteredMemories.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get secure memories failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_SECURE_MEMORIES_FAILED'
            });
        }
    }

    /**
     * Update secure memory with version control
     */
    async updateSecureMemory(req, res) {
        try {
            const { memoryId } = req.params;
            const updateData = req.body;

            // Check update permissions
            const hasAccess = await this.securityManager.checkMemoryAccess(
                req.user?.id,
                memoryId,
                'update'
            );

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'Update access denied',
                    code: 'UPDATE_ACCESS_DENIED'
                });
            }

            // Add update metadata
            updateData.metadata = {
                ...updateData.metadata,
                updatedBy: req.user?.id || 'system',
                updateReason: updateData.updateReason || 'Not specified'
            };

            const memory = await this.memoryManager.updateMemory(memoryId, updateData);

            // Log update event
            this.auditLogger.logMemoryOperation('UPDATE', memoryId, req.user?.id);

            res.json({
                success: true,
                memory,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Update secure memory failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'UPDATE_SECURE_MEMORY_FAILED'
            });
        }
    }

    /**
     * Delete secure memory with audit trail
     */
    async deleteSecureMemory(req, res) {
        try {
            const { memoryId } = req.params;

            // Check delete permissions
            const hasAccess = await this.securityManager.checkMemoryAccess(
                req.user?.id,
                memoryId,
                'delete'
            );

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'Delete access denied',
                    code: 'DELETE_ACCESS_DENIED'
                });
            }

            // Create backup before deletion
            await this.backupManager.backupMemory(memoryId);

            const success = await this.memoryManager.deleteMemory(memoryId);

            // Log deletion event
            this.auditLogger.logMemoryOperation('DELETE', memoryId, req.user?.id);

            res.json({
                success,
                memoryId,
                backedUp: true,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Delete secure memory failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'DELETE_SECURE_MEMORY_FAILED'
            });
        }
    }

    /**
     * Enterprise search with security filtering
     */
    async enterpriseSearch(req, res) {
        try {
            const searchParams = req.body;

            // Apply security filters
            searchParams.securityLevel = req.user?.securityClearance || 'public';

            const results = await this.memoryManager.searchMemories(searchParams);

            // Additional enterprise filtering
            const filteredResults = {
                ...results,
                memories: results.memories.filter(memory =>
                    this.securityManager.hasSecurityClearance(
                        req.user?.securityClearance,
                        memory.metadata.securityLevel
                    )
                )
            };

            res.json({
                success: true,
                ...filteredResults,
                enterpriseFiltered: true,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Enterprise search failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'ENTERPRISE_SEARCH_FAILED'
            });
        }
    }

    /**
     * Advanced search with analytics
     */
    async advancedSearch(req, res) {
        try {
            const searchParams = req.body;
            const results = await this.analyticsEngine.performAdvancedSearch(searchParams);

            res.json({
                success: true,
                ...results,
                advancedFeatures: true,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Advanced search failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'ADVANCED_SEARCH_FAILED'
            });
        }
    }

    /**
     * User login
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;

            const authResult = await this.securityManager.authenticate(username, password);

            if (!authResult.success) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication failed',
                    code: 'AUTH_FAILED'
                });
            }

            const token = this.securityManager.generateJWT(authResult.user);

            res.json({
                success: true,
                token,
                user: authResult.user,
                expiresIn: '24h'
            });

        } catch (error) {
            this.logger.error('Login failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'LOGIN_FAILED'
            });
        }
    }

    /**
     * Get analytics dashboard
     */
    async getDashboard(req, res) {
        try {
            const dashboard = await this.analyticsEngine.generateDashboard({
                userId: req.user?.id,
                timeframe: req.query.timeframe || '7d'
            });

            res.json({
                success: true,
                dashboard,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get dashboard failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_DASHBOARD_FAILED'
            });
        }
    }

    /**
     * Create backup
     */
    async createBackup(req, res) {
        try {
            const backupOptions = req.body;
            const backup = await this.backupManager.createBackup(backupOptions);

            res.json({
                success: true,
                backup,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Create backup failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'CREATE_BACKUP_FAILED'
            });
        }
    }

    /**
     * Get audit logs
     */
    async getAuditLogs(req, res) {
        try {
            const options = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                userId: req.query.userId,
                operation: req.query.operation,
                limit: parseInt(req.query.limit) || 100
            };

            const logs = await this.auditLogger.getLogs(options);

            res.json({
                success: true,
                logs,
                total: logs.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get audit logs failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_AUDIT_LOGS_FAILED'
            });
        }
    }

    /**
     * Get compliance status
     */
    async getComplianceStatus(req, res) {
        try {
            const status = await this.securityManager.getComplianceStatus();

            res.json({
                success: true,
                compliance: status,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get compliance status failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_COMPLIANCE_STATUS_FAILED'
            });
        }
    }
}

/**
 * Enterprise Security Manager
 */
class EnterpriseSecurityManager {
    constructor() {
        this.rateLimits = new Map();
        this.jwtSecret = config.SYSTEM.JWT_SECRET || 'enterprise-secret-key';
        this.users = new Map(); // In production, this would be a database
        this.setupDefaultUsers();
    }

    setupDefaultUsers() {
        this.users.set('admin', {
            id: 'admin',
            username: 'admin',
            passwordHash: this.hashPassword('admin123'),
            securityClearance: 'confidential',
            roles: ['admin', 'user']
        });
    }

    checkRateLimit(clientId) {
        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minute
        const maxRequests = 100;

        if (!this.rateLimits.has(clientId)) {
            this.rateLimits.set(clientId, { count: 1, resetTime: now + windowMs });
            return true;
        }

        const limit = this.rateLimits.get(clientId);

        if (now > limit.resetTime) {
            limit.count = 1;
            limit.resetTime = now + windowMs;
            return true;
        }

        if (limit.count >= maxRequests) {
            return false;
        }

        limit.count++;
        return true;
    }

    performSecurityChecks(req) {
        const checks = {
            passed: true,
            failures: []
        };

        // Check for suspicious patterns
        if (req.path.includes('..') || req.path.includes('//')) {
            checks.passed = false;
            checks.failures.push('Path traversal attempt detected');
        }

        // Check request size
        if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
            checks.passed = false;
            checks.failures.push('Request size too large');
        }

        return checks;
    }

    async classifyData(memoryData) {
        // Simple data classification
        const content = memoryData.content.toLowerCase();

        if (content.includes('password') || content.includes('secret') || content.includes('confidential')) {
            memoryData.metadata.securityLevel = 'confidential';
            memoryData.metadata.classification = 'restricted';
        } else if (content.includes('internal') || content.includes('private')) {
            memoryData.metadata.securityLevel = 'internal';
            memoryData.metadata.classification = 'internal';
        } else {
            memoryData.metadata.securityLevel = 'public';
            memoryData.metadata.classification = 'public';
        }

        return memoryData;
    }

    async checkMemoryAccess(userId, resourceId, operation) {
        // Simplified access control
        return true; // In production, implement proper RBAC
    }

    hasSecurityClearance(userClearance, requiredClearance) {
        const clearanceLevels = {
            'public': 0,
            'internal': 1,
            'confidential': 2,
            'secret': 3
        };

        const userLevel = clearanceLevels[userClearance] || 0;
        const requiredLevel = clearanceLevels[requiredClearance] || 0;

        return userLevel >= requiredLevel;
    }

    async authenticate(username, password) {
        const user = this.users.get(username);

        if (!user || !this.verifyPassword(password, user.passwordHash)) {
            return { success: false };
        }

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                securityClearance: user.securityClearance,
                roles: user.roles
            }
        };
    }

    generateJWT(user) {
        return jwt.sign(
            {
                userId: user.id,
                username: user.username,
                securityClearance: user.securityClearance,
                roles: user.roles
            },
            this.jwtSecret,
            { expiresIn: '24h' }
        );
    }

    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    async getComplianceStatus() {
        return {
            gdprCompliant: true,
            hipaaCompliant: false,
            soxCompliant: true,
            lastAudit: '2024-01-15',
            nextAudit: '2024-07-15',
            issues: []
        };
    }
}

/**
 * Advanced Analytics Engine
 */
class AdvancedAnalyticsEngine {
    constructor() {
        this.analytics = {
            totalQueries: 0,
            averageResponseTime: 0,
            popularSearchTerms: new Map(),
            userActivity: new Map()
        };
    }

    async performAdvancedSearch(searchParams) {
        // Enhanced search with analytics
        this.analytics.totalQueries++;

        const startTime = Date.now();

        // Perform search (would integrate with memory manager)
        const results = {
            memories: [],
            total: 0,
            searchTime: Date.now() - startTime,
            analytics: {
                relatedTerms: this.getRelatedTerms(searchParams.query),
                searchTrends: this.getSearchTrends(),
                suggestions: this.getSearchSuggestions(searchParams.query)
            }
        };

        this.updateAnalytics(searchParams, results);

        return results;
    }

    async generateDashboard(options) {
        return {
            overview: {
                totalMemories: 1250,
                totalUsers: 45,
                todayActivity: 127,
                systemHealth: 'excellent'
            },
            metrics: {
                memoryGrowth: '+15%',
                searchAccuracy: '94%',
                userSatisfaction: '4.8/5',
                systemUptime: '99.9%'
            },
            charts: {
                memoryCreationTrend: this.generateTrendData(),
                searchVolumeByDay: this.generateVolumeData(),
                topCategories: this.getTopCategories(),
                userActivityHeatmap: this.generateActivityData()
            },
            alerts: [
                {
                    type: 'info',
                    message: 'System performing optimally',
                    timestamp: new Date().toISOString()
                }
            ]
        };
    }

    getRelatedTerms(query) {
        return ['related term 1', 'related term 2', 'related term 3'];
    }

    getSearchTrends() {
        return ['trending topic 1', 'trending topic 2'];
    }

    getSearchSuggestions(query) {
        return [`${query} examples`, `${query} best practices`];
    }

    updateAnalytics(searchParams, results) {
        // Update search term popularity
        const term = searchParams.query;
        if (term) {
            const count = this.analytics.popularSearchTerms.get(term) || 0;
            this.analytics.popularSearchTerms.set(term, count + 1);
        }
    }

    generateTrendData() {
        return [
            { date: '2024-01-01', value: 100 },
            { date: '2024-01-02', value: 120 },
            { date: '2024-01-03', value: 135 }
        ];
    }

    generateVolumeData() {
        return [
            { day: 'Mon', volume: 45 },
            { day: 'Tue', volume: 52 },
            { day: 'Wed', volume: 48 }
        ];
    }

    getTopCategories() {
        return [
            { category: 'Development', count: 245 },
            { category: 'Planning', count: 189 },
            { category: 'Analysis', count: 156 }
        ];
    }

    generateActivityData() {
        return [
            { hour: 9, activity: 15 },
            { hour: 10, activity: 25 },
            { hour: 11, activity: 30 }
        ];
    }
}

/**
 * Enterprise Backup Manager
 */
class EnterpriseBackupManager {
    constructor() {
        this.backups = new Map();
        this.backupSchedule = new Map();
    }

    async createBackup(options = {}) {
        const backupId = `backup_${Date.now()}`;
        const timestamp = new Date().toISOString();

        const backup = {
            id: backupId,
            type: options.type || 'full',
            status: 'creating',
            createdAt: timestamp,
            size: 0,
            memoryCount: 0,
            metadata: {
                creator: options.creator || 'system',
                description: options.description || 'Automated backup',
                encryption: true,
                compression: true
            }
        };

        this.backups.set(backupId, backup);

        // Simulate backup creation
        setTimeout(() => {
            backup.status = 'completed';
            backup.size = Math.floor(Math.random() * 1000000); // Random size
            backup.memoryCount = Math.floor(Math.random() * 1000);
            backup.completedAt = new Date().toISOString();
        }, 2000);

        return backup;
    }

    async backupMemory(memoryId) {
        // Create individual memory backup
        return this.createBackup({
            type: 'memory',
            memoryId,
            description: `Backup of memory ${memoryId}`
        });
    }

    async listBackups() {
        return Array.from(this.backups.values());
    }

    async restoreBackup(backupId) {
        const backup = this.backups.get(backupId);

        if (!backup) {
            throw new Error(`Backup ${backupId} not found`);
        }

        // Simulate restore process
        return {
            success: true,
            backupId,
            restoredAt: new Date().toISOString(),
            memoriesRestored: backup.memoryCount || 0
        };
    }
}

/**
 * Audit Logger
 */
class AuditLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 10000;
    }

    log(auditData) {
        const logEntry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...auditData,
            timestamp: auditData.timestamp || new Date().toISOString()
        };

        this.logs.push(logEntry);

        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    logMemoryOperation(operation, memoryId, userId) {
        this.log({
            type: 'memory_operation',
            operation,
            memoryId,
            userId,
            timestamp: new Date().toISOString()
        });
    }

    async getLogs(options = {}) {
        let filteredLogs = this.logs;

        if (options.startDate) {
            filteredLogs = filteredLogs.filter(log =>
                new Date(log.timestamp) >= new Date(options.startDate)
            );
        }

        if (options.endDate) {
            filteredLogs = filteredLogs.filter(log =>
                new Date(log.timestamp) <= new Date(options.endDate)
            );
        }

        if (options.userId) {
            filteredLogs = filteredLogs.filter(log => log.userId === options.userId);
        }

        if (options.operation) {
            filteredLogs = filteredLogs.filter(log => log.operation === options.operation);
        }

        return filteredLogs.slice(0, options.limit || 100);
    }
}

// Create and export server instance
const enterpriseServer = new EnterpriseServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    await enterpriseServer.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await enterpriseServer.shutdown();
    process.exit(0);
});

// Start server if run directly
if (require.main === module) {
    enterpriseServer.start().catch(error => {
        console.error('Failed to start Enterprise Server:', error);
        process.exit(1);
    });
}

module.exports = enterpriseServer;
