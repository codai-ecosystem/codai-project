const http = require('http');
const url = require('url');

// Simple service status checker
const SERVICES = [
    { name: 'CODAI', port: 5000 },
    { name: 'MEMORAI', port: 5002 },
    { name: 'ANALIZAI', port: 5003 },
    { name: 'BANCAI', port: 5004 },
    { name: 'STOCAI', port: 5005 },
    { name: 'AIDE', port: 5008 },
    { name: 'MARKETAI', port: 5026 },
    { name: 'TALENTAI', port: 5037 },
    { name: 'API_GATEWAY', port: 8080 }
];

// Check if a service is responding on a port
function checkServiceHealth(port) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: '/api/health',
            method: 'GET',
            timeout: 3000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: 'healthy',
                    responseCode: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', () => {
            resolve({ status: 'offline', error: 'Connection failed' });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ status: 'timeout', error: 'Request timeout' });
        });

        req.end();
    });
}

// Main status check function
async function checkAllServices() {
    console.log('🔍 CODAI Ecosystem Service Status Check');
    console.log('='.repeat(50));
    console.log(`🕐 Timestamp: ${new Date().toLocaleString()}`);
    console.log('');

    const results = [];

    for (const service of SERVICES) {
        process.stdout.write(`Checking ${service.name.padEnd(12)} (${service.port})... `);

        const result = await checkServiceHealth(service.port);

        if (result.status === 'healthy') {
            console.log('✅ HEALTHY');
        } else if (result.status === 'timeout') {
            console.log('⏱️  TIMEOUT');
        } else {
            console.log('❌ OFFLINE');
        }

        results.push({
            ...service,
            ...result,
            timestamp: new Date().toISOString()
        });
    }

    console.log('');
    console.log('📊 Summary:');
    const healthy = results.filter(r => r.status === 'healthy').length;
    const total = results.length;
    console.log(`   Active Services: ${healthy}/${total}`);
    console.log(`   Success Rate: ${Math.round((healthy / total) * 100)}%`);

    if (healthy === 0) {
        console.log('');
        console.log('⚠️  No services are currently running. Recommendations:');
        console.log('   1. Start individual services: cd apps/[service] && pnpm dev');
        console.log('   2. Check workspace dependencies: pnpm install');
        console.log('   3. Verify Next.js configuration in each app');
    }

    return results;
}

// Run the check
if (require.main === module) {
    checkAllServices().then(results => {
        process.exit(healthy === 0 ? 1 : 0);
    }).catch(error => {
        console.error('❌ Status check failed:', error);
        process.exit(1);
    });
}

module.exports = { checkAllServices, checkServiceHealth };
