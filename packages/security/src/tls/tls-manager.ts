/**
 * TLS Certificate Manager for CODAI Ecosystem
 * Provides HTTPS/TLS enforcement across all 47 services
 */

import fs from 'fs/promises'
import path from 'path'
import { createServer } from 'https'
import { createServer as createHttpServer } from 'http'
import express from 'express'

export interface TLSConfig {
    cert: string
    key: string
    ca?: string
    minVersion: 'TLSv1.2' | 'TLSv1.3'
    ciphers: string[]
    honorCipherOrder: boolean
    dhparam?: string
}

export interface CertificateInfo {
    serviceName: string
    certPath: string
    keyPath: string
    caPath?: string
    expiryDate: Date
    autoRenew: boolean
}

export class TLSManager {
    private certificates: Map<string, CertificateInfo> = new Map()
    private defaultConfig: TLSConfig

    constructor() {
        this.defaultConfig = {
            cert: '',
            key: '',
            minVersion: 'TLSv1.3',
            ciphers: [
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES256-GCM-SHA384',
                'ECDHE-RSA-AES128-SHA256',
                'ECDHE-RSA-AES256-SHA384',
                'ECDHE-RSA-AES256-SHA256',
                'ECDHE-RSA-AES128-SHA',
                'ECDHE-RSA-AES256-SHA',
                'AES128-GCM-SHA256',
                'AES256-GCM-SHA384',
                'AES128-SHA256',
                'AES256-SHA256',
                'AES128-SHA',
                'AES256-SHA'
            ],
            honorCipherOrder: true
        }
    }

    /**
     * Generate self-signed certificate for development
     */
    async generateSelfSignedCert(serviceName: string, domain: string = 'localhost'): Promise<CertificateInfo> {
        const certDir = path.join(process.cwd(), '.certificates', serviceName)

        try {
            await fs.mkdir(certDir, { recursive: true })
        } catch (error) {
            // Directory already exists
        }

        const certPath = path.join(certDir, 'cert.pem')
        const keyPath = path.join(certDir, 'key.pem')

        // For development, we'll use openssl command
        const { exec } = require('child_process')
        const { promisify } = require('util')
        const execAsync = promisify(exec)

        try {
            // Generate private key
            await execAsync(`openssl genrsa -out "${keyPath}" 2048`)

            // Generate certificate
            await execAsync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/CN=${domain}"`)

            console.log(`✅ Generated self-signed certificate for ${serviceName}`)
        } catch (error) {
            console.warn(`⚠️  OpenSSL not available, using fallback certificate for ${serviceName}`)

            // Fallback: create placeholder files
            const fallbackCert = this.generateFallbackCert(domain)
            const fallbackKey = this.generateFallbackKey()

            await fs.writeFile(certPath, fallbackCert)
            await fs.writeFile(keyPath, fallbackKey)
        }

        const certInfo: CertificateInfo = {
            serviceName,
            certPath,
            keyPath,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            autoRenew: true
        }

        this.certificates.set(serviceName, certInfo)
        return certInfo
    }

    /**
     * Load existing certificate for a service
     */
    async loadCertificate(serviceName: string, certPath: string, keyPath: string): Promise<CertificateInfo> {
        try {
            // Verify files exist
            await fs.access(certPath)
            await fs.access(keyPath)

            const certInfo: CertificateInfo = {
                serviceName,
                certPath,
                keyPath,
                expiryDate: await this.getCertificateExpiry(certPath),
                autoRenew: false
            }

            this.certificates.set(serviceName, certInfo)
            console.log(`✅ Loaded certificate for ${serviceName}`)
            return certInfo
        } catch (error) {
            console.error(`❌ Failed to load certificate for ${serviceName}:`, error)
            throw error
        }
    }

    /**
     * Create HTTPS server with TLS configuration
     */
    async createSecureServer(app: express.Application, serviceName: string, port: number): Promise<void> {
        let certInfo = this.certificates.get(serviceName)

        if (!certInfo) {
            // Generate certificate if not exists
            certInfo = await this.generateSelfSignedCert(serviceName)
        }

        const cert = await fs.readFile(certInfo.certPath, 'utf8')
        const key = await fs.readFile(certInfo.keyPath, 'utf8')

        const tlsConfig = {
            ...this.defaultConfig,
            cert,
            key,
            ciphers: this.defaultConfig.ciphers.join(':')
        }

        // Add security middleware
        this.addSecurityMiddleware(app)

        // Create HTTPS server
        const httpsServer = createServer(tlsConfig, app)

        // Create HTTP server for redirects
        const httpApp = express()
        this.addHttpsRedirect(httpApp)
        const httpServer = createHttpServer(httpApp)

        // Start servers
        httpsServer.listen(port + 443, () => {
            console.log(`🔒 ${serviceName} HTTPS server running on port ${port + 443}`)
        })

        httpServer.listen(port, () => {
            console.log(`↗️  ${serviceName} HTTP redirect server running on port ${port}`)
        })
    }

    /**
     * Add comprehensive security middleware
     */
    private addSecurityMiddleware(app: express.Application): void {
        // Security headers middleware
        app.use((req, res, next) => {
            // HSTS - HTTP Strict Transport Security
            res.setHeader(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            )

            // X-Frame-Options - Prevent clickjacking
            res.setHeader('X-Frame-Options', 'DENY')

            // X-Content-Type-Options - Prevent MIME sniffing
            res.setHeader('X-Content-Type-Options', 'nosniff')

            // X-XSS-Protection - XSS filtering
            res.setHeader('X-XSS-Protection', '1; mode=block')

            // Content Security Policy
            res.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:; font-src 'self' data:; object-src 'none'; frame-ancestors 'none';"
            )

            // Referrer Policy
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

            // Permissions Policy (Feature Policy)
            res.setHeader(
                'Permissions-Policy',
                'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
            )

            next()
        })

        console.log('🛡️  Security headers middleware added')
    }

    /**
     * Add HTTPS redirect middleware
     */
    private addHttpsRedirect(app: express.Application): void {
        app.use((req, res) => {
            const httpsUrl = `https://${req.get('host')}${req.url}`
            res.redirect(301, httpsUrl)
        })
    }

    /**
     * Get certificate expiry date
     */
    private async getCertificateExpiry(certPath: string): Promise<Date> {
        try {
            const { exec } = require('child_process')
            const { promisify } = require('util')
            const execAsync = promisify(exec)

            const result = await execAsync(`openssl x509 -enddate -noout -in "${certPath}"`)
            const dateMatch = result.stdout.match(/notAfter=(.+)/)

            if (dateMatch) {
                return new Date(dateMatch[1])
            }
        } catch (error) {
            console.warn('Could not parse certificate expiry, using default')
        }

        // Default to 1 year from now
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }

    /**
     * Check certificate expiry and renew if needed
     */
    async checkAndRenewCertificates(): Promise<void> {
        const now = new Date()
        const renewalThreshold = 30 * 24 * 60 * 60 * 1000 // 30 days

        for (const [serviceName, certInfo] of this.certificates) {
            const timeUntilExpiry = certInfo.expiryDate.getTime() - now.getTime()

            if (timeUntilExpiry < renewalThreshold && certInfo.autoRenew) {
                console.log(`🔄 Renewing certificate for ${serviceName}`)
                await this.generateSelfSignedCert(serviceName)
            }
        }
    }

    /**
     * Fallback certificate for development (when OpenSSL is not available)
     */
    private generateFallbackCert(domain: string): string {
        return `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG2wYJ7qMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAwGZhQKpK0SY2G9HAJ6j7X7B5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5
X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5QIDAQAB
o1AwTjAdBgNVHQ4EFgQUKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qMA8GA1Ud
EwEB/wQFMAMBAf8wHwYDVR0jBBgwFoAUKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2w
YJ7qMA0GCSqGSIb3DQEBCwUAA4IBAQABqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wY
J7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7q
KqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0
UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2w
YJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7qKqL0UG2wYJ7q
-----END CERTIFICATE-----`
    }

    /**
     * Fallback private key for development
     */
    private generateFallbackKey(): string {
        return `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDAZmFAqkrRJjYb
0cAnqPtfsHlflflflflflflflflflflflflflflflflflflflflflflflflflflflflf
lflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflf
lflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflf
lflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflf
lflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflf
lflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflf
lflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflflf
UAwIBAgIJAKL0UG2wYJ7qMA0GCSqGSIb3DQEBCwUAA4IBAQABqL0UG2wYJ7qKqL0U
-----END PRIVATE KEY-----`
    }

    /**
     * Get service certificate info
     */
    getCertificateInfo(serviceName: string): CertificateInfo | undefined {
        return this.certificates.get(serviceName)
    }

    /**
     * List all managed certificates
     */
    listCertificates(): CertificateInfo[] {
        return Array.from(this.certificates.values())
    }
}

export default TLSManager
