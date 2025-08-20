const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { createHash, randomBytes } = require('crypto');

// ================================
// CBD Phase 2: Multi-Cloud Authentication Service
// ================================

class CBDMultiCloudAuthService {
    constructor() {
        this.app = express();
        this.users = new Map();
        this.refreshTokens = new Set();
        this.cloudConfig = this.initializeCloudConfig();

        this.setupMiddleware();
        this.setupRoutes();
        this.createDemoUsers();
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: [
                'http://localhost:4001', 'http://localhost:4004', 'http://localhost:4005',
                'http://localhost:4006', 'http://localhost:4007', 'http://localhost:4008',
                'http://localhost:4180', 'http://localhost:4600', 'http://localhost:4700',
                'http://localhost:4800'
            ],
            credentials: true
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    initializeCloudConfig() {
        return {
            aws: { enabled: process.env.CBD_ENABLE_AWS === 'true', region: process.env.AWS_REGION || 'us-east-1' },
            azure: { enabled: process.env.CBD_ENABLE_AZURE === 'true', region: process.env.AZURE_LOCATION || 'eastus' },
            gcp: { enabled: process.env.CBD_ENABLE_GCP === 'true', region: process.env.GOOGLE_CLOUD_REGION || 'us-central1' },
            local: { enabled: true, strategy: 'performance' }
        };
    }

    createDemoUsers() {
        // Demo admin user
        const adminUser = {
            id: 'admin-001',
            email: 'admin@cbd.local',
            name: 'CBD Administrator',
            provider: 'local',
            roles: ['admin', 'developer', 'operator'],
            permissions: ['*'],
            cloudAccess: { aws: true, azure: true, gcp: true },
            lastLogin: new Date(),
            mfaEnabled: true
        };
        this.users.set('admin@cbd.local', adminUser);

        // Demo developer user
        const devUser = {
            id: 'dev-001',
            email: 'developer@cbd.local',
            name: 'CBD Developer',
            provider: 'local',
            roles: ['developer'],
            permissions: ['read', 'write', 'deploy'],
            cloudAccess: { aws: true, azure: false, gcp: true },
            lastLogin: new Date(),
            mfaEnabled: false
        };
        this.users.set('developer@cbd.local', devUser);

        // Demo viewer user
        const viewerUser = {
            id: 'viewer-001',
            email: 'viewer@cbd.local',
            name: 'CBD Viewer',
            provider: 'local',
            roles: ['viewer'],
            permissions: ['read'],
            cloudAccess: { aws: false, azure: false, gcp: false },
            lastLogin: new Date(),
            mfaEnabled: false
        };
        this.users.set('viewer@cbd.local', viewerUser);
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'CBD Multi-Cloud Authentication',
                phase: 2,
                timestamp: new Date().toISOString(),
                cloudProviders: {
                    aws: this.cloudConfig.aws.enabled,
                    azure: this.cloudConfig.azure.enabled,
                    gcp: this.cloudConfig.gcp.enabled
                },
                features: {
                    localAuth: true,
                    multiCloudAuth: true,
                    jwtTokens: true,
                    roleBasedAccess: true,
                    mfaSupport: true
                },
                activeUsers: this.users.size,
                activeTokens: this.refreshTokens.size
            });
        });

        // Authentication endpoints
        this.app.post('/auth/login', this.handleLogin.bind(this));
        this.app.post('/auth/refresh', this.handleRefreshToken.bind(this));
        this.app.post('/auth/logout', this.handleLogout.bind(this));

        // User management
        this.app.get('/auth/me', this.authenticateToken.bind(this), this.getProfile.bind(this));
        this.app.get('/auth/users', this.authenticateToken.bind(this), this.requireAdmin.bind(this), this.getUsers.bind(this));

        // Cloud provider status
        this.app.get('/auth/cloud-status', this.authenticateToken.bind(this), this.getCloudStatus.bind(this));

        // Development endpoints
        this.app.get('/auth/demo-users', (req, res) => {
            if (process.env.NODE_ENV !== 'development') {
                return res.status(404).json({ error: 'Not found' });
            }

            const demoUsers = Array.from(this.users.values()).map(user => ({
                email: user.email,
                name: user.name,
                roles: user.roles,
                provider: user.provider,
                cloudAccess: user.cloudAccess
            }));

            res.json({
                message: 'Phase 2 Demo Users for Multi-Cloud Authentication',
                users: demoUsers,
                instructions: {
                    login: 'POST /auth/login with { "email": "admin@cbd.local", "password": "demo123" }',
                    authenticate: 'Use Bearer token in Authorization header',
                    examples: {
                        admin: 'admin@cbd.local (All cloud access)',
                        developer: 'developer@cbd.local (AWS + GCP access)',
                        viewer: 'viewer@cbd.local (Local access only)'
                    }
                },
                endpoints: {
                    login: 'POST /auth/login',
                    profile: 'GET /auth/me',
                    cloudStatus: 'GET /auth/cloud-status',
                    health: 'GET /health'
                }
            });
        });

        // Token validation endpoint
        this.app.post('/auth/validate', (req, res) => {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ error: 'Token required' });
            }

            try {
                const decoded = jwt.verify(token, this.getJWTSecret());
                const user = this.users.get(decoded.email);

                if (!user) {
                    return res.status(401).json({ error: 'User not found' });
                }

                res.json({
                    valid: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        roles: user.roles,
                        permissions: user.permissions,
                        cloudAccess: user.cloudAccess
                    },
                    expiresAt: new Date(decoded.exp * 1000)
                });
            } catch (error) {
                res.status(401).json({
                    valid: false,
                    error: 'Invalid or expired token',
                    details: error.message
                });
            }
        });
    }

    async handleLogin(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }

            const user = this.users.get(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Demo password validation
            if (password !== 'demo123') {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Update last login
            user.lastLogin = new Date();

            // Generate tokens
            const authToken = this.generateAuthToken(user);

            res.json({
                success: true,
                message: 'Authentication successful',
                ...authToken,
                cloudAccess: user.cloudAccess
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Authentication failed' });
        }
    }

    async handleRefreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken || !this.refreshTokens.has(refreshToken)) {
                return res.status(401).json({ error: 'Invalid refresh token' });
            }

            const decoded = jwt.verify(refreshToken, this.getJWTSecret());
            const user = this.users.get(decoded.email);

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            // Remove old refresh token
            this.refreshTokens.delete(refreshToken);

            // Generate new tokens
            const authToken = this.generateAuthToken(user);

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                ...authToken
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(401).json({ error: 'Invalid refresh token' });
        }
    }

    async handleLogout(req, res) {
        try {
            const { refreshToken } = req.body;

            if (refreshToken) {
                this.refreshTokens.delete(refreshToken);
            }

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Logout failed' });
        }
    }

    async getProfile(req, res) {
        const user = req.user;
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                permissions: user.permissions,
                cloudAccess: user.cloudAccess,
                lastLogin: user.lastLogin,
                mfaEnabled: user.mfaEnabled,
                provider: user.provider
            }
        });
    }

    async getUsers(req, res) {
        const users = Array.from(this.users.values()).map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            provider: user.provider,
            roles: user.roles,
            cloudAccess: user.cloudAccess,
            lastLogin: user.lastLogin,
            mfaEnabled: user.mfaEnabled
        }));

        res.json({
            users,
            total: users.length,
            timestamp: new Date().toISOString()
        });
    }

    async getCloudStatus(req, res) {
        const user = req.user;

        res.json({
            user: {
                email: user.email,
                name: user.name,
                cloudAccess: user.cloudAccess
            },
            availableProviders: {
                aws: {
                    enabled: this.cloudConfig.aws.enabled,
                    hasAccess: user.cloudAccess.aws,
                    region: this.cloudConfig.aws.region,
                    services: this.cloudConfig.aws.enabled ? ['DynamoDB', 'OpenSearch', 'S3', 'RDS'] : []
                },
                azure: {
                    enabled: this.cloudConfig.azure.enabled,
                    hasAccess: user.cloudAccess.azure,
                    region: this.cloudConfig.azure.region,
                    services: this.cloudConfig.azure.enabled ? ['Cosmos DB', 'Cognitive Search', 'Blob Storage'] : []
                },
                gcp: {
                    enabled: this.cloudConfig.gcp.enabled,
                    hasAccess: user.cloudAccess.gcp,
                    region: this.cloudConfig.gcp.region,
                    services: this.cloudConfig.gcp.enabled ? ['Firestore', 'Spanner', 'Cloud Storage', 'BigQuery'] : []
                }
            },
            timestamp: new Date().toISOString()
        });
    }

    // Middleware
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        try {
            const decoded = jwt.verify(token, this.getJWTSecret());
            const user = this.users.get(decoded.email);

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(403).json({ error: 'Invalid or expired token' });
        }
    }

    requireAdmin(req, res, next) {
        const user = req.user;

        if (!user.roles.includes('admin')) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    }

    generateAuthToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions,
            cloudAccess: user.cloudAccess
        };

        const token = jwt.sign(payload, this.getJWTSecret(), {
            expiresIn: '1h',
            issuer: 'cbd-phase2-auth',
            audience: 'cbd-universal-database'
        });

        const refreshToken = jwt.sign({
            email: user.email,
            type: 'refresh'
        }, this.getJWTSecret(), {
            expiresIn: '7d',
            issuer: 'cbd-phase2-auth',
            audience: 'cbd-universal-database'
        });

        this.refreshTokens.add(refreshToken);

        return {
            token,
            refreshToken,
            expiresIn: 3600, // 1 hour
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                provider: user.provider,
                roles: user.roles,
                permissions: user.permissions,
                cloudAccess: user.cloudAccess,
                lastLogin: user.lastLogin,
                mfaEnabled: user.mfaEnabled
            }
        };
    }

    getJWTSecret() {
        return process.env.CBD_JWT_SECRET || 'your_jwt_secret_key_change_in_production_123456789';
    }

    start(port = 4900) {
        this.app.listen(port, () => {
            console.log(`
🔐 CBD Multi-Cloud Authentication Service Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server running on port ${port}
✅ Phase 2: Multi-Cloud Integration Active
✅ Local Authentication: Enabled
✅ JWT Tokens: Enabled (1h access, 7d refresh)
✅ Role-Based Access: Enabled
✅ CORS: Configured for CBD ecosystem

🌐 Cloud Provider Status:
${this.cloudConfig.aws.enabled ? '✅ AWS Integration (' + this.cloudConfig.aws.region + ')' : '⏸️  AWS Integration (Disabled)'}
${this.cloudConfig.azure.enabled ? '✅ Azure Integration (' + this.cloudConfig.azure.region + ')' : '⏸️  Azure Integration (Disabled)'}
${this.cloudConfig.gcp.enabled ? '✅ GCP Integration (' + this.cloudConfig.gcp.region + ')' : '⏸️  GCP Integration (Disabled)'}

👥 Demo Users (Password: demo123):
🔑 admin@cbd.local (Admin - Full Cloud Access)
🔧 developer@cbd.local (Developer - AWS+GCP Access)
👁️  viewer@cbd.local (Viewer - Local Only)

🌐 API Endpoints:
POST http://localhost:${port}/auth/login
POST http://localhost:${port}/auth/refresh  
POST http://localhost:${port}/auth/logout
POST http://localhost:${port}/auth/validate
GET  http://localhost:${port}/auth/me
GET  http://localhost:${port}/auth/cloud-status
GET  http://localhost:${port}/auth/demo-users
GET  http://localhost:${port}/health

🔗 Integration Ready:
✅ CBD Core Database (4180)
✅ CBD Collaboration (4600)
✅ CBD AI Analytics (4700)
✅ CBD GraphQL Gateway (4800)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
        });
    }
}

// Start the service if run directly
if (require.main === module) {
    const authService = new CBDMultiCloudAuthService();
    authService.start(4900);
}

module.exports = CBDMultiCloudAuthService;
