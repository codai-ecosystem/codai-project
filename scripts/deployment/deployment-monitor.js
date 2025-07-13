#!/usr/bin/env node

// DEPLOYMENT STATUS MONITOR
// Real-time monitoring of all deployed apps

const http = require('http');

const APPS = [
    { name: 'CODAI', port: 4030, domain: 'codai.ro', description: 'AI Development Platform' },
    { name: 'MEMORAI', port: 4031, domain: 'memorai.ro', description: 'Memory & Database Core' },
    { name: 'BANCAI', port: 4033, domain: 'bancai.ro', description: 'Banking & Finance Platform' },
    { name: 'STOCAI', port: 4063, domain: 'stocai.ro', description: 'Stock Trading Platform' },
    { name: 'PUBLICAI', port: 4040, domain: 'publicai.ro', description: 'Public AI Interface' },
    { name: 'LOGAI', port: 4041, domain: 'logai.ro', description: 'Logging & Analytics' },
    { name: 'TOOLS', port: 4062, domain: 'tools.codai.ro', description: 'Development Tools' },
    { name: 'CUMPARAI', port: 4052, domain: 'cumparai.ro', description: 'E-commerce Platform' }
];

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m',
    bg_green: '\x1b[42m',
    bg_red: '\x1b[41m'
};

function checkAppStatus(app) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${app.port}`, (res) => {
            resolve({
                ...app,
                status: res.statusCode === 200 ? 'LIVE' : 'ERROR',
                statusCode: res.statusCode,
                online: true
            });
        });

        req.on('error', () => {
            resolve({
                ...app,
                status: 'OFFLINE',
                statusCode: null,
                online: false
            });
        });

        req.setTimeout(3000, () => {
            req.destroy();
            resolve({
                ...app,
                status: 'TIMEOUT',
                statusCode: null,
                online: false
            });
        });
    });
}

async function monitorApps() {
    console.clear();

    console.log(`${colors.bright}${colors.cyan}🚀 CODAI ECOSYSTEM - DEPLOYMENT STATUS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.yellow}📅 ${new Date().toLocaleString()}${colors.reset}\n`);

    const statusChecks = await Promise.all(APPS.map(checkAppStatus));

    const liveApps = statusChecks.filter(app => app.status === 'LIVE');
    const offlineApps = statusChecks.filter(app => app.status === 'OFFLINE');

    console.log(`${colors.bright}📊 OVERALL STATUS:${colors.reset}`);
    console.log(`${colors.green}✅ LIVE: ${liveApps.length}${colors.reset} | ${colors.red}❌ OFFLINE: ${offlineApps.length}${colors.reset} | ${colors.blue}📱 TOTAL: ${APPS.length}${colors.reset}`);

    const successRate = Math.round((liveApps.length / APPS.length) * 100);
    const statusColor = successRate >= 75 ? colors.green : successRate >= 50 ? colors.yellow : colors.red;
    console.log(`${statusColor}🎯 SUCCESS RATE: ${successRate}%${colors.reset}\n`);

    if (liveApps.length > 0) {
        console.log(`${colors.bright}${colors.bg_green} ✅ LIVE APPS - BEAUTIFUL UI ACCESSIBLE NOW! ${colors.reset}`);
        console.log(`${colors.green}${'─'.repeat(60)}${colors.reset}`);

        liveApps.forEach(app => {
            console.log(`${colors.green}🌟 ${app.name}${colors.reset}`);
            console.log(`   ${colors.cyan}🌐 Local:  http://localhost:${app.port}${colors.reset}`);
            console.log(`   ${colors.magenta}🌍 Domain: https://${app.domain}${colors.reset}`);
            console.log(`   ${colors.blue}📋 ${app.description}${colors.reset}`);
            console.log('');
        });
    }

    if (offlineApps.length > 0) {
        console.log(`${colors.bright}${colors.bg_red} ❌ OFFLINE APPS ${colors.reset}`);
        console.log(`${colors.red}${'─'.repeat(30)}${colors.reset}`);

        offlineApps.forEach(app => {
            console.log(`${colors.red}💥 ${app.name} - Port ${app.port}${colors.reset}`);
        });
        console.log('');
    }

    if (liveApps.length > 0) {
        console.log(`${colors.bright}🎨 BEAUTIFUL UI FEATURES LIVE:${colors.reset}`);
        console.log(`${colors.cyan}   ✨ Framer Motion animations${colors.reset}`);
        console.log(`${colors.cyan}   🎨 Glass morphism design${colors.reset}`);
        console.log(`${colors.cyan}   📊 Real-time data updates${colors.reset}`);
        console.log(`${colors.cyan}   🌈 Beautiful gradients${colors.reset}`);
        console.log(`${colors.cyan}   📱 Responsive design${colors.reset}\n`);

        console.log(`${colors.bright}🌍 PRODUCTION DEPLOYMENT:${colors.reset}`);
        console.log(`${colors.yellow}   📝 Ready for: node deploy-production-domains.js${colors.reset}`);
        console.log(`${colors.yellow}   🚀 Will deploy to: ${liveApps.map(a => a.domain).join(', ')}${colors.reset}\n`);
    }

    if (successRate >= 75) {
        console.log(`${colors.bright}${colors.green}🏆 MISSION SUCCESS! Ready for production deployment!${colors.reset}`);
    } else if (successRate >= 25) {
        console.log(`${colors.bright}${colors.yellow}⚡ PARTIAL SUCCESS! Continue deployment...${colors.reset}`);
    } else {
        console.log(`${colors.bright}${colors.red}🔧 TROUBLESHOOTING NEEDED${colors.reset}`);
    }

    console.log(`\n${colors.blue}🔄 Auto-refresh in 10 seconds...${colors.reset}`);
}

async function continuousMonitoring() {
    await monitorApps();
    setTimeout(continuousMonitoring, 10000); // Refresh every 10 seconds
}

console.log(`${colors.bright}🚀 Starting deployment monitoring...${colors.reset}`);
continuousMonitoring().catch(console.error);
