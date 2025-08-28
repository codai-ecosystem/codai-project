/**
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
                eventTrends: eventTrends.map(item => ({ time: item.time, count: item.value })),
                threatTrends: threatTrends.map(item => ({ time: item.time, threats: item.value })),
                performanceImpact: performanceImpact.map(item => ({ time: item.time, latency: item.value }))
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
            console.log(`Cleaned up ${cleaned} old security metrics`);
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
};