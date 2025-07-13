#!/usr/bin/env node

const http = require('http');
const apps = [
    { name: 'codai', port: 4030, priority: 'CRITICAL' },
    { name: 'memorai', port: 4031, priority: 'CRITICAL' },
    { name: 'analizai', port: 4032, priority: 'HIGH' },
    { name: 'bancai', port: 4033, priority: 'CRITICAL' },
    { name: 'wallet', port: 4034, priority: 'HIGH' },
    { name: 'legalizai', port: 4035, priority: 'MEDIUM' },
    { name: 'fabricai', port: 4036, priority: 'HIGH' },
    { name: 'studiai', port: 4037, priority: 'HIGH' },
    { name: 'marketai', port: 4038, priority: 'HIGH' },
    { name: 'x', port: 4039, priority: 'HIGH' },
    { name: 'publicai', port: 4040, priority: 'HIGH' },
    { name: 'admin', port: 4041, priority: 'HIGH' },
    { name: 'aide', port: 4042, priority: 'CRITICAL' },
    { name: 'ajutai', port: 4043, priority: 'HIGH' },
    { name: 'dash', port: 4044, priority: 'MEDIUM' },
    { name: 'docs', port: 4045, priority: 'MEDIUM' },
    { name: 'explorer', port: 4046, priority: 'MEDIUM' },
    { name: 'id', port: 4047, priority: 'HIGH' },
    { name: 'hub', port: 4048, priority: 'MEDIUM' },
    { name: 'kodex', port: 4049, priority: 'HIGH' },
    { name: 'tools', port: 4050, priority: 'LOW' },
    { name: 'mod', port: 4051, priority: 'MEDIUM' },
    { name: 'mobile', port: 4052, priority: 'LOW' },
    { name: 'jucai', port: 4053, priority: 'LOW' },
    { name: 'muzicai', port: 4054, priority: 'LOW' },
    { name: 'curtai', port: 4055, priority: 'LOW' },
    { name: 'dexai', port: 4056, priority: 'LOW' },
    { name: 'sunai', port: 4057, priority: 'LOW' },
    { name: 'talentai', port: 4058, priority: 'LOW' },
    { name: 'acasai', port: 4059, priority: 'LOW' },
    { name: 'metu', port: 4060, priority: 'MEDIUM' },
    { name: 'cumparai', port: 4061, priority: 'HIGH' },
    { name: 'sociai', port: 4062, priority: 'MEDIUM' },
    { name: 'stocai', port: 4063, priority: 'HIGH' }
];

async function checkApp(app) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${app.port}`, (res) => {
            resolve({
                ...app,
                status: 'RUNNING',
                statusCode: res.statusCode,
                message: `✅ ${app.name} is running on port ${app.port}`
            });
        });

        req.on('error', () => {
            resolve({
                ...app,
                status: 'NOT_RUNNING',
                statusCode: 0,
                message: `❌ ${app.name} is not running on port ${app.port}`
            });
        });

        req.setTimeout(2000, () => {
            req.destroy();
            resolve({
                ...app,
                status: 'TIMEOUT',
                statusCode: 0,
                message: `⏱️  ${app.name} timed out on port ${app.port}`
            });
        });
    });
}

async function main() {
    console.log('🔍 CODAI ECOSYSTEM HEALTH CHECK');
    console.log('================================\n');

    const results = [];

    for (const app of apps) {
        const result = await checkApp(app);
        results.push(result);
        console.log(result.message);
    }

    console.log('\n📊 SUMMARY BY PRIORITY:');
    console.log('========================');

    const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    let totalRunning = 0;
    let totalApps = 0;

    for (const priority of priorities) {
        const priorityApps = results.filter(r => r.priority === priority);
        const running = priorityApps.filter(r => r.status === 'RUNNING').length;
        totalRunning += running;
        totalApps += priorityApps.length;

        console.log(`${priority}: ${running}/${priorityApps.length} running (${Math.round(running / priorityApps.length * 100)}%)`);
    }

    console.log(`\n🎯 OVERALL HEALTH: ${totalRunning}/${totalApps} apps running (${Math.round(totalRunning / totalApps * 100)}%)`);

    // Show running apps
    const runningApps = results.filter(r => r.status === 'RUNNING');
    if (runningApps.length > 0) {
        console.log('\n✅ RUNNING APPS:');
        runningApps.forEach(app => {
            console.log(`   • ${app.name} (${app.priority}) - http://localhost:${app.port}`);
        });
    }

    // Show critical apps that are down
    const criticalDown = results.filter(r => r.priority === 'CRITICAL' && r.status !== 'RUNNING');
    if (criticalDown.length > 0) {
        console.log('\n🚨 CRITICAL APPS DOWN:');
        criticalDown.forEach(app => {
            console.log(`   • ${app.name} - port ${app.port}`);
        });
    }

    process.exit(0);
}

main().catch(console.error);
