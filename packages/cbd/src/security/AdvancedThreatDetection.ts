/**
 * Advanced Threat Detection Module - Phase 4 Week 2
 * AI-powered threat detection and response system
 */

import crypto from 'crypto';

export interface ThreatSignature {
    id: string;
    name: string;
    pattern: RegExp | string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'injection' | 'authentication' | 'data_exfiltration' | 'ddos' | 'anomaly';
    description: string;
    mitigation: string;
}

export interface ThreatEvent {
    id: string;
    timestamp: Date;
    sourceIP: string;
    userAgent: string;
    endpoint: string;
    method: string;
    payload: any;
    threatSignature: ThreatSignature;
    riskScore: number;
    blocked: boolean;
    response: 'allowed' | 'blocked' | 'rate_limited' | 'monitored';
}

export interface SecurityProfile {
    userId?: string;
    ipAddress: string;
    userAgent: string;
    requestCount: number;
    failedAuthCount: number;
    suspiciousActivityCount: number;
    riskScore: number;
    lastActivity: Date;
    reputation: 'trusted' | 'suspicious' | 'malicious' | 'unknown';
}

export interface ThreatIntelligence {
    maliciousIPs: Set<string>;
    suspiciousUserAgents: Set<string>;
    knownAttackPatterns: ThreatSignature[];
    blacklistedDomains: Set<string>;
    geoLocationRisks: Map<string, number>; // country -> risk score
}

export interface DetectionMetrics {
    totalEvents: number;
    threatsDetected: number;
    threatsBlocked: number;
    falsePositives: number;
    avgRiskScore: number;
    topThreatCategories: Map<string, number>;
    detectionAccuracy: number;
}

export class AdvancedThreatDetection {
    private threatSignatures: Map<string, ThreatSignature>;
    private securityProfiles: Map<string, SecurityProfile>;
    private threatIntelligence: ThreatIntelligence;
    private threatEvents: ThreatEvent[] = [];
    private metrics: DetectionMetrics;

    constructor() {
        this.threatSignatures = new Map();
        this.securityProfiles = new Map();
        this.threatIntelligence = this.initializeThreatIntelligence();
        this.metrics = this.initializeMetrics();
        this.loadThreatSignatures();
    }

    private initializeThreatIntelligence(): ThreatIntelligence {
        return {
            maliciousIPs: new Set([
                // Common malicious IP ranges (example)
                '10.0.0.0/8',
                '192.168.0.0/16'
            ]),
            suspiciousUserAgents: new Set([
                'sqlmap',
                'nikto',
                'nmap',
                'masscan',
                'curl/7.68.0', // Often used in automated attacks
                'python-requests'
            ]),
            knownAttackPatterns: [],
            blacklistedDomains: new Set([
                'malicious-domain.com',
                'phishing-site.net'
            ]),
            geoLocationRisks: new Map([
                ['CN', 0.7], // Higher risk countries (example)
                ['RU', 0.8],
                ['US', 0.1], // Lower risk
                ['GB', 0.1]
            ])
        };
    }

    private initializeMetrics(): DetectionMetrics {
        return {
            totalEvents: 0,
            threatsDetected: 0,
            threatsBlocked: 0,
            falsePositives: 0,
            avgRiskScore: 0,
            topThreatCategories: new Map(),
            detectionAccuracy: 0.95
        };
    }

    private loadThreatSignatures(): void {
        const signatures: ThreatSignature[] = [
            // SQL Injection patterns
            {
                id: 'sql-injection-1',
                name: 'SQL Injection - Union Attack',
                pattern: /(\bunion\b.+\bselect\b)|(\bselect\b.+\bunion\b)/i,
                severity: 'high',
                category: 'injection',
                description: 'Detects SQL injection attempts using UNION operators',
                mitigation: 'Block request and sanitize input parameters'
            },
            {
                id: 'sql-injection-2',
                name: 'SQL Injection - Classic patterns',
                pattern: /('|\"|;|--|\|\||&&|\bor\b \d+=\d+|\band\b \d+=\d+)/i,
                severity: 'high',
                category: 'injection',
                description: 'Detects classic SQL injection patterns',
                mitigation: 'Block request and implement input validation'
            },

            // XSS patterns
            {
                id: 'xss-script-tag',
                name: 'Cross-Site Scripting - Script Tags',
                pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/i,
                severity: 'high',
                category: 'injection',
                description: 'Detects script tag injection attempts',
                mitigation: 'HTML encode output and validate input'
            },

            // Authentication attacks
            {
                id: 'brute-force-1',
                name: 'Brute Force Attack',
                pattern: 'BEHAVIORAL', // Special pattern for behavioral detection
                severity: 'medium',
                category: 'authentication',
                description: 'Multiple failed login attempts from same source',
                mitigation: 'Rate limit and temporary account lockout'
            },

            // Data exfiltration
            {
                id: 'data-exfil-1',
                name: 'Suspicious Data Access',
                pattern: 'BEHAVIORAL',
                severity: 'high',
                category: 'data_exfiltration',
                description: 'Unusual data access patterns detected',
                mitigation: 'Monitor and alert security team'
            },

            // DDoS patterns
            {
                id: 'ddos-rate-1',
                name: 'DDoS - High Request Rate',
                pattern: 'BEHAVIORAL',
                severity: 'medium',
                category: 'ddos',
                description: 'Abnormally high request rate detected',
                mitigation: 'Rate limiting and IP blocking'
            }
        ];

        signatures.forEach(sig => {
            this.threatSignatures.set(sig.id, sig);
        });
    }

    /**
     * Analyze incoming request for threats
     */
    public analyzeRequest(request: {
        ip: string;
        userAgent: string;
        path: string;
        method: string;
        headers: Record<string, string>;
        body?: any;
        query?: any;
        userId?: string;
    }): ThreatEvent | null {
        this.metrics.totalEvents++;

        // Get or create security profile
        const profileKey = request.userId || request.ip;
        let profile = this.securityProfiles.get(profileKey);
        if (!profile) {
            profile = this.createSecurityProfile(request.ip, request.userAgent, request.userId);
            this.securityProfiles.set(profileKey, profile);
        }

        // Update profile
        profile.requestCount++;
        profile.lastActivity = new Date();

        // Check threat intelligence
        const riskScore = this.calculateRiskScore(request, profile);

        // Detect threats
        const threat = this.detectThreats(request, profile, riskScore);

        if (threat) {
            this.metrics.threatsDetected++;
            this.threatEvents.push(threat);

            // Update profile risk
            profile.riskScore = Math.min(profile.riskScore + threat.riskScore * 0.1, 1.0);
            profile.suspiciousActivityCount++;

            // Determine response
            threat.response = this.determineResponse(threat, profile);

            if (threat.response === 'blocked') {
                this.metrics.threatsBlocked++;
                threat.blocked = true;
            }

            // Update threat category metrics
            const category = threat.threatSignature.category;
            const count = this.metrics.topThreatCategories.get(category) || 0;
            this.metrics.topThreatCategories.set(category, count + 1);

            return threat;
        }

        // Decrease risk score for legitimate requests
        profile.riskScore = Math.max(profile.riskScore - 0.01, 0);

        return null;
    }

    private createSecurityProfile(ip: string, userAgent: string, userId?: string): SecurityProfile {
        return {
            userId,
            ipAddress: ip,
            userAgent,
            requestCount: 0,
            failedAuthCount: 0,
            suspiciousActivityCount: 0,
            riskScore: 0,
            lastActivity: new Date(),
            reputation: 'unknown'
        };
    }

    private calculateRiskScore(request: any, profile: SecurityProfile): number {
        let riskScore = 0;

        // IP reputation check
        if (this.threatIntelligence.maliciousIPs.has(request.ip)) {
            riskScore += 0.8;
        }

        // User agent check
        if (this.threatIntelligence.suspiciousUserAgents.has(request.userAgent)) {
            riskScore += 0.6;
        }

        // Request frequency analysis
        const recentRequestCount = profile.requestCount;
        if (recentRequestCount > 100) { // High frequency
            riskScore += 0.3;
        }

        // Failed authentication history
        if (profile.failedAuthCount > 5) {
            riskScore += 0.4;
        }

        // Previous suspicious activity
        if (profile.suspiciousActivityCount > 0) {
            riskScore += profile.suspiciousActivityCount * 0.1;
        }

        // Current profile risk
        riskScore += profile.riskScore;

        return Math.min(riskScore, 1.0);
    }

    private detectThreats(request: any, profile: SecurityProfile, riskScore: number): ThreatEvent | null {
        // Check pattern-based signatures
        for (const [id, signature] of this.threatSignatures) {
            if (signature.pattern === 'BEHAVIORAL') {
                // Handle behavioral patterns separately
                const behavioralThreat = this.detectBehavioralThreats(request, profile, signature);
                if (behavioralThreat) {
                    return behavioralThreat;
                }
                continue;
            }

            // Check pattern against request data
            const pattern = signature.pattern as RegExp;
            const requestData = JSON.stringify({
                path: request.path,
                query: request.query,
                body: request.body,
                headers: request.headers
            });

            if (pattern.test(requestData)) {
                return this.createThreatEvent(request, signature, riskScore + 0.3);
            }
        }

        // Check if risk score alone warrants flagging
        if (riskScore > 0.7) {
            const anomalySignature: ThreatSignature = {
                id: 'anomaly-high-risk',
                name: 'High Risk Anomaly',
                pattern: 'ANOMALY',
                severity: 'medium',
                category: 'anomaly',
                description: 'Request flagged due to high cumulative risk score',
                mitigation: 'Monitor closely and apply rate limiting'
            };

            return this.createThreatEvent(request, anomalySignature, riskScore);
        }

        return null;
    }

    private detectBehavioralThreats(request: any, profile: SecurityProfile, signature: ThreatSignature): ThreatEvent | null {
        switch (signature.id) {
            case 'brute-force-1':
                if (profile.failedAuthCount > 10) {
                    return this.createThreatEvent(request, signature, 0.8);
                }
                break;

            case 'ddos-rate-1':
                if (profile.requestCount > 200) { // High request rate
                    return this.createThreatEvent(request, signature, 0.6);
                }
                break;

            case 'data-exfil-1':
                // Check for unusual data access patterns
                if (request.path.includes('/export') || request.path.includes('/download')) {
                    if (profile.requestCount > 50) {
                        return this.createThreatEvent(request, signature, 0.7);
                    }
                }
                break;
        }

        return null;
    }

    private createThreatEvent(request: any, signature: ThreatSignature, riskScore: number): ThreatEvent {
        return {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            sourceIP: request.ip,
            userAgent: request.userAgent,
            endpoint: request.path,
            method: request.method,
            payload: {
                headers: request.headers,
                query: request.query,
                body: request.body
            },
            threatSignature: signature,
            riskScore,
            blocked: false,
            response: 'monitored'
        };
    }

    private determineResponse(threat: ThreatEvent, profile: SecurityProfile): 'allowed' | 'blocked' | 'rate_limited' | 'monitored' {
        // Critical threats are always blocked
        if (threat.threatSignature.severity === 'critical') {
            return 'blocked';
        }

        // High severity threats with high risk profiles
        if (threat.threatSignature.severity === 'high' && threat.riskScore > 0.7) {
            return 'blocked';
        }

        // SQL Injection and XSS are always blocked
        if (threat.threatSignature.category === 'injection') {
            return 'blocked';
        }

        // Rate limit high-frequency requests
        if (threat.threatSignature.category === 'ddos' || profile.requestCount > 100) {
            return 'rate_limited';
        }

        // Monitor medium risk threats
        if (threat.threatSignature.severity === 'medium') {
            return 'monitored';
        }

        return 'allowed';
    }

    /**
     * Update threat intelligence with new data
     */
    public updateThreatIntelligence(updates: {
        maliciousIPs?: string[];
        suspiciousUserAgents?: string[];
        blacklistedDomains?: string[];
    }): void {
        if (updates.maliciousIPs) {
            updates.maliciousIPs.forEach(ip => this.threatIntelligence.maliciousIPs.add(ip));
        }

        if (updates.suspiciousUserAgents) {
            updates.suspiciousUserAgents.forEach(ua => this.threatIntelligence.suspiciousUserAgents.add(ua));
        }

        if (updates.blacklistedDomains) {
            updates.blacklistedDomains.forEach(domain => this.threatIntelligence.blacklistedDomains.add(domain));
        }
    }

    /**
     * Get security metrics and threat summary
     */
    public getSecurityMetrics(): DetectionMetrics & {
        recentThreats: ThreatEvent[];
        topRiskProfiles: SecurityProfile[];
        threatIntelligenceStats: {
            maliciousIPCount: number;
            suspiciousUserAgentCount: number;
            blacklistedDomainCount: number;
        };
    } {
        // Calculate average risk score
        const totalRiskScore = this.threatEvents.reduce((sum, event) => sum + event.riskScore, 0);
        this.metrics.avgRiskScore = this.threatEvents.length > 0 ? totalRiskScore / this.threatEvents.length : 0;

        // Get recent threats (last 100)
        const recentThreats = this.threatEvents.slice(-100);

        // Get top risk profiles
        const sortedProfiles = Array.from(this.securityProfiles.values())
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 10);

        return {
            ...this.metrics,
            recentThreats,
            topRiskProfiles: sortedProfiles,
            threatIntelligenceStats: {
                maliciousIPCount: this.threatIntelligence.maliciousIPs.size,
                suspiciousUserAgentCount: this.threatIntelligence.suspiciousUserAgents.size,
                blacklistedDomainCount: this.threatIntelligence.blacklistedDomains.size
            }
        };
    }

    /**
     * Block IP address
     */
    public blockIP(ip: string, reason: string): void {
        this.threatIntelligence.maliciousIPs.add(ip);

        // Update all profiles for this IP
        for (const [key, profile] of this.securityProfiles) {
            if (profile.ipAddress === ip) {
                profile.reputation = 'malicious';
                profile.riskScore = 1.0;
            }
        }
    }

    /**
     * Report false positive to improve detection accuracy
     */
    public reportFalsePositive(eventId: string): void {
        const event = this.threatEvents.find(e => e.id === eventId);
        if (event) {
            this.metrics.falsePositives++;

            // Adjust detection accuracy
            this.metrics.detectionAccuracy = Math.max(
                (this.metrics.threatsDetected - this.metrics.falsePositives) / this.metrics.threatsDetected,
                0
            );
        }
    }

    /**
     * Generate threat intelligence report
     */
    public generateThreatReport(timeRange: { from: Date; to: Date }): {
        summary: {
            totalThreats: number;
            blockedThreats: number;
            topCategories: Array<{ category: string; count: number }>;
            avgRiskScore: number;
            detectionAccuracy: number;
        };
        timeline: Array<{ date: string; threats: number }>;
        topSources: Array<{ ip: string; threats: number; riskScore: number }>;
        recommendations: string[];
    } {
        const filteredEvents = this.threatEvents.filter(
            event => event.timestamp >= timeRange.from && event.timestamp <= timeRange.to
        );

        // Top categories
        const categoryMap = new Map<string, number>();
        filteredEvents.forEach(event => {
            const category = event.threatSignature.category;
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        });

        const topCategories = Array.from(categoryMap.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Timeline (daily aggregation)
        const timelineMap = new Map<string, number>();
        filteredEvents.forEach(event => {
            const date = event.timestamp.toISOString().split('T')[0];
            timelineMap.set(date, (timelineMap.get(date) || 0) + 1);
        });

        const timeline = Array.from(timelineMap.entries())
            .map(([date, threats]) => ({ date, threats }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Top threat sources
        const sourceMap = new Map<string, { threats: number; riskScore: number }>();
        filteredEvents.forEach(event => {
            const ip = event.sourceIP;
            const existing = sourceMap.get(ip) || { threats: 0, riskScore: 0 };
            sourceMap.set(ip, {
                threats: existing.threats + 1,
                riskScore: Math.max(existing.riskScore, event.riskScore)
            });
        });

        const topSources = Array.from(sourceMap.entries())
            .map(([ip, data]) => ({ ip, ...data }))
            .sort((a, b) => b.threats - a.threats)
            .slice(0, 10);

        // Generate recommendations
        const recommendations: string[] = [];

        if (this.metrics.falsePositives / this.metrics.threatsDetected > 0.1) {
            recommendations.push('Consider tuning threat detection rules to reduce false positives');
        }

        if (topCategories[0]?.category === 'injection') {
            recommendations.push('Implement stricter input validation and sanitization');
        }

        if (this.metrics.avgRiskScore > 0.5) {
            recommendations.push('Consider implementing additional authentication factors');
        }

        return {
            summary: {
                totalThreats: filteredEvents.length,
                blockedThreats: filteredEvents.filter(e => e.blocked).length,
                topCategories,
                avgRiskScore: this.metrics.avgRiskScore,
                detectionAccuracy: this.metrics.detectionAccuracy
            },
            timeline,
            topSources,
            recommendations
        };
    }

    /**
     * Get threat metrics for monitoring
     */
    public getThreatMetrics(): {
        totalThreats: number;
        activeThreatProfiles: number;
        threatLevel: string;
        detectionAccuracy: number;
        recentThreats: number;
        topThreatTypes: string[];
    } {
        const recentEvents = this.threatEvents.filter(event =>
            event.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        // Determine threat level based on recent activity
        let threatLevel: string;
        if (recentEvents.length === 0) threatLevel = 'low';
        else if (recentEvents.length < 10) threatLevel = 'medium';
        else threatLevel = 'high';

        // Get top threat types
        const threatTypeCounts = new Map<string, number>();
        recentEvents.forEach(event => {
            const threatType = event.threatSignature.category;
            const count = threatTypeCounts.get(threatType) || 0;
            threatTypeCounts.set(threatType, count + 1);
        });

        const topThreatTypes = Array.from(threatTypeCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, _]) => type);

        return {
            totalThreats: this.threatEvents.length,
            activeThreatProfiles: this.securityProfiles.size,
            threatLevel,
            detectionAccuracy: this.metrics.detectionAccuracy,
            recentThreats: recentEvents.length,
            topThreatTypes
        };
    }
}
