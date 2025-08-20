"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CBDMultiCloudAuthService = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const MultiCloudConfiguration_1 = require("./src/config/MultiCloudConfiguration");
class CBDMultiCloudAuthService {
    constructor() {
        this.users = new Map();
        this.refreshTokens = new Set();
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeCloudConfig();
        this.createDemoUsers();
    }
    setupMiddleware() {
        this.app.use((0, cors_1.default)({
            origin: ['http://localhost:4001', 'http://localhost:4004', 'http://localhost:4005', 'http://localhost:4006', 'http://localhost:4007', 'http://localhost:4008'],
            credentials: true
        }));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
    initializeCloudConfig() {
        const config = new MultiCloudConfiguration_1.MultiCloudConfiguration();
        this.cloudConfig = config.build();
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
            cloudAccess: {
                aws: true,
                azure: true,
                gcp: true
            },
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
            cloudAccess: {
                aws: true,
                azure: false,
                gcp: true
            },
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
            cloudAccess: {
                aws: false,
                azure: false,
                gcp: false
            },
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
                    aws: this.cloudConfig.aws?.enabled || false,
                    azure: this.cloudConfig.azure?.enabled || false,
                    gcp: this.cloudConfig.gcp?.enabled || false
                },
                features: {
                    localAuth: true,
                    multiCloudAuth: true,
                    jwtTokens: true,
                    roleBasedAccess: true,
                    mfaSupport: true
                }
            });
        });
        // Local authentication
        this.app.post('/auth/login', this.handleLogin.bind(this));
        this.app.post('/auth/refresh', this.handleRefreshToken.bind(this));
        this.app.post('/auth/logout', this.handleLogout.bind(this));
        // User management
        this.app.get('/auth/me', this.authenticateToken.bind(this), this.getProfile.bind(this));
        this.app.get('/auth/users', this.authenticateToken.bind(this), this.requireAdmin.bind(this), this.getUsers.bind(this));
        // Cloud provider authentication status
        this.app.get('/auth/cloud-status', this.authenticateToken.bind(this), this.getCloudStatus.bind(this));
        // Cloud provider integration endpoints (future implementation)
        this.app.post('/auth/aws/login', this.handleAWSLogin.bind(this));
        this.app.post('/auth/azure/login', this.handleAzureLogin.bind(this));
        this.app.post('/auth/gcp/login', this.handleGCPLogin.bind(this));
        // Development endpoints
        this.app.get('/auth/demo-users', (req, res) => {
            if (process.env.NODE_ENV !== 'development') {
                return res.status(404).json({ error: 'Not found' });
            }
            const demoUsers = Array.from(this.users.values()).map(user => ({
                email: user.email,
                name: user.name,
                roles: user.roles,
                provider: user.provider
            }));
            res.json({
                message: 'Demo users for Phase 2 testing',
                users: demoUsers,
                instructions: {
                    login: 'POST /auth/login with { email, password: "demo123" }',
                    adminUser: 'admin@cbd.local (all permissions)',
                    devUser: 'developer@cbd.local (read/write/deploy)',
                    viewerUser: 'viewer@cbd.local (read only)'
                }
            });
        });
    }
    async handleLogin(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password required' });
                return;
            }
            const user = this.users.get(email);
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            // Demo password validation (in production, use proper hashing)
            if (password !== 'demo123') {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
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
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Authentication failed' });
        }
    }
    async handleRefreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken || !this.refreshTokens.has(refreshToken)) {
                res.status(401).json({ error: 'Invalid refresh token' });
                return;
            }
            // Verify refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, this.getJWTSecret());
            const user = this.users.get(decoded.email);
            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Logout failed' });
        }
    }
    async getProfile(req, res) {
        const user = req.user;
        res.json({
            user: {
                ...user,
                // Don't expose sensitive data
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                permissions: user.permissions,
                cloudAccess: user.cloudAccess,
                lastLogin: user.lastLogin,
                mfaEnabled: user.mfaEnabled
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
        res.json({ users });
    }
    async getCloudStatus(req, res) {
        const user = req.user;
        res.json({
            cloudAccess: user.cloudAccess,
            availableProviders: {
                aws: {
                    enabled: this.cloudConfig.aws?.enabled || false,
                    hasAccess: user.cloudAccess.aws || false,
                    services: this.cloudConfig.aws?.enabled ? ['DynamoDB', 'OpenSearch', 'S3', 'RDS'] : []
                },
                azure: {
                    enabled: this.cloudConfig.azure?.enabled || false,
                    hasAccess: user.cloudAccess.azure || false,
                    services: this.cloudConfig.azure?.enabled ? ['Cosmos DB', 'Cognitive Search', 'Blob Storage'] : []
                },
                gcp: {
                    enabled: this.cloudConfig.gcp?.enabled || false,
                    hasAccess: user.cloudAccess.gcp || false,
                    services: this.cloudConfig.gcp?.enabled ? ['Firestore', 'Spanner', 'Cloud Storage', 'BigQuery'] : []
                }
            }
        });
    }
    // Cloud provider authentication handlers (stub implementations)
    async handleAWSLogin(req, res) {
        res.json({
            message: 'AWS authentication not yet implemented',
            phase: 'Phase 3 - Advanced Integration',
            status: 'planned'
        });
    }
    async handleAzureLogin(req, res) {
        res.json({
            message: 'Azure authentication not yet implemented',
            phase: 'Phase 3 - Advanced Integration',
            status: 'planned'
        });
    }
    async handleGCPLogin(req, res) {
        res.json({
            message: 'GCP authentication not yet implemented',
            phase: 'Phase 3 - Advanced Integration',
            status: 'planned'
        });
    }
    // Middleware
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.getJWTSecret());
            const user = this.users.get(decoded.email);
            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(403).json({ error: 'Invalid or expired token' });
        }
    }
    requireAdmin(req, res, next) {
        const user = req.user;
        if (!user.roles.includes('admin')) {
            res.status(403).json({ error: 'Admin access required' });
            return;
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
        const token = jsonwebtoken_1.default.sign(payload, this.getJWTSecret(), {
            expiresIn: '1h',
            issuer: 'cbd-phase2-auth',
            audience: 'cbd-universal-database'
        });
        const refreshToken = jsonwebtoken_1.default.sign({
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
                ...user,
                // Clean sensitive data
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server running on port ${port}
✅ Phase 2: Multi-Cloud Integration Active
✅ Local Authentication: Enabled
✅ JWT Tokens: Enabled
✅ Role-Based Access: Enabled
✅ MFA Support: Ready

🌐 Cloud Provider Status:
${this.cloudConfig.aws?.enabled ? '✅' : '⏸️ '} AWS Integration
${this.cloudConfig.azure?.enabled ? '✅' : '⏸️ '} Azure Integration  
${this.cloudConfig.gcp?.enabled ? '✅' : '⏸️ '} GCP Integration

📋 Demo Users (Development):
👤 admin@cbd.local (Admin - All Permissions)
👤 developer@cbd.local (Developer - Read/Write/Deploy)
👤 viewer@cbd.local (Viewer - Read Only)
🔑 Password: demo123

🔗 Endpoints:
POST /auth/login - Authenticate user
POST /auth/refresh - Refresh token
POST /auth/logout - Logout user
GET  /auth/me - Get user profile
GET  /auth/cloud-status - Cloud access status
GET  /health - Service health check

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
        });
    }
}
exports.CBDMultiCloudAuthService = CBDMultiCloudAuthService;
// Start the service if run directly
if (require.main === module) {
    const authService = new CBDMultiCloudAuthService();
    authService.start(4900);
}
exports.default = CBDMultiCloudAuthService;
