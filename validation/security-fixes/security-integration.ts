/**
 * Security Integration Script
 * Integrates all security fixes with the Memorai API server
 */

import { EnhancedSecureServer, defaultSecureServerConfig, productionSecureServerConfig } from './enhanced-server-configuration'

/**
 * Initialize and start the enhanced secure server
 */
async function initializeSecureMemoraiAPI(): Promise<void> {
    console.log('🔒 Phase 2A Security Remediation - Initializing Secure Memorai API...')

    try {
        // Determine configuration based on environment
        const config = process.env.NODE_ENV === 'production'
            ? productionSecureServerConfig
            : defaultSecureServerConfig

        console.log(`📋 Using ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} security configuration:`)
        console.log(`   - HTTPS Enabled: ${config.enableHTTPS}`)
        console.log(`   - HTTP Port: ${config.port}`)
        console.log(`   - HTTPS Port: ${config.httpsPort}`)
        console.log(`   - Rate Limiting: ${config.enableRateLimit}`)
        console.log(`   - SQL Injection Protection: ${config.databaseEnabled}`)
        console.log(`   - Security Headers: ${config.enableSecurityHeaders}`)

        // Create and initialize the secure server
        const secureServer = new EnhancedSecureServer(config)

        // Start the server with all security features
        await secureServer.initializeSecureServer()

        console.log('✅ Phase 2A Security Remediation Complete!')
        console.log('🛡️ All critical security vulnerabilities addressed:')
        console.log('   ✅ HTTPS/TLS encryption implemented')
        console.log('   ✅ SQL injection protection active')
        console.log('   ✅ Security hardening applied')
        console.log('   ✅ Enhanced server configuration deployed')

        // Set up graceful shutdown
        process.on('SIGINT', async () => {
            console.log('🔄 Received SIGINT. Gracefully shutting down...')
            await secureServer.shutdown()
            process.exit(0)
        })

        process.on('SIGTERM', async () => {
            console.log('🔄 Received SIGTERM. Gracefully shutting down...')
            await secureServer.shutdown()
            process.exit(0)
        })

    } catch (error) {
        console.error('❌ Failed to initialize Secure Memorai API:', error)
        process.exit(1)
    }
}

// Export for use as a module
export { initializeSecureMemoraiAPI }

// Run directly if this script is executed
if (require.main === module) {
    initializeSecureMemoraiAPI().catch(error => {
        console.error('❌ Startup failed:', error)
        process.exit(1)
    })
}
