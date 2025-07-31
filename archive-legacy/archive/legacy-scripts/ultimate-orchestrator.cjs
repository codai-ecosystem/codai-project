#!/usr/bin/env node

/**
 * 🚀 ULTIMATE ECOSYSTEM ORCHESTRATOR v3.0
 * 
 * Purpose: Deploy ALL 29 services with cycling fixes applied
 * Features: Express replacements, enhanced error handling, health monitoring
 * Target: Achieve 29/29 services (100% ecosystem completion)
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Complete service registry with cycling fixes applied
const serviceRegistry = {
    // Priority 1 Apps (Foundation) - ports 3000-3003
    coreApps: [
        { name: 'codai', port: 3000, category: 'foundation', command: 'pnpm dev', priority: 1 },
        { name: 'memorai', port: 3001, category: 'foundation', command: 'pnpm dev', priority: 1 },
        { name: 'logai', port: 3002, category: 'foundation', command: 'pnpm dev', priority: 1 },
        { name: 'bancai', port: 3003, category: 'foundation', command: 'pnpm dev', priority: 1 }
    ],

    // Fixed Express Apps - ports 3004-3010
    expressApps: [
        { name: 'wallet', port: 3004, category: 'business', command: 'node server.cjs', priority: 2, type: 'express-app' },
        { name: 'fabricai', port: 3005, category: 'business', command: 'node server.cjs', priority: 2, type: 'express-app' },
        { name: 'studiai', port: 3006, category: 'user', command: 'pnpm dev', priority: 3 },
        { name: 'sociai', port: 3007, category: 'user', command: 'node server.cjs', priority: 3, type: 'express-app' },
        { name: 'cumparai', port: 3008, category: 'user', command: 'node server.cjs', priority: 3, type: 'express-app' },
        { name: 'x', port: 3009, category: 'specialized', command: 'node server.cjs', priority: 2, type: 'express-app' },
        { name: 'publicai', port: 3010, category: 'user', command: 'pnpm dev', priority: 4 }
    ],

    // Infrastructure Services - ports 4000-4007
    infrastructureServices: [
        { name: 'admin', port: 4000, category: 'infrastructure', command: 'node server.js', priority: 1 },
        { name: 'AIDE', port: 4001, category: 'development', command: 'node server.js', priority: 1 },
        { name: 'ajutai', port: 4002, category: 'user', command: 'node server.js', priority: 2, fixed: true },
        { name: 'analizai', port: 4003, category: 'analytics', command: 'node server.js', priority: 2 },
        { name: 'dash', port: 4004, category: 'analytics', command: 'node server.js', priority: 1 },
        { name: 'docs', port: 4005, category: 'development', command: 'node server.js', priority: 1 },
        { name: 'explorer', port: 4006, category: 'specialized', command: 'node server.js', priority: 3 },
        { name: 'hub', port: 4007, category: 'infrastructure', command: 'node server.js', priority: 1 }
    ],

    // Business Services - ports 4008-4015
    businessServices: [
        { name: 'id', port: 4008, category: 'infrastructure', command: 'node server.js', priority: 1 },
        { name: 'jucai', port: 4009, category: 'user', command: 'node server.js', priority: 3 },
        { name: 'kodex', port: 4010, category: 'development', command: 'node server.js', priority: 2, fixed: true },
        { name: 'legalizai', port: 4011, category: 'specialized', command: 'node server.js', priority: 3, fixed: true },
        { name: 'marketai', port: 4012, category: 'business', command: 'node server.js', priority: 2 },
        { name: 'metu', port: 4013, category: 'analytics', command: 'node server.js', priority: 2 },
        { name: 'mod', port: 4014, category: 'development', command: 'node server.js', priority: 3, fixed: true },
        { name: 'stocai', port: 4015, category: 'specialized', command: 'node server.js', priority: 2 }
    ],

    // Extended Services - ports 4016-4017
    extendedServices: [
        { name: 'templates', port: 4016, category: 'development', command: 'node server.js', priority: 4, fixed: true },
        { name: 'tools', port: 4017, category: 'development', command: 'node server.js', priority: 4, fixed: true }
    ]
};

// Global state
let runningServices = new Map();
let stats = {
    total: 0,
    running: 0,
    failed: 0,
    healthy: 0,
    startTime: Date.now()
};

console.log('🚀 ULTIMATE ECOSYSTEM ORCHESTRATOR v3.0 STARTING...');
console.log('Target: Deploy ALL 29 services for 100% ecosystem completion');
console.log('Features: Express replacements + enhanced error handling + health monitoring');
console.log('='.repeat(90));

/**
 * Get all services in deployment order
 */
function getAllServices() {
    const allServices = [
        ...serviceRegistry.coreApps,
        ...serviceRegistry.expressApps,
        ...serviceRegistry.infrastructureServices,
        ...serviceRegistry.businessServices,
        ...serviceRegistry.extendedServices
    ];

    // Sort by priority for optimal deployment
    return allServices.sort((a, b) => a.priority - b.priority);
}

/**
 * Start a single service with enhanced error handling
 */
function startService(service) {
    return new Promise((resolve) => {
        console.log(`🔄 Starting ${service.name} (${service.category}) on port ${service.port}...`);

        // Determine working directory
        const isApp = service.port < 4000;
        const workingDir = isApp ?
            path.join(__dirname, 'apps', service.name) :
            path.join(__dirname, 'services', service.name);

        // Check if directory exists
        if (!fs.existsSync(workingDir)) {
            console.log(`   ❌ Directory not found: ${workingDir}`);
            stats.failed++;
            return resolve(false);
        }

        // Parse command
        const commandParts = service.command.split(' ');
        const command = commandParts[0];
        const args = commandParts.slice(1);

        // Start the service
        const serviceProcess = spawn(command, args, {
            cwd: workingDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            detached: false,
            shell: true
        });

        // Track the service
        runningServices.set(service.name, {
            process: serviceProcess,
            service: service,
            status: 'starting',
            startTime: Date.now(),
            restartCount: 0
        });

        // Handle service output
        serviceProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
                console.log(`   📊 [${service.name}] ${output}`);

                // Check for successful start indicators
                if (output.includes('running on') || output.includes('started') || output.includes('listening')) {
                    const serviceInfo = runningServices.get(service.name);
                    if (serviceInfo && serviceInfo.status === 'starting') {
                        serviceInfo.status = 'running';
                        stats.running++;
                        console.log(`   ✅ [${service.name}] Successfully started on port ${service.port}`);
                    }
                }
            }
        });

        serviceProcess.stderr.on('data', (data) => {
            const error = data.toString().trim();
            if (error && !error.includes('ExperimentalWarning')) {
                console.log(`   ⚠️  [${service.name}] ${error}`);
            }
        });

        // Handle service exit
        serviceProcess.on('exit', (code, signal) => {
            const serviceInfo = runningServices.get(service.name);
            if (serviceInfo) {
                if (serviceInfo.status === 'running') {
                    stats.running--;
                }

                console.log(`   🔄 [${service.name}] Exited with code ${code} (signal: ${signal})`);

                // Auto-restart logic for cycling services
                if (service.fixed && serviceInfo.restartCount < 3) {
                    serviceInfo.restartCount++;
                    console.log(`   🔄 [${service.name}] Auto-restarting (attempt ${serviceInfo.restartCount}/3)...`);
                    setTimeout(() => startService(service), 2000);
                } else {
                    serviceInfo.status = 'failed';
                    stats.failed++;
                }
            }
        });

        serviceProcess.on('error', (error) => {
            console.log(`   ❌ [${service.name}] Process error: ${error.message}`);
            const serviceInfo = runningServices.get(service.name);
            if (serviceInfo) {
                serviceInfo.status = 'failed';
                stats.failed++;
            }
        });

        // Initial success after 3 seconds
        setTimeout(() => {
            const serviceInfo = runningServices.get(service.name);
            if (serviceInfo && serviceInfo.status === 'starting') {
                serviceInfo.status = 'running';
                stats.running++;
                console.log(`   ✅ [${service.name}] Assumed started (no error in 3s)`);
            }
            resolve(true);
        }, 3000);
    });
}

/**
 * Health check for a service
 */
function healthCheck(service) {
    return new Promise((resolve) => {
        const http = require('http');
        const options = {
            hostname: 'localhost',
            port: service.port,
            path: '/health',
            method: 'GET',
            timeout: 3000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status === 'healthy') {
                        stats.healthy++;
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch (error) {
                    resolve(false);
                }
            });
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => resolve(false));
        req.end();
    });
}

/**
 * Display comprehensive status dashboard
 */
function displayStatus() {
    console.clear();

    const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
    const totalServices = stats.running + stats.failed;
    const successRate = totalServices > 0 ? Math.round((stats.running / totalServices) * 100) : 0;

    console.log('🚀 ULTIMATE ECOSYSTEM ORCHESTRATOR v3.0 - LIVE DASHBOARD');
    console.log('='.repeat(90));
    console.log(`⏱️  Uptime: ${uptime}s | 🎯 Target: 29/29 services | 🔧 With Cycling Fixes Applied`);
    console.log('='.repeat(90));

    console.log(`📊 ECOSYSTEM STATUS:`);
    console.log(`   ✅ Running: ${stats.running}/29 services (${Math.round((stats.running / 29) * 100)}%)`);
    console.log(`   ❌ Failed: ${stats.failed}/29 services`);
    console.log(`   ❤️  Healthy: ${stats.healthy}/29 services`);
    console.log(`   📈 Success Rate: ${successRate}%`);
    console.log('');

    // Show services by category
    const categories = {
        'foundation': [],
        'business': [],
        'user': [],
        'infrastructure': [],
        'analytics': [],
        'development': [],
        'specialized': []
    };

    // Categorize running services
    for (const [name, info] of runningServices.entries()) {
        const category = info.service.category;
        if (categories[category]) {
            categories[category].push({
                name: name,
                port: info.service.port,
                status: info.status,
                uptime: Math.floor((Date.now() - info.startTime) / 1000)
            });
        }
    }

    // Display by category
    for (const [category, services] of Object.entries(categories)) {
        if (services.length > 0) {
            const running = services.filter(s => s.status === 'running').length;
            console.log(`🏷️  ${category.toUpperCase()}: ${running}/${services.length} running`);

            services.forEach(service => {
                const statusIcon = service.status === 'running' ? '🟢' :
                    service.status === 'starting' ? '🟡' : '🔴';
                console.log(`   ${statusIcon} ${service.name} (${service.port}) - ${service.uptime}s`);
            });
            console.log('');
        }
    }

    console.log('='.repeat(90));
    console.log('🎯 Press Ctrl+C to stop all services and exit');
    console.log('='.repeat(90));
}

/**
 * Run comprehensive health checks
 */
async function runHealthChecks() {
    stats.healthy = 0;
    const healthPromises = [];

    for (const [name, info] of runningServices.entries()) {
        if (info.status === 'running') {
            healthPromises.push(healthCheck(info.service));
        }
    }

    if (healthPromises.length > 0) {
        await Promise.all(healthPromises);
    }
}

/**
 * Main orchestration function
 */
async function main() {
    const allServices = getAllServices();
    stats.total = allServices.length;

    console.log(`📋 Deploying ${stats.total} services in priority order...`);
    console.log('');

    // Deploy all services with staggered start
    for (const service of allServices) {
        await startService(service);
        // Small delay between services to prevent resource conflicts
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('');
    console.log('✅ All services deployment initiated!');
    console.log('🔄 Starting real-time monitoring...');
    console.log('');

    // Start real-time monitoring
    const statusInterval = setInterval(() => {
        displayStatus();
    }, 3000);

    // Start health checks
    const healthInterval = setInterval(async () => {
        await runHealthChecks();
    }, 10000);

    // Graceful shutdown handler
    process.on('SIGINT', () => {
        console.log('\\n🛑 Shutting down all services...');
        clearInterval(statusInterval);
        clearInterval(healthInterval);

        for (const [name, info] of runningServices.entries()) {
            if (info.process && !info.process.killed) {
                console.log(`   🔄 Stopping ${name}...`);
                info.process.kill('SIGTERM');
            }
        }

        setTimeout(() => {
            console.log('🏁 All services stopped. Ecosystem orchestrator terminated.');
            process.exit(0);
        }, 3000);
    });

    // Initial status display
    setTimeout(() => {
        displayStatus();
    }, 5000);
}

// Start the ultimate orchestrator
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { startService, getAllServices, serviceRegistry };
