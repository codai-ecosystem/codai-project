#!/usr/bin/env node

const services = [
    { name: 'Gateway', port: 4000, path: '/api/gateway/health' },
    { name: 'CODAI', port: 4001, path: '/health' },
    { name: 'ID', port: 4004, path: '/api/health' },
    { name: 'BancAI', port: 4005, path: '/api/health' },
    { name: 'MemorAI', port: 4006, path: '/api/health' },
    { name: 'Admin', port: 4007, path: '/api/health' },
    { name: 'Hub', port: 4008, path: '/api/health' }
];

async function testService(service) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`http://localhost:${service.port}${service.path}`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });

        clearTimeout(timeoutId);

        const status = response.status;
        let data = 'No content';

        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
                if (data.length > 100) data = data.substring(0, 100) + '...';
            }
        } catch (e) {
            data = 'Failed to parse response';
        }

        return {
            name: service.name,
            port: service.port,
            status: status,
            healthy: status >= 200 && status < 300,
            data: data,
            error: null
        };
    } catch (error) {
        return {
            name: service.name,
            port: service.port,
            status: 'ERROR',
            healthy: false,
            data: null,
            error: error.message
        };
    }
}

async function runHealthCheck() {
    console.log('🔍 CODAI Ecosystem Health Check');
    console.log('=================================');
    console.log(`📅 ${new Date().toISOString()}\n`);

    const results = await Promise.all(services.map(testService));

    let healthyCount = 0;

    results.forEach(result => {
        const healthIcon = result.healthy ? '✅' : '❌';
        const statusInfo = result.status === 'ERROR' ? result.error : `HTTP ${result.status}`;

        console.log(`${healthIcon} ${result.name.padEnd(8)} (Port ${result.port}): ${statusInfo}`);

        if (result.healthy) {
            healthyCount++;
            if (typeof result.data === 'object' && result.data?.service) {
                console.log(`   Service: ${result.data.service} v${result.data.version || 'unknown'}`);
                if (result.data.features) {
                    console.log(`   Features: ${result.data.features.slice(0, 3).join(', ')}${result.data.features.length > 3 ? '...' : ''}`);
                }
            }
        } else if (result.status !== 'ERROR') {
            console.log(`   Response: ${typeof result.data === 'string' ? result.data.substring(0, 50) : 'Non-text response'}`);
        }
        console.log('');
    });

    console.log(`📊 Overall Health: ${healthyCount}/${results.length} services operational`);
    console.log(`🎯 Success Rate: ${Math.round((healthyCount / results.length) * 100)}%`);

    if (healthyCount === results.length) {
        console.log('\n🎉 All services are healthy! Ready for comprehensive testing.');
    } else {
        console.log(`\n🔧 ${results.length - healthyCount} services need attention before comprehensive testing.`);
    }

    return results;
}

runHealthCheck().catch(console.error);
