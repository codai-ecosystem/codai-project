/**
 * @fileoverview Security Event Monitor
 * @description Real-time security event monitoring and logging
 */

import crypto from 'crypto';

export interface SecurityEvent {
    id: string;
    timestamp: Date;
    type: 'authentication' | 'authorization' | 'data_access' | 'system' | 'network' | 'application';
    subtype: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: {
        ip: string;
        userAgent?: string;
        userId?: string;
        sessionId?: string;
        deviceId?: string;
    };
    details: Record<string, any>;
    riskScore: number;
    actionsTaken: string[];
}

export interface SecurityMetrics {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topRiskSources: Array<{ source: string; count: number; avgRiskScore: number }>;
    anomalies: number;
    blockedRequests: number;
}

export class SecurityEventMonitor {
    private events: SecurityEvent[] = [];
    private eventListeners: Array<(event: SecurityEvent) => void> = [];
    private maxEvents: number = 10000;
    private anomalyThreshold: number = 0.8;

    constructor(options: { maxEvents?: number; anomalyThreshold?: number } = {}) {
        this.maxEvents = options.maxEvents || 10000;
        this.anomalyThreshold = options.anomalyThreshold || 0.8;
        
        // Start cleanup task
        setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
    }

    /**
     * Log security event
     */
    logEvent(eventData: Omit<SecurityEvent, 'id' | 'timestamp' | 'riskScore' | 'actionsTaken'>): void {
        const event: SecurityEvent = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            riskScore: this.calculateRiskScore(eventData),
            actionsTaken: [],
            ...eventData
        };

        this.events.unshift(event);
        
        // Limit events array size
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(0, this.maxEvents);
        }

        // Process event
        this.processEvent(event);
        
        // Notify listeners
        this.eventListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Event listener error:', error);
            }
        });
    }

    /**
     * Subscribe to security events
     */
    onEvent(listener: (event: SecurityEvent) => void): () => void {
        this.eventListeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            const index = this.eventListeners.indexOf(listener);
            if (index > -1) {
                this.eventListeners.splice(index, 1);
            }
        };
    }

    /**
     * Get recent security events
     */
    getRecentEvents(limit: number = 100): SecurityEvent[] {
        return this.events.slice(0, limit);
    }

    /**
     * Get events by type
     */
    getEventsByType(type: SecurityEvent['type'], hours: number = 24): SecurityEvent[] {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.events.filter(event => 
            event.type === type && event.timestamp >= since
        );
    }

    /**
     * Get high-risk events
     */
    getHighRiskEvents(threshold: number = 0.7, hours: number = 24): SecurityEvent[] {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.events.filter(event => 
            event.riskScore >= threshold && event.timestamp >= since
        );
    }

    /**
     * Get security metrics
     */
    getSecurityMetrics(hours: number = 24): SecurityMetrics {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        const recentEvents = this.events.filter(event => event.timestamp >= since);

        const eventsByType: Record<string, number> = {};
        const eventsBySeverity: Record<string, number> = {};
        const sourceRiskMap = new Map<string, { count: number; totalRisk: number }>();

        recentEvents.forEach(event => {
            // Count by type
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
            
            // Count by severity
            eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
            
            // Track source risk
            const sourceKey = event.source.ip + (event.source.userId ? `:${event.source.userId}` : '');
            const sourceData = sourceRiskMap.get(sourceKey) || { count: 0, totalRisk: 0 };
            sourceData.count++;
            sourceData.totalRisk += event.riskScore;
            sourceRiskMap.set(sourceKey, sourceData);
        });

        // Calculate top risk sources
        const topRiskSources = Array.from(sourceRiskMap.entries())
            .map(([source, data]) => ({
                source,
                count: data.count,
                avgRiskScore: data.totalRisk / data.count
            }))
            .sort((a, b) => b.avgRiskScore - a.avgRiskScore)
            .slice(0, 10);

        // Count anomalies
        const anomalies = recentEvents.filter(event => event.riskScore >= this.anomalyThreshold).length;
        
        // Count blocked requests (assuming action taken)
        const blockedRequests = recentEvents.filter(event => 
            event.actionsTaken.some(action => action.includes('blocked') || action.includes('denied'))
        ).length;

        return {
            totalEvents: recentEvents.length,
            eventsByType,
            eventsBySeverity,
            topRiskSources,
            anomalies,
            blockedRequests
        };
    }

    private calculateRiskScore(eventData: Partial<SecurityEvent>): number {
        let score = 0.1; // Base score

        // Severity weighting
        const severityWeights = {
            low: 0.2,
            medium: 0.5,
            high: 0.8,
            critical: 1.0
        };
        score += severityWeights[eventData.severity || 'low'];

        // Event type weighting
        const typeWeights = {
            authentication: 0.6,
            authorization: 0.7,
            data_access: 0.5,
            system: 0.8,
            network: 0.6,
            application: 0.4
        };
        score += typeWeights[eventData.type || 'application'];

        // Check for suspicious patterns
        if (eventData.details) {
            // Multiple failed attempts
            if (eventData.details.failedAttempts > 3) {
                score += 0.3;
            }
            
            // Unusual access patterns
            if (eventData.details.unusualTime || eventData.details.unusualLocation) {
                score += 0.2;
            }
            
            // Suspicious user agent
            if (eventData.details.suspiciousUserAgent) {
                score += 0.1;
            }
        }

        return Math.min(1.0, score);
    }

    private processEvent(event: SecurityEvent): void {
        // Auto-response based on risk score
        if (event.riskScore >= 0.9) {
            event.actionsTaken.push('high_risk_alert_triggered');
            this.triggerHighRiskAlert(event);
        }

        // Detect brute force attempts
        if (event.type === 'authentication' && event.subtype === 'failed_login') {
            this.checkBruteForce(event);
        }

        // Detect unusual access patterns
        if (event.type === 'data_access') {
            this.checkUnusualAccess(event);
        }
    }

    private triggerHighRiskAlert(event: SecurityEvent): void {
        console.log(`🚨 HIGH RISK SECURITY EVENT: ${event.id}`);
        console.log(`Type: ${event.type}/${event.subtype}`);
        console.log(`Risk Score: ${event.riskScore}`);
        console.log(`Source: ${event.source.ip}`);
        
        // In production: send to alerting system, SIEM, etc.
    }

    private checkBruteForce(event: SecurityEvent): void {
        const recentFailures = this.events
            .filter(e => 
                e.type === 'authentication' && 
                e.subtype === 'failed_login' &&
                e.source.ip === event.source.ip &&
                e.timestamp >= new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
            );

        if (recentFailures.length >= 5) {
            event.actionsTaken.push('brute_force_detected');
            console.log(`🚨 Brute force attack detected from ${event.source.ip}`);
        }
    }

    private checkUnusualAccess(event: SecurityEvent): void {
        if (!event.source.userId) return;

        // Check for unusual times or patterns
        const hour = event.timestamp.getHours();
        if (hour < 6 || hour > 22) { // Outside business hours
            event.riskScore = Math.min(1.0, event.riskScore + 0.1);
            event.actionsTaken.push('unusual_time_detected');
        }
    }

    private cleanup(): void {
        const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
        const originalLength = this.events.length;
        
        this.events = this.events.filter(event => event.timestamp >= cutoff);
        
        const cleaned = originalLength - this.events.length;
        if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} old security events`);
        }
    }
}

// Predefined event types for common security events
export const SecurityEvents = {
    // Authentication events
    LOGIN_SUCCESS: (userId: string, ip: string) => ({
        type: 'authentication' as const,
        subtype: 'login_success',
        severity: 'low' as const,
        source: { ip, userId },
        details: { success: true }
    }),

    LOGIN_FAILED: (ip: string, reason: string, attempts: number = 1) => ({
        type: 'authentication' as const,
        subtype: 'failed_login',
        severity: attempts > 3 ? 'high' as const : 'medium' as const,
        source: { ip },
        details: { reason, failedAttempts: attempts }
    }),

    // Authorization events
    ACCESS_DENIED: (userId: string, resource: string, ip: string) => ({
        type: 'authorization' as const,
        subtype: 'access_denied',
        severity: 'medium' as const,
        source: { ip, userId },
        details: { resource, denied: true }
    }),

    PRIVILEGE_ESCALATION: (userId: string, fromRole: string, toRole: string, ip: string) => ({
        type: 'authorization' as const,
        subtype: 'privilege_escalation',
        severity: 'high' as const,
        source: { ip, userId },
        details: { fromRole, toRole }
    }),

    // Data access events
    SENSITIVE_DATA_ACCESS: (userId: string, dataType: string, ip: string) => ({
        type: 'data_access' as const,
        subtype: 'sensitive_access',
        severity: 'medium' as const,
        source: { ip, userId },
        details: { dataType }
    }),

    // System events
    SYSTEM_ERROR: (error: string, component: string) => ({
        type: 'system' as const,
        subtype: 'error',
        severity: 'high' as const,
        source: { ip: 'localhost' },
        details: { error, component }
    }),

    // Network events
    SUSPICIOUS_REQUEST: (ip: string, userAgent: string, suspicious: string[]) => ({
        type: 'network' as const,
        subtype: 'suspicious_request',
        severity: 'medium' as const,
        source: { ip, userAgent },
        details: { suspiciousIndicators: suspicious }
    })
};