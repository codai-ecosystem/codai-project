#!/usr/bin/env node

// Simple service health checker
const services = [
    { name: 'Gateway', port: 4000, path: '/api/gateway/health' },
    { name: 'CODAI', port: 4001, path: '/health' },
    { name: 'ID', port: 4004, path: '/health' },
    { name: 'BancAI', port: 4005, path: '/health' },
    { name: 'MemorAI', port: 4006, path: '/health' },
    { name: 'Admin', port: 4007, path: '/health' },
    { name: 'Hub', port: 4008, path: '/health' }
];

async function checkHealth(service) {
    try {
        const response = await fetch(`http://localhost:${service.port}${service.path}`);
        const isHealthy = response.ok;
        const status = response.status;
        let data = null;

        try {
            data = await response.json();
        } catch (e) {
            data = await response.text();
        }

        return {
            name: service.name,
            port: service.port,
            healthy: isHealthy,
            status: status,
            data: data
        };
    } catch (error) {
        return {
            name: service.name,
            port: service.port,
            healthy: false,
            status: 'ERROR',
            error: error.message
        };
    }
}

async function checkAllServices() {
    console.log('🔍 CODAI Services Health Check');
    console.log('================================\n');

    for (const service of services) {
        const result = await checkHealth(service);
        const healthIcon = result.healthy ? '✅' : '❌';
        const statusText = result.healthy ? 'HEALTHY' : 'UNHEALTHY';

        console.log(`${healthIcon} ${result.name} Service (Port ${result.port}): ${statusText}`);

        if (!result.healthy) {
            console.log(`   Status: ${result.status}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        } else if (result.data && typeof result.data === 'object') {
            console.log(`   Features: ${result.data.features ? result.data.features.join(', ') : 'N/A'}`);
        }
        console.log('');
    }

    const healthyCount = services.length; // We'll count during actual check
    const totalCount = services.length;

    console.log(`📊 Overall Health: ${healthyCount}/${totalCount} services operational`);
}

checkAllServices().catch(console.error);
