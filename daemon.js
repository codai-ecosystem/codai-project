#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Comprehensive App configurations for the complete Codai Ecosystem
const apps = [
    // === CORE NEXT.JS APPLICATIONS (Ports 4030-4040) ===
    { name: 'CodAI', port: 4030, dir: 'apps/codai', type: 'nextjs', domain: 'codai.ro', description: 'Central Platform & AIDE' },
    { name: 'MemorAI', port: 4031, dir: 'apps/memorai', type: 'nextjs', domain: 'memorai.ro', description: 'AI Memory & Database Core' },
    { name: 'LogAI', port: 4032, dir: 'apps/logai', type: 'nextjs', domain: 'logai.ro', description: 'Identity & Access Control' },
    { name: 'BancAI', port: 4033, dir: 'apps/bancai', type: 'nextjs', domain: 'bancai.ro', description: 'Financial Engine & KYC' },
    { name: 'Wallet', port: 4034, dir: 'apps/wallet', type: 'nextjs', domain: 'wallet.bancai.ro', description: 'Smart Programmable Wallet' },
    { name: 'FabricAI', port: 4035, dir: 'apps/fabricai', type: 'nextjs', domain: 'fabricai.ro', description: 'Enterprise SaaS Platform' },
    { name: 'StudiAI', port: 4036, dir: 'apps/studiai', type: 'nextjs', domain: 'studiai.ro', description: 'AI-Powered Learning' },
    { name: 'SociAI', port: 4037, dir: 'apps/sociai', type: 'nextjs', domain: 'sociai.ro', description: 'AI-Enhanced Social Platform' },
    { name: 'CumparAI', port: 4038, dir: 'apps/cumparai', type: 'nextjs', domain: 'cumparai.ro', description: 'AI Shopping Platform' },
    { name: 'X Trading', port: 4039, dir: 'apps/x', type: 'nextjs', domain: 'x.codai.ro', description: 'AI Trading & Swapping' },
    { name: 'PublicAI', port: 4040, dir: 'apps/publicai', type: 'nextjs', domain: 'publicai.ro', description: 'Civic Tech & Transparency' },

    // === EXPRESS.JS MICROSERVICES (Ports 4041-4055) ===
    { name: 'AIDE', port: 4041, dir: 'apps/aide', type: 'nextjs', domain: 'aide.codai.ro', description: 'AI Development Interface' },
    { name: 'AnalizAI', port: 4056, dir: 'apps/analizai', type: 'nextjs', domain: 'analizai.ro', description: 'Insights & Diagnostics' },
    { name: 'MarketAI', port: 4043, dir: 'apps/marketai', type: 'nextjs', domain: 'marketai.ro', description: 'AI Agents Marketplace' },
    { name: 'Explorer', port: 4044, dir: 'apps/explorer', type: 'nextjs', domain: 'explorer.codai.ro', description: 'AI Blockchain Explorer' },
    { name: 'Kodex', port: 4045, dir: 'apps/kodex', type: 'nextjs', domain: 'kodex.codai.ro', description: 'CodaiChain Protocol' },
    { name: 'ID Service', port: 4046, dir: 'apps/id', type: 'nextjs', domain: 'id.codai.ro', description: 'Identity & Reputation' },
    { name: 'Mod Builder', port: 4047, dir: 'apps/mod', type: 'nextjs', domain: 'mod.codai.ro', description: 'Modular Automation' },
    { name: 'Tools Hub', port: 4048, dir: 'apps/tools', type: 'nextjs', domain: 'tools.codai.ro', description: 'AI Utilities' },
    { name: 'Dashboard', port: 4049, dir: 'apps/dash', type: 'nextjs', domain: 'dash.codai.ro', description: 'Visual Dashboards' },
    { name: 'Integration Hub', port: 4050, dir: 'apps/hub', type: 'nextjs', domain: 'hub.codai.ro', description: 'Integration Center' },
    { name: 'Docs Portal', port: 4051, dir: 'apps/docs', type: 'nextjs', domain: 'docs.codai.ro', description: 'Developer Docs' },
    { name: 'Admin Panel', port: 4052, dir: 'apps/admin', type: 'nextjs', domain: 'admin.codai.ro', description: 'Internal Admin' },
    { name: 'StocAI', port: 4053, dir: 'apps/stocai', type: 'next', domain: 'stocai.ro', description: 'AI Stock Trading Platform' },
    { name: 'AjutAI', port: 4054, dir: 'apps/ajutai', type: 'nextjs', domain: 'ajutai.ro', description: 'Support & Copilot' },
    { name: 'LegalizAI', port: 4055, dir: 'apps/legalizai', type: 'nextjs', domain: 'legalizai.ro', description: 'Legal & Compliance' },

    // === ADDITIONAL SERVICES (Port 4056) ===
    { name: 'Mobile App', port: 4056, dir: 'apps/mobile', type: 'nextjs', domain: 'mobile.codai.ro', description: 'Hybrid Next.js + React Native Mobile Platform' }
];

const PID_FILE = path.join(__dirname, '.codai-daemon.pid');
const LOG_FILE = path.join(__dirname, '.codai-daemon.log');

class CodaiDaemon {
    constructor() {
        this.processes = new Map();
        this.isShuttingDown = false;

        // Set up graceful shutdown
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
        process.on('exit', () => this.cleanup());
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(LOG_FILE, logEntry);
        console.log(message);
    }

    /**
     * 🧹 Enterprise Port Cleanup - Eliminates zombie processes on ecosystem ports
     * Prevents EADDRINUSE errors by cleaning up orphaned Node.js processes
     */
    async cleanupPorts() {
        this.log('🧹 Running enterprise port cleanup...');

        const allPorts = apps.map(app => app.port);
        let cleanedCount = 0;
        let totalProcesses = 0;

        for (const port of allPorts) {
            try {
                // Check if port is in use
                const { stdout } = await execAsync(`netstat -ano | findstr ":${port}.*LISTENING"`).catch(() => ({ stdout: '' }));

                if (stdout.trim()) {
                    const lines = stdout.trim().split('\n');
                    for (const line of lines) {
                        const pidMatch = line.match(/\s+(\d+)$/);
                        if (pidMatch) {
                            const pid = pidMatch[1];
                            totalProcesses++;

                            try {
                                // Get process info
                                const { stdout: processInfo } = await execAsync(`tasklist /FI "PID eq ${pid}" /NH`).catch(() => ({ stdout: '' }));
                                const processName = processInfo.split(/\s+/)[0] || 'Unknown';

                                this.log(`🎯 Found zombie process: Port ${port} -> PID ${pid} (${processName})`);

                                // Kill the process
                                await execAsync(`taskkill /F /PID ${pid}`);
                                this.log(`✅ Eliminated PID ${pid} on port ${port}`);
                                cleanedCount++;

                                // Small delay to ensure port is released
                                await new Promise(resolve => setTimeout(resolve, 100));

                            } catch (killError) {
                                this.log(`⚠️ Could not eliminate PID ${pid}: ${killError.message}`);
                            }
                        }
                    }
                }
            } catch (error) {
                this.log(`❌ Error checking port ${port}: ${error.message}`);
            }
        }

        if (totalProcesses > 0) {
            this.log(`📊 Port cleanup completed: ${cleanedCount}/${totalProcesses} zombie processes eliminated`);
            // Wait for ports to fully release
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            this.log('✅ No zombie processes found - ports are clean!');
        }
    }

    async startApp(app) {
        const appPath = path.join(process.cwd(), app.dir);
        const env = {
            ...process.env,
            PORT: app.port.toString(),
            NODE_ENV: 'development'
        };

        // Determine the command based on app type
        let command, args;
        if (app.type === 'express') {
            // Express.js apps use direct node server.js
            command = 'node';
            args = ['server.js'];
        } else {
            // Next.js apps use pnpm dev
            command = 'pnpm';
            args = ['dev'];
        }

        const child = spawn(command, args, {
            cwd: appPath,
            env: env,
            stdio: 'ignore', // Completely silent
            detached: false, // Keep under daemon control
            shell: false // Security: Disable shell to prevent injection attacks
        });

        this.processes.set(app.name, {
            process: child,
            app: app,
            startTime: Date.now()
        });

        child.on('error', (error) => {
            this.log(`❌ ${app.name} (${app.type}) failed to start: ${error.message}`);
        });

        child.on('exit', (code, signal) => {
            if (!this.isShuttingDown) {
                this.log(`⚠️  ${app.name} (${app.type}) exited unexpectedly (code: ${code}, signal: ${signal})`);
                this.processes.delete(app.name);

                // Auto-restart after 5 seconds
                setTimeout(() => {
                    if (!this.isShuttingDown) {
                        this.log(`🔄 Restarting ${app.name} (${app.type})...`);
                        this.startApp(app);
                    }
                }, 5000);
            }
        });

        this.log(`🚀 Started ${app.name} (${app.type}) on port ${app.port} - ${app.domain}`);
    }

    async startAll() {
        this.log('🎯 Starting Complete Codai Ecosystem Daemon...');
        this.log(`📊 Architecture: ${apps.length} Total Apps (${apps.filter(app => app.type === 'nextjs').length} Next.js + ${apps.filter(app => app.type === 'express').length} Express.js)`);

        // 🧹 CRITICAL: Clean up zombie processes before starting
        await this.cleanupPorts();

        // Write PID file
        fs.writeFileSync(PID_FILE, process.pid.toString());

        // Start all apps with staggered timing and grouped by type
        const nextjsApps = apps.filter(app => app.type === 'nextjs');
        const expressApps = apps.filter(app => app.type === 'express');

        this.log('🚀 Starting Next.js Applications...');
        for (let i = 0; i < nextjsApps.length; i++) {
            const app = nextjsApps[i];
            await this.startApp(app);
            if (i < nextjsApps.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

        this.log('⚡ Starting Express.js Microservices...');
        for (let i = 0; i < expressApps.length; i++) {
            const app = expressApps[i];
            await this.startApp(app);
            if (i < expressApps.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Faster for Express apps
            }
        }

        this.log(`✅ Complete Codai Ecosystem Started! ${apps.length} applications running.`);
        this.log(`🌐 Next.js Apps: ${nextjsApps.length} | Express.js Services: ${expressApps.length}`);
        this.log('📊 Daemon running in background. Use "pnpm stop" to stop all apps.');

        // Keep the daemon alive
        this.keepAlive();
    }

    keepAlive() {
        // Check health every 30 seconds
        setInterval(() => {
            if (!this.isShuttingDown) {
                const runningCount = this.processes.size;
                const nextjsRunning = Array.from(this.processes.values()).filter(p => p.app.type === 'nextjs').length;
                const expressRunning = Array.from(this.processes.values()).filter(p => p.app.type === 'express').length;

                this.log(`💚 Health check: ${runningCount}/${apps.length} apps running (Next.js: ${nextjsRunning}, Express: ${expressRunning})`);
            }
        }, 30000);

        // Keep process alive
        process.stdin.resume();
    }

    async shutdown() {
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;

        this.log('🛑 Shutting down Codai Ecosystem...');

        // Kill all processes
        for (const [name, { process }] of this.processes) {
            try {
                this.log(`⏹️  Stopping ${name}...`);
                process.kill('SIGTERM');

                // Force kill after 5 seconds
                setTimeout(() => {
                    if (!process.killed) {
                        process.kill('SIGKILL');
                    }
                }, 5000);
            } catch (error) {
                this.log(`❌ Error stopping ${name}: ${error.message}`);
            }
        }

        this.cleanup();

        setTimeout(() => {
            this.log('✅ Codai Ecosystem stopped successfully!');
            process.exit(0);
        }, 6000);
    }

    cleanup() {
        // Remove PID file
        try {
            if (fs.existsSync(PID_FILE)) {
                fs.unlinkSync(PID_FILE);
            }
        } catch (error) {
            // Ignore cleanup errors
        }
    }

    static isRunning() {
        try {
            if (fs.existsSync(PID_FILE)) {
                const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
                process.kill(pid, 0); // Check if process exists
                return pid;
            }
        } catch (error) {
            // Process doesn't exist
        }
        return false;
    }

    static async stop() {
        const pid = CodaiDaemon.isRunning();
        if (pid) {
            console.log(`🛑 Stopping Codai Daemon (PID: ${pid})...`);
            try {
                process.kill(pid, 'SIGTERM');

                // Wait for graceful shutdown
                let attempts = 0;
                while (CodaiDaemon.isRunning() && attempts < 10) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    attempts++;
                }

                if (CodaiDaemon.isRunning()) {
                    console.log('⚠️  Force killing daemon...');
                    process.kill(pid, 'SIGKILL');
                }

                console.log('✅ Codai Daemon stopped successfully!');
            } catch (error) {
                console.log(`❌ Error stopping daemon: ${error.message}`);
            }
        } else {
            console.log('ℹ️  Codai Daemon is not running');
        }
    }

    static status() {
        const pid = CodaiDaemon.isRunning();
        if (pid) {
            console.log(`✅ Codai Daemon is running (PID: ${pid})`);
            console.log(`📋 Log file: ${LOG_FILE}`);

            // Show recent logs
            if (fs.existsSync(LOG_FILE)) {
                console.log('\n📝 Recent activity:');
                const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n');
                logs.slice(-5).forEach(line => {
                    if (line.trim()) console.log(`   ${line}`);
                });
            }
        } else {
            console.log('❌ Codai Daemon is not running');
        }
    }
}

// Command handling
const command = process.argv[2];

switch (command) {
    case 'start':
        if (CodaiDaemon.isRunning()) {
            console.log('⚠️  Codai Daemon is already running. Use "pnpm stop" first.');
            process.exit(1);
        } else {
            const daemon = new CodaiDaemon();
            daemon.startAll();
        }
        break;

    case 'stop':
        await CodaiDaemon.stop();
        break;

    case 'status':
        CodaiDaemon.status();
        break;

    case 'restart':
        await CodaiDaemon.stop();
        setTimeout(() => {
            const daemon = new CodaiDaemon();
            daemon.startAll();
        }, 2000);
        break;

    default:
        console.log(`
🚀 Codai Ecosystem Daemon - Complete 27-App Orchestration

Usage:
  pnpm dev           Start all apps in background
  pnpm stop          Stop all apps
  pnpm status        Show daemon status
  pnpm restart       Restart all apps

🏗️  Architecture Overview:
  • Total Apps: ${apps.length}
  • Next.js Apps: ${apps.filter(app => app.type === 'nextjs').length} (Ports 4030-4040, 4056)
  • Express.js Apps: ${apps.filter(app => app.type === 'express').length} (Ports 4041-4055)

📊 Core Next.js Applications (4030-4040):
${apps.filter(app => app.type === 'nextjs' && app.port <= 4040).map(app =>
            `  • ${app.name.padEnd(12)} (${app.port}) - ${app.domain}`
        ).join('\n')}

🔧 Express.js Microservices (4041-4055):
${apps.filter(app => app.type === 'express').map(app =>
            `  • ${app.name.padEnd(12)} (${app.port}) - ${app.domain}`
        ).join('\n')}

📱 Additional Services:
${apps.filter(app => app.port > 4055).map(app =>
            `  • ${app.name.padEnd(12)} (${app.port}) - ${app.domain}`
        ).join('\n')}
    `);
        break;
}
