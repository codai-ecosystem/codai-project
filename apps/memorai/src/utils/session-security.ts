/**
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
            console.log(`Cleaned up ${cleanedCount} expired sessions`);
        }
    }

    private logSecurityEvent(eventType: string, data: any): void {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: eventType,
            service: 'memorai',
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
            'Chrome': /Chrome\/([0-9.]+)/,
            'Firefox': /Firefox\/([0-9.]+)/,
            'Safari': /Safari\/([0-9.]+)/,
            'Edge': /Edge\/([0-9.]+)/
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
}