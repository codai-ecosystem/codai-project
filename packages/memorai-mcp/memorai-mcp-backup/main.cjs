#!/usr/bin/env node

/**
 * 🧠 MemorAI MCP - Main Entry Point
 * Unified interface for all MemorAI MCP operations
 */

const path = require('path');
const config = require('./src/utils/config.cjs');
const logger = require('./src/utils/logger.cjs');

class MemorAIMCPMain {
    constructor() {
        this.commands = {
            'start': this.startServers,
            'stop': this.stopServers,
            'restart': this.restartServers,
            'test': this.runTests,
            'status': this.getStatus,
            'health': this.checkHealth,
            'logs': this.showLogs,
            'help': this.showHelp
        };
    }

    async run() {
        const command = process.argv[2] || 'help';
        const args = process.argv.slice(3);

        console.log('🧠 MemorAI MCP - Advanced Memory Context Protocol');
        console.log('==================================================');
        console.log(`🕐 ${new Date().toISOString()}`);
        console.log(`🏷️ Node ID: ${config.SYSTEM.NODE_ID}`);
        console.log(`🌐 Environment: ${config.SYSTEM.NODE_ENV}`);
        console.log('==================================================\n');

        try {
            config.validate();

            if (this.commands[command]) {
                await this.commands[command].call(this, ...args);
            } else {
                console.log(`❌ Unknown command: ${command}`);
                await this.showHelp();
                process.exit(1);
            }
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            if (error.stack) {
                console.error('Stack trace:', error.stack);
            }
            process.exit(1);
        }
    }

    async startServers(phase = 'all') {
        console.log('🚀 Starting MemorAI MCP Servers...\n');

        const MemorAIMCPServerManager = require('./scripts/server-manager.cjs');
        const manager = new MemorAIMCPServerManager();

        if (phase === 'all') {
            await manager.startAll();
        } else {
            // Start specific phase
            const phaseNumber = parseInt(phase);
            if (phaseNumber >= 2 && phaseNumber <= 7) {
                const phaseConfig = manager.phases.find(p => p.phase === phaseNumber);
                if (phaseConfig) {
                    await manager.startPhase(phaseConfig);
                } else {
                    throw new Error(`Phase ${phaseNumber} not found`);
                }
            } else {
                throw new Error(`Invalid phase number: ${phase}. Use 2-7 or 'all'`);
            }
        }
    }

    async stopServers() {
        console.log('🛑 Stopping MemorAI MCP Servers...\n');

        const MemorAIMCPServerManager = require('./scripts/server-manager.cjs');
        const manager = new MemorAIMCPServerManager();
        await manager.stopAll();
    }

    async restartServers(phase = 'all') {
        console.log('🔄 Restarting MemorAI MCP Servers...\n');

        await this.stopServers();
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        await this.startServers(phase);
    }

    async runTests(phase = 'all') {
        console.log('🧪 Running MemorAI MCP Tests...\n');

        const TestSuite = require('./tests/comprehensive-test-suite.cjs');
        const testSuite = new TestSuite();

        const success = await testSuite.runAllTests();
        process.exit(success ? 0 : 1);
    }

    async getStatus() {
        console.log('📊 Getting MemorAI MCP Status...\n');

        try {
            const MemorAIMCPServerManager = require('./scripts/server-manager.cjs');
            const manager = new MemorAIMCPServerManager();
            const status = await manager.getStatus();

            console.log(JSON.stringify(status, null, 2));
        } catch (error) {
            console.log('⚠️ Server manager not running. Checking individual servers...\n');

            const phases = [
                { phase: 2, port: config.PORTS.PHASE_2_CBD, name: 'CBD Integration' },
                { phase: 3, port: config.PORTS.PHASE_3_INTELLIGENCE, name: 'Intelligence Layer' },
                { phase: 4, port: config.PORTS.PHASE_4_ENTERPRISE, name: 'Enterprise Features' },
                { phase: 5, port: config.PORTS.PHASE_5_PERFORMANCE, name: 'Performance Optimization' },
                { phase: 6, port: config.PORTS.PHASE_6_REALTIME, name: 'Real-time Collaboration' },
                { phase: 7, port: config.PORTS.PHASE_7_AI, name: 'AI Integration' }
            ];

            for (const phase of phases) {
                try {
                    const response = await this.makeRequest(`http://localhost:${phase.port}/health`);
                    console.log(`✅ Phase ${phase.phase} (${phase.name}): ${response.status || 'running'}`);
                } catch (error) {
                    console.log(`❌ Phase ${phase.phase} (${phase.name}): not responding`);
                }
            }
        }
    }

    async checkHealth() {
        console.log('🏥 Checking MemorAI MCP Health...\n');

        const phases = [
            { phase: 2, port: config.PORTS.PHASE_2_CBD, name: 'CBD Integration' },
            { phase: 3, port: config.PORTS.PHASE_3_INTELLIGENCE, name: 'Intelligence Layer' },
            { phase: 4, port: config.PORTS.PHASE_4_ENTERPRISE, name: 'Enterprise Features' },
            { phase: 5, port: config.PORTS.PHASE_5_PERFORMANCE, name: 'Performance Optimization' },
            { phase: 6, port: config.PORTS.PHASE_6_REALTIME, name: 'Real-time Collaboration' },
            { phase: 7, port: config.PORTS.PHASE_7_AI, name: 'AI Integration' }
        ];

        let healthyCount = 0;

        for (const phase of phases) {
            try {
                const startTime = Date.now();
                const response = await this.makeRequest(`http://localhost:${phase.port}/health`);
                const responseTime = Date.now() - startTime;

                console.log(`✅ Phase ${phase.phase}: ${response.status || 'healthy'} (${responseTime}ms)`);
                healthyCount++;

                if (response.version) {
                    console.log(`   Version: ${response.version}`);
                }
                if (response.uptime) {
                    console.log(`   Uptime: ${Math.round(response.uptime / 1000)}s`);
                }

            } catch (error) {
                console.log(`❌ Phase ${phase.phase}: ${error.message}`);
            }
            console.log('');
        }

        console.log(`📊 Health Summary: ${healthyCount}/${phases.length} services healthy`);

        if (healthyCount === phases.length) {
            console.log('🎉 All services are healthy!');
        } else {
            console.log('⚠️ Some services are not responding properly.');
        }
    }

    async showLogs(lines = '50') {
        console.log(`📄 Showing last ${lines} log entries...\n`);

        const numLines = parseInt(lines) || 50;
        const recentLogs = logger.getRecentLogs(numLines);

        for (const log of recentLogs) {
            const timestamp = new Date(log.timestamp).toLocaleString();
            console.log(`[${timestamp}] [${log.level}] [${log.phase}] ${log.message}`);

            if (log.meta && Object.keys(log.meta).length > 0) {
                console.log(`  Meta: ${JSON.stringify(log.meta)}`);
            }
        }

        if (recentLogs.length === 0) {
            console.log('No logs available.');
        }

        console.log(`\n📊 Log Statistics:`);
        const stats = logger.getStats();
        console.log(`Total logs: ${stats.total}`);
        console.log(`Recent errors: ${stats.recentErrors}`);
        console.log(`Recent warnings: ${stats.recentWarnings}`);
    }

    async showHelp() {
        console.log('🧠 MemorAI MCP - Available Commands');
        console.log('====================================\n');

        console.log('📋 Server Management:');
        console.log('  start [phase]    - Start all servers or specific phase (2-7)');
        console.log('  stop             - Stop all servers');
        console.log('  restart [phase]  - Restart all servers or specific phase');
        console.log('');

        console.log('🧪 Testing & Monitoring:');
        console.log('  test             - Run comprehensive test suite');
        console.log('  status           - Show server status');
        console.log('  health           - Check health of all services');
        console.log('  logs [lines]     - Show recent log entries (default: 50)');
        console.log('');

        console.log('📖 Information:');
        console.log('  help             - Show this help message');
        console.log('');

        console.log('🔗 Examples:');
        console.log('  node main.cjs start           # Start all servers');
        console.log('  node main.cjs start 7         # Start only Phase 7 (AI)');
        console.log('  node main.cjs test            # Run all tests');
        console.log('  node main.cjs health          # Check health');
        console.log('  node main.cjs logs 100        # Show last 100 log entries');
        console.log('');

        console.log('🏗️ Available Phases:');
        console.log('  Phase 2: CBD Integration       (Port 8002)');
        console.log('  Phase 3: Intelligence Layer    (Port 8003)');
        console.log('  Phase 4: Enterprise Features   (Port 8004)');
        console.log('  Phase 5: Performance Optimization (Port 8005)');
        console.log('  Phase 6: Real-time Collaboration (Port 8006)');
        console.log('  Phase 7: AI Integration        (Port 8007)');
    }

    async makeRequest(url, method = 'GET', data = null, headers = {}) {
        const http = require('http');
        const https = require('https');

        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;

            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'MemorAI-MCP-CLI/1.0',
                    ...headers
                },
                timeout: 5000
            };

            if (data && method !== 'GET') {
                const jsonData = JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(jsonData);
            }

            const req = client.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(responseData);
                        resolve(parsedData);
                    } catch (error) {
                        resolve({ status: 'success', raw: responseData });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (data && method !== 'GET') {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }
}

// Run if called directly
if (require.main === module) {
    const main = new MemorAIMCPMain();
    main.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = MemorAIMCPMain;
