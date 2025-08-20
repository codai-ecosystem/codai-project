/**
 * @codai/security - Enterprise Security Package
 * Comprehensive security middleware for CODAI ecosystem
 */

export { default as TLSManager } from './tls/tls-manager'
export { default as WAFManager } from './waf/waf-manager'
export { default as SecurityIntegration } from './security-integration'

export type {
    TLSConfig,
    CertificateInfo
} from './tls/tls-manager'

export type {
    WAFRule,
    WAFConfig,
    SecurityEvent,
    WAFStats
} from './waf/waf-manager'

export type {
    SecurityConfig,
    SecurityStats
} from './security-integration'

/**
 * Quick setup function for services
 */
export async function setupSecurity(config: {
    serviceName: string
    port: number
    app: any // express.Application
    httpsEnabled?: boolean
    wafEnabled?: boolean
    rateLimitEnabled?: boolean
}): Promise<any> {
    const securityIntegration = new (await import('./security-integration')).default({
        serviceName: config.serviceName,
        port: config.port,
        httpsEnabled: config.httpsEnabled ?? true,
        wafEnabled: config.wafEnabled ?? true,
        rateLimitEnabled: config.rateLimitEnabled ?? true,
        helmetEnabled: true
    })

    await securityIntegration.applySecurityMiddleware(config.app)
    await securityIntegration.startSecureServer(config.app)

    return securityIntegration
}

// Version info
export const version = '1.0.0'
export const description = 'CODAI Enterprise Security Package - Phase 2 Implementation'
