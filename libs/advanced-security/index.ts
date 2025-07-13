/**
 * CODAI Advanced Security & Threat Detection System
 * Real-time security monitoring, threat detection, and automated response
 */

export interface SecurityThreat {
    id: string
    type: 'brute_force' | 'sql_injection' | 'xss' | 'csrf' | 'ddos' | 'data_breach' | 'unauthorized_access' | 'suspicious_activity'
    severity: 'low' | 'medium' | 'high' | 'critical'
    source: string
    target: string
    timestamp: Date
    description: string
    evidence: any[]
    status: 'detected' | 'investigating' | 'mitigated' | 'resolved' | 'false_positive'
    automaticResponse: boolean
    userAgent?: string
    ipAddress?: string
    geoLocation?: { country: string; city: string; lat: number; lon: number }
}

export interface SecurityMetrics {
    threatsDetected: number
    threatsBlocked: number
    falsePositives: number
    responseTime: number
    vulnerabilitiesFound: number
    securityScore: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    lastSecurityScan: Date
    activeSessions: number
    suspiciousAttempts: number
}

export interface SecurityRule {
    id: string
    name: string
    type: 'rate_limit' | 'geo_block' | 'pattern_match' | 'behavioral' | 'ml_anomaly'
    condition: string
    action: 'block' | 'alert' | 'monitor' | 'challenge'
    priority: number
    enabled: boolean
    threshold?: number
    whitelist?: string[]
    blacklist?: string[]
}

export interface UserSession {
    id: string
    userId: string
    ipAddress: string
    userAgent: string
    startTime: Date
    lastActivity: Date
    location: { country: string; city: string }
    devices: string[]
    riskScore: number
    authenticated: boolean
    twoFactorEnabled: boolean
    permissions: string[]
}

export class AdvancedSecuritySystem {
    private threats: SecurityThreat[] = []
    private securityRules: SecurityRule[] = []
    private activeSessions: Map<string, UserSession> = new Map()
    private securityMetrics: SecurityMetrics
    private threatPatterns: Map<string, RegExp> = new Map()
    private anomalyDetector: AnomalyDetector
    private encryptionManager: EncryptionManager

    constructor() {
        this.securityMetrics = {
            threatsDetected: 0,
            threatsBlocked: 0,
            falsePositives: 0,
            responseTime: 0,
            vulnerabilitiesFound: 0,
            securityScore: 95,
            riskLevel: 'low',
            lastSecurityScan: new Date(),
            activeSessions: 0,
            suspiciousAttempts: 0
        }

        this.anomalyDetector = new AnomalyDetector()
        this.encryptionManager = new EncryptionManager()
        this.initializeSecurityRules()
        this.initializeThreatPatterns()
        this.startRealTimeMonitoring()
    }

    private initializeSecurityRules() {
        this.securityRules = [
            {
                id: 'rate_limit_login',
                name: 'Login Rate Limiting',
                type: 'rate_limit',
                condition: 'More than 5 login attempts per minute',
                action: 'challenge',
                priority: 1,
                enabled: true,
                threshold: 5
            },
            {
                id: 'geo_block_suspicious',
                name: 'Suspicious Geo-location Block',
                type: 'geo_block',
                condition: 'Login from high-risk countries',
                action: 'block',
                priority: 2,
                enabled: true,
                blacklist: ['XX', 'YY'] // Placeholder for actual risk countries
            },
            {
                id: 'sql_injection_pattern',
                name: 'SQL Injection Detection',
                type: 'pattern_match',
                condition: 'SQL injection patterns in input',
                action: 'block',
                priority: 1,
                enabled: true
            },
            {
                id: 'xss_pattern',
                name: 'XSS Attack Detection',
                type: 'pattern_match',
                condition: 'Cross-site scripting patterns',
                action: 'block',
                priority: 1,
                enabled: true
            },
            {
                id: 'behavioral_anomaly',
                name: 'Behavioral Anomaly Detection',
                type: 'behavioral',
                condition: 'Unusual user behavior patterns',
                action: 'alert',
                priority: 3,
                enabled: true
            },
            {
                id: 'ml_anomaly_detection',
                name: 'ML-based Anomaly Detection',
                type: 'ml_anomaly',
                condition: 'Machine learning detected anomaly',
                action: 'monitor',
                priority: 2,
                enabled: true
            }
        ]
    }

    private initializeThreatPatterns() {
        this.threatPatterns.set('sql_injection', /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b|'|\"|;|--|\||&)/i)
        this.threatPatterns.set('xss', /<script|javascript:|onerror|onload|onclick|alert\(|document\.|window\.|eval\(/i)
        this.threatPatterns.set('csrf', /csrf|cross.site.request.forgery/i)
        this.threatPatterns.set('path_traversal', /\.\.(\/|\\)|\/etc\/passwd|\/windows\/system32/i)
        this.threatPatterns.set('command_injection', /;|\||&|`|\\$\(|\${|exec|system|passthru|shell_exec/i)
    }

    private startRealTimeMonitoring() {
        // Monitor for security threats every 5 seconds
        setInterval(() => {
            this.scanForThreats()
            this.updateSecurityMetrics()
            this.performAnomalyDetection()
        }, 5000)

        // Perform comprehensive security scan every hour
        setInterval(() => {
            this.performComprehensiveScan()
        }, 3600000)

        // Session cleanup every 10 minutes
        setInterval(() => {
            this.cleanupExpiredSessions()
        }, 600000)
    }

    public analyzeRequest(request: {
        url: string
        method: string
        headers: Record<string, string>
        body?: string
        userAgent: string
        ipAddress: string
    }): { allowed: boolean; threats: SecurityThreat[]; riskScore: number } {
        const threats: SecurityThreat[] = []
        let riskScore = 0

        // Check against threat patterns
        const content = `${request.url} ${request.body || ''} ${JSON.stringify(request.headers)}`

        for (const [threatType, pattern] of this.threatPatterns) {
            if (pattern.test(content)) {
                const threat = this.createThreat(
                    threatType as SecurityThreat['type'],
                    'high',
                    request.ipAddress,
                    request.url,
                    `${threatType} pattern detected in request`,
                    { request, pattern: pattern.toString() }
                )
                threats.push(threat)
                riskScore += 30
            }
        }

        // Check rate limiting
        const rateLimitThreat = this.checkRateLimit(request.ipAddress, request.url)
        if (rateLimitThreat) {
            threats.push(rateLimitThreat)
            riskScore += 20
        }

        // Check geo-location
        const geoThreat = this.checkGeoLocation(request.ipAddress)
        if (geoThreat) {
            threats.push(geoThreat)
            riskScore += 25
        }

        // ML-based anomaly detection
        const anomalyScore = this.anomalyDetector.analyzeRequest(request)
        if (anomalyScore > 0.7) {
            const threat = this.createThreat(
                'suspicious_activity',
                'medium',
                request.ipAddress,
                request.url,
                `ML anomaly detection score: ${anomalyScore.toFixed(2)}`,
                { anomalyScore, request }
            )
            threats.push(threat)
            riskScore += anomalyScore * 40
        }

        // Apply security rules
        for (const rule of this.securityRules) {
            if (rule.enabled && this.evaluateRule(rule, request)) {
                const threat = this.createThreat(
                    'unauthorized_access',
                    'medium',
                    request.ipAddress,
                    request.url,
                    `Security rule triggered: ${rule.name}`,
                    { rule, request }
                )
                threats.push(threat)
                riskScore += 15
            }
        }

        const allowed = threats.every(threat => threat.severity !== 'critical') && riskScore < 80

        if (threats.length > 0) {
            this.recordThreats(threats)
            this.triggerAutomaticResponse(threats, request)
        }

        return { allowed, threats, riskScore: Math.min(100, riskScore) }
    }

    private createThreat(
        type: SecurityThreat['type'],
        severity: SecurityThreat['severity'],
        source: string,
        target: string,
        description: string,
        evidence: any
    ): SecurityThreat {
        return {
            id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity,
            source,
            target,
            timestamp: new Date(),
            description,
            evidence: [evidence],
            status: 'detected',
            automaticResponse: severity === 'critical' || severity === 'high',
            ipAddress: source,
            geoLocation: this.getGeoLocation(source) || undefined
        }
    }

    private checkRateLimit(ipAddress: string, endpoint: string): SecurityThreat | null {
        const key = `${ipAddress}:${endpoint}`
        const now = Date.now()
        const windowMs = 60000 // 1 minute

        // Get request count in the last minute
        const requests = this.getRequestHistory(key, windowMs)

        if (requests.length > 10) { // More than 10 requests per minute
            return this.createThreat(
                'ddos',
                'high',
                ipAddress,
                endpoint,
                `Rate limit exceeded: ${requests.length} requests in 1 minute`,
                { requests: requests.length, limit: 10, timeWindow: '1 minute' }
            )
        }

        return null
    }

    private checkGeoLocation(ipAddress: string): SecurityThreat | null {
        const geoLocation = this.getGeoLocation(ipAddress)
        const highRiskCountries = ['XX', 'YY', 'ZZ'] // Placeholder

        if (geoLocation && highRiskCountries.includes(geoLocation.country)) {
            return this.createThreat(
                'suspicious_activity',
                'medium',
                ipAddress,
                'system',
                `Request from high-risk country: ${geoLocation.country}`,
                { geoLocation }
            )
        }

        return null
    }

    private evaluateRule(rule: SecurityRule, request: any): boolean {
        switch (rule.type) {
            case 'rate_limit':
                return this.checkRateLimit(request.ipAddress, request.url) !== null

            case 'geo_block':
                const geo = this.getGeoLocation(request.ipAddress)
                return geo && rule.blacklist?.includes(geo.country) || false

            case 'pattern_match':
                const pattern = this.threatPatterns.get(rule.id.split('_')[0])
                return pattern ? pattern.test(JSON.stringify(request)) : false

            default:
                return false
        }
    }

    private getGeoLocation(ipAddress: string): { country: string; city: string; lat: number; lon: number } | null {
        // In production, this would use a real geo-location service
        const mockLocations = [
            { country: 'US', city: 'New York', lat: 40.7128, lon: -74.0060 },
            { country: 'GB', city: 'London', lat: 51.5074, lon: -0.1278 },
            { country: 'JP', city: 'Tokyo', lat: 35.6762, lon: 139.6503 },
            { country: 'XX', city: 'Unknown', lat: 0, lon: 0 }
        ]

        return mockLocations[Math.floor(Math.random() * mockLocations.length)]
    }

    private getRequestHistory(key: string, windowMs: number): any[] {
        // In production, this would use Redis or similar
        const stored = localStorage.getItem(`rate_limit_${key}`)
        if (!stored) return []

        const requests = JSON.parse(stored)
        const cutoff = Date.now() - windowMs

        return requests.filter((timestamp: number) => timestamp > cutoff)
    }

    private recordThreats(threats: SecurityThreat[]) {
        this.threats.push(...threats)
        this.securityMetrics.threatsDetected += threats.length

        // Keep only last 1000 threats
        if (this.threats.length > 1000) {
            this.threats = this.threats.slice(-1000)
        }

        // Store in localStorage for persistence
        localStorage.setItem('security_threats', JSON.stringify(this.threats.slice(-100)))
    }

    private triggerAutomaticResponse(threats: SecurityThreat[], request: any) {
        const criticalThreats = threats.filter(t => t.severity === 'critical')
        const highThreats = threats.filter(t => t.severity === 'high')

        if (criticalThreats.length > 0) {
            this.blockIpAddress(request.ipAddress, 'Automatic block due to critical threat')
            this.alertSecurityTeam(criticalThreats)
        }

        if (highThreats.length > 0) {
            this.increaseMonitoring(request.ipAddress)
            this.alertSecurityTeam(highThreats)
        }
    }

    private blockIpAddress(ipAddress: string, reason: string) {
        console.warn(`🚫 BLOCKED IP: ${ipAddress} - ${reason}`)

        // Add to blocked IPs list
        const blockedIps = JSON.parse(localStorage.getItem('blocked_ips') || '[]')
        blockedIps.push({
            ip: ipAddress,
            reason,
            timestamp: Date.now(),
            duration: 3600000 // 1 hour
        })
        localStorage.setItem('blocked_ips', JSON.stringify(blockedIps))
    }

    private increaseMonitoring(ipAddress: string) {
        console.info(`👁️ INCREASED MONITORING: ${ipAddress}`)

        const monitored = JSON.parse(localStorage.getItem('monitored_ips') || '[]')
        monitored.push({
            ip: ipAddress,
            timestamp: Date.now(),
            duration: 1800000 // 30 minutes
        })
        localStorage.setItem('monitored_ips', JSON.stringify(monitored))
    }

    private alertSecurityTeam(threats: SecurityThreat[]) {
        console.error(`🚨 SECURITY ALERT: ${threats.length} threat(s) detected`, threats)

        // In production, this would send real alerts via email, Slack, etc.
        const alert = {
            timestamp: Date.now(),
            threats,
            severity: threats.some(t => t.severity === 'critical') ? 'critical' : 'high'
        }

        const alerts = JSON.parse(localStorage.getItem('security_alerts') || '[]')
        alerts.push(alert)
        localStorage.setItem('security_alerts', JSON.stringify(alerts))
    }

    private scanForThreats() {
        // Scan current sessions for suspicious activity
        for (const [sessionId, session] of this.activeSessions) {
            const suspiciousActivity = this.detectSuspiciousActivity(session)
            if (suspiciousActivity) {
                const threat = this.createThreat(
                    'suspicious_activity',
                    'medium',
                    session.ipAddress,
                    'session',
                    suspiciousActivity,
                    { session }
                )
                this.recordThreats([threat])
            }
        }
    }

    private detectSuspiciousActivity(session: UserSession): string | null {
        const now = Date.now()
        const sessionDuration = now - session.startTime.getTime()
        const inactivity = now - session.lastActivity.getTime()

        // Check for suspicious patterns
        if (sessionDuration > 12 * 60 * 60 * 1000) { // More than 12 hours
            return 'Unusually long session duration'
        }

        if (session.devices.length > 3) {
            return 'Multiple devices used in same session'
        }

        if (session.riskScore > 70) {
            return 'High risk score detected'
        }

        return null
    }

    private updateSecurityMetrics() {
        this.securityMetrics.activeSessions = this.activeSessions.size
        this.securityMetrics.riskLevel = this.calculateRiskLevel()
        this.securityMetrics.securityScore = this.calculateSecurityScore()
    }

    private calculateRiskLevel(): SecurityMetrics['riskLevel'] {
        const recentThreats = this.threats.filter(t =>
            Date.now() - t.timestamp.getTime() < 3600000 // Last hour
        )

        const criticalCount = recentThreats.filter(t => t.severity === 'critical').length
        const highCount = recentThreats.filter(t => t.severity === 'high').length

        if (criticalCount > 0) return 'critical'
        if (highCount > 5) return 'high'
        if (recentThreats.length > 10) return 'medium'
        return 'low'
    }

    private calculateSecurityScore(): number {
        let score = 100

        const recentThreats = this.threats.filter(t =>
            Date.now() - t.timestamp.getTime() < 86400000 // Last 24 hours
        )

        // Deduct points for threats
        score -= recentThreats.filter(t => t.severity === 'critical').length * 15
        score -= recentThreats.filter(t => t.severity === 'high').length * 10
        score -= recentThreats.filter(t => t.severity === 'medium').length * 5
        score -= recentThreats.filter(t => t.severity === 'low').length * 2

        return Math.max(0, score)
    }

    private performAnomalyDetection() {
        const anomalies = this.anomalyDetector.detectAnomalies()

        anomalies.forEach(anomaly => {
            const threat = this.createThreat(
                'suspicious_activity',
                'medium',
                'system',
                'anomaly_detection',
                `Anomaly detected: ${anomaly.description}`,
                anomaly
            )
            this.recordThreats([threat])
        })
    }

    private performComprehensiveScan() {
        console.log('🔍 Performing comprehensive security scan...')

        // Vulnerability scanning
        this.scanForVulnerabilities()

        // Update security metrics
        this.securityMetrics.lastSecurityScan = new Date()

        console.log('✅ Comprehensive security scan completed')
    }

    private scanForVulnerabilities() {
        // Check for common vulnerabilities
        const vulnerabilities: string[] = []

        // Check HTTPS
        if (location.protocol !== 'https:') {
            vulnerabilities.push('Site not using HTTPS')
        }

        // Check CSP header
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            vulnerabilities.push('Content Security Policy not implemented')
        }

        // Check for exposed sensitive data
        if (localStorage.getItem('password') || sessionStorage.getItem('password')) {
            vulnerabilities.push('Sensitive data stored in browser storage')
        }

        this.securityMetrics.vulnerabilitiesFound = vulnerabilities.length
    }

    private cleanupExpiredSessions() {
        const now = Date.now()
        const maxInactivity = 30 * 60 * 1000 // 30 minutes

        for (const [sessionId, session] of this.activeSessions) {
            if (now - session.lastActivity.getTime() > maxInactivity) {
                this.activeSessions.delete(sessionId)
            }
        }
    }

    public createSession(userId: string, ipAddress: string, userAgent: string): UserSession {
        const session: UserSession = {
            id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            ipAddress,
            userAgent,
            startTime: new Date(),
            lastActivity: new Date(),
            location: this.getGeoLocation(ipAddress) || { country: 'Unknown', city: 'Unknown' },
            devices: [this.detectDevice(userAgent)],
            riskScore: this.calculateInitialRiskScore(ipAddress, userAgent),
            authenticated: false,
            twoFactorEnabled: false,
            permissions: []
        }

        this.activeSessions.set(session.id, session)
        return session
    }

    private detectDevice(userAgent: string): string {
        if (/mobile/i.test(userAgent)) return 'mobile'
        if (/tablet/i.test(userAgent)) return 'tablet'
        return 'desktop'
    }

    private calculateInitialRiskScore(ipAddress: string, userAgent: string): number {
        let score = 0

        // Check geo-location risk
        const geo = this.getGeoLocation(ipAddress)
        if (geo && ['XX', 'YY'].includes(geo.country)) score += 30

        // Check user agent for suspicious patterns
        if (userAgent.includes('bot') || userAgent.includes('crawler')) score += 20

        // Check if IP is in threat database
        const recentThreats = this.threats.filter(t => t.source === ipAddress)
        score += recentThreats.length * 10

        return Math.min(100, score)
    }

    public getSecurityDashboard() {
        return {
            metrics: this.securityMetrics,
            recentThreats: this.threats.slice(-10),
            activeSessions: Array.from(this.activeSessions.values()),
            securityRules: this.securityRules,
            threatSummary: this.generateThreatSummary()
        }
    }

    private generateThreatSummary() {
        const last24Hours = this.threats.filter(t =>
            Date.now() - t.timestamp.getTime() < 86400000
        )

        const byType = last24Hours.reduce((acc, threat) => {
            acc[threat.type] = (acc[threat.type] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const bySeverity = last24Hours.reduce((acc, threat) => {
            acc[threat.severity] = (acc[threat.severity] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return { byType, bySeverity, total: last24Hours.length }
    }
}

// Anomaly Detection System
class AnomalyDetector {
    private baseline: Map<string, number> = new Map()
    private thresholds: Map<string, number> = new Map()

    analyzeRequest(request: any): number {
        // Simplified ML-like anomaly detection
        let anomalyScore = 0

        // Check request size
        const requestSize = JSON.stringify(request).length
        if (requestSize > 10000) anomalyScore += 0.3

        // Check unusual headers
        const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'proxy']
        const headerCount = Object.keys(request.headers).filter(h =>
            suspiciousHeaders.some(sh => h.toLowerCase().includes(sh))
        ).length
        anomalyScore += headerCount * 0.2

        // Check request frequency
        const frequency = this.getRequestFrequency(request.ipAddress)
        if (frequency > 100) anomalyScore += 0.4

        return Math.min(1, anomalyScore)
    }

    detectAnomalies(): any[] {
        // Return detected anomalies
        return []
    }

    private getRequestFrequency(ipAddress: string): number {
        // Simplified frequency calculation
        return Math.random() * 200
    }
}

// Encryption Management System
class EncryptionManager {
    private keys: Map<string, CryptoKey> = new Map()

    async generateKey(): Promise<CryptoKey> {
        return await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        )
    }

    async encrypt(data: string, key: CryptoKey): Promise<ArrayBuffer> {
        const encoder = new TextEncoder()
        const encodedData = encoder.encode(data)
        const iv = crypto.getRandomValues(new Uint8Array(12))

        return await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encodedData
        )
    }

    async decrypt(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
        )

        const decoder = new TextDecoder()
        return decoder.decode(decryptedData)
    }
}

// Global security instance
let globalSecurity: AdvancedSecuritySystem | null = null

export function initializeSecurity(): AdvancedSecuritySystem {
    if (!globalSecurity) {
        globalSecurity = new AdvancedSecuritySystem()
    }
    return globalSecurity
}

export function getSecurity(): AdvancedSecuritySystem | null {
    return globalSecurity
}
