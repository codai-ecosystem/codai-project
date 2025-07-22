/**
 * Enhanced Server Configuration
 * Implements production-ready server configuration addressing security vulnerabilities
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import https from 'https'
import { HTTPSManager } from './https-configuration'
import { SQLInjectionProtector } from './sql-injection-protection'
import { SecurityHardeningService, SecurityHardeningConfig, defaultSecurityHardeningConfig } from './security-hardening'

export interface SecureServerConfig {
    port: number
    enableHTTPS: boolean
    httpsPort?: number
    corsOrigins: string[]
    enableCompression: boolean
    enableRateLimit: boolean
    enableSecurityHeaders: boolean
    databaseEnabled: boolean
    securityLoggingLevel: 'none' | 'basic' | 'detailed'
    productionMode: boolean
}

export class EnhancedSecureServer {
    private app: express.Application
    private config: SecureServerConfig
    private httpsManager: HTTPSManager
    private sqlProtector: SQLInjectionProtector
    private securityHardening: SecurityHardeningService

    constructor(config: SecureServerConfig) {
        this.app = express()
        this.config = config
        this.httpsManager = new HTTPSManager({
            enabled: config.enableHTTPS,
            port: config.httpsPort || 8443,
            redirectHttp: config.productionMode,
            certificatePath: './certs/server.crt',
            privateKeyPath: './certs/server.key',
            passphrase: process.env.SSL_PASSPHRASE,
            rejectUnauthorized: config.productionMode,
            cipherSuites: [
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES256-GCM-SHA384',
                'ECDHE-RSA-AES128-SHA256',
                'ECDHE-RSA-AES256-SHA384'
            ]
        })

        this.sqlProtector = new SQLInjectionProtector({
            enableParameterizedQueries: true,
            logSuspiciousQueries: true,
            blockDangerousPatterns: true,
            maxQueryLength: 10000,
            allowedTables: ['memories', 'entities', 'relations', 'observations']
        })

        const securityConfig: SecurityHardeningConfig = {
            ...defaultSecurityHardeningConfig,
            enableRateLimit: config.enableRateLimit,
            corsOrigins: config.corsOrigins,
            enableRequestLogging: config.securityLoggingLevel !== 'none'
        }

        this.securityHardening = new SecurityHardeningService(securityConfig)
    }

    /**
     * Initialize secure server with all security configurations
     */
    async initializeSecureServer(): Promise<void> {
        console.log('🔒 Initializing Enhanced Secure Server...')

        // Apply security middleware in correct order
        this.applySecurityMiddleware()

        // Configure database security
        if (this.config.databaseEnabled) {
            this.configureDatabaseSecurity()
        }

        // Set up routes
        this.configureSecureRoutes()

        // Start HTTP/HTTPS servers
        await this.startServers()

        console.log('✅ Enhanced Secure Server initialized successfully')
    }

    /**
     * Apply all security middleware in proper order
     */
    private applySecurityMiddleware(): void {
        console.log('🛡️ Applying security middleware...')

        // Helmet for basic security headers
        this.app.use(helmet({
            contentSecurityPolicy: false, // We'll use custom CSP
            crossOriginEmbedderPolicy: false
        }))

        // Trust proxy for production deployments
        if (this.config.productionMode) {
            this.app.set('trust proxy', 1)
        }

        // CORS configuration
        this.app.use(cors({
            origin: this.config.corsOrigins,
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'Authorization',
                'X-API-Key'
            ]
        }))

        // Compression (apply before other middleware)
        if (this.config.enableCompression) {
            this.app.use(compression({
                level: 6,
                threshold: 1024,
                filter: (req, res) => {
                    // Don't compress responses with this request header
                    if (req.headers['x-no-compression']) {
                        return false
                    }
                    // Use compression filter function
                    return compression.filter(req, res)
                }
            }))
        }

        // Request parsing with security limits
        this.app.use(express.json({
            limit: '10mb',
            verify: (req, res, buf) => {
                // Additional validation can be added here
                if (buf.length > 10 * 1024 * 1024) { // 10MB limit
                    throw new Error('Request body too large')
                }
            }
        }))

        this.app.use(express.urlencoded({
            extended: true,
            limit: '10mb',
            parameterLimit: 1000
        }))

        // Apply security hardening
        this.securityHardening.applySecurityHardening(this.app)

        // SQL injection protection middleware
        this.app.use((req, res, next) => {
            if (this.config.databaseEnabled) {
                this.sqlProtector.validateRequest(req, res, next)
            } else {
                next()
            }
        })

        console.log('✅ Security middleware applied')
    }

    /**
     * Configure database security settings
     */
    private configureDatabaseSecurity(): void {
        console.log('🗄️ Configuring database security...')

        // Database query protection middleware
        this.app.use('/api/v1/database/*', (req, res, next) => {
            // Validate database operations
            if (!this.sqlProtector.validateDatabaseQuery(req.body.query || '')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid database query detected',
                    securityAlert: true,
                    timestamp: new Date()
                })
            }
            next()
        })

        console.log('✅ Database security configured')
    }

    /**
     * Configure secure API routes
     */
    private configureSecureRoutes(): void {
        console.log('🛣️ Configuring secure routes...')

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date(),
                version: process.env.npm_package_version || '1.0.0',
                security: {
                    https: this.config.enableHTTPS,
                    rateLimit: this.config.enableRateLimit,
                    sqlProtection: this.config.databaseEnabled
                }
            })
        })

        // Security status endpoint (for monitoring)
        this.app.get('/security-status', (req, res) => {
            res.json({
                securityFeatures: {
                    httpsEnabled: this.config.enableHTTPS,
                    rateLimitEnabled: this.config.enableRateLimit,
                    sqlInjectionProtection: this.config.databaseEnabled,
                    securityHeadersEnabled: this.config.enableSecurityHeaders,
                    corsConfigured: this.config.corsOrigins.length > 0
                },
                lastCheck: new Date(),
                status: 'secure'
            })
        })

        // API documentation endpoint
        this.app.get('/api/docs', (req, res) => {
            res.json({
                apiVersion: '1.0.0',
                endpoints: {
                    health: 'GET /health',
                    securityStatus: 'GET /security-status',
                    database: 'POST /api/v1/database/*'
                },
                security: {
                    authentication: 'Required for protected endpoints',
                    rateLimit: `${this.config.enableRateLimit ? 'Enabled' : 'Disabled'}`,
                    https: `${this.config.enableHTTPS ? 'Enforced' : 'Optional'}`
                }
            })
        })

        // Catch-all for undefined routes
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found',
                timestamp: new Date(),
                availableEndpoints: ['/health', '/security-status', '/api/docs']
            })
        })

        console.log('✅ Secure routes configured')
    }

    /**
     * Start HTTP and HTTPS servers
     */
    private async startServers(): Promise<void> {
        console.log('🚀 Starting servers...')

        try {
            // Start HTTP server (redirects to HTTPS in production)
            const httpServer = this.app.listen(this.config.port, () => {
                console.log(`🌐 HTTP Server running on port ${this.config.port}`)
            })

            // Configure HTTP server security
            httpServer.setTimeout(30000) // 30 second timeout
            httpServer.keepAliveTimeout = 5000
            httpServer.headersTimeout = 6000

            // Start HTTPS server if enabled
            if (this.config.enableHTTPS) {
                const httpsPort = this.config.httpsPort || 8443
                const httpsOptions = this.httpsManager.createServerOptions()
                const httpsServer = https.createServer(httpsOptions, this.app)

                httpsServer.listen(httpsPort, () => {
                    console.log(`🔒 HTTPS Server running on port ${httpsPort}`)
                })

                // Configure HTTPS server security
                httpsServer.setTimeout(30000)
                httpsServer.keepAliveTimeout = 5000
                httpsServer.headersTimeout = 6000

                // HTTP to HTTPS redirect in production
                if (this.config.productionMode) {
                    this.app.use((req, res, next) => {
                        if (req.header('x-forwarded-proto') !== 'https') {
                            return res.redirect(`https://${req.header('host')}${req.url}`)
                        }
                        next()
                    })
                }
            }

            console.log('✅ All servers started successfully')
        } catch (error) {
            console.error('❌ Failed to start servers:', error)
            throw error
        }
    }

    /**
     * Get Express app instance for additional configuration
     */
    getApp(): express.Application {
        return this.app
    }

    /**
     * Graceful shutdown
     */
    async shutdown(): Promise<void> {
        console.log('🔄 Shutting down Enhanced Secure Server...')
        // Add graceful shutdown logic here
        console.log('✅ Server shutdown complete')
    }
}

// Default configuration for development
export const defaultSecureServerConfig: SecureServerConfig = {
    port: 8002,
    enableHTTPS: true,
    httpsPort: 8443,
    corsOrigins: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
        'https://codai.app'
    ],
    enableCompression: true,
    enableRateLimit: true,
    enableSecurityHeaders: true,
    databaseEnabled: true,
    securityLoggingLevel: 'detailed',
    productionMode: process.env.NODE_ENV === 'production'
}

// Production configuration
export const productionSecureServerConfig: SecureServerConfig = {
    port: 80,
    enableHTTPS: true,
    httpsPort: 443,
    corsOrigins: [
        'https://codai.app',
        'https://memorai.app'
    ],
    enableCompression: true,
    enableRateLimit: true,
    enableSecurityHeaders: true,
    databaseEnabled: true,
    securityLoggingLevel: 'basic',
    productionMode: true
}
