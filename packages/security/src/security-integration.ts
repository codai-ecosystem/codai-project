/**
 * Security Middleware Integration for CODAI Ecosystem
 * Combines TLS, WAF, and other security measures
 */

import express from 'express'
import TLSManager from './tls/tls-manager'
import WAFManager from './waf/waf-manager'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

export interface SecurityConfig {
    serviceName: string
    port: number
    httpsEnabled: boolean
    wafEnabled: boolean
    rateLimitEnabled: boolean
    helmetEnabled: boolean
    customCertPath?: string
    customKeyPath?: string
    wafConfig?: any
}

export interface SecurityStats {
    serviceName: string
    startTime: Date
    httpsEnabled: boolean
    certificateExpiry?: Date
    wafStats?: any
    rateLimitStats?: any
    securityEvents: number
    lastSecurityCheck: Date
}

export class SecurityIntegration {
    private tlsManager: TLSManager
    private wafManager?: WAFManager
    private config: SecurityConfig
    private stats: SecurityStats

    constructor(config: SecurityConfig) {
        this.config = config
        this.tlsManager = new TLSManager()

        if (config.wafEnabled) {
            this.wafManager = new WAFManager(config.wafConfig || {
                enabled: true,
                logAllRequests: false,
                blockByDefault: false,
                rateLimitEnabled: true,
                challengeEnabled: true,
                customRules: []
            })
        }

        this.stats = {
            serviceName: config.serviceName,
            startTime: new Date(),
            httpsEnabled: config.httpsEnabled,
            securityEvents: 0,
            lastSecurityCheck: new Date()
        }
    }

    /**
     * Apply comprehensive security middleware to Express app
     */
    async applySecurityMiddleware(app: express.Application): Promise<void> {
        console.log(`🔒 Applying security middleware for ${this.config.serviceName}`)

        // 1. Helmet for basic security headers (if enabled)
        if (this.config.helmetEnabled) {
            app.use(helmet({
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        imgSrc: ["'self'", "data:", "https:"],
                        connectSrc: ["'self'", "wss:", "https:"],
                        fontSrc: ["'self'", "data:"],
                        objectSrc: ["'none'"],
                        mediaSrc: ["'self'"],
                        frameSrc: ["'none'"],
                        frameAncestors: ["'none'"]
                    },
                },
                crossOriginEmbedderPolicy: false,
                hsts: {
                    maxAge: 31536000,
                    includeSubDomains: true,
                    preload: true
                }
            }))
            console.log('🪖 Helmet security headers applied')
        }

        // 2. Custom security headers
        this.addCustomSecurityHeaders(app)

        // 3. Rate limiting (if enabled)
        if (this.config.rateLimitEnabled) {
            this.addRateLimit(app)
        }

        // 4. WAF protection (if enabled)
        if (this.config.wafEnabled && this.wafManager) {
            app.use(this.wafManager.createWAFMiddleware())
            console.log('🛡️  WAF protection enabled')
        }

        // 5. Request/Response sanitization
        this.addSanitizationMiddleware(app)

        // 6. Security monitoring
        this.addSecurityMonitoring(app)

        console.log(`✅ Security middleware applied for ${this.config.serviceName}`)
    }

    /**
     * Start secure server with HTTPS/TLS
     */
    async startSecureServer(app: express.Application): Promise<void> {
        if (this.config.httpsEnabled) {
            // Load or generate certificates
            if (this.config.customCertPath && this.config.customKeyPath) {
                await this.tlsManager.loadCertificate(
                    this.config.serviceName,
                    this.config.customCertPath,
                    this.config.customKeyPath
                )
            } else {
                await this.tlsManager.generateSelfSignedCert(this.config.serviceName)
            }

            // Start HTTPS server with redirect
            await this.tlsManager.createSecureServer(app, this.config.serviceName, this.config.port)

            const certInfo = this.tlsManager.getCertificateInfo(this.config.serviceName)
            this.stats.certificateExpiry = certInfo?.expiryDate

            console.log(`🔒 ${this.config.serviceName} secure server started on ports ${this.config.port} (HTTP redirect) and ${this.config.port + 443} (HTTPS)`)
        } else {
            // Start HTTP server with security warning
            app.listen(this.config.port, () => {
                console.warn(`⚠️  ${this.config.serviceName} HTTP server started on port ${this.config.port} - HTTPS is DISABLED`)
            })
        }
    }

    /**
     * Add custom security headers
     */
    private addCustomSecurityHeaders(app: express.Application): void {
        app.use((req, res, next) => {
            // Additional security headers beyond Helmet
            res.setHeader('X-Powered-By', 'CODAI-Security')
            res.setHeader('X-Security-Scanner', 'enabled')
            res.setHeader('X-Rate-Limit-Policy', 'strict')

            // Custom CODAI headers
            res.setHeader('X-CODAI-Service', this.config.serviceName)
            res.setHeader('X-CODAI-Security-Version', '2.0')

            next()
        })
    }

    /**
     * Add rate limiting
     */
    private addRateLimit(app: express.Application): void {
        // General API rate limiting
        const generalLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // limit each IP to 1000 requests per windowMs
            message: {
                error: 'Too many requests from this IP',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
        })

        // Auth endpoint specific rate limiting (stricter)
        const authLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10, // limit each IP to 10 login attempts per windowMs
            message: {
                error: 'Too many authentication attempts',
                retryAfter: '15 minutes'
            },
            skipSuccessfulRequests: true,
        })

        // OAuth2 endpoint specific rate limiting
        const oauthLimiter = rateLimit({
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 50, // limit each IP to 50 OAuth requests per windowMs
            message: {
                error: 'Too many OAuth requests',
                retryAfter: '5 minutes'
            }
        })

        app.use(generalLimiter)
        app.use('/api/auth', authLimiter)
        app.use('/api/oauth2', oauthLimiter)

        console.log('🐌 Rate limiting configured')
    }

    /**
     * Add request/response sanitization
     */
    private addSanitizationMiddleware(app: express.Application): void {
        app.use((req, res, next) => {
            // Remove potentially dangerous headers
            delete req.headers['x-forwarded-host']
            delete req.headers['x-original-host']

            // Sanitize query parameters
            if (req.query) {
                this.sanitizeObject(req.query)
            }

            // Sanitize request body
            if (req.body) {
                this.sanitizeObject(req.body)
            }

            next()
        })
    }

    /**
     * Sanitize object recursively
     */
    private sanitizeObject(obj: any): void {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Remove common XSS patterns
                obj[key] = obj[key]
                    .replace(/<script[^>]*>.*?<\/script>/gi, '')
                    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '')
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.sanitizeObject(obj[key])
            }
        }
    }

    /**
     * Add security monitoring
     */
    private addSecurityMonitoring(app: express.Application): void {
        app.use((req, res, next) => {
            // Track security events
            this.stats.securityEvents++
            this.stats.lastSecurityCheck = new Date()

            // Log suspicious requests
            const suspicious = this.detectSuspiciousRequest(req)
            if (suspicious) {
                console.warn(`🚨 Suspicious request: ${req.ip} - ${req.method} ${req.url}`)
            }

            next()
        })
    }

    /**
     * Detect suspicious request patterns
     */
    private detectSuspiciousRequest(req: express.Request): boolean {
        const suspiciousPatterns = [
            /\.\.[\/\\]/,  // Path traversal
            /<script/i,    // XSS attempts
            /union.*select/i,  // SQL injection
            /cmd\.exe/i,   // Command injection
            /\/admin/i     // Admin path probing
        ]

        const checkString = `${req.url} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)}`
        return suspiciousPatterns.some(pattern => pattern.test(checkString))
    }

    /**
     * Get security statistics
     */
    getSecurityStats(): SecurityStats {
        this.stats.wafStats = this.wafManager?.getStats()
        return this.stats
    }

    /**
     * Perform security health check
     */
    async performSecurityHealthCheck(): Promise<any> {
        const healthCheck = {
            serviceName: this.config.serviceName,
            timestamp: new Date(),
            httpsEnabled: this.config.httpsEnabled,
            wafEnabled: this.config.wafEnabled,
            certificateStatus: 'unknown',
            wafRulesActive: 0,
            securityEvents: this.stats.securityEvents,
            recommendations: [] as string[]
        }

        // Check certificate status
        if (this.config.httpsEnabled) {
            const certInfo = this.tlsManager.getCertificateInfo(this.config.serviceName)
            if (certInfo) {
                const daysUntilExpiry = Math.ceil((certInfo.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                healthCheck.certificateStatus = daysUntilExpiry > 30 ? 'good' : 'expiring_soon'

                if (daysUntilExpiry <= 30) {
                    healthCheck.recommendations.push('Certificate expires within 30 days - consider renewal')
                }
            }
        } else {
            healthCheck.recommendations.push('HTTPS is disabled - enable for production use')
        }

        // Check WAF status
        if (this.wafManager) {
            const wafRules = this.wafManager.getRules()
            healthCheck.wafRulesActive = wafRules.filter(rule => rule.enabled).length
        } else {
            healthCheck.recommendations.push('WAF is disabled - enable for better protection')
        }

        return healthCheck
    }

    /**
     * Update security configuration
     */
    updateConfig(newConfig: Partial<SecurityConfig>): void {
        this.config = { ...this.config, ...newConfig }
        console.log(`🔧 Security configuration updated for ${this.config.serviceName}`)
    }

    /**
     * Shutdown security services gracefully
     */
    async shutdown(): Promise<void> {
        console.log(`🛑 Shutting down security services for ${this.config.serviceName}`)

        // Perform final security check
        await this.tlsManager.checkAndRenewCertificates()

        console.log(`✅ Security services shutdown complete for ${this.config.serviceName}`)
    }
}

export default SecurityIntegration
