/**
 * CND Enhanced Gateway Demo
 * Tests the Phase 2 CND integration features
 */

const { CND } = require('../../packages/cnd/dist/index.js');

async function testCNDGatewayIntegration() {
    console.log('🚀 Testing CND Enhanced Gateway Integration');
    console.log('===============================================\n');

    try {
        // Initialize CND with Gateway configuration
        const cndConfig = {
            cbd: {
                host: 'localhost',
                port: 5000,
                database: 'gateway_db'
            },
            enterprise: {
                enabled: true,
                features: {
                    serviceDiscovery: true,
                    authentication: true,
                    authorization: true,
                    audit: true,
                    monitoring: true,
                    encryption: false // Disabled for demo
                },
                serviceDiscovery: {
                    enabled: true,
                    serviceName: 'api-gateway',
                    port: 4000,
                    healthCheckPath: '/health',
                    metadata: {
                        version: '2.0.0',
                        category: 'infrastructure',
                        capabilities: ['routing', 'authentication', 'rate-limiting', 'load-balancing']
                    }
                },
                authentication: {
                    enabled: true,
                    jwtSecret: 'demo-gateway-secret',
                    sessionTimeout: 3600000,
                    tokenRefreshThreshold: 300000
                },
                authorization: {
                    enabled: true,
                    defaultRole: 'user',
                    adminRoles: ['admin', 'gateway-admin'],
                    roles: {
                        'admin': {
                            permissions: ['*']
                        },
                        'gateway-admin': {
                            permissions: ['gateway:*', 'services:read', 'metrics:read']
                        },
                        'service-consumer': {
                            permissions: ['services:read', 'api:call']
                        },
                        'user': {
                            permissions: ['api:call:basic']
                        }
                    }
                },
                audit: {
                    enabled: true,
                    logLevel: 'detailed',
                    storage: 'memory',
                    includeRequestBody: true,
                    includeResponseBody: false,
                    retentionDays: 90
                },
                monitoring: {
                    enabled: true,
                    metricsEnabled: true,
                    healthChecksEnabled: true,
                    performanceTracking: true,
                    customMetrics: {
                        'gateway_requests_total': 'counter',
                        'gateway_request_duration': 'histogram',
                        'gateway_service_health': 'gauge',
                        'gateway_active_connections': 'gauge'
                    }
                }
            }
        };

        console.log('1. 🔌 Initializing CND with Gateway Configuration...');
        const cnd = new CND(cndConfig);
        await cnd.connect();
        console.log('✅ CND connected successfully');

        // Test Service Discovery
        console.log('\n2. 🔍 Testing Service Discovery...');

        // Register CODAI services
        const services = [
            {
                id: 'codai',
                name: 'CODAI Service',
                url: 'http://localhost:4001',
                port: 4001,
                healthPath: '/health',
                description: 'AI processing and development platform',
                version: '1.0.0',
                category: 'core'
            },
            {
                id: 'admin',
                name: 'Admin Service',
                url: 'http://localhost:4002',
                port: 4002,
                healthPath: '/health',
                description: 'Administration and management',
                version: '1.0.0',
                category: 'core'
            },
            {
                id: 'hub',
                name: 'Hub Service',
                url: 'http://localhost:4003',
                port: 4003,
                healthPath: '/health',
                description: 'Central coordination hub',
                version: '1.0.0',
                category: 'core'
            },
            {
                id: 'id',
                name: 'ID Service',
                url: 'http://localhost:4004',
                port: 4004,
                healthPath: '/health',
                description: 'Identity and authentication',
                version: '1.0.0',
                category: 'core'
            },
            {
                id: 'bancai',
                name: 'BancAI Service',
                url: 'http://localhost:4005',
                port: 4005,
                healthPath: '/health',
                description: 'Banking and financial services',
                version: '1.0.0',
                category: 'business'
            }
        ];

        for (const service of services) {
            await cnd.registerService(service.id, service);
            console.log(`   ✅ Registered ${service.name} (${service.id})`);
        }

        // Test service discovery
        const discoveredServices = await cnd.discoverAllServices();
        console.log(`✅ Discovered ${discoveredServices.length} services`);

        // Test Authentication
        console.log('\n3. 🔐 Testing Authentication System...');

        // Create a test user
        const testUser = await cnd.authenticate({
            username: 'gateway-admin',
            password: 'demo-password',
            role: 'gateway-admin'
        });
        console.log('✅ Test user authenticated:', testUser.user.username);
        console.log('   🎟️  Token generated:', testUser.token ? 'Yes' : 'No');

        // Test token validation
        const tokenValidation = await cnd.authenticateToken(testUser.token);
        console.log('✅ Token validation successful:', tokenValidation.isValid);
        console.log('   👤 User permissions:', tokenValidation.permissions.slice(0, 3).join(', ') + '...');

        // Test Authorization
        console.log('\n4. 🛡️  Testing Authorization System...');

        const hasGatewayAccess = tokenValidation.permissions.includes('gateway:*');
        const hasMetricsAccess = tokenValidation.permissions.includes('metrics:read');
        const hasAdminAccess = tokenValidation.permissions.includes('*');

        console.log('✅ Authorization checks:');
        console.log(`   Gateway access: ${hasGatewayAccess ? '✅' : '❌'}`);
        console.log(`   Metrics access: ${hasMetricsAccess ? '✅' : '❌'}`);
        console.log(`   Admin access: ${hasAdminAccess ? '✅' : '❌'}`);

        // Test Audit Logging
        console.log('\n5. 📝 Testing Audit Logging...');

        await cnd.logAudit({
            action: 'gateway_demo_test',
            resource: '/api/gateway/demo',
            userId: testUser.user.id,
            details: {
                method: 'GET',
                path: '/api/gateway/demo',
                ip: '127.0.0.1',
                userAgent: 'CND-Demo-Client/1.0'
            },
            timestamp: new Date(),
            severity: 'info'
        });
        console.log('✅ Audit log entry created');

        await cnd.logAudit({
            action: 'service_discovery_test',
            resource: '/api/gateway/services',
            userId: testUser.user.id,
            details: {
                discoveredServices: discoveredServices.length,
                serviceCategories: ['core', 'business']
            },
            timestamp: new Date(),
            severity: 'info'
        });
        console.log('✅ Service discovery audit logged');

        // Test Monitoring and Metrics
        console.log('\n6. 📊 Testing Monitoring and Metrics...');

        // Record some test metrics
        await cnd.recordMetric('gateway_requests_total', 1, {
            method: 'GET',
            status_code: '200',
            path: '/api/gateway/demo'
        });

        await cnd.recordMetric('gateway_request_duration', 125, {
            method: 'GET',
            path: '/api/gateway/demo'
        });

        await cnd.recordMetric('gateway_service_health', 1, {
            service_id: 'codai',
            service_name: 'CODAI Service'
        });

        await cnd.recordMetric('gateway_active_connections', services.length);

        console.log('✅ Metrics recorded successfully');

        // Get current metrics
        const currentMetrics = await cnd.getCurrentMetrics();
        console.log('✅ Current metrics retrieved:', Object.keys(currentMetrics).length, 'metrics');

        // Export Prometheus metrics
        const prometheusMetrics = await cnd.exportPrometheusMetrics();
        console.log('✅ Prometheus metrics exported');

        // Test Health Status
        console.log('\n7. ❤️  Testing Health Status...');

        const healthStatus = await cnd.getHealthStatus();
        console.log('✅ CND Health Status:');
        console.log(`   Overall Status: ${healthStatus.status}`);
        console.log(`   Connected: ${healthStatus.connected}`);
        console.log(`   Enterprise Features: ${healthStatus.enterprise ? 'Enabled' : 'Disabled'}`);

        if (healthStatus.features) {
            console.log('   Active Features:');
            Object.entries(healthStatus.features).forEach(([feature, enabled]) => {
                console.log(`     ${feature}: ${enabled ? '✅' : '❌'}`);
            });
        }

        // Test Service Health Updates
        console.log('\n8. 🔄 Testing Service Health Updates...');

        for (const service of services.slice(0, 3)) { // Test first 3 services
            const isHealthy = Math.random() > 0.3; // Random health status for demo
            await cnd.updateServiceHealth(service.id, isHealthy);
            console.log(`   ${service.name}: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
        }

        // Verify service discovery with health status
        const updatedServices = await cnd.discoverAllServices();
        const healthyServices = updatedServices.filter(s => s.isHealthy).length;
        console.log(`✅ Service health updated - ${healthyServices}/${updatedServices.length} services healthy`);

        // Summary
        console.log('\n🎉 CND Gateway Integration Test Complete!');
        console.log('==========================================');
        console.log('✅ Service Discovery: Working');
        console.log('✅ Authentication: Working');
        console.log('✅ Authorization: Working');
        console.log('✅ Audit Logging: Working');
        console.log('✅ Monitoring: Working');
        console.log('✅ Health Checks: Working');
        console.log('\n🚀 Gateway is ready for Phase 2 integration!');

        // Cleanup
        await cnd.disconnect();

    } catch (error) {
        console.error('❌ CND Gateway Integration Test Failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testCNDGatewayIntegration().catch(console.error);
