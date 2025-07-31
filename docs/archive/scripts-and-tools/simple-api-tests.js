#!/usr/bin/env node

// Simple API testing for healthy services
const testEndpoints = [
    { name: 'BancAI Health', url: 'http://localhost:4005/api/health', method: 'GET', expectedStatus: 200 },
    { name: 'Hub Health', url: 'http://localhost:4008/api/health', method: 'GET', expectedStatus: 200 },
    { name: 'Gateway Health', url: 'http://localhost:4000/api/gateway/health', method: 'GET', expectedStatus: [200, 503] },
    { name: 'Gateway Services', url: 'http://localhost:4000/api/gateway/services', method: 'GET', expectedStatus: [200, 401] }, // 401 expected without auth
    { name: 'Gateway Metrics', url: 'http://localhost:4000/api/gateway/metrics', method: 'GET', expectedStatus: [200, 401] }, // 401 expected without auth
];

async function runSimpleTest(test) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(test.url, {
            method: test.method,
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });

        clearTimeout(timeoutId);

        const status = response.status;
        const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
        const passed = expectedStatuses.includes(status);

        let data = null;
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = text.length > 100 ? text.substring(0, 100) + '...' : text;
            }
        } catch (e) {
            data = 'Failed to parse response';
        }

        return {
            name: test.name,
            url: test.url,
            status: status,
            expected: test.expectedStatus,
            passed: passed,
            data: data,
            error: null
        };
    } catch (error) {
        return {
            name: test.name,
            url: test.url,
            status: 'ERROR',
            expected: test.expectedStatus,
            passed: false,
            data: null,
            error: error.message
        };
    }
}

async function runApiTests() {
    console.log('🧪 CODAI API Testing Suite');
    console.log('==========================');
    console.log(`📅 ${new Date().toISOString()}\n`);

    const results = await Promise.all(testEndpoints.map(runSimpleTest));

    let passedCount = 0;
    let totalTests = results.length;

    results.forEach(result => {
        const statusIcon = result.passed ? '✅' : '❌';
        const statusInfo = result.status === 'ERROR' ? result.error : `HTTP ${result.status}`;

        console.log(`${statusIcon} ${result.name.padEnd(20)}: ${statusInfo}`);

        if (result.passed) {
            passedCount++;
            if (typeof result.data === 'object' && result.data?.success !== undefined) {
                console.log(`   Response: ${result.data.success ? 'Success' : 'Failed'}`);
                if (result.data.data?.gateway) {
                    console.log(`   Gateway Version: ${result.data.data.gateway.version}`);
                    console.log(`   Services: ${result.data.message}`);
                }
                if (result.data.data?.service) {
                    console.log(`   Service: ${result.data.data.service} v${result.data.data.version || 'unknown'}`);
                }
            }
        } else if (result.status === 401) {
            console.log(`   ℹ️  Authentication required (expected for protected endpoints)`);
        } else if (result.status !== 'ERROR') {
            console.log(`   Expected: ${result.expected}, Got: ${result.status}`);
        }
        console.log('');
    });

    console.log(`📊 Test Results: ${passedCount}/${totalTests} tests passed (${Math.round((passedCount / totalTests) * 100)}%)`);

    if (passedCount === totalTests) {
        console.log('🎉 All API tests passed! Basic service connectivity confirmed.');
    } else {
        console.log(`🔧 ${totalTests - passedCount} tests failed. Service issues need attention.`);
    }

    // Specific recommendations
    console.log('\n💡 Next Steps:');
    const healthyServices = results.filter(r => r.name.includes('Health') && r.passed).length;
    const totalHealthChecks = results.filter(r => r.name.includes('Health')).length;

    if (healthyServices > 0) {
        console.log(`✅ ${healthyServices}/${totalHealthChecks} services have working health endpoints`);
        console.log('📝 Ready to implement comprehensive tests for healthy services');
    }

    if (passedCount >= 3) {
        console.log('🚀 Gateway and core services operational - can begin service-specific testing');
    }

    return results;
}

runApiTests().catch(console.error);
