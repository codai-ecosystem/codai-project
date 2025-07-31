/**
 * Security Hardening Service
 * Addresses medium-priority security vulnerabilities from Phase 2
 */

import express from 'express'
import rateLimit from 'express-rate-limit'

export interface SecurityHardeningConfig {
    disableTraceMethod: boolean
    enableRateLimit: boolean
    rateLimitWindowMs: number
    rateLimitMaxRequests: number
    enableSecurityHeaders: boolean
    corsOrigins: string[]
    enableRequestLogging: boolean
}

export class SecurityHardeningService {
    private config: SecurityHardeningConfig

    constructor(config: SecurityHardeningConfig) {
        this.config = config
    }

    /**
     * Apply security hardening middleware to Express app
     */
    applySecurityHardening(app: express.Application): void {
        // Disable TRACE method (addresses HTTP method security issue)
        if (this.config.disableTraceMethod) {
            this.disableTraceMethod(app)
        }

        // Rate limiting (addresses DoS vulnerability)
        if (this.config.enableRateLimit) {
            app.use(this.createRateLimitMiddleware())
        }

        // Enhanced security headers
        if (this.config.enableSecurityHeaders) {
            app.use(this.createSecurityHeadersMiddleware())
        }

        // Request logging for security monitoring
        if (this.config.enableRequestLogging) {
            app.use(this.createSecurityLoggingMiddleware())
        }

        console.log('🔒 Security hardening applied successfully')
    }

    /**
     * Disable HTTP TRACE method
     */
    private disableTraceMethod(app: express.Application): void {
        app.use((req, res, next) => {
            if (req.method === 'TRACE') {
                return res.status(405).json({
                    success: false,
                    error: 'HTTP TRACE method not allowed',
                    timestamp: new Date(),
                    securityPolicy: 'TRACE method disabled for security'
                })
            }
            next()
        })

        console.log('🚫 HTTP TRACE method disabled')
    }

    /**
     * Create rate limiting middleware
     */
    private createRateLimitMiddleware() {
        return rateLimit({
            windowMs: this.config.rateLimitWindowMs,
            max: this.config.rateLimitMaxRequests,
            message: {
                success: false,
                error: 'Too many requests from this IP',
                retryAfter: this.config.rateLimitWindowMs / 1000,
                timestamp: new Date(),
                securityPolicy: 'Rate limiting active'
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                // Log rate limit violations for security monitoring
                console.warn(`🚨 Rate limit exceeded for IP: ${req.ip} - Path: ${req.path}`)
                res.status(429).json({
                    success: false,
                    error: 'Rate limit exceeded',
                    retryAfter: Math.ceil(this.config.rateLimitWindowMs / 1000),
                    timestamp: new Date(),
                    securityAlert: true
                })
            }
        })
    }

    /**
     * Enhanced security headers middleware
     */
    private createSecurityHeadersMiddleware() {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            // Strict Transport Security (HTTPS enforcement)
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

            // Content Type Options (prevent MIME sniffing)
            res.setHeader('X-Content-Type-Options', 'nosniff')

            // Frame Options (clickjacking protection)
            res.setHeader('X-Frame-Options', 'DENY')

            // XSS Protection
            res.setHeader('X-XSS-Protection', '1; mode=block')

            // Content Security Policy
            res.setHeader('Content-Security-Policy',
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self'; " +
                "connect-src 'self'; " +
                "frame-ancestors 'none';"
            )

            // Referrer Policy
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

            // Permissions Policy
            res.setHeader('Permissions-Policy',
                'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
            )

            // Cache Control for security
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private')
            res.setHeader('Pragma', 'no-cache')
            res.setHeader('Expires', '0')

            next()
        }
    }

    /**
     * Security logging middleware
     */
    private createSecurityLoggingMiddleware() {
        const self = this

        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const startTime = Date.now()
            const originalSend = res.send

            // Override response send to capture response data
            res.send = function (data) {
                const responseTime = Date.now() - startTime
                const statusCode = res.statusCode

                // Log security-relevant requests
                if (self.shouldLogSecurityEvent(req, statusCode)) {
                    console.log(`🔍 Security Log: ${req.method} ${req.path} - ${req.ip} - ${statusCode} - ${responseTime}ms`)

                    // Log suspicious patterns
                    if (self.detectSuspiciousPatterns(req)) {
                        console.warn(`🚨 Suspicious request detected: ${req.method} ${req.path} - IP: ${req.ip}`)
                    }
                }

                return originalSend.call(this, data)
            }

            next()
        }
    }

    /**
     * Determine if security event should be logged
     */
    private shouldLogSecurityEvent(req: express.Request, statusCode: number): boolean {
        // Log all authentication endpoints
        if (req.path.includes('/auth') || req.path.includes('/login')) {
            return true
        }

        // Log database operations
        if (req.path.includes('/api/v1/database')) {
            return true
        }

        // Log errors and security-related status codes
        if (statusCode >= 400) {
            return true
        }

        // Log admin operations
        if (req.path.includes('/admin')) {
            return true
        }

        return false
    }

    /**
     * Detect suspicious request patterns
     */
    private detectSuspiciousPatterns(req: express.Request): boolean {
        const suspiciousPatterns = [
            // SQL injection attempts
            new RegExp("(\\bunion\\b|\\bselect\\b|\\bdrop\\b|\\bdelete\\b|\\binsert\\b|\\bupdate\\b)", 'gi'),
            // XSS attempts  
            new RegExp("<script|javascript:|on\\w+\\s*=", 'gi'),
            // Path traversal attempts
            new RegExp("\\.\\.[\\/\\\\]", 'g'),
            // Command injection attempts
            new RegExp("[;&|`$()]", 'g')
        ]

        const requestData = JSON.stringify({
            query: req.query,
            body: req.body,
            params: req.params
        })

        return suspiciousPatterns.some(pattern => pattern.test(requestData))
    }
}

export const defaultSecurityHardeningConfig: SecurityHardeningConfig = {
    disableTraceMethod: true,
    enableRateLimit: true,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 100, // Max 100 requests per 15 minutes per IP
    enableSecurityHeaders: true,
    corsOrigins: ['http://localhost:3000', 'https://codai.app'],
    enableRequestLogging: true
}
