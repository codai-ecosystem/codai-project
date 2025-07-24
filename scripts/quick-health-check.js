#!/usr/bin/env node

/**
 * Quick Service Health Checker
 * Tests all CODAI services and reports status
 */

import http from 'http';

const services = [
    { name: 'Gateway', port: 4000, path: '/health' },
    { name: 'CODAI', port: 4001, path: '/api/health' },
    { name: 'Admin', port: 4002, path: '/api/health' },
    { name: 'Hub', port: 4003, path: '/api/health' },
    { name: 'ID', port: 4004, path: '/api/health' },
    { name: 'BancAI', port: 4005, path: '/api/health' }
];

async function checkService(service) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: service.port,
            path: service.path,
            method: 'GET',
            timeout: 3000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    service: service.name,
                    port: service.port,
                    status: res.statusCode === 200 ? '✅ Healthy' : `⚠️  Status ${res.statusCode}`,
                    response: data.substring(0, 100)
                });
            });
        });

        req.on('error', (error) => {
            resolve({
                service: service.name,
                port: service.port,
                status: '❌ Down',
                error: error.message
            });
        });

        req.end();
    });
}

async function main() {
    console.log('🔍 CODAI Services Health Check');
    console.log('================================');

    const results = await Promise.all(services.map(checkService));

    results.forEach(result => {
        console.log(`${result.service.padEnd(10)} Port ${result.port}: ${result.status}`);
        if (result.error) {
            console.log(`           Error: ${result.error}`);
        }
    });

    const healthy = results.filter(r => r.status.includes('✅')).length;
    console.log(`\n📊 Summary: ${healthy}/${results.length} services healthy`);

    if (healthy === results.length) {
        console.log('🎉 All services are operational!');
        process.exit(0);
    } else {
        console.log('⚠️  Some services need attention');
        process.exit(1);
    }
}

main().catch(console.error);
