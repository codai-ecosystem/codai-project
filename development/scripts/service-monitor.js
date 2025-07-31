#!/usr/bin/env node

import http from 'http';

const SERVICES = [
    { name: 'Gateway', url: 'http://localhost:4000', healthPath: '/health' },
    { name: 'CODAI', url: 'http://localhost:4001', healthPath: '/' },
    { name: 'ID', url: 'http://localhost:4004', healthPath: '/' },
    { name: 'BancAI', url: 'http://localhost:4005', healthPath: '/' },
    { name: 'MemorAI', url: 'http://localhost:4006', healthPath: '/' },
    { name: 'Admin', url: 'http://localhost:4007', healthPath: '/' },
    { name: 'Hub', url: 'http://localhost:4008', healthPath: '/' },
    { name: 'CBD', url: 'http://localhost:4180', healthPath: '/health' }
];

async function checkService(service) {
    return new Promise((resolve) => {
        const url = new URL(service.healthPath, service.url);

        const req = http.get(url, { timeout: 3000 }, (res) => {
            resolve({
                name: service.name,
                url: service.url,
                status: res.statusCode < 500 ? '✅ UP' : '⚠️ ERROR',
                statusCode: res.statusCode,
                responseTime: Date.now() - startTime
            });
        });

        const startTime = Date.now();

        req.on('error', () => {
            resolve({
                name: service.name,
                url: service.url,
                status: '❌ DOWN',
                statusCode: null,
                responseTime: Date.now() - startTime
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                name: service.name,
                url: service.url,
                status: '⏱️ TIMEOUT',
                statusCode: null,
                responseTime: Date.now() - startTime
            });
        });
    });
}

async function monitorServices() {
    console.log('\n🔍 CODAI Service Monitor - ' + new Date().toLocaleTimeString());
    console.log('━'.repeat(70));

    const checks = await Promise.all(SERVICES.map(checkService));

    let upCount = 0;
    let downCount = 0;

    checks.forEach(check => {
        const statusLine = `${check.status} ${check.name.padEnd(8)} | ${check.url} | ${check.responseTime}ms`;
        console.log(statusLine);

        if (check.status.includes('✅')) upCount++;
        else downCount++;
    });

    console.log('━'.repeat(70));
    console.log(`📊 Summary: ${upCount} UP, ${downCount} DOWN | Health: ${Math.round((upCount / SERVICES.length) * 100)}%`);

    return { upCount, downCount, totalServices: SERVICES.length };
}

// Run once
if (process.argv.includes('--once')) {
    monitorServices().then(() => process.exit(0));
} else {
    // Continuous monitoring
    console.log('🚀 Starting continuous service monitoring (Ctrl+C to stop)...');

    // Initial check
    monitorServices();

    // Check every 30 seconds
    const interval = setInterval(monitorServices, 30000);

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n👋 Service monitoring stopped');
        clearInterval(interval);
        process.exit(0);
    });
}
