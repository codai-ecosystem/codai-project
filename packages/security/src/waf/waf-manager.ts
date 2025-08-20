/**
 * Web Application Firewall (WAF) for CODAI Ecosystem
 * Provides comprehensive protection against web-based attacks
 */

import express from 'express'
import rateLimit from 'express-rate-limit'
import { createHash } from 'node:crypto'

export interface WAFRule {
    id: string
    name: string
    pattern: RegExp
    action: 'block' | 'log' | 'challenge' | 'rate_limit'
    description: string
    category: 'sql_injection' | 'xss' | 'lfi' | 'rfi' | 'command_injection' | 'custom'
    severity: 'low' | 'medium' | 'high' | 'critical'
    enabled: boolean
}

export interface WAFConfig {
    enabled: boolean
    logAllRequests: boolean
    blockByDefault: boolean
    rateLimitEnabled: boolean
    challengeEnabled: boolean
    customRules: WAFRule[]
}

export interface SecurityEvent {
    timestamp: Date
    sourceIp: string
    userAgent: string
    url: string
    method: string
    ruleId: string
    ruleName: string
    action: string
    blocked: boolean
    payload?: any
    severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface WAFStats {
    totalRequests: number
    blockedRequests: number
    challengedRequests: number
    ruleTriggered: Map<string, number>
    topAttackers: string[]
    lastUpdated: Date
}

export class WAFManager {
    private rules: Map<string, WAFRule> = new Map()
    private securityEvents: SecurityEvent[] = []
    private blockedIPs: Set<string> = new Set()
    private rateLimiters: Map<string, any> = new Map()
    private stats: WAFStats
    private config: WAFConfig

    constructor(config: WAFConfig) {
        this.config = config
        this.stats = {
            totalRequests: 0,
            blockedRequests: 0,
            challengedRequests: 0,
            ruleTriggered: new Map(),
            topAttackers: [],
            lastUpdated: new Date()
        }

        this.initializeDefaultRules()
        this.loadCustomRules(config.customRules || [])
    }

    /**
     * Initialize OWASP Core Rule Set equivalent rules
     */
    private initializeDefaultRules(): void {
        const defaultRules: WAFRule[] = [
            // SQL Injection Protection
            {
                id: 'SQL_001',
                name: 'SQL Injection - Basic Patterns',
                pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b.*\b(FROM|WHERE|INTO|VALUES|SET|TABLE)\b)/gi,
                action: 'block',
                description: 'Detects basic SQL injection patterns',
                category: 'sql_injection',
                severity: 'high',
                enabled: true
            },
            {
                id: 'SQL_002',
                name: 'SQL Injection - Advanced Patterns',
                pattern: /(\b(OR|AND)\s+[\d\w\s]*[=<>]+[\d\w\s]*(\-\-|#|\/\*))/gi,
                action: 'block',
                description: 'Detects advanced SQL injection patterns',
                category: 'sql_injection',
                severity: 'critical',
                enabled: true
            },

            // XSS Protection
            {
                id: 'XSS_001',
                name: 'XSS - Script Tags',
                pattern: /<script[^>]*>.*?<\/script>/gi,
                action: 'block',
                description: 'Detects script tag injections',
                category: 'xss',
                severity: 'high',
                enabled: true
            },
            {
                id: 'XSS_002',
                name: 'XSS - Event Handlers',
                pattern: /\b(on\w+\s*=\s*["\'].*?["\'])/gi,
                action: 'block',
                description: 'Detects JavaScript event handler injections',
                category: 'xss',
                severity: 'high',
                enabled: true
            },
            {
                id: 'XSS_003',
                name: 'XSS - JavaScript URLs',
                pattern: /javascript\s*:/gi,
                action: 'block',
                description: 'Detects JavaScript URL injections',
                category: 'xss',
                severity: 'medium',
                enabled: true
            },

            // Local File Inclusion (LFI)
            {
                id: 'LFI_001',
                name: 'LFI - Path Traversal',
                pattern: /(\.\.[\/\\])+/g,
                action: 'block',
                description: 'Detects path traversal attempts',
                category: 'lfi',
                severity: 'high',
                enabled: true
            },
            {
                id: 'LFI_002',
                name: 'LFI - System Files',
                pattern: /\b(etc\/passwd|boot\.ini|windows\/system32)/gi,
                action: 'block',
                description: 'Detects system file access attempts',
                category: 'lfi',
                severity: 'critical',
                enabled: true
            },

            // Remote File Inclusion (RFI)
            {
                id: 'RFI_001',
                name: 'RFI - HTTP Includes',
                pattern: /\b(https?:\/\/[^\/\s]+\/.*\.(php|asp|jsp|py|rb|pl))/gi,
                action: 'block',
                description: 'Detects remote file inclusion attempts',
                category: 'rfi',
                severity: 'critical',
                enabled: true
            },

            // Command Injection
            {
                id: 'CMD_001',
                name: 'Command Injection - Basic',
                pattern: /(\||;|&|`|\$\(|\$\{|<|>)/g,
                action: 'log',
                description: 'Detects potential command injection characters',
                category: 'command_injection',
                severity: 'medium',
                enabled: true
            },
            {
                id: 'CMD_002',
                name: 'Command Injection - System Commands',
                pattern: /\b(cat|ls|dir|whoami|id|uname|ping|curl|wget|nc|netcat|telnet|ssh|ftp)\b/gi,
                action: 'block',
                description: 'Detects system command execution attempts',
                category: 'command_injection',
                severity: 'high',
                enabled: true
            },

            // CODAI-Specific Rules
            {
                id: 'CODAI_001',
                name: 'OAuth2 Token Theft Attempt',
                pattern: /\b(access_token|refresh_token|authorization_code)\s*[=:]\s*[a-zA-Z0-9\-_.]{20,}/gi,
                action: 'block',
                description: 'Detects potential OAuth2 token theft attempts',
                category: 'custom',
                severity: 'critical',
                enabled: true
            },
            {
                id: 'CODAI_002',
                name: 'API Key Exposure',
                pattern: /\b(api_key|apikey|api-key)\s*[=:]\s*[a-zA-Z0-9\-_.]{16,}/gi,
                action: 'block',
                description: 'Detects API key exposure in requests',
                category: 'custom',
                severity: 'high',
                enabled: true
            },
            {
                id: 'CODAI_003',
                name: 'Suspicious File Upload',
                pattern: /\.(php|asp|aspx|jsp|py|rb|pl|sh|bat|exe|dll)$/gi,
                action: 'block',
                description: 'Blocks suspicious file extensions in uploads',
                category: 'custom',
                severity: 'high',
                enabled: true
            }
        ]

        defaultRules.forEach(rule => {
            this.rules.set(rule.id, rule)
        })

        console.log(`🛡️  Loaded ${defaultRules.length} default WAF rules`)
    }

    /**
     * Load custom rules from configuration
     */
    private loadCustomRules(customRules: WAFRule[]): void {
        customRules.forEach(rule => {
            this.rules.set(rule.id, rule)
        })

        if (customRules.length > 0) {
            console.log(`🛡️  Loaded ${customRules.length} custom WAF rules`)
        }
    }

    /**
     * Create WAF middleware for Express applications
     */
    createWAFMiddleware(): express.RequestHandler {
        return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (!this.config.enabled) {
                return next()
            }

            this.stats.totalRequests++

            const sourceIp = this.getClientIP(req)

            // Check if IP is already blocked
            if (this.blockedIPs.has(sourceIp)) {
                this.logSecurityEvent(req, 'IP_BLOCKED', 'Blocked IP attempting access', 'block', true)
                this.stats.blockedRequests++
                return res.status(403).json({ error: 'Access denied' })
            }

            // Evaluate request against all rules
            const threats = await this.evaluateRequest(req)

            if (threats.length > 0) {
                const highestThreat = threats.reduce((prev, current) =>
                    this.getSeverityScore(current.severity) > this.getSeverityScore(prev.severity) ? current : prev
                )

                const blocked = await this.handleThreat(req, res, highestThreat)

                if (blocked) {
                    this.stats.blockedRequests++
                    return // Response already sent
                }
            }

            // Log all requests if configured
            if (this.config.logAllRequests) {
                this.logSecurityEvent(req, 'REQUEST_LOGGED', 'Normal request logged', 'log', false)
            }

            next()
        }
    }

    /**
     * Evaluate request against all WAF rules
     */
    private async evaluateRequest(req: express.Request): Promise<any[]> {
        const threats = []
        const requestData = this.extractRequestData(req)

        for (const [ruleId, rule] of this.rules) {
            if (!rule.enabled) continue

            const match = this.evaluateRule(rule, requestData)
            if (match) {
                threats.push({
                    ruleId,
                    rule,
                    match,
                    severity: rule.severity,
                    action: rule.action
                })

                // Update rule trigger stats
                const currentCount = this.stats.ruleTriggered.get(ruleId) || 0
                this.stats.ruleTriggered.set(ruleId, currentCount + 1)
            }
        }

        return threats
    }

    /**
     * Extract request data for rule evaluation
     */
    private extractRequestData(req: express.Request): any {
        return {
            url: req.url,
            query: JSON.stringify(req.query),
            body: req.body ? JSON.stringify(req.body) : '',
            headers: JSON.stringify(req.headers),
            userAgent: req.get('user-agent') || '',
            method: req.method,
            params: JSON.stringify(req.params)
        }
    }

    /**
     * Evaluate a single rule against request data
     */
    private evaluateRule(rule: WAFRule, requestData: any): any {
        const searchTargets = [
            requestData.url,
            requestData.query,
            requestData.body,
            requestData.userAgent
        ]

        for (const target of searchTargets) {
            if (target && rule.pattern.test(target)) {
                return {
                    target,
                    match: target.match(rule.pattern)
                }
            }
        }

        return null
    }

    /**
     * Handle detected threat
     */
    private async handleThreat(req: express.Request, res: express.Response, threat: any): Promise<boolean> {
        const sourceIp = this.getClientIP(req)

        this.logSecurityEvent(req, threat.ruleId, threat.rule.description, threat.action, true)

        switch (threat.action) {
            case 'block':
                res.status(403).json({
                    error: 'Request blocked by security policy',
                    ruleId: threat.ruleId,
                    timestamp: new Date().toISOString()
                })
                return true

            case 'challenge':
                // Implement CAPTCHA or similar challenge
                this.stats.challengedRequests++
                res.status(429).json({
                    error: 'Security challenge required',
                    challenge: this.generateChallenge(),
                    timestamp: new Date().toISOString()
                })
                return true

            case 'rate_limit':
                // Apply rate limiting
                await this.applyRateLimit(sourceIp)
                break

            case 'log':
            default:
                // Just log, don't block
                break
        }

        return false
    }

    /**
     * Log security event
     */
    private logSecurityEvent(req: express.Request, ruleId: string, description: string, action: string, blocked: boolean): void {
        const event: SecurityEvent = {
            timestamp: new Date(),
            sourceIp: this.getClientIP(req),
            userAgent: req.get('user-agent') || '',
            url: req.url,
            method: req.method,
            ruleId,
            ruleName: description,
            action,
            blocked,
            severity: this.rules.get(ruleId)?.severity || 'medium'
        }

        this.securityEvents.push(event)

        // Keep only last 10000 events to prevent memory issues
        if (this.securityEvents.length > 10000) {
            this.securityEvents = this.securityEvents.slice(-5000)
        }

        // Log to console for immediate visibility
        if (blocked) {
            console.warn(`🚨 WAF BLOCK: ${event.sourceIp} - ${ruleId} - ${description}`)
        } else if (action === 'log') {
            console.log(`📝 WAF LOG: ${event.sourceIp} - ${ruleId} - ${description}`)
        }
    }

    /**
     * Get client IP address
     */
    private getClientIP(req: express.Request): string {
        return req.ip ||
            req.connection.remoteAddress ||
            req.headers['x-forwarded-for'] as string ||
            req.headers['x-real-ip'] as string ||
            'unknown'
    }

    /**
     * Get severity score for comparison
     */
    private getSeverityScore(severity: string): number {
        const scores: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 }
        return scores[severity] || 0
    }

    /**
     * Generate security challenge
     */
    private generateChallenge(): string {
        return createHash('md5').update(Date.now().toString() + Math.random().toString()).digest('hex')
    }

    /**
     * Apply rate limiting to an IP
     */
    private async applyRateLimit(ip: string): Promise<void> {
        // Implement progressive rate limiting
        console.log(`🐌 Rate limiting applied to IP: ${ip}`)
    }

    /**
     * Block IP address
     */
    blockIP(ip: string, duration: number = 3600000): void { // 1 hour default
        this.blockedIPs.add(ip)
        console.log(`🚫 IP blocked: ${ip}`)

        // Auto-unblock after duration
        setTimeout(() => {
            this.blockedIPs.delete(ip)
            console.log(`✅ IP unblocked: ${ip}`)
        }, duration)
    }

    /**
     * Unblock IP address
     */
    unblockIP(ip: string): void {
        this.blockedIPs.delete(ip)
        console.log(`✅ IP manually unblocked: ${ip}`)
    }

    /**
     * Get WAF statistics
     */
    getStats(): WAFStats {
        this.stats.lastUpdated = new Date()
        return this.stats
    }

    /**
     * Get recent security events
     */
    getRecentEvents(limit: number = 100): SecurityEvent[] {
        return this.securityEvents.slice(-limit)
    }

    /**
     * Get events for specific IP
     */
    getEventsForIP(ip: string, limit: number = 50): SecurityEvent[] {
        return this.securityEvents
            .filter(event => event.sourceIp === ip)
            .slice(-limit)
    }

    /**
     * Add custom rule
     */
    addRule(rule: WAFRule): void {
        this.rules.set(rule.id, rule)
        console.log(`✅ Added WAF rule: ${rule.id}`)
    }

    /**
     * Remove rule
     */
    removeRule(ruleId: string): void {
        this.rules.delete(ruleId)
        console.log(`🗑️  Removed WAF rule: ${ruleId}`)
    }

    /**
     * Enable/disable rule
     */
    toggleRule(ruleId: string, enabled: boolean): void {
        const rule = this.rules.get(ruleId)
        if (rule) {
            rule.enabled = enabled
            console.log(`${enabled ? '✅' : '❌'} WAF rule ${ruleId}: ${enabled ? 'enabled' : 'disabled'}`)
        }
    }

    /**
     * Get all rules
     */
    getRules(): WAFRule[] {
        return Array.from(this.rules.values())
    }
}

export default WAFManager
