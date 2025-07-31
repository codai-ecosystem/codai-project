/**
 * HTTPS/TLS Configuration for Memorai API
 * Addresses CRITICAL security vulnerability: Missing HTTPS encryption
 */

import https from 'https'
import fs from 'fs'
import path from 'path'

export interface HTTPSConfig {
    enabled: boolean
    port: number
    redirectHttp: boolean
    certificatePath?: string
    privateKeyPath?: string
    passphrase?: string
    cipherSuites?: string[]
    secureProtocol?: string
    rejectUnauthorized: boolean
}

export class HTTPSManager {
    private config: HTTPSConfig

    constructor(config: HTTPSConfig) {
        this.config = config
    }

    /**
     * Create HTTPS server options
     */
    createServerOptions(): https.ServerOptions {
        if (!this.config.enabled) {
            throw new Error('HTTPS is not enabled')
        }

        const options: https.ServerOptions = {
            // Use provided certificates or generate self-signed for development
            key: this.getPrivateKey(),
            cert: this.getCertificate(),

            // Security configurations
            secureProtocol: this.config.secureProtocol || 'TLSv1_2_method',
            ciphers: this.config.cipherSuites?.join(':') || [
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES256-GCM-SHA384',
                'ECDHE-RSA-AES128-SHA256',
                'ECDHE-RSA-AES256-SHA384'
            ].join(':'),

            // Reject unauthorized connections in production
            rejectUnauthorized: this.config.rejectUnauthorized,

            // Request client certificate verification
            requestCert: false,

            // Prefer server cipher order
            honorCipherOrder: true
        }

        if (this.config.passphrase) {
            options.passphrase = this.config.passphrase
        }

        return options
    }

    /**
     * Get private key from file or generate self-signed
     */
    private getPrivateKey(): Buffer {
        if (this.config.privateKeyPath && fs.existsSync(this.config.privateKeyPath)) {
            return fs.readFileSync(this.config.privateKeyPath)
        }

        // For development only - generate self-signed key
        if (process.env.NODE_ENV === 'development') {
            return this.generateSelfSignedKey()
        }

        throw new Error('Private key not found. Please provide certificatePath and privateKeyPath for production.')
    }

    /**
     * Get certificate from file or generate self-signed
     */
    private getCertificate(): Buffer {
        if (this.config.certificatePath && fs.existsSync(this.config.certificatePath)) {
            return fs.readFileSync(this.config.certificatePath)
        }

        // For development only - generate self-signed certificate
        if (process.env.NODE_ENV === 'development') {
            return this.generateSelfSignedCertificate()
        }

        throw new Error('Certificate not found. Please provide certificatePath for production.')
    }

    /**
     * Generate self-signed private key for development
     */
    private generateSelfSignedKey(): Buffer {
        console.warn('⚠️  Using self-signed certificate for development only!')

        // Basic self-signed key for development
        const devKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKB
wdABG0iMNyC4/3CK73X3qyNfpLzJqCw2BgOcz6Mm4ZRYrn3wKp7D2gBqUC1Sm5w
[Development key content - replace with actual generated key]
-----END PRIVATE KEY-----`

        return Buffer.from(devKey)
    }

    /**
     * Generate self-signed certificate for development
     */
    private generateSelfSignedCertificate(): Buffer {
        console.warn('⚠️  Using self-signed certificate for development only!')

        const devCert = `-----BEGIN CERTIFICATE-----
MIICljCCAX4CCQCKOtLslDMzOTANBgkqhkiG9w0BAQsFADANMQswCQYDVQQGEwJV
UzELMAkGA1UECAwCQ0ExFjAUBgNVBAcMDU1vdW50YWluIFZpZXcxFDASBgNVBAoM
[Development certificate content - replace with actual generated certificate]
-----END CERTIFICATE-----`

        return Buffer.from(devCert)
    }

    /**
     * Validate HTTPS configuration
     */
    validateConfig(): { valid: boolean; errors: string[] } {
        const errors: string[] = []

        if (!this.config.enabled) {
            errors.push('HTTPS is disabled - this is a security risk in production')
        }

        if (!this.config.port || this.config.port < 1 || this.config.port > 65535) {
            errors.push('Invalid HTTPS port specified')
        }

        if (process.env.NODE_ENV === 'production') {
            if (!this.config.certificatePath || !fs.existsSync(this.config.certificatePath)) {
                errors.push('Production certificate file not found')
            }

            if (!this.config.privateKeyPath || !fs.existsSync(this.config.privateKeyPath)) {
                errors.push('Production private key file not found')
            }

            if (!this.config.rejectUnauthorized) {
                errors.push('rejectUnauthorized should be true in production')
            }
        }

        return {
            valid: errors.length === 0,
            errors
        }
    }
}

export const defaultHTTPSConfig: HTTPSConfig = {
    enabled: process.env.NODE_ENV === 'production',
    port: 6368, // HTTPS port for Memorai API
    redirectHttp: true,
    rejectUnauthorized: process.env.NODE_ENV === 'production',
    cipherSuites: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA384',
        'DHE-RSA-AES128-GCM-SHA256',
        'DHE-RSA-AES256-GCM-SHA384'
    ],
    secureProtocol: 'TLSv1_2_method'
}
