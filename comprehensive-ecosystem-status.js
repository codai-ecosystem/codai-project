#!/usr/bin/env node

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// COMPREHENSIVE ECOSYSTEM STATUS CHECKER
// Based on memory: we have sophisticated enterprise-grade apps
// Goal: Verify all 35+ apps, identify issues, plan next actions

const APPS_CONFIG = {
    // TIER 1: CORE PLATFORM (CRITICAL - ENTERPRISE PRODUCTION READY)
    'codai': { port: 4030, type: 'next.js', priority: 'CRITICAL', expected: 'AI Development Platform' },
    'memorai': { port: 4031, type: 'next.js', priority: 'CRITICAL', expected: 'Memory Management System' },
    'logai': { port: 4032, type: 'next.js', priority: 'CRITICAL', expected: 'Logging & Analytics' },
    'bancai': { port: 4033, type: 'next.js', priority: 'CRITICAL', expected: 'Financial Platform' },
    'kodex': { port: 4034, type: 'next.js', priority: 'CRITICAL', expected: 'Code Management' },
    'docai': { port: 4035, type: 'next.js', priority: 'CRITICAL', expected: 'Documentation System' },

    // TIER 2: FINANCIAL ECOSYSTEM (HIGH PRIORITY)
    'paymentsai': { port: 4036, type: 'next.js', priority: 'HIGH', expected: 'Payment Processing' },
    'bankingai': { port: 4037, type: 'next.js', priority: 'HIGH', expected: 'Banking Services' },
    'tradingai': { port: 4038, type: 'next.js', priority: 'HIGH', expected: 'Trading Platform' },
    'cryptoai': { port: 4039, type: 'next.js', priority: 'HIGH', expected: 'Crypto Management' },

    // TIER 3: SPECIALIZED APPLICATIONS (MEDIUM PRIORITY)
    'publicai': { port: 4040, type: 'next.js', priority: 'MEDIUM', expected: 'Public Interface' },
    'assistantai': { port: 4041, type: 'next.js', priority: 'MEDIUM', expected: 'AI Assistant' },
    'aide': { port: 4042, type: 'next.js', priority: 'MEDIUM', expected: 'Development Aid' },
    'devai': { port: 4043, type: 'next.js', priority: 'MEDIUM', expected: 'Developer Tools' },
    'builderai': { port: 4044, type: 'next.js', priority: 'MEDIUM', expected: 'Build System' },
    'testai': { port: 4045, type: 'next.js', priority: 'MEDIUM', expected: 'Testing Platform' },
    'deployai': { port: 4046, type: 'next.js', priority: 'MEDIUM', expected: 'Deployment System' },
    'monitorai': { port: 4047, type: 'next.js', priority: 'MEDIUM', expected: 'Monitoring Dashboard' },

    // TIER 4: UTILITY & INTEGRATION (STANDARD PRIORITY)
    'apigatewayai': { port: 4048, type: 'next.js', priority: 'STANDARD', expected: 'API Gateway' },
    'authenticationai': { port: 4049, type: 'next.js', priority: 'STANDARD', expected: 'Auth Service' },
    'notificationai': { port: 4050, type: 'next.js', priority: 'STANDARD', expected: 'Notifications' },
    'storageai': { port: 4051, type: 'next.js', priority: 'STANDARD', expected: 'Storage Management' },
    'searchai': { port: 4052, type: 'next.js', priority: 'STANDARD', expected: 'Search Engine' },
    'analyticsai': { port: 4053, type: 'next.js', priority: 'STANDARD', expected: 'Analytics Platform' },
    'reportingai': { port: 4054, type: 'next.js', priority: 'STANDARD', expected: 'Reporting System' },
    'backupai': { port: 4055, type: 'next.js', priority: 'STANDARD', expected: 'Backup Service' },

    // TIER 5: CREATIVE & SPECIALIZED (LOW PRIORITY)
    'creativai': { port: 4056, type: 'next.js', priority: 'LOW', expected: 'Creative Platform' },
    'mediaai': { port: 4057, type: 'next.js', priority: 'LOW', expected: 'Media Management' },
    'designai': { port: 4058, type: 'next.js', priority: 'LOW', expected: 'Design Tools' },
    'socialai': { port: 4059, type: 'next.js', priority: 'LOW', expected: 'Social Platform' },
    'marketingai': { port: 4060, type: 'next.js', priority: 'LOW', expected: 'Marketing Tools' },
    'cumparai': { port: 4061, type: 'next.js', priority: 'LOW', expected: 'Shopping Platform' },
    'sociai': { port: 4062, type: 'next.js', priority: 'LOW', expected: 'Social AI' },
    'stocai': { port: 4063, type: 'next.js', priority: 'LOW', expected: 'Stock Management' }
};

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bright: '\x1b[1m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(hostname, port, timeout = 5000) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname,
            port,
            path: '/',
            method: 'GET',
            timeout
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    success: true,
                    status: res.statusCode,
                    headers: res.headers,
                    data: data.substring(0, 500), // First 500 chars
                    contentType: res.headers['content-type'] || 'unknown'
                });
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ success: false, error: 'TIMEOUT', timeout: true });
        });

        req.on('error', (err) => {
            resolve({ success: false, error: err.message, code: err.code });
        });

        req.end();
    });
}

async function checkApp(name, config) {
    const startTime = Date.now();
    log(`\n🔍 Testing ${name} (Port ${config.port}) - ${config.priority} Priority`, 'cyan');

    const result = await makeRequest('localhost', config.port, 8000);
    const responseTime = Date.now() - startTime;

    if (result.success) {
        const isNextJS = result.data.includes('__NEXT_DATA__') || result.data.includes('_next/');
        const hasReact = result.data.includes('react') || result.data.includes('React');
        const hasContent = result.data.length > 100;

        log(`  ✅ ONLINE (${result.status}) - ${responseTime}ms`, 'green');
        log(`  📊 Type: ${isNextJS ? 'Next.js App' : hasReact ? 'React App' : 'Web App'}`, 'blue');
        log(`  📄 Content: ${hasContent ? 'Rich Content' : 'Basic Page'} (${result.data.length} chars)`, 'blue');
        log(`  🌐 Content-Type: ${result.contentType}`, 'blue');

        return {
            name,
            status: 'ONLINE',
            port: config.port,
            priority: config.priority,
            responseTime,
            isNextJS,
            hasReact,
            hasContent,
            contentLength: result.data.length,
            httpStatus: result.status,
            details: result
        };
    } else {
        const errorType = result.timeout ? 'TIMEOUT' : result.code === 'ECONNREFUSED' ? 'NOT_RUNNING' : 'ERROR';
        log(`  ❌ ${errorType} - ${result.error}`, 'red');

        return {
            name,
            status: errorType,
            port: config.port,
            priority: config.priority,
            error: result.error,
            responseTime
        };
    }
}

async function runComprehensiveCheck() {
    log('🚀 COMPREHENSIVE CODAI ECOSYSTEM STATUS CHECK', 'bright');
    log('=====================================', 'cyan');
    log('Based on memory: Enterprise-grade ecosystem with sophisticated features', 'yellow');
    log('Goal: Verify all 35+ apps and plan enhancement strategy\n', 'yellow');

    const results = [];
    const appNames = Object.keys(APPS_CONFIG);
    const totalApps = appNames.length;

    // Test apps in priority order
    const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'STANDARD', 'LOW'];

    for (const priority of priorityOrder) {
        const appsInPriority = appNames.filter(name => APPS_CONFIG[name].priority === priority);

        if (appsInPriority.length > 0) {
            log(`\n🎯 TESTING ${priority} PRIORITY APPS (${appsInPriority.length} apps)`, 'magenta');
            log('='.repeat(50), 'magenta');

            for (const appName of appsInPriority) {
                const result = await checkApp(appName, APPS_CONFIG[appName]);
                results.push(result);

                // Brief pause between checks
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }

    // Generate comprehensive report
    log('\n📊 COMPREHENSIVE ECOSYSTEM STATUS REPORT', 'bright');
    log('=====================================', 'cyan');

    const online = results.filter(r => r.status === 'ONLINE');
    const offline = results.filter(r => r.status !== 'ONLINE');
    const byPriority = {};

    priorityOrder.forEach(priority => {
        byPriority[priority] = {
            total: results.filter(r => r.priority === priority).length,
            online: results.filter(r => r.priority === priority && r.status === 'ONLINE').length
        };
    });

    log(`\n📈 OVERALL STATUS:`, 'white');
    log(`  🟢 Online: ${online.length}/${totalApps} (${Math.round(online.length / totalApps * 100)}%)`, online.length > totalApps / 2 ? 'green' : 'yellow');
    log(`  🔴 Offline: ${offline.length}/${totalApps} (${Math.round(offline.length / totalApps * 100)}%)`, offline.length > 0 ? 'red' : 'green');

    log(`\n🎯 BY PRIORITY:`, 'white');
    priorityOrder.forEach(priority => {
        const stats = byPriority[priority];
        const percentage = stats.total > 0 ? Math.round(stats.online / stats.total * 100) : 0;
        const color = percentage >= 80 ? 'green' : percentage >= 50 ? 'yellow' : 'red';
        log(`  ${priority}: ${stats.online}/${stats.total} (${percentage}%)`, color);
    });

    // Show online apps
    if (online.length > 0) {
        log(`\n✅ ONLINE APPLICATIONS (${online.length}):`, 'green');
        online.forEach(app => {
            const typeIndicator = app.isNextJS ? '⚡Next.js' : app.hasReact ? '⚛️React' : '🌐Web';
            const contentIndicator = app.hasContent ? '📄Rich' : '📋Basic';
            log(`  🟢 ${app.name.toUpperCase()} (${app.port}) - ${typeIndicator} ${contentIndicator} - ${app.responseTime}ms`, 'green');
        });
    }

    // Show offline apps by priority
    if (offline.length > 0) {
        log(`\n❌ OFFLINE APPLICATIONS (${offline.length}):`, 'red');
        priorityOrder.forEach(priority => {
            const offlineInPriority = offline.filter(r => r.priority === priority);
            if (offlineInPriority.length > 0) {
                log(`\n  ${priority} PRIORITY:`, 'yellow');
                offlineInPriority.forEach(app => {
                    log(`    🔴 ${app.name.toUpperCase()} (${app.port}) - ${app.status}`, 'red');
                });
            }
        });
    }

    // Next steps recommendation
    log(`\n🎯 RECOMMENDED NEXT STEPS:`, 'cyan');

    const criticalOffline = offline.filter(r => r.priority === 'CRITICAL');
    const highOffline = offline.filter(r => r.priority === 'HIGH');

    if (criticalOffline.length > 0) {
        log(`  🚨 URGENT: Fix ${criticalOffline.length} CRITICAL apps first`, 'red');
        criticalOffline.forEach(app => log(`    - ${app.name} (${app.port})`, 'red'));
    }

    if (highOffline.length > 0) {
        log(`  ⚠️  HIGH: Fix ${highOffline.length} HIGH priority apps`, 'yellow');
        highOffline.forEach(app => log(`    - ${app.name} (${app.port})`, 'yellow'));
    }

    if (online.length >= totalApps * 0.8) {
        log(`  🎉 EXCELLENT: 80%+ apps online - Focus on UI/UX enhancements`, 'green');
    } else if (online.length >= totalApps * 0.5) {
        log(`  👍 GOOD: 50%+ apps online - Continue systematic fixes`, 'yellow');
    } else {
        log(`  🛠️  FOCUS: <50% apps online - Prioritize foundation fixes`, 'red');
    }

    // Save detailed report
    const reportData = {
        timestamp: new Date().toISOString(),
        summary: {
            total: totalApps,
            online: online.length,
            offline: offline.length,
            percentage: Math.round(online.length / totalApps * 100)
        },
        byPriority,
        onlineApps: online,
        offlineApps: offline,
        recommendations: criticalOffline.length > 0 ? 'Fix critical apps first' : 'Continue systematic improvements'
    };

    fs.writeFileSync(
        path.join(__dirname, 'ECOSYSTEM_STATUS_DETAILED_REPORT.json'),
        JSON.stringify(reportData, null, 2)
    );

    log(`\n💾 Detailed report saved to: ECOSYSTEM_STATUS_DETAILED_REPORT.json`, 'blue');
    log(`\n🎯 Use this data to prioritize fixes and enhancements!`, 'cyan');

    return reportData;
}

// Run the comprehensive check
runComprehensiveCheck().catch(console.error);
