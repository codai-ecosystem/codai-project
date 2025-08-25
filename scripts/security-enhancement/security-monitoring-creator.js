/**
 * @fileoverview Security Monitoring Creator
 * @description Creates real-time security monitoring and alerting systems
 */

import fs from 'fs';
import path from 'path';

export default function createSecurityMonitoring(dirs, appName) {
    createSecurityEventMonitor(dirs.utilsDir, appName);
    createThreatDetection(dirs.utilsDir, appName);
    createSecurityMetrics(dirs.utilsDir, appName);
    createAlertingSystem(dirs.utilsDir, appName);
    console.log(`🚨 Security monitoring system created for ${appName}`);
}

function createSecurityEventMonitor(utilsDir, appName) {
    const monitorContent = `/**
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
            const sourceKey = event.source.ip + (event.source.userId ? \`:\${event.source.userId}\` : '');
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
        console.log(\`🚨 HIGH RISK SECURITY EVENT: \${event.id}\`);
        console.log(\`Type: \${event.type}/\${event.subtype}\`);
        console.log(\`Risk Score: \${event.riskScore}\`);
        console.log(\`Source: \${event.source.ip}\`);
        
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
            console.log(\`🚨 Brute force attack detected from \${event.source.ip}\`);
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
            console.log(\`Cleaned up \${cleaned} old security events\`);
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
};`;

    fs.writeFileSync(path.join(utilsDir, 'security-event-monitor.ts'), monitorContent);
}

function createThreatDetection(utilsDir, appName) {
    const threatContent = `/**
 * @fileoverview Threat Detection System
 * @description Advanced threat detection and analysis
 */

export interface ThreatSignature {
    id: string;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'malware' | 'phishing' | 'bruteforce' | 'ddos' | 'injection' | 'anomaly';
    patterns: Array<{
        type: 'regex' | 'ip' | 'behavior' | 'frequency';
        pattern: string | RegExp;
        threshold?: number;
        timeWindow?: number; // in seconds
    }>;
}

export interface ThreatDetectionResult {
    threat: ThreatSignature;
    confidence: number;
    evidence: any[];
    timestamp: Date;
    source: string;
    recommended_actions: string[];
}

export class ThreatDetectionEngine {
    private signatures: ThreatSignature[] = [];
    private behaviorBaseline: Map<string, any> = new Map();
    private recentActivities: Array<{ timestamp: Date; source: string; activity: any }> = [];

    constructor() {
        this.loadDefaultSignatures();
        this.startBaselineLearning();
    }

    /**
     * Analyze request for threats
     */
    analyzeRequest(request: {
        ip: string;
        userAgent: string;
        path: string;
        method: string;
        headers: Record<string, string>;
        body?: any;
        userId?: string;
    }): ThreatDetectionResult[] {
        const results: ThreatDetectionResult[] = [];

        for (const signature of this.signatures) {
            const detection = this.checkSignature(signature, request);
            if (detection) {
                results.push(detection);
            }
        }

        // Record activity for behavioral analysis
        this.recordActivity(request.ip, {
            path: request.path,
            method: request.method,
            userAgent: request.userAgent,
            timestamp: new Date()
        });

        return results;
    }

    /**
     * Add custom threat signature
     */
    addSignature(signature: ThreatSignature): void {
        this.signatures.push(signature);
    }

    /**
     * Update behavior baseline
     */
    updateBaseline(source: string, behavior: any): void {
        this.behaviorBaseline.set(source, {
            ...this.behaviorBaseline.get(source),
            ...behavior,
            lastUpdated: new Date()
        });
    }

    private loadDefaultSignatures(): void {
        // SQL Injection signatures
        this.signatures.push({
            id: 'sql-injection-1',
            name: 'SQL Injection Attempt',
            description: 'Detects common SQL injection patterns',
            severity: 'high',
            category: 'injection',
            patterns: [
                {
                    type: 'regex',
                    pattern: /('|(\\-\\-)|(;)|(\\||\\|)|(\\*|\\*))/i
                },
                {
                    type: 'regex',
                    pattern: /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i
                }
            ]
        });

        // XSS signatures
        this.signatures.push({
            id: 'xss-1',
            name: 'Cross-Site Scripting Attempt',
            description: 'Detects XSS attack patterns',
            severity: 'high',
            category: 'injection',
            patterns: [
                {
                    type: 'regex',
                    pattern: /<script[^>]*>.*?<\\/script>/gi
                },
                {
                    type: 'regex',
                    pattern: /javascript:|vbscript:|onload=|onerror=|onclick=/i
                }
            ]
        });

        // Brute force signatures
        this.signatures.push({
            id: 'brute-force-1',
            name: 'Brute Force Attack',
            description: 'Detects multiple failed login attempts',
            severity: 'medium',
            category: 'bruteforce',
            patterns: [
                {
                    type: 'frequency',
                    pattern: 'failed_login',
                    threshold: 5,
                    timeWindow: 300 // 5 minutes
                }
            ]
        });

        // DDoS signatures
        this.signatures.push({
            id: 'ddos-1',
            name: 'DDoS Attack',
            description: 'Detects high request frequency from single source',
            severity: 'critical',
            category: 'ddos',
            patterns: [
                {
                    type: 'frequency',
                    pattern: 'request_count',
                    threshold: 100,
                    timeWindow: 60 // 1 minute
                }
            ]
        });

        // Malicious user agents
        this.signatures.push({
            id: 'malicious-ua-1',
            name: 'Malicious User Agent',
            description: 'Detects known malicious user agents',
            severity: 'medium',
            category: 'malware',
            patterns: [
                {
                    type: 'regex',
                    pattern: /(nikto|sqlmap|nmap|masscan|zap|burp|metasploit)/i
                }
            ]
        });
    }

    private checkSignature(signature: ThreatSignature, request: any): ThreatDetectionResult | null {
        const evidence = [];
        let matchCount = 0;

        for (const pattern of signature.patterns) {
            const match = this.checkPattern(pattern, request);
            if (match) {
                evidence.push(match);
                matchCount++;
            }
        }

        if (matchCount > 0) {
            const confidence = Math.min(1.0, matchCount / signature.patterns.length);
            
            return {
                threat: signature,
                confidence,
                evidence,
                timestamp: new Date(),
                source: request.ip,
                recommended_actions: this.getRecommendedActions(signature)
            };
        }

        return null;
    }

    private checkPattern(pattern: any, request: any): any {
        switch (pattern.type) {
            case 'regex':
                const regexMatch = this.checkRegexPattern(pattern.pattern, request);
                if (regexMatch) return regexMatch;
                break;

            case 'frequency':
                const freqMatch = this.checkFrequencyPattern(pattern, request);
                if (freqMatch) return freqMatch;
                break;

            case 'behavior':
                const behaviorMatch = this.checkBehaviorPattern(pattern, request);
                if (behaviorMatch) return behaviorMatch;
                break;

            case 'ip':
                const ipMatch = this.checkIPPattern(pattern.pattern as string, request.ip);
                if (ipMatch) return ipMatch;
                break;
        }

        return null;
    }

    private checkRegexPattern(pattern: RegExp, request: any): any {
        const searchText = JSON.stringify(request).toLowerCase();
        const match = pattern.exec(searchText);
        
        if (match) {
            return {
                type: 'regex',
                pattern: pattern.source,
                match: match[0],
                location: 'request_data'
            };
        }

        return null;
    }

    private checkFrequencyPattern(pattern: any, request: any): any {
        const timeWindow = pattern.timeWindow * 1000; // Convert to milliseconds
        const cutoff = new Date(Date.now() - timeWindow);
        
        const recentCount = this.recentActivities.filter(activity => 
            activity.source === request.ip && 
            activity.timestamp >= cutoff
        ).length;

        if (recentCount >= pattern.threshold) {
            return {
                type: 'frequency',
                pattern: pattern.pattern,
                count: recentCount,
                threshold: pattern.threshold,
                timeWindow: pattern.timeWindow
            };
        }

        return null;
    }

    private checkBehaviorPattern(pattern: any, request: any): any {
        const baseline = this.behaviorBaseline.get(request.ip);
        
        if (!baseline) return null;

        // Check for deviations from normal behavior
        const currentBehavior = this.extractBehaviorMetrics(request);
        const deviation = this.calculateBehaviorDeviation(baseline, currentBehavior);

        if (deviation > 0.7) { // 70% deviation threshold
            return {
                type: 'behavior',
                deviation,
                baseline: baseline,
                current: currentBehavior
            };
        }

        return null;
    }

    private checkIPPattern(pattern: string, ip: string): any {
        // Check against known malicious IP lists, IP ranges, etc.
        const maliciousIPs = [
            // Add known malicious IPs or IP ranges
        ];

        if (maliciousIPs.includes(ip)) {
            return {
                type: 'ip',
                ip,
                reason: 'known_malicious'
            };
        }

        return null;
    }

    private extractBehaviorMetrics(request: any): any {
        return {
            requestRate: 1, // Requests per minute
            pathPatterns: [request.path],
            userAgentConsistency: 1,
            geolocation: 'unknown',
            timePattern: new Date().getHours()
        };
    }

    private calculateBehaviorDeviation(baseline: any, current: any): number {
        // Simplified behavior deviation calculation
        let deviation = 0;
        let factors = 0;

        if (baseline.requestRate && current.requestRate) {
            const rateDiff = Math.abs(baseline.requestRate - current.requestRate) / baseline.requestRate;
            deviation += rateDiff;
            factors++;
        }

        return factors > 0 ? deviation / factors : 0;
    }

    private getRecommendedActions(signature: ThreatSignature): string[] {
        const actions = [];

        switch (signature.category) {
            case 'injection':
                actions.push('Block request');
                actions.push('Log detailed request information');
                actions.push('Alert security team');
                break;

            case 'bruteforce':
                actions.push('Temporarily block IP address');
                actions.push('Implement rate limiting');
                actions.push('Alert account owner');
                break;

            case 'ddos':
                actions.push('Activate DDoS protection');
                actions.push('Block attacking IPs');
                actions.push('Scale infrastructure');
                break;

            case 'malware':
                actions.push('Block user agent');
                actions.push('Scan for other indicators');
                actions.push('Update security rules');
                break;
        }

        return actions;
    }

    private recordActivity(source: string, activity: any): void {
        this.recentActivities.unshift({
            timestamp: new Date(),
            source,
            activity
        });

        // Keep only recent activities (last 24 hours)
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.recentActivities = this.recentActivities.filter(
            activity => activity.timestamp >= cutoff
        );
    }

    private startBaselineLearning(): void {
        // Start a process to learn normal behavior patterns
        setInterval(() => {
            this.updateBehaviorBaselines();
        }, 60 * 60 * 1000); // Every hour
    }

    private updateBehaviorBaselines(): void {
        // Analyze recent activities to update behavior baselines
        const sourceGroups = new Map<string, any[]>();
        
        this.recentActivities.forEach(activity => {
            if (!sourceGroups.has(activity.source)) {
                sourceGroups.set(activity.source, []);
            }
            sourceGroups.get(activity.source)!.push(activity);
        });

        sourceGroups.forEach((activities, source) => {
            if (activities.length >= 10) { // Minimum activities for baseline
                const behavior = this.analyzeBehaviorPattern(activities);
                this.updateBaseline(source, behavior);
            }
        });
    }

    private analyzeBehaviorPattern(activities: any[]): any {
        // Analyze activities to extract behavior patterns
        const hours = activities.map(a => a.timestamp.getHours());
        const paths = activities.map(a => a.activity.path);
        const userAgents = activities.map(a => a.activity.userAgent);

        return {
            commonHours: this.findCommonElements(hours),
            commonPaths: this.findCommonElements(paths),
            userAgentConsistency: new Set(userAgents).size / userAgents.length,
            averageRequestRate: activities.length / 24 // requests per hour
        };
    }

    private findCommonElements(arr: any[]): any[] {
        const counts = {};
        arr.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });

        return Object.entries(counts)
            .filter(([, count]) => count >= arr.length * 0.1) // 10% threshold
            .map(([item]) => item);
    }
}`;

    fs.writeFileSync(path.join(utilsDir, 'threat-detection.ts'), threatContent);
}

function createSecurityMetrics(utilsDir, appName) {
    const metricsContent = `/**
 * @fileoverview Security Metrics Collector
 * @description Collects and analyzes security-related metrics
 */

export interface SecurityMetric {
    name: string;
    value: number;
    timestamp: Date;
    tags: Record<string, string>;
    type: 'counter' | 'gauge' | 'histogram' | 'timer';
}

export interface SecurityDashboard {
    overview: {
        totalEvents: number;
        highRiskEvents: number;
        blockedRequests: number;
        activeThreats: number;
        securityScore: number;
    };
    trends: {
        eventTrends: Array<{ time: Date; count: number }>;
        threatTrends: Array<{ time: Date; threats: number }>;
        performanceImpact: Array<{ time: Date; latency: number }>;
    };
    topThreats: Array<{
        type: string;
        count: number;
        severity: string;
        trend: 'up' | 'down' | 'stable';
    }>;
    recommendations: string[];
}

export class SecurityMetricsCollector {
    private metrics: SecurityMetric[] = [];
    private maxMetrics: number = 50000;
    private aggregationWindow: number = 60; // seconds

    constructor(options: { maxMetrics?: number; aggregationWindow?: number } = {}) {
        this.maxMetrics = options.maxMetrics || 50000;
        this.aggregationWindow = options.aggregationWindow || 60;
        
        // Start periodic cleanup
        setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
    }

    /**
     * Record a security metric
     */
    recordMetric(
        name: string,
        value: number,
        type: SecurityMetric['type'] = 'counter',
        tags: Record<string, string> = {}
    ): void {
        const metric: SecurityMetric = {
            name,
            value,
            timestamp: new Date(),
            tags,
            type
        };

        this.metrics.unshift(metric);

        // Limit metrics array size
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(0, this.maxMetrics);
        }
    }

    /**
     * Get metrics by name
     */
    getMetrics(name: string, hours: number = 24): SecurityMetric[] {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.metrics.filter(metric => 
            metric.name === name && metric.timestamp >= since
        );
    }

    /**
     * Get aggregated metrics
     */
    getAggregatedMetrics(
        name: string,
        aggregation: 'sum' | 'avg' | 'max' | 'min' | 'count',
        intervalMinutes: number = 5,
        hours: number = 24
    ): Array<{ time: Date; value: number }> {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        const metrics = this.metrics.filter(metric => 
            metric.name === name && metric.timestamp >= since
        );

        const intervalMs = intervalMinutes * 60 * 1000;
        const buckets = new Map<number, SecurityMetric[]>();

        // Group metrics into time buckets
        metrics.forEach(metric => {
            const bucketTime = Math.floor(metric.timestamp.getTime() / intervalMs) * intervalMs;
            if (!buckets.has(bucketTime)) {
                buckets.set(bucketTime, []);
            }
            buckets.get(bucketTime)!.push(metric);
        });

        // Calculate aggregated values
        const result = [];
        for (const [bucketTime, bucketMetrics] of buckets.entries()) {
            let value: number;
            
            switch (aggregation) {
                case 'sum':
                    value = bucketMetrics.reduce((sum, m) => sum + m.value, 0);
                    break;
                case 'avg':
                    value = bucketMetrics.reduce((sum, m) => sum + m.value, 0) / bucketMetrics.length;
                    break;
                case 'max':
                    value = Math.max(...bucketMetrics.map(m => m.value));
                    break;
                case 'min':
                    value = Math.min(...bucketMetrics.map(m => m.value));
                    break;
                case 'count':
                    value = bucketMetrics.length;
                    break;
            }

            result.push({
                time: new Date(bucketTime),
                value
            });
        }

        return result.sort((a, b) => a.time.getTime() - b.time.getTime());
    }

    /**
     * Calculate security score
     */
    calculateSecurityScore(): number {
        const hours = 24;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        const recentMetrics = this.metrics.filter(metric => metric.timestamp >= since);

        let score = 100; // Start with perfect score

        // Deduct points for security events
        const securityEvents = recentMetrics.filter(m => m.name.startsWith('security.event'));
        const criticalEvents = securityEvents.filter(m => m.tags.severity === 'critical').length;
        const highEvents = securityEvents.filter(m => m.tags.severity === 'high').length;
        const mediumEvents = securityEvents.filter(m => m.tags.severity === 'medium').length;

        score -= criticalEvents * 10;
        score -= highEvents * 5;
        score -= mediumEvents * 2;

        // Deduct points for threats
        const threatMetrics = recentMetrics.filter(m => m.name.startsWith('security.threat'));
        score -= threatMetrics.length * 3;

        // Deduct points for failed authentications
        const authFailures = recentMetrics.filter(m => m.name === 'auth.failed').length;
        if (authFailures > 10) {
            score -= Math.min(20, authFailures - 10);
        }

        // Bonus points for good practices
        const mfaUsage = recentMetrics.filter(m => m.name === 'auth.mfa.success').length;
        const totalAuth = recentMetrics.filter(m => m.name.startsWith('auth.')).length;
        if (totalAuth > 0 && mfaUsage / totalAuth > 0.8) {
            score += 5; // Bonus for high MFA usage
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Generate security dashboard data
     */
    generateDashboard(): SecurityDashboard {
        const hours = 24;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        const recentMetrics = this.metrics.filter(metric => metric.timestamp >= since);

        // Overview
        const totalEvents = recentMetrics.filter(m => m.name.startsWith('security.event')).length;
        const highRiskEvents = recentMetrics.filter(m => 
            m.name.startsWith('security.event') && 
            (m.tags.severity === 'critical' || m.tags.severity === 'high')
        ).length;
        const blockedRequests = recentMetrics.filter(m => m.name === 'security.blocked').length;
        const activeThreats = recentMetrics.filter(m => m.name.startsWith('security.threat')).length;
        const securityScore = this.calculateSecurityScore();

        // Trends
        const eventTrends = this.getAggregatedMetrics('security.event', 'count', 60, 24);
        const threatTrends = this.getAggregatedMetrics('security.threat', 'count', 60, 24);
        const performanceImpact = this.getAggregatedMetrics('security.latency', 'avg', 60, 24);

        // Top threats
        const threatCounts = new Map<string, { count: number; severity: string }>();
        recentMetrics.filter(m => m.name.startsWith('security.threat')).forEach(metric => {
            const threatType = metric.tags.type || 'unknown';
            const severity = metric.tags.severity || 'medium';
            const current = threatCounts.get(threatType) || { count: 0, severity };
            current.count++;
            threatCounts.set(threatType, current);
        });

        const topThreats = Array.from(threatCounts.entries())
            .map(([type, data]) => ({
                type,
                count: data.count,
                severity: data.severity,
                trend: 'stable' as const // Simplified - would calculate actual trend
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Recommendations
        const recommendations = this.generateRecommendations(recentMetrics);

        return {
            overview: {
                totalEvents,
                highRiskEvents,
                blockedRequests,
                activeThreats,
                securityScore
            },
            trends: {
                eventTrends,
                threatTrends,
                performanceImpact
            },
            topThreats,
            recommendations
        };
    }

    private generateRecommendations(metrics: SecurityMetric[]): string[] {
        const recommendations = [];

        // Check for high failure rates
        const authFailures = metrics.filter(m => m.name === 'auth.failed').length;
        const totalAuth = metrics.filter(m => m.name.startsWith('auth.')).length;
        if (totalAuth > 0 && authFailures / totalAuth > 0.2) {
            recommendations.push('High authentication failure rate detected. Consider implementing additional brute force protection.');
        }

        // Check for low MFA usage
        const mfaUsage = metrics.filter(m => m.name === 'auth.mfa.success').length;
        if (totalAuth > 0 && mfaUsage / totalAuth < 0.5) {
            recommendations.push('Low MFA usage detected. Consider enforcing MFA for sensitive operations.');
        }

        // Check for many security events
        const securityEvents = metrics.filter(m => m.name.startsWith('security.event')).length;
        if (securityEvents > 100) {
            recommendations.push('High number of security events. Review security policies and monitoring rules.');
        }

        // Check for performance impact
        const avgLatency = metrics.filter(m => m.name === 'security.latency').reduce((sum, m) => sum + m.value, 0) / 
                          metrics.filter(m => m.name === 'security.latency').length;
        if (avgLatency > 100) { // > 100ms
            recommendations.push('Security middleware is impacting performance. Consider optimization.');
        }

        return recommendations.length > 0 ? recommendations : ['Security metrics look good! Keep up the excellent work.'];
    }

    private cleanup(): void {
        const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
        const originalLength = this.metrics.length;
        
        this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoff);
        
        const cleaned = originalLength - this.metrics.length;
        if (cleaned > 0) {
            console.log(\`Cleaned up \${cleaned} old security metrics\`);
        }
    }
}

// Predefined metric names
export const SecurityMetricNames = {
    // Authentication
    AUTH_SUCCESS: 'auth.success',
    AUTH_FAILED: 'auth.failed',
    AUTH_MFA_SUCCESS: 'auth.mfa.success',
    AUTH_MFA_FAILED: 'auth.mfa.failed',

    // Authorization
    AUTHZ_SUCCESS: 'authz.success',
    AUTHZ_DENIED: 'authz.denied',

    // Security events
    SECURITY_EVENT: 'security.event',
    SECURITY_THREAT: 'security.threat',
    SECURITY_BLOCKED: 'security.blocked',
    SECURITY_LATENCY: 'security.latency',

    // Vulnerabilities
    VULN_DETECTED: 'vulnerability.detected',
    VULN_FIXED: 'vulnerability.fixed',

    // Compliance
    COMPLIANCE_CHECK: 'compliance.check',
    COMPLIANCE_PASS: 'compliance.pass',
    COMPLIANCE_FAIL: 'compliance.fail'
};`;

    fs.writeFileSync(path.join(utilsDir, 'security-metrics.ts'), metricsContent);
}

function createAlertingSystem(utilsDir, appName) {
    const alertContent = `/**
 * @fileoverview Security Alerting System
 * @description Manages security alerts and notifications
 */

export interface SecurityAlert {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'authentication' | 'authorization' | 'data_breach' | 'system' | 'compliance';
    timestamp: Date;
    source: {
        component: string;
        ip?: string;
        userId?: string;
    };
    details: Record<string, any>;
    status: 'active' | 'acknowledged' | 'resolved' | 'false_positive';
    assignedTo?: string;
    resolvedAt?: Date;
    actions: Array<{
        action: string;
        timestamp: Date;
        user: string;
        details?: any;
    }>;
}

export interface AlertingRule {
    id: string;
    name: string;
    description: string;
    condition: {
        metric: string;
        operator: '>' | '<' | '==' | '!=' | 'contains';
        threshold: number | string;
        timeWindow: number; // in seconds
    };
    severity: SecurityAlert['severity'];
    enabled: boolean;
    cooldown: number; // in seconds
    actions: Array<{
        type: 'email' | 'slack' | 'webhook' | 'log';
        config: Record<string, any>;
    }>;
}

export class SecurityAlertingSystem {
    private alerts: SecurityAlert[] = [];
    private rules: AlertingRule[] = [];
    private lastAlertTime = new Map<string, Date>();
    private maxAlerts: number = 10000;

    constructor(options: { maxAlerts?: number } = {}) {
        this.maxAlerts = options.maxAlerts || 10000;
        this.initializeDefaultRules();
        
        // Start cleanup task
        setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
    }

    /**
     * Create a security alert
     */
    createAlert(alertData: Omit<SecurityAlert, 'id' | 'status' | 'actions'>): SecurityAlert {
        const alert: SecurityAlert = {
            id: this.generateAlertId(),
            status: 'active',
            actions: [],
            ...alertData
        };

        this.alerts.unshift(alert);

        // Limit alerts array size
        if (this.alerts.length > this.maxAlerts) {
            this.alerts = this.alerts.slice(0, this.maxAlerts);
        }

        // Process alert actions
        this.processAlert(alert);

        return alert;
    }

    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId: string, userId: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return false;

        alert.status = 'acknowledged';
        alert.assignedTo = userId;
        alert.actions.push({
            action: 'acknowledged',
            timestamp: new Date(),
            user: userId
        });

        return true;
    }

    /**
     * Resolve alert
     */
    resolveAlert(alertId: string, userId: string, resolution?: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return false;

        alert.status = 'resolved';
        alert.resolvedAt = new Date();
        alert.actions.push({
            action: 'resolved',
            timestamp: new Date(),
            user: userId,
            details: { resolution }
        });

        return true;
    }

    /**
     * Mark alert as false positive
     */
    markFalsePositive(alertId: string, userId: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return false;

        alert.status = 'false_positive';
        alert.resolvedAt = new Date();
        alert.actions.push({
            action: 'false_positive',
            timestamp: new Date(),
            user: userId
        });

        return true;
    }

    /**
     * Get active alerts
     */
    getActiveAlerts(): SecurityAlert[] {
        return this.alerts.filter(alert => alert.status === 'active');
    }

    /**
     * Get alerts by severity
     */
    getAlertsBySeverity(severity: SecurityAlert['severity']): SecurityAlert[] {
        return this.alerts.filter(alert => alert.severity === severity);
    }

    /**
     * Get alerts by category
     */
    getAlertsByCategory(category: SecurityAlert['category']): SecurityAlert[] {
        return this.alerts.filter(alert => alert.category === category);
    }

    /**
     * Check if metrics should trigger alerts
     */
    checkAlertingRules(metrics: Array<{ name: string; value: number; timestamp: Date }>): void {
        for (const rule of this.rules) {
            if (!rule.enabled) continue;

            // Check cooldown
            const lastAlert = this.lastAlertTime.get(rule.id);
            if (lastAlert && (Date.now() - lastAlert.getTime()) < rule.cooldown * 1000) {
                continue;
            }

            if (this.evaluateRule(rule, metrics)) {
                this.triggerAlert(rule);
                this.lastAlertTime.set(rule.id, new Date());
            }
        }
    }

    /**
     * Add custom alerting rule
     */
    addRule(rule: AlertingRule): void {
        this.rules.push(rule);
    }

    /**
     * Remove alerting rule
     */
    removeRule(ruleId: string): void {
        this.rules = this.rules.filter(rule => rule.id !== ruleId);
    }

    private initializeDefaultRules(): void {
        // High failure rate rule
        this.rules.push({
            id: 'high-auth-failure-rate',
            name: 'High Authentication Failure Rate',
            description: 'Triggers when authentication failures exceed threshold',
            condition: {
                metric: 'auth.failed',
                operator: '>',
                threshold: 10,
                timeWindow: 300 // 5 minutes
            },
            severity: 'high',
            enabled: true,
            cooldown: 600, // 10 minutes
            actions: [
                {
                    type: 'log',
                    config: { level: 'warn' }
                }
            ]
        });

        // Critical security event rule
        this.rules.push({
            id: 'critical-security-event',
            name: 'Critical Security Event',
            description: 'Triggers on any critical security event',
            condition: {
                metric: 'security.event.critical',
                operator: '>',
                threshold: 0,
                timeWindow: 60
            },
            severity: 'critical',
            enabled: true,
            cooldown: 300, // 5 minutes
            actions: [
                {
                    type: 'log',
                    config: { level: 'error' }
                }
            ]
        });

        // Brute force attack rule
        this.rules.push({
            id: 'brute-force-detected',
            name: 'Brute Force Attack Detected',
            description: 'Multiple failed login attempts from same source',
            condition: {
                metric: 'security.threat.bruteforce',
                operator: '>',
                threshold: 0,
                timeWindow: 60
            },
            severity: 'high',
            enabled: true,
            cooldown: 1800, // 30 minutes
            actions: [
                {
                    type: 'log',
                    config: { level: 'warn' }
                }
            ]
        });
    }

    private evaluateRule(rule: AlertingRule, metrics: Array<{ name: string; value: number; timestamp: Date }>): boolean {
        const timeWindow = rule.condition.timeWindow * 1000; // Convert to milliseconds
        const cutoff = new Date(Date.now() - timeWindow);

        const relevantMetrics = metrics.filter(metric => 
            metric.name === rule.condition.metric && 
            metric.timestamp >= cutoff
        );

        if (relevantMetrics.length === 0) return false;

        let testValue: number;
        
        // Calculate aggregate value based on operator
        switch (rule.condition.operator) {
            case '>':
            case '<':
                testValue = relevantMetrics.reduce((sum, m) => sum + m.value, 0);
                break;
            case '==':
            case '!=':
                testValue = relevantMetrics.length > 0 ? relevantMetrics[0].value : 0;
                break;
            case 'contains':
                // For string-based conditions
                return relevantMetrics.some(m => 
                    String(m.value).includes(String(rule.condition.threshold))
                );
            default:
                return false;
        }

        // Evaluate condition
        switch (rule.condition.operator) {
            case '>':
                return testValue > Number(rule.condition.threshold);
            case '<':
                return testValue < Number(rule.condition.threshold);
            case '==':
                return testValue === Number(rule.condition.threshold);
            case '!=':
                return testValue !== Number(rule.condition.threshold);
            default:
                return false;
        }
    }

    private triggerAlert(rule: AlertingRule): void {
        const alert = this.createAlert({
            title: rule.name,
            description: rule.description,
            severity: rule.severity,
            category: 'system',
            timestamp: new Date(),
            source: {
                component: '${appName}-alerting',
            },
            details: {
                rule: rule.id,
                condition: rule.condition
            }
        });

        // Execute alert actions
        for (const action of rule.actions) {
            this.executeAction(action, alert);
        }
    }

    private executeAction(action: any, alert: SecurityAlert): void {
        try {
            switch (action.type) {
                case 'log':
                    const level = action.config?.level || 'info';
                    console[level](\`🚨 Security Alert [\${alert.severity.toUpperCase()}]: \${alert.title}\`);
                    break;

                case 'email':
                    // Implement email sending
                    console.log(\`📧 Email alert would be sent: \${alert.title}\`);
                    break;

                case 'slack':
                    // Implement Slack notification
                    console.log(\`📱 Slack alert would be sent: \${alert.title}\`);
                    break;

                case 'webhook':
                    // Implement webhook call
                    console.log(\`🔗 Webhook would be called for: \${alert.title}\`);
                    break;
            }
        } catch (error) {
            console.error(\`Failed to execute alert action \${action.type}:\`, error);
        }
    }

    private generateAlertId(): string {
        return \`alert_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    }

    private cleanup(): void {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
        const originalLength = this.alerts.length;
        
        // Keep active alerts, remove old resolved ones
        this.alerts = this.alerts.filter(alert => 
            alert.status === 'active' || 
            alert.status === 'acknowledged' || 
            alert.timestamp >= cutoff
        );
        
        const cleaned = originalLength - this.alerts.length;
        if (cleaned > 0) {
            console.log(\`Cleaned up \${cleaned} old security alerts\`);
        }
    }

    /**
     * Get alerting statistics
     */
    getAlertingStats(): {
        totalAlerts: number;
        activeAlerts: number;
        alertsBySeverity: Record<string, number>;
        alertsByCategory: Record<string, number>;
        avgResolutionTime: number;
        falsePositiveRate: number;
    } {
        const totalAlerts = this.alerts.length;
        const activeAlerts = this.alerts.filter(a => a.status === 'active').length;
        
        const alertsBySeverity = {};
        const alertsByCategory = {};
        let totalResolutionTime = 0;
        let resolvedCount = 0;
        let falsePositives = 0;

        this.alerts.forEach(alert => {
            // Count by severity
            alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
            
            // Count by category
            alertsByCategory[alert.category] = (alertsByCategory[alert.category] || 0) + 1;
            
            // Calculate resolution time
            if (alert.resolvedAt) {
                totalResolutionTime += alert.resolvedAt.getTime() - alert.timestamp.getTime();
                resolvedCount++;
            }
            
            // Count false positives
            if (alert.status === 'false_positive') {
                falsePositives++;
            }
        });

        return {
            totalAlerts,
            activeAlerts,
            alertsBySeverity,
            alertsByCategory,
            avgResolutionTime: resolvedCount > 0 ? totalResolutionTime / resolvedCount / 1000 : 0, // in seconds
            falsePositiveRate: totalAlerts > 0 ? falsePositives / totalAlerts : 0
        };
    }
}`;

    fs.writeFileSync(path.join(utilsDir, 'security-alerting.ts'), alertContent);
}