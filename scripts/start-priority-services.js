#!/usr/bin/env node

/**
 * Systematic Service Startup Script
 * Starts services in priority order with proper port allocation
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const projectsIndex = JSON.parse(readFileSync(join(projectRoot, 'projects.index.json'), 'utf8'));

// Track running processes
const runningProcesses = new Map();

async function startService(serviceName, port, priority = 2) {
    console.log(`🚀 Starting ${serviceName} on port ${port} (Priority ${priority})`);

    const servicePath = join(projectRoot, 'services', serviceName);

    // Kill any existing process on this port first
    try {
        const killProcess = spawn('npx', ['kill-port', port.toString()], {
            stdio: 'pipe',
            shell: true
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        // Port might not be in use, continue
    }

    const serviceProcess = spawn('npm', ['run', 'dev'], {
        cwd: servicePath,
        stdio: 'pipe',
        shell: true,
        env: {
            ...process.env,
            PORT: port.toString(),
            NODE_ENV: 'development'
        }
    });

    runningProcesses.set(serviceName, { process: serviceProcess, port, priority });

    serviceProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('ready') || output.includes('started') || output.includes('listening')) {
            console.log(`  ✅ ${serviceName} ready on http://localhost:${port}`);
        }
    });

    serviceProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE')) {
            console.log(`  ⚠️ ${serviceName} port ${port} already in use`);
        }
    });

    // Give process time to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    return serviceProcess;
}

async function startPriorityServices() {
    console.log('🎯 Starting Priority Services for Codai Ecosystem...\n');

    // Priority 1 Services - Infrastructure & Core
    console.log('📊 Priority 1: Infrastructure & Core Services');
    await startService('admin', 4001, 1);
    await startService('hub', 4012, 1);
    await startService('id', 4013, 1);

    // Priority 2 Services - Development & Analytics  
    console.log('\n🔧 Priority 2: Development & Analytics Services');
    await startService('AIDE', 4002, 2);
    await startService('docs', 4009, 2);
    await startService('dash', 4008, 2);

    // Priority 3 Services - Business Platforms
    console.log('\n💼 Priority 3: Business Platform Services');
    await startService('ajutai', 4003, 3);
    await startService('analizai', 4004, 3);
    await startService('kodex', 4015, 3);

    console.log('\n📈 Service Startup Summary:');
    console.log(`✅ Services started: ${runningProcesses.size}`);

    // List all running services
    for (const [name, info] of runningProcesses) {
        console.log(`  • ${name}: http://localhost:${info.port} (Priority ${info.priority})`);
    }

    console.log('\n🌐 Access services via browser to verify operational status');
    console.log('🔄 Services will continue running in background...');
}

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down services...');
    for (const [name, info] of runningProcesses) {
        console.log(`  Stopping ${name}...`);
        info.process.kill();
    }
    process.exit(0);
});

startPriorityServices().catch(console.error);
