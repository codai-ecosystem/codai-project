/**
 * @fileoverview Authentication Security Enhancer
 * @description Creates advanced authentication and session security features
 */

import fs from 'fs';
import path from 'path';

export default function createAuthSecurityEnhancer(dirs, appName) {
    createSessionSecurityManager(dirs.utilsDir, appName);
    createMultiFactorAuth(dirs.utilsDir, appName);
    createSecureAuthMiddleware(dirs.middlewareDir, appName);
    createPasswordSecurity(dirs.utilsDir, appName);
    console.log(`🔐 Authentication security system created for ${appName}`);
}

function createSessionSecurityManager(utilsDir, appName) {
    const sessionSecurityContent = `/**
 * @fileoverview Session Security Manager
 * @description Advanced session management with security features
 */

import crypto from 'crypto';

export interface SessionData {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
    createdAt: Date;
    lastActivity: Date;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint?: string;
    isActive: boolean;
    expiresAt: Date;
}

export interface SecurityContext {
    ipAddress: string;
    userAgent: string;
    deviceFingerprint?: string;
    geolocation?: string;
    riskScore: number;
}

export class SessionSecurityManager {
    private sessions = new Map<string, SessionData>();
    private sessionTimeout: number;
    private maxConcurrentSessions: number;
    private securityConfig: {
        enableIPValidation: boolean;
        enableDeviceFingerprinting: boolean;
        enableGeolocationTracking: boolean;
        maxIdleTime: number;
        requireReauthForSensitive: boolean;
    };

    constructor(
        sessionTimeout: number = 24 * 60 * 60 * 1000, // 24 hours
        maxConcurrentSessions: number = 5
    ) {
        this.sessionTimeout = sessionTimeout;
        this.maxConcurrentSessions = maxConcurrentSessions;
        this.securityConfig = {
            enableIPValidation: true,
            enableDeviceFingerprinting: true,
            enableGeolocationTracking: false,
            maxIdleTime: 30 * 60 * 1000, // 30 minutes
            requireReauthForSensitive: true
        };

        // Clean up expired sessions every 5 minutes
        setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
    }

    /**
     * Create a new secure session
     */
    async createSession(
        userId: string,
        email: string,
        role: string,
        permissions: string[],
        securityContext: SecurityContext
    ): Promise<string> {
        const sessionId = crypto.randomBytes(32).toString('hex');
        const now = new Date();
        
        // Check concurrent session limit
        await this.enforceConcurrentSessionLimit(userId);

        const sessionData: SessionData = {
            userId,
            email,
            role,
            permissions,
            createdAt: now,
            lastActivity: now,
            ipAddress: securityContext.ipAddress,
            userAgent: securityContext.userAgent,
            deviceFingerprint: securityContext.deviceFingerprint,
            isActive: true,
            expiresAt: new Date(now.getTime() + this.sessionTimeout)
        };

        this.sessions.set(sessionId, sessionData);
        
        // Log session creation
        this.logSecurityEvent('session_created', {
            sessionId,
            userId,
            ipAddress: securityContext.ipAddress,
            riskScore: securityContext.riskScore
        });

        return sessionId;
    }

    /**
     * Validate session and security context
     */
    async validateSession(sessionId: string, securityContext: SecurityContext): Promise<SessionData | null> {
        const session = this.sessions.get(sessionId);
        
        if (!session || !session.isActive) {
            return null;
        }

        // Check expiration
        if (session.expiresAt < new Date()) {
            this.invalidateSession(sessionId);
            return null;
        }

        // Check idle timeout
        const idleTime = Date.now() - session.lastActivity.getTime();
        if (idleTime > this.securityConfig.maxIdleTime) {
            this.invalidateSession(sessionId);
            this.logSecurityEvent('session_idle_timeout', { sessionId, userId: session.userId });
            return null;
        }

        // Security validations
        if (this.securityConfig.enableIPValidation && session.ipAddress !== securityContext.ipAddress) {
            this.logSecurityEvent('session_ip_mismatch', {
                sessionId,
                userId: session.userId,
                originalIP: session.ipAddress,
                newIP: securityContext.ipAddress
            });
            
            // Optionally invalidate session on IP mismatch
            if (securityContext.riskScore > 0.7) {
                this.invalidateSession(sessionId);
                return null;
            }
        }

        // Update last activity
        session.lastActivity = new Date();
        
        return session;
    }

    /**
     * Refresh session with extended timeout
     */
    async refreshSession(sessionId: string): Promise<boolean> {
        const session = this.sessions.get(sessionId);
        
        if (!session || !session.isActive) {
            return false;
        }

        session.expiresAt = new Date(Date.now() + this.sessionTimeout);
        session.lastActivity = new Date();
        
        return true;
    }

    /**
     * Invalidate a session
     */
    invalidateSession(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        
        if (session) {
            session.isActive = false;
            this.logSecurityEvent('session_invalidated', {
                sessionId,
                userId: session.userId
            });
        }
        
        this.sessions.delete(sessionId);
    }

    /**
     * Invalidate all sessions for a user
     */
    invalidateAllUserSessions(userId: string): void {
        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.userId === userId) {
                this.invalidateSession(sessionId);
            }
        }
    }

    /**
     * Get active sessions for a user
     */
    getUserActiveSessions(userId: string): Array<{
        sessionId: string;
        createdAt: Date;
        lastActivity: Date;
        ipAddress: string;
        userAgent: string;
    }> {
        const userSessions = [];
        
        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.userId === userId && session.isActive) {
                userSessions.push({
                    sessionId,
                    createdAt: session.createdAt,
                    lastActivity: session.lastActivity,
                    ipAddress: session.ipAddress,
                    userAgent: session.userAgent
                });
            }
        }
        
        return userSessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    }

    /**
     * Calculate session risk score
     */
    calculateSessionRisk(session: SessionData, securityContext: SecurityContext): number {
        let riskScore = 0;

        // IP address mismatch
        if (session.ipAddress !== securityContext.ipAddress) {
            riskScore += 0.3;
        }

        // User agent mismatch
        if (session.userAgent !== securityContext.userAgent) {
            riskScore += 0.2;
        }

        // Long idle time
        const idleTime = Date.now() - session.lastActivity.getTime();
        if (idleTime > 60 * 60 * 1000) { // 1 hour
            riskScore += 0.1;
        }

        // Device fingerprint mismatch
        if (session.deviceFingerprint && 
            securityContext.deviceFingerprint && 
            session.deviceFingerprint !== securityContext.deviceFingerprint) {
            riskScore += 0.4;
        }

        return Math.min(riskScore, 1.0);
    }

    /**
     * Require reauthentication for sensitive operations
     */
    requireReauthentication(sessionId: string, action: string): boolean {
        if (!this.securityConfig.requireReauthForSensitive) {
            return false;
        }

        const sensitiveActions = [
            'change_password',
            'update_email',
            'delete_account',
            'financial_transaction',
            'admin_action'
        ];

        return sensitiveActions.includes(action);
    }

    private async enforceConcurrentSessionLimit(userId: string): Promise<void> {
        const userSessions = this.getUserActiveSessions(userId);
        
        if (userSessions.length >= this.maxConcurrentSessions) {
            // Remove oldest session
            const oldestSession = userSessions[userSessions.length - 1];
            this.invalidateSession(oldestSession.sessionId);
            
            this.logSecurityEvent('concurrent_session_limit_enforced', {
                userId,
                removedSessionId: oldestSession.sessionId
            });
        }
    }

    private cleanupExpiredSessions(): void {
        const now = new Date();
        let cleanedCount = 0;
        
        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.expiresAt < now || !session.isActive) {
                this.sessions.delete(sessionId);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(\`Cleaned up \${cleanedCount} expired sessions\`);
        }
    }

    private logSecurityEvent(eventType: string, data: any): void {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: eventType,
            service: '${appName}',
            ...data
        };
        
        // In production, send to security monitoring system
        console.log('Security Event:', JSON.stringify(logEntry));
    }

    /**
     * Get session statistics
     */
    getSessionStatistics(): {
        totalActiveSessions: number;
        averageSessionDuration: number;
        sessionsPerUser: Map<string, number>;
        securityEvents: number;
    } {
        const userSessionCounts = new Map<string, number>();
        let totalDuration = 0;
        
        for (const session of this.sessions.values()) {
            if (session.isActive) {
                const count = userSessionCounts.get(session.userId) || 0;
                userSessionCounts.set(session.userId, count + 1);
                
                totalDuration += Date.now() - session.createdAt.getTime();
            }
        }

        return {
            totalActiveSessions: this.sessions.size,
            averageSessionDuration: this.sessions.size > 0 ? totalDuration / this.sessions.size : 0,
            sessionsPerUser: userSessionCounts,
            securityEvents: 0 // Implement security event counting if needed
        };
    }
}

// Device fingerprinting utility
export class DeviceFingerprinting {
    static generateFingerprint(userAgent: string, additionalData?: any): string {
        const fingerprintData = {
            userAgent,
            ...additionalData
        };
        
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(fingerprintData))
            .digest('hex')
            .substring(0, 32);
    }

    static extractBrowserInfo(userAgent: string): {
        browser: string;
        version: string;
        os: string;
        device: string;
    } {
        // Simplified browser detection (use a proper library in production)
        const browserPatterns = {
            'Chrome': /Chrome\\/([0-9.]+)/,
            'Firefox': /Firefox\\/([0-9.]+)/,
            'Safari': /Safari\\/([0-9.]+)/,
            'Edge': /Edge\\/([0-9.]+)/
        };

        let browser = 'Unknown';
        let version = 'Unknown';

        for (const [name, pattern] of Object.entries(browserPatterns)) {
            const match = userAgent.match(pattern);
            if (match) {
                browser = name;
                version = match[1];
                break;
            }
        }

        const os = this.detectOS(userAgent);
        const device = this.detectDevice(userAgent);

        return { browser, version, os, device };
    }

    private static detectOS(userAgent: string): string {
        const osPatterns = {
            'Windows': /Windows NT ([0-9.]+)/,
            'macOS': /Mac OS X ([0-9._]+)/,
            'Linux': /Linux/,
            'Android': /Android ([0-9.]+)/,
            'iOS': /OS ([0-9._]+)/
        };

        for (const [name, pattern] of Object.entries(osPatterns)) {
            if (pattern.test(userAgent)) {
                return name;
            }
        }

        return 'Unknown';
    }

    private static detectDevice(userAgent: string): string {
        if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
            return 'Mobile';
        } else if (/Tablet|iPad/.test(userAgent)) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }
}`;

    fs.writeFileSync(path.join(utilsDir, 'session-security.ts'), sessionSecurityContent);
}

function createMultiFactorAuth(utilsDir, appName) {
    const mfaContent = `/**
 * @fileoverview Multi-Factor Authentication (MFA)
 * @description TOTP, SMS, and backup code implementations
 */

import crypto from 'crypto';

export interface MFAMethod {
    id: string;
    type: 'totp' | 'sms' | 'email' | 'backup_codes';
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    lastUsed?: Date;
}

export interface TOTPMethod extends MFAMethod {
    type: 'totp';
    secret: string;
    qrCodeUrl?: string;
}

export interface SMSMethod extends MFAMethod {
    type: 'sms';
    phoneNumber: string;
    maskedPhoneNumber: string;
}

export interface BackupCodesMethod extends MFAMethod {
    type: 'backup_codes';
    codes: Array<{ code: string; used: boolean; usedAt?: Date }>;
}

export class MultiFactorAuth {
    private readonly secretLength = 32;
    private readonly codeLength = 6;
    private readonly timeStep = 30; // seconds
    private readonly window = 1; // allow ±1 time step

    /**
     * Generate TOTP secret and setup URL
     */
    generateTOTPSecret(userEmail: string): { secret: string; setupUrl: string; qrCodeUrl: string } {
        const secret = crypto.randomBytes(this.secretLength).toString('base64').replace(/[^A-Z0-9]/gi, '').substr(0, this.secretLength);
        const issuer = '${appName}';
        const accountName = \`\${issuer}:\${userEmail}\`;
        
        const setupUrl = \`otpauth://totp/\${encodeURIComponent(accountName)}?secret=\${secret}&issuer=\${encodeURIComponent(issuer)}\`;
        const qrCodeUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(setupUrl)}\`;

        return { secret, setupUrl, qrCodeUrl };
    }

    /**
     * Verify TOTP code
     */
    verifyTOTPCode(secret: string, code: string): boolean {
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Check current time step and adjacent ones (to handle clock drift)
        for (let i = -this.window; i <= this.window; i++) {
            const timeStep = Math.floor(currentTime / this.timeStep) + i;
            const expectedCode = this.generateTOTPCode(secret, timeStep);
            
            if (expectedCode === code) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Generate TOTP code for a given time step
     */
    private generateTOTPCode(secret: string, timeStep: number): string {
        const key = Buffer.from(secret, 'base64');
        const time = Buffer.alloc(8);
        time.writeBigUInt64BE(BigInt(timeStep), 0);

        const hmac = crypto.createHmac('sha1', key);
        hmac.update(time);
        const hash = hmac.digest();

        const offset = hash[19] & 0x0f;
        const code = (
            ((hash[offset] & 0x7f) << 24) |
            ((hash[offset + 1] & 0xff) << 16) |
            ((hash[offset + 2] & 0xff) << 8) |
            (hash[offset + 3] & 0xff)
        ) % Math.pow(10, this.codeLength);

        return code.toString().padStart(this.codeLength, '0');
    }

    /**
     * Generate SMS verification code
     */
    generateSMSCode(): { code: string; expiresAt: Date } {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        return { code, expiresAt };
    }

    /**
     * Send SMS verification code (placeholder - integrate with SMS provider)
     */
    async sendSMSCode(phoneNumber: string, code: string): Promise<boolean> {
        try {
            // Integrate with SMS provider (Twilio, AWS SNS, etc.)
            console.log(\`Sending SMS code \${code} to \${phoneNumber}\`);
            
            // Placeholder implementation
            return true;
        } catch (error) {
            console.error('SMS sending failed:', error);
            return false;
        }
    }

    /**
     * Generate backup codes
     */
    generateBackupCodes(count: number = 10): Array<{ code: string; used: boolean }> {
        const codes = [];
        
        for (let i = 0; i < count; i++) {
            const code = crypto.randomBytes(4).toString('hex').toLowerCase();
            codes.push({ code, used: false });
        }
        
        return codes;
    }

    /**
     * Verify backup code
     */
    verifyBackupCode(codes: Array<{ code: string; used: boolean; usedAt?: Date }>, inputCode: string): boolean {
        const code = codes.find(c => c.code === inputCode.toLowerCase() && !c.used);
        
        if (code) {
            code.used = true;
            code.usedAt = new Date();
            return true;
        }
        
        return false;
    }

    /**
     * Mask phone number for display
     */
    maskPhoneNumber(phoneNumber: string): string {
        if (phoneNumber.length < 4) return phoneNumber;
        
        const lastFour = phoneNumber.slice(-4);
        const masked = phoneNumber.slice(0, -4).replace(/\\d/g, '*');
        
        return masked + lastFour;
    }

    /**
     * Check if user has MFA enabled
     */
    hasMFAEnabled(methods: MFAMethod[]): boolean {
        return methods.some(method => method.isActive && method.isVerified);
    }

    /**
     * Get available MFA methods for user
     */
    getActiveMethods(methods: MFAMethod[]): MFAMethod[] {
        return methods.filter(method => method.isActive && method.isVerified);
    }

    /**
     * Validate MFA challenge
     */
    async validateMFAChallenge(
        methods: MFAMethod[],
        methodId: string,
        code: string,
        additionalData?: any
    ): Promise<{ valid: boolean; method?: MFAMethod; error?: string }> {
        const method = methods.find(m => m.id === methodId && m.isActive && m.isVerified);
        
        if (!method) {
            return { valid: false, error: 'Invalid MFA method' };
        }

        let isValid = false;

        switch (method.type) {
            case 'totp':
                const totpMethod = method as TOTPMethod;
                isValid = this.verifyTOTPCode(totpMethod.secret, code);
                break;

            case 'sms':
                // Verify SMS code (requires stored code and expiration check)
                isValid = additionalData?.storedCode === code && 
                         additionalData?.expiresAt > new Date();
                break;

            case 'backup_codes':
                const backupMethod = method as BackupCodesMethod;
                isValid = this.verifyBackupCode(backupMethod.codes, code);
                break;

            default:
                return { valid: false, error: 'Unsupported MFA method' };
        }

        if (isValid) {
            method.lastUsed = new Date();
            return { valid: true, method };
        }

        return { valid: false, error: 'Invalid verification code' };
    }

    /**
     * Generate MFA recovery token
     */
    generateRecoveryToken(userId: string): { token: string; expiresAt: Date } {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        return { token, expiresAt };
    }
}

// MFA middleware for protecting routes
export function requireMFA(options: { allowBackupCodes?: boolean } = {}) {
    return async (req: any, res: any, next: any) => {
        try {
            const user = req.user;
            
            if (!user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            // Check if user has MFA enabled
            const userMFAMethods = await getUserMFAMethods(user.sub);
            const mfa = new MultiFactorAuth();
            
            if (!mfa.hasMFAEnabled(userMFAMethods)) {
                // MFA not enabled, proceed
                return next();
            }

            // Check MFA verification in session or header
            const mfaVerified = req.session?.mfaVerified || req.headers['x-mfa-verified'];
            
            if (!mfaVerified) {
                return res.status(403).json({
                    error: 'MFA verification required',
                    mfaRequired: true,
                    availableMethods: mfa.getActiveMethods(userMFAMethods).map(method => ({
                        id: method.id,
                        type: method.type,
                        maskedInfo: method.type === 'sms' ? (method as SMSMethod).maskedPhoneNumber : undefined
                    }))
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ error: 'MFA verification failed' });
        }
    };
}

// Helper function (implement according to your data layer)
async function getUserMFAMethods(userId: string): Promise<MFAMethod[]> {
    // This should query your database for user's MFA methods
    return [];
}

// MFA setup flow helper
export class MFASetupFlow {
    private pendingSetups = new Map<string, any>();

    /**
     * Start MFA setup process
     */
    startSetup(userId: string, methodType: 'totp' | 'sms'): { setupId: string; setupData: any } {
        const setupId = crypto.randomUUID();
        const mfa = new MultiFactorAuth();
        
        let setupData;
        
        switch (methodType) {
            case 'totp':
                const userEmail = 'user@example.com'; // Get from user data
                setupData = mfa.generateTOTPSecret(userEmail);
                break;
                
            case 'sms':
                setupData = { phoneNumber: '', verificationCode: '' };
                break;
        }

        this.pendingSetups.set(setupId, {
            userId,
            methodType,
            setupData,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });

        return { setupId, setupData };
    }

    /**
     * Complete MFA setup
     */
    async completeSetup(setupId: string, verificationCode: string): Promise<{ success: boolean; method?: MFAMethod }> {
        const setup = this.pendingSetups.get(setupId);
        
        if (!setup || setup.expiresAt < new Date()) {
            return { success: false };
        }

        const mfa = new MultiFactorAuth();
        let isValid = false;

        switch (setup.methodType) {
            case 'totp':
                isValid = mfa.verifyTOTPCode(setup.setupData.secret, verificationCode);
                break;
                
            case 'sms':
                isValid = setup.setupData.verificationCode === verificationCode;
                break;
        }

        if (isValid) {
            const method: MFAMethod = {
                id: crypto.randomUUID(),
                type: setup.methodType,
                isActive: true,
                isVerified: true,
                createdAt: new Date()
            };

            // Save method to database
            this.pendingSetups.delete(setupId);
            
            return { success: true, method };
        }

        return { success: false };
    }
}`;

    fs.writeFileSync(path.join(utilsDir, 'multi-factor-auth.ts'), mfaContent);
}

function createSecureAuthMiddleware(middlewareDir, appName) {
    const authMiddlewareContent = `/**
 * @fileoverview Secure Authentication Middleware
 * @description Comprehensive authentication and authorization middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { SessionSecurityManager, SecurityContext, DeviceFingerprinting } from '../utils/session-security';
import { AuthenticationService } from '../utils/auth-utils';
import { MultiFactorAuth } from '../utils/multi-factor-auth';

export interface AuthConfig {
    requireAuth: boolean;
    requireMFA: boolean;
    requiredPermissions?: string[];
    requiredRoles?: string[];
    allowPublicAccess?: boolean;
    requireSecureConnection?: boolean;
    enableSessionSecurity?: boolean;
    enableDeviceFingerprinting?: boolean;
}

const defaultAuthConfig: AuthConfig = {
    requireAuth: true,
    requireMFA: false,
    allowPublicAccess: false,
    requireSecureConnection: process.env.NODE_ENV === 'production',
    enableSessionSecurity: true,
    enableDeviceFingerprinting: true
};

export class SecureAuthMiddleware {
    private sessionManager: SessionSecurityManager;
    private authService: AuthenticationService;
    private mfaService: MultiFactorAuth;
    private config: AuthConfig;

    constructor(config: Partial<AuthConfig> = {}) {
        this.config = { ...defaultAuthConfig, ...config };
        this.sessionManager = new SessionSecurityManager();
        this.authService = new AuthenticationService();
        this.mfaService = new MultiFactorAuth();
    }

    /**
     * Main authentication middleware
     */
    async authenticate(request: NextRequest, config?: Partial<AuthConfig>): Promise<NextResponse | null> {
        const currentConfig = { ...this.config, ...config };

        try {
            // 1. Check if public access is allowed
            if (currentConfig.allowPublicAccess && !this.hasAuthHeader(request)) {
                return null; // Allow public access
            }

            // 2. Require secure connection in production
            if (currentConfig.requireSecureConnection && !this.isSecureConnection(request)) {
                return this.errorResponse('HTTPS required', 426);
            }

            // 3. Extract and validate authentication
            const authResult = await this.validateAuthentication(request, currentConfig);
            if (authResult.error) {
                return authResult.error;
            }

            // 4. Session security validation
            if (currentConfig.enableSessionSecurity && authResult.sessionId) {
                const securityContext = this.buildSecurityContext(request);
                const session = await this.sessionManager.validateSession(authResult.sessionId, securityContext);
                
                if (!session) {
                    return this.errorResponse('Session invalid or expired', 401);
                }

                // Check for high-risk session
                const riskScore = this.sessionManager.calculateSessionRisk(session, securityContext);
                if (riskScore > 0.8) {
                    return this.errorResponse('Session security risk detected', 403);
                }
            }

            // 5. MFA validation
            if (currentConfig.requireMFA) {
                const mfaResult = await this.validateMFA(request, authResult.user);
                if (mfaResult) {
                    return mfaResult;
                }
            }

            // 6. Permission and role checks
            if (currentConfig.requiredPermissions || currentConfig.requiredRoles) {
                const authzResult = this.checkAuthorization(authResult.user, currentConfig);
                if (authzResult) {
                    return authzResult;
                }
            }

            // Authentication successful
            return null;
        } catch (error) {
            console.error('Authentication middleware error:', error);
            return this.errorResponse('Authentication failed', 500);
        }
    }

    private async validateAuthentication(
        request: NextRequest,
        config: AuthConfig
    ): Promise<{ user?: any; sessionId?: string; error?: NextResponse }> {
        // Check for JWT in Authorization header
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            try {
                const user = await this.authService.verifyToken(token);
                return { user };
            } catch (error) {
                if (config.requireAuth) {
                    return { error: this.errorResponse('Invalid token', 401) };
                }
            }
        }

        // Check for session cookie
        const sessionId = request.cookies.get('session-id')?.value;
        if (sessionId) {
            const securityContext = this.buildSecurityContext(request);
            const session = await this.sessionManager.validateSession(sessionId, securityContext);
            
            if (session) {
                return { user: session, sessionId };
            } else if (config.requireAuth) {
                return { error: this.errorResponse('Session invalid', 401) };
            }
        }

        // No authentication provided
        if (config.requireAuth) {
            return { error: this.errorResponse('Authentication required', 401) };
        }

        return {};
    }

    private async validateMFA(request: NextRequest, user: any): Promise<NextResponse | null> {
        const mfaToken = request.headers.get('x-mfa-token');
        const sessionMFAVerified = request.cookies.get('mfa-verified')?.value;

        if (!mfaToken && !sessionMFAVerified) {
            return NextResponse.json({
                error: 'MFA verification required',
                mfaRequired: true,
                challenge: 'mfa_required'
            }, { status: 403 });
        }

        // Validate MFA token if provided
        if (mfaToken) {
            try {
                const decoded = await this.authService.verifyToken(mfaToken);
                if (decoded.type !== 'mfa' || decoded.sub !== user.sub) {
                    return this.errorResponse('Invalid MFA token', 403);
                }
            } catch {
                return this.errorResponse('Invalid MFA token', 403);
            }
        }

        return null;
    }

    private checkAuthorization(user: any, config: AuthConfig): NextResponse | null {
        // Check required roles
        if (config.requiredRoles) {
            if (!this.authService.hasRole(user.role, config.requiredRoles)) {
                return this.errorResponse('Insufficient role permissions', 403);
            }
        }

        // Check required permissions
        if (config.requiredPermissions) {
            const hasAllPermissions = config.requiredPermissions.every(permission =>
                this.authService.hasPermission(user.permissions, permission)
            );

            if (!hasAllPermissions) {
                return this.errorResponse('Insufficient permissions', 403);
            }
        }

        return null;
    }

    private buildSecurityContext(request: NextRequest): SecurityContext {
        const ipAddress = this.getClientIP(request);
        const userAgent = request.headers.get('user-agent') || '';
        
        let deviceFingerprint;
        if (this.config.enableDeviceFingerprinting) {
            const additionalData = {
                acceptLanguage: request.headers.get('accept-language'),
                acceptEncoding: request.headers.get('accept-encoding')
            };
            deviceFingerprint = DeviceFingerprinting.generateFingerprint(userAgent, additionalData);
        }

        return {
            ipAddress,
            userAgent,
            deviceFingerprint,
            riskScore: 0.1 // Calculate based on various factors
        };
    }

    private hasAuthHeader(request: NextRequest): boolean {
        return !!(request.headers.get('authorization') || request.cookies.get('session-id'));
    }

    private isSecureConnection(request: NextRequest): boolean {
        return request.url.startsWith('https://') || 
               request.headers.get('x-forwarded-proto') === 'https';
    }

    private getClientIP(request: NextRequest): string {
        const forwarded = request.headers.get('x-forwarded-for');
        const real = request.headers.get('x-real-ip');
        
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        
        if (real) {
            return real;
        }
        
        return 'unknown';
    }

    private errorResponse(message: string, status: number): NextResponse {
        return NextResponse.json(
            {
                error: message,
                timestamp: new Date().toISOString(),
                status
            },
            { status }
        );
    }
}

// Middleware factory functions
export function createAuthMiddleware(config?: Partial<AuthConfig>) {
    const middleware = new SecureAuthMiddleware(config);
    
    return async (request: NextRequest): Promise<NextResponse | null> => {
        return middleware.authenticate(request);
    };
}

export function requireAuthentication(config?: Partial<AuthConfig>) {
    return createAuthMiddleware({ requireAuth: true, ...config });
}

export function requireMFA(config?: Partial<AuthConfig>) {
    return createAuthMiddleware({ requireAuth: true, requireMFA: true, ...config });
}

export function requireRole(roles: string[], config?: Partial<AuthConfig>) {
    return createAuthMiddleware({ requireAuth: true, requiredRoles: roles, ...config });
}

export function requirePermissions(permissions: string[], config?: Partial<AuthConfig>) {
    return createAuthMiddleware({ requireAuth: true, requiredPermissions: permissions, ...config });
}

// Wrapper for Next.js API routes
export function withSecureAuth<T extends (...args: any[]) => any>(
    handler: T,
    config?: Partial<AuthConfig>
): T {
    const middleware = new SecureAuthMiddleware(config);
    
    return (async (req: any, res: any, ...args: any[]) => {
        const request = req as NextRequest;
        const authResult = await middleware.authenticate(request);
        
        if (authResult) {
            // Authentication failed, return error response
            return res.status(authResult.status).json(await authResult.json());
        }
        
        // Authentication successful, proceed to handler
        return handler(req, res, ...args);
    }) as T;
}`;

    fs.writeFileSync(path.join(middlewareDir, 'secure-auth-middleware.ts'), authMiddlewareContent);
}

function createPasswordSecurity(utilsDir, appName) {
    const passwordSecurityContent = `/**
 * @fileoverview Password Security Utilities
 * @description Advanced password hashing, validation, and security features
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';

export interface PasswordPolicy {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    forbidCommonPasswords: boolean;
    forbidPersonalInfo: boolean;
    maxConsecutiveChars: number;
    minUniqueChars: number;
}

export interface PasswordStrength {
    score: number; // 0-100
    level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    feedback: string[];
    estimatedCrackTime: string;
}

export interface PasswordHistory {
    hash: string;
    createdAt: Date;
    algorithm: string;
}

export class PasswordSecurity {
    private static readonly SALT_ROUNDS = 12;
    private static readonly PBKDF2_ITERATIONS = 100000;
    private static readonly DEFAULT_POLICY: PasswordPolicy = {
        minLength: 12,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        forbidCommonPasswords: true,
        forbidPersonalInfo: true,
        maxConsecutiveChars: 3,
        minUniqueChars: 8
    };

    private static readonly COMMON_PASSWORDS = new Set([
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey',
        'dragon', 'master', 'hello', 'login', 'password1'
    ]);

    /**
     * Hash password using bcrypt
     */
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Hash password using PBKDF2 (alternative to bcrypt)
     */
    static async hashPasswordPBKDF2(password: string, salt?: Buffer): Promise<{ hash: string; salt: string }> {
        const saltBuffer = salt || crypto.randomBytes(32);
        const hash = crypto.pbkdf2Sync(password, saltBuffer, this.PBKDF2_ITERATIONS, 64, 'sha256');
        
        return {
            hash: hash.toString('hex'),
            salt: saltBuffer.toString('hex')
        };
    }

    /**
     * Verify password against hash
     */
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    }

    /**
     * Verify password against PBKDF2 hash
     */
    static async verifyPasswordPBKDF2(password: string, hash: string, salt: string): Promise<boolean> {
        try {
            const saltBuffer = Buffer.from(salt, 'hex');
            const derivedHash = crypto.pbkdf2Sync(password, saltBuffer, this.PBKDF2_ITERATIONS, 64, 'sha256');
            return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedHash);
        } catch (error) {
            console.error('PBKDF2 password verification error:', error);
            return false;
        }
    }

    /**
     * Validate password against policy
     */
    static validatePassword(
        password: string,
        userInfo?: { email?: string; name?: string; username?: string },
        policy: Partial<PasswordPolicy> = {}
    ): { isValid: boolean; errors: string[] } {
        const currentPolicy = { ...this.DEFAULT_POLICY, ...policy };
        const errors: string[] = [];

        // Length checks
        if (password.length < currentPolicy.minLength) {
            errors.push(\`Password must be at least \${currentPolicy.minLength} characters long\`);
        }
        if (password.length > currentPolicy.maxLength) {
            errors.push(\`Password must not exceed \${currentPolicy.maxLength} characters\`);
        }

        // Character type requirements
        if (currentPolicy.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (currentPolicy.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (currentPolicy.requireNumbers && !/\\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (currentPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        // Consecutive characters
        if (this.hasConsecutiveChars(password, currentPolicy.maxConsecutiveChars)) {
            errors.push(\`Password must not contain more than \${currentPolicy.maxConsecutiveChars} consecutive identical characters\`);
        }

        // Unique characters
        const uniqueChars = new Set(password).size;
        if (uniqueChars < currentPolicy.minUniqueChars) {
            errors.push(\`Password must contain at least \${currentPolicy.minUniqueChars} unique characters\`);
        }

        // Common passwords
        if (currentPolicy.forbidCommonPasswords && this.isCommonPassword(password)) {
            errors.push('Password is too common and easily guessable');
        }

        // Personal information
        if (currentPolicy.forbidPersonalInfo && userInfo) {
            if (this.containsPersonalInfo(password, userInfo)) {
                errors.push('Password must not contain personal information');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Calculate password strength score
     */
    static calculatePasswordStrength(password: string): PasswordStrength {
        let score = 0;
        const feedback: string[] = [];

        // Length scoring
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 15;
        if (password.length >= 16) score += 10;

        // Character variety scoring
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/\\d/.test(password)) score += 10;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

        // Entropy and complexity
        const uniqueChars = new Set(password).size;
        score += Math.min(uniqueChars * 2, 20);

        // Penalty for common patterns
        if (/123|abc|qwe|aaa|000/.test(password.toLowerCase())) {
            score -= 20;
            feedback.push('Avoid common patterns like 123, abc, or repeated characters');
        }

        // Penalty for dictionary words
        if (this.isCommonPassword(password)) {
            score -= 30;
            feedback.push('Avoid common passwords');
        }

        // Calculate estimated crack time
        const estimatedCrackTime = this.estimateCrackTime(password);

        // Determine strength level
        let level: PasswordStrength['level'];
        if (score < 20) level = 'very-weak';
        else if (score < 40) level = 'weak';
        else if (score < 60) level = 'fair';
        else if (score < 80) level = 'good';
        else if (score < 90) level = 'strong';
        else level = 'very-strong';

        // Add feedback based on strength
        if (level === 'very-weak' || level === 'weak') {
            feedback.push('Consider using a longer password with more character variety');
        } else if (level === 'fair') {
            feedback.push('Good password, but could be stronger with more length or complexity');
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            level,
            feedback,
            estimatedCrackTime
        };
    }

    /**
     * Generate secure random password
     */
    static generateSecurePassword(
        length: number = 16,
        options: {
            includeUppercase?: boolean;
            includeLowercase?: boolean;
            includeNumbers?: boolean;
            includeSpecialChars?: boolean;
            excludeSimilarChars?: boolean;
        } = {}
    ): string {
        const defaults = {
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSpecialChars: true,
            excludeSimilarChars: true
        };
        
        const config = { ...defaults, ...options };
        
        let charset = '';
        if (config.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (config.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (config.includeNumbers) charset += '0123456789';
        if (config.includeSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (config.excludeSimilarChars) {
            charset = charset.replace(/[0O1lI]/g, '');
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, charset.length);
            password += charset[randomIndex];
        }

        return password;
    }

    /**
     * Check password against history
     */
    static async isPasswordReused(
        password: string,
        passwordHistory: PasswordHistory[]
    ): Promise<boolean> {
        for (const historyEntry of passwordHistory) {
            const isMatch = await this.verifyPassword(password, historyEntry.hash);
            if (isMatch) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate password reset token
     */
    static generatePasswordResetToken(): { token: string; hash: string; expiresAt: Date } {
        const token = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        return { token, hash, expiresAt };
    }

    /**
     * Verify password reset token
     */
    static verifyPasswordResetToken(token: string, hash: string): boolean {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(tokenHash, 'hex'));
    }

    private static hasConsecutiveChars(password: string, maxConsecutive: number): boolean {
        let consecutiveCount = 1;
        
        for (let i = 1; i < password.length; i++) {
            if (password[i] === password[i - 1]) {
                consecutiveCount++;
                if (consecutiveCount > maxConsecutive) {
                    return true;
                }
            } else {
                consecutiveCount = 1;
            }
        }
        
        return false;
    }

    private static isCommonPassword(password: string): boolean {
        return this.COMMON_PASSWORDS.has(password.toLowerCase());
    }

    private static containsPersonalInfo(
        password: string,
        userInfo: { email?: string; name?: string; username?: string }
    ): boolean {
        const lowerPassword = password.toLowerCase();
        
        if (userInfo.email) {
            const emailParts = userInfo.email.split('@');
            if (lowerPassword.includes(emailParts[0].toLowerCase())) {
                return true;
            }
        }
        
        if (userInfo.name && lowerPassword.includes(userInfo.name.toLowerCase())) {
            return true;
        }
        
        if (userInfo.username && lowerPassword.includes(userInfo.username.toLowerCase())) {
            return true;
        }
        
        return false;
    }

    private static estimateCrackTime(password: string): string {
        const charset = this.getCharsetSize(password);
        const entropy = Math.log2(Math.pow(charset, password.length));
        
        // Assume 1 billion guesses per second
        const guessesPerSecond = 1e9;
        const totalCombinations = Math.pow(2, entropy);
        const averageCombinations = totalCombinations / 2;
        const seconds = averageCombinations / guessesPerSecond;
        
        if (seconds < 60) return 'Less than a minute';
        if (seconds < 3600) return \`\${Math.round(seconds / 60)} minutes\`;
        if (seconds < 86400) return \`\${Math.round(seconds / 3600)} hours\`;
        if (seconds < 31536000) return \`\${Math.round(seconds / 86400)} days\`;
        if (seconds < 315360000) return \`\${Math.round(seconds / 31536000)} years\`;
        return 'Centuries';
    }

    private static getCharsetSize(password: string): number {
        let size = 0;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/\\d/.test(password)) size += 10;
        if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Approximate special chars
        return size;
    }
}`;

    fs.writeFileSync(path.join(utilsDir, 'password-security.ts'), passwordSecurityContent);
}