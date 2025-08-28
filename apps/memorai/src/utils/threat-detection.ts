/**
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
                    pattern: /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i
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
                    pattern: /<script[^>]*>.*?<\/script>/gi
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
        const maliciousIPs: string[] = [
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
        const counts: Record<string, number> = {};
        arr.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });

        return Object.entries(counts)
            .filter(([, count]) => (count as number) >= arr.length * 0.1) // 10% threshold
            .map(([item]) => item);
    }
}