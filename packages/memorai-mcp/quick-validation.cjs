#!/usr/bin/env node

/**
 * 🧠 MemorAI MCP - Quick Validation Script
 * Simple validation to check current server status
 */

const http = require('http');

const phases = [
    { phase: 2, port: 8002, name: 'CBD Integration' },
    { phase: 3, port: 8003, name: 'Intelligence Layer' },
    { phase: 4, port: 8004, name: 'Enterprise Features' },
    { phase: 5, port: 8005, name: 'Performance Optimization' },
    { phase: 6, port: 8006, name: 'Real-time Collaboration' },
    { phase: 7, port: 8007, name: 'AI Integration' }
];

async function checkHealth(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}/health`, { timeout: 3000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({ status: 'healthy', data: result });
                } catch (e) {
                    resolve({ status: 'healthy', data: { raw: data } });
                }
            });
        });

        req.on('error', () => resolve({ status: 'offline', data: null }));
        req.on('timeout', () => {
            req.destroy();
            resolve({ status: 'timeout', data: null });
        });

        req.setTimeout(3000);
    });
}

async function validateAll() {
    console.log('🧠 MemorAI MCP - Quick Validation');
    console.log('=================================');
    console.log(`🕐 ${new Date().toISOString()}`);
    console.log('=================================\n');

    let healthyCount = 0;
    let totalCount = phases.length;

    for (const phase of phases) {
        process.stdout.write(`🔍 Phase ${phase.phase} (${phase.name})... `);

        const result = await checkHealth(phase.port);

        if (result.status === 'healthy') {
            console.log(`✅ HEALTHY`);
            if (result.data.version) {
                console.log(`   Version: ${result.data.version}`);
            }
            if (result.data.service) {
                console.log(`   Service: ${result.data.service}`);
            }
            healthyCount++;
        } else if (result.status === 'timeout') {
            console.log(`⏰ TIMEOUT`);
        } else {
            console.log(`❌ OFFLINE`);
        }
        console.log('');
    }

    console.log('📊 VALIDATION SUMMARY');
    console.log('====================');
    console.log(`✅ Healthy: ${healthyCount}/${totalCount} servers`);
    console.log(`❌ Offline: ${totalCount - healthyCount}/${totalCount} servers`);

    if (healthyCount === totalCount) {
        console.log('🎉 ALL SERVERS ARE OPERATIONAL!');
        return true;
    } else if (healthyCount > 0) {
        console.log('⚠️ PARTIAL SYSTEM OPERATIONAL');
        return false;
    } else {
        console.log('🚨 NO SERVERS RESPONDING');
        return false;
    }
}

// Run validation
validateAll().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Validation error:', error.message);
    process.exit(1);
});
