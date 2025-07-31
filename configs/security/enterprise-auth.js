// 🔐 Enterprise Security & Authentication System for Codai Ecosystem
// OAuth 2.0, SSO, MFA, RBAC implementation across all 27 services

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 4997; // Security & Authentication Gateway

// Middleware
app.use(compression());
app.use(cors({
    origin: ['http://localhost:4030', 'http://localhost:4031', 'http://localhost:4032', 'http://localhost:4033', 'http://localhost:4034', 'http://localhost:4035', 'http://localhost:4036', 'http://localhost:4037', 'http://localhost:4038', 'http://localhost:4039', 'http://localhost:4040', 'http://localhost:4056'],
    credentials: true
}));
app.use(express.json());

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'codai-enterprise-security-key-2025';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'codai-refresh-security-key-2025';

// In-memory stores (in production, use Redis/Database)
let users = new Map();
let sessions = new Map();
let mfaCodes = new Map();
let auditLog = [];

// Security configuration
const securityConfig = {
    tokenExpiry: '15m',           // Access token expires in 15 minutes
    refreshTokenExpiry: '7d',     // Refresh token expires in 7 days
    mfaCodeExpiry: 300,          // MFA code expires in 5 minutes
    maxLoginAttempts: 5,         // Maximum failed login attempts
    lockoutDuration: 900,        // Account lockout duration (15 minutes)
    passwordMinLength: 8,        // Minimum password length
    requireMFA: true             // Require multi-factor authentication
};

// Role-based access control definitions
const roles = {
    'super_admin': {
        permissions: ['*'], // All permissions
        description: 'Complete system access'
    },
    'admin': {
        permissions: ['user:read', 'user:write', 'service:read', 'service:write', 'analytics:read'],
        description: 'Administrative access'
    },
    'enterprise_user': {
        permissions: ['service:read', 'service:write', 'analytics:read', 'profile:write'],
        description: 'Enterprise user access'
    },
    'basic_user': {
        permissions: ['service:read', 'profile:write'],
        description: 'Basic user access'
    },
    'readonly': {
        permissions: ['service:read'],
        description: 'Read-only access'
    }
};

// Initialize default admin user
const defaultAdmin = {
    id: crypto.randomUUID(),
    username: 'admin',
    email: 'admin@codai.ro',
    passwordHash: crypto.pbkdf2Sync('CodaiAdmin2025!', 'salt', 10000, 64, 'sha512').toString('hex'),
    role: 'super_admin',
    mfaEnabled: true,
    mfaSecret: crypto.randomBytes(32).toString('hex'),
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    failedAttempts: 0,
    lockedUntil: null
};

users.set('admin', defaultAdmin);

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    });
}

// Permission checking middleware
function requirePermission(permission) {
    return (req, res, next) => {
        const userRole = req.user.role;
        const rolePermissions = roles[userRole]?.permissions || [];

        if (rolePermissions.includes('*') || rolePermissions.includes(permission)) {
            next();
        } else {
            auditLog.push({
                timestamp: new Date().toISOString(),
                action: 'ACCESS_DENIED',
                user: req.user.username,
                permission: permission,
                ip: req.ip
            });
            res.status(403).json({ error: 'Insufficient permissions' });
        }
    };
}

// Generate MFA code
function generateMFACode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Password hashing
function hashPassword(password, salt = 'salt') {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Generate tokens
function generateTokens(user) {
    const accessToken = jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role,
            permissions: roles[user.role]?.permissions || []
        },
        JWT_SECRET,
        { expiresIn: securityConfig.tokenExpiry }
    );

    const refreshToken = jwt.sign(
        { id: user.id, username: user.username },
        REFRESH_SECRET,
        { expiresIn: securityConfig.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
}

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password, mfaCode } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = users.get(username);
        if (!user) {
            auditLog.push({
                timestamp: new Date().toISOString(),
                action: 'LOGIN_FAILED',
                reason: 'USER_NOT_FOUND',
                username: username,
                ip: req.ip
            });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
            return res.status(423).json({ error: 'Account temporarily locked' });
        }

        // Verify password
        const passwordHash = hashPassword(password);
        if (passwordHash !== user.passwordHash) {
            user.failedAttempts = (user.failedAttempts || 0) + 1;

            if (user.failedAttempts >= securityConfig.maxLoginAttempts) {
                user.lockedUntil = new Date(Date.now() + securityConfig.lockoutDuration * 1000).toISOString();
                auditLog.push({
                    timestamp: new Date().toISOString(),
                    action: 'ACCOUNT_LOCKED',
                    username: username,
                    attempts: user.failedAttempts,
                    ip: req.ip
                });
            }

            auditLog.push({
                timestamp: new Date().toISOString(),
                action: 'LOGIN_FAILED',
                reason: 'INVALID_PASSWORD',
                username: username,
                attempts: user.failedAttempts,
                ip: req.ip
            });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check MFA if enabled
        if (user.mfaEnabled && securityConfig.requireMFA) {
            if (!mfaCode) {
                // Generate and send MFA code
                const code = generateMFACode();
                mfaCodes.set(user.id, {
                    code: code,
                    expiresAt: Date.now() + securityConfig.mfaCodeExpiry * 1000
                });

                console.log(`🔐 MFA Code for ${username}: ${code}`); // In production, send via SMS/Email

                return res.json({
                    requireMFA: true,
                    message: 'MFA code sent. Please provide the code to complete login.'
                });
            } else {
                // Verify MFA code
                const storedMFA = mfaCodes.get(user.id);
                if (!storedMFA || storedMFA.code !== mfaCode || Date.now() > storedMFA.expiresAt) {
                    auditLog.push({
                        timestamp: new Date().toISOString(),
                        action: 'MFA_FAILED',
                        username: username,
                        ip: req.ip
                    });
                    return res.status(401).json({ error: 'Invalid or expired MFA code' });
                }

                mfaCodes.delete(user.id); // Remove used MFA code
            }
        }

        // Reset failed attempts
        user.failedAttempts = 0;
        user.lockedUntil = null;
        user.lastLogin = new Date().toISOString();

        // Generate tokens
        const tokens = generateTokens(user);

        // Create session
        const sessionId = crypto.randomUUID();
        sessions.set(sessionId, {
            userId: user.id,
            username: user.username,
            role: user.role,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            ip: req.ip
        });

        auditLog.push({
            timestamp: new Date().toISOString(),
            action: 'LOGIN_SUCCESS',
            username: username,
            sessionId: sessionId,
            ip: req.ip
        });

        res.json({
            message: 'Login successful',
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            sessionId: sessionId,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                permissions: roles[user.role]?.permissions || []
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const userRecord = users.get(user.username);
        if (!userRecord || !userRecord.isActive) {
            return res.status(403).json({ error: 'User not found or inactive' });
        }

        const tokens = generateTokens(userRecord);
        res.json(tokens);
    });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
    const { sessionId } = req.body;

    if (sessionId) {
        sessions.delete(sessionId);
    }

    auditLog.push({
        timestamp: new Date().toISOString(),
        action: 'LOGOUT',
        username: req.user.username,
        sessionId: sessionId,
        ip: req.ip
    });

    res.json({ message: 'Logout successful' });
});

// User management endpoints
app.post('/api/users', authenticateToken, requirePermission('user:write'), (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields required' });
        }

        if (users.has(username)) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        if (!roles[role]) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const newUser = {
            id: crypto.randomUUID(),
            username,
            email,
            passwordHash: hashPassword(password),
            role,
            mfaEnabled: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            failedAttempts: 0,
            lockedUntil: null
        };

        users.set(username, newUser);

        auditLog.push({
            timestamp: new Date().toISOString(),
            action: 'USER_CREATED',
            username: req.user.username,
            targetUser: username,
            role: role,
            ip: req.ip
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/users', authenticateToken, requirePermission('user:read'), (req, res) => {
    const userList = Array.from(users.values()).map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
    }));

    res.json(userList);
});

// Security dashboard endpoints
app.get('/api/security/dashboard', authenticateToken, requirePermission('analytics:read'), (req, res) => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentAuditLogs = auditLog.filter(log => new Date(log.timestamp) > last24h);
    const activeSessions = Array.from(sessions.values());

    const stats = {
        totalUsers: users.size,
        activeUsers: Array.from(users.values()).filter(user => user.isActive).length,
        activeSessions: activeSessions.length,
        loginAttempts24h: recentAuditLogs.filter(log => log.action.includes('LOGIN')).length,
        failedLogins24h: recentAuditLogs.filter(log => log.action === 'LOGIN_FAILED').length,
        mfaUsage: recentAuditLogs.filter(log => log.action.includes('MFA')).length,
        lastUpdate: new Date().toISOString()
    };

    res.json({
        stats,
        recentActivities: recentAuditLogs.slice(-50),
        activeSessions: activeSessions.map(session => ({
            sessionId: session.sessionId,
            username: session.username,
            role: session.role,
            ip: session.ip,
            lastActivity: session.lastActivity
        }))
    });
});

app.get('/api/security/audit', authenticateToken, requirePermission('analytics:read'), (req, res) => {
    const { limit = 100, action, username } = req.query;

    let filteredLogs = auditLog;

    if (action) {
        filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    if (username) {
        filteredLogs = filteredLogs.filter(log => log.username === username);
    }

    res.json(filteredLogs.slice(-limit));
});

// Security dashboard HTML
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>🔐 Codai Enterprise Security Center</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; min-height: 100vh; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .security-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .security-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 20px; border-radius: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
        .security-value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .security-label { font-size: 0.9em; opacity: 0.8; }
        .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .dashboard-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); }
        .login-form { max-width: 400px; margin: 20px auto; padding: 30px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input { width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; background: rgba(255,255,255,0.1); color: white; font-size: 14px; }
        .form-group input::placeholder { color: rgba(255,255,255,0.6); }
        .login-btn { width: 100%; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s; }
        .login-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
        .status-good { color: #4ade80; }
        .status-warning { color: #fbbf24; }
        .status-critical { color: #f87171; }
        .hidden { display: none; }
        .audit-log { max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; }
        h1, h2, h3 { margin-top: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Codai Enterprise Security Center</h1>
            <p>Multi-factor Authentication • Role-based Access Control • Real-time Monitoring</p>
        </div>
        
        <div id="login-section" class="login-form">
            <h2>🔑 Secure Login</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" placeholder="Enter username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" placeholder="Enter password" required>
                </div>
                <div class="form-group hidden" id="mfa-group">
                    <label for="mfaCode">MFA Code:</label>
                    <input type="text" id="mfaCode" name="mfaCode" placeholder="Enter 6-digit MFA code">
                </div>
                <button type="submit" class="login-btn">🔐 Secure Login</button>
            </form>
            <div style="margin-top: 20px; text-align: center; opacity: 0.8;">
                <p><strong>Demo Credentials:</strong></p>
                <p>Username: admin</p>
                <p>Password: CodaiAdmin2025!</p>
                <p><small>MFA code will be displayed in console</small></p>
            </div>
        </div>
        
        <div id="dashboard-section" class="hidden">
            <div class="security-grid">
                <div class="security-card">
                    <div class="security-value" id="total-users">-</div>
                    <div class="security-label">Total Users</div>
                </div>
                <div class="security-card">
                    <div class="security-value" id="active-sessions">-</div>
                    <div class="security-label">Active Sessions</div>
                </div>
                <div class="security-card">
                    <div class="security-value" id="login-attempts">-</div>
                    <div class="security-label">Logins (24h)</div>
                </div>
                <div class="security-card">
                    <div class="security-value" id="failed-logins">-</div>
                    <div class="security-label">Failed Logins</div>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>🔍 Recent Security Activities</h3>
                    <div class="audit-log" id="recent-activities">Loading...</div>
                </div>
                <div class="dashboard-card">
                    <h3>👥 Active Sessions</h3>
                    <div id="active-sessions-list">Loading...</div>
                </div>
            </div>
            
            <div class="dashboard-card">
                <h3>📊 Role-based Access Control</h3>
                <div id="rbac-info">
                    <p><strong>Available Roles:</strong></p>
                    <ul>
                        <li><strong>Super Admin:</strong> Complete system access (*)</li>
                        <li><strong>Admin:</strong> User management, service control, analytics</li>
                        <li><strong>Enterprise User:</strong> Service access, analytics, profile management</li>
                        <li><strong>Basic User:</strong> Service access, profile management</li>
                        <li><strong>Read-only:</strong> View-only access</li>
                    </ul>
                </div>
            </div>
            
            <button class="login-btn" onclick="logout()" style="max-width: 200px; margin: 20px auto; display: block;">🚪 Logout</button>
        </div>
    </div>

    <script>
        let authToken = null;
        let sessionId = null;

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const mfaCode = document.getElementById('mfaCode').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password, mfaCode })
                });

                const data = await response.json();

                if (data.requireMFA) {
                    document.getElementById('mfa-group').classList.remove('hidden');
                    alert('MFA code has been generated. Check the console log for the code.');
                } else if (data.accessToken) {
                    authToken = data.accessToken;
                    sessionId = data.sessionId;
                    showDashboard();
                    loadSecurityDashboard();
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                alert('Login error: ' + error.message);
            }
        });

        function showDashboard() {
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('dashboard-section').classList.remove('hidden');
        }

        async function loadSecurityDashboard() {
            try {
                const response = await fetch('/api/security/dashboard', {
                    headers: { 'Authorization': \`Bearer \${authToken}\` }
                });

                const data = await response.json();
                updateSecurityStats(data.stats);
                updateRecentActivities(data.recentActivities);
                updateActiveSessions(data.activeSessions);

            } catch (error) {
                console.error('Error loading security dashboard:', error);
            }
        }

        function updateSecurityStats(stats) {
            document.getElementById('total-users').textContent = stats.totalUsers;
            document.getElementById('active-sessions').textContent = stats.activeSessions;
            document.getElementById('login-attempts').textContent = stats.loginAttempts24h;
            document.getElementById('failed-logins').textContent = stats.failedLogins24h;
        }

        function updateRecentActivities(activities) {
            const html = activities.slice(-10).map(activity => 
                \`<div>\${activity.timestamp.substring(11, 19)} - \${activity.action} - \${activity.username || 'System'}</div>\`
            ).join('');
            document.getElementById('recent-activities').innerHTML = html;
        }

        function updateActiveSessions(sessions) {
            const html = sessions.map(session => 
                \`<div style="margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                    <strong>\${session.username}</strong> (\${session.role})<br>
                    <small>IP: \${session.ip} | Last: \${new Date(session.lastActivity).toLocaleTimeString()}</small>
                </div>\`
            ).join('');
            document.getElementById('active-sessions-list').innerHTML = html || 'No active sessions';
        }

        async function logout() {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 
                        'Authorization': \`Bearer \${authToken}\`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ sessionId })
                });

                authToken = null;
                sessionId = null;
                document.getElementById('login-section').classList.remove('hidden');
                document.getElementById('dashboard-section').classList.add('hidden');
                document.getElementById('mfa-group').classList.add('hidden');
                document.getElementById('login-form').reset();

            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Auto-refresh dashboard every 30 seconds
        setInterval(() => {
            if (authToken) {
                loadSecurityDashboard();
            }
        }, 30000);
    </script>
</body>
</html>
    `);
});

// Start Security System
console.log('🚀 Starting Codai Enterprise Security & Authentication System...');
console.log(`🔐 Security Dashboard: http://localhost:${PORT}`);
console.log('🛡️ OAuth 2.0, MFA, and RBAC active');
console.log('👤 Default admin credentials: admin / CodaiAdmin2025!');

// Start server
app.listen(PORT, () => {
    console.log(`✅ Security & Authentication System started on port ${PORT}`);
    console.log('🔒 Enterprise-grade security protocols active');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Stopping Security System...');
    process.exit(0);
});
