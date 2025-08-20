#!/usr/bin/env node

/**
 * 🧠 MemorAI MCP - Server Manager
 * Centralized server management for all MemorAI MCP phases
 */

const { spawn } = require('child_process');
const path = require('path');
const config = require('../src/utils/config.cjs');
const logger = require('../src/utils/logger.cjs');

class MemorAIMCPServerManager {
    constructor() {
        this.servers = new Map();
        this.startTime = new Date();
        this.nodeId = `memorai-${process.env.USERNAME || 'system'}-${Date.now()}`;
        this.systemLogger = logger.createPhaseLogger('SYSTEM');

        // Server phase definitions
        this.phases = [
            {
                phase: 2,
                name: 'CBD Integration',
                port: 8002,
                server: 'memorai-mcp-advanced-phase4.cjs',
                description: 'Advanced CBD integration with enterprise features',
                dependencies: []
            },
            {
                phase: 3,
                name: 'Intelligence Layer',
                port: 8003,
                server: 'memorai-mcp-intelligent.cjs',
                description: 'Semantic analysis and intelligent processing',
                dependencies: [2]
            },
            {
                phase: 4,
                name: 'Enterprise Features',
                port: 8004,
                server: 'memorai-mcp-advanced-phase4.cjs',
                description: 'Enterprise security and compliance features',
                dependencies: [2, 3]
            },
            {
                phase: 5,
                name: 'Performance Optimization',
                port: 8005,
                server: 'memorai-mcp-performance-phase5.cjs',
                description: 'Clustering and performance optimization',
                dependencies: [2, 3, 4]
            },
            {
                phase: 6,
                name: 'Real-time Collaboration',
                port: 8006,
                server: 'memorai-mcp-realtime-phase6.cjs',
                description: 'WebSocket real-time collaboration',
                dependencies: [2, 3, 4, 5]
            },
            {
                phase: 7,
                name: 'AI Integration',
                port: 8007,
                server: 'memorai-mcp-ai-phase7.cjs',
                description: 'Advanced AI integration and learning',
                dependencies: [2, 3, 4, 5, 6]
            }
        ];

        this.initializeBanner();
    }

    initializeBanner() {
        console.log('🧠 MemorAI MCP - Server Manager');
        console.log('================================');
        console.log(`📊 Managing ${this.phases.length} server phases`);
        console.log(`🕐 Started at: ${this.startTime.toISOString()}`);
        console.log('================================\n');
    }

    async startAll() {
        this.systemLogger.info('🚀 Starting MemorAI MCP Server Manager');

        for (const phase of this.phases) {
            try {
                await this.waitForDependencies(phase.dependencies);
                await this.startPhase(phase);
                await this.delay(2000); // Wait 2 seconds between starts
            } catch (error) {
                this.systemLogger.error(`Failed to start phase ${phase.phase}`, { error: error.message });
                throw error;
            }
        }

        this.systemLogger.info('✅ All MemorAI MCP servers started successfully');
        return this.getStatus();
    }

    async startPhase(phase) {
        const phaseLogger = logger.createPhaseLogger(phase.phase);

        console.log(`🚀 Starting Phase ${phase.phase}: ${phase.name}`);
        console.log(`📡 Port: ${phase.port}`);
        console.log(`🖥️ Server: ${phase.server}`);

        try {
            const serverPath = path.resolve(__dirname, '..', phase.server);
            const childProcess = spawn('node', [serverPath], {
                stdio: ['pipe', 'pipe', 'pipe'],
                detached: false,
                env: {
                    ...process.env,
                    PORT: phase.port,
                    PHASE: phase.phase,
                    NODE_ENV: config.ENVIRONMENT
                }
            });

            const serverInfo = {
                phase: phase.phase,
                name: phase.name,
                port: phase.port,
                server: phase.server,
                process: childProcess,
                pid: childProcess.pid,
                status: 'starting',
                startTime: new Date(),
                lastCheck: new Date()
            };

            this.servers.set(phase.phase, serverInfo);

            // Handle process output
            childProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    phaseLogger.info(`STDOUT: ${output}`);
                }
            });

            childProcess.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error) {
                    phaseLogger.warn(`STDERR: ${error}`);
                }
            });

            childProcess.on('close', (code) => {
                phaseLogger.info(`Process exited with code ${code}`);
                if (serverInfo.status !== 'stopped') {
                    serverInfo.status = code === 0 ? 'stopped' : 'error';
                }
            });

            childProcess.on('error', (error) => {
                phaseLogger.error(`Process error for Phase ${phase.phase}`, { error: error.message, stack: error.stack });
                serverInfo.status = 'error';
            });

            console.log(`⏳ Phase ${phase.phase} starting...`);

        } catch (error) {
            phaseLogger.error(`Failed to start Phase ${phase.phase}`, { error: error.message, stack: error.stack });
            console.log(`❌ Phase ${phase.phase} failed to start: ${error.message}`);
            throw error;
        }
    }

    async waitForDependencies(dependencies) {
        if (!dependencies || dependencies.length === 0) return;

        for (const dep of dependencies) {
            const server = this.servers.get(dep);
            if (!server || server.status !== 'running') {
                // For now, just wait a bit if dependency is not ready
                await this.delay(1000);
            }
        }
    }

    getStatus() {
        const status = {
            nodeId: this.nodeId,
            startTime: this.startTime,
            uptime: Date.now() - this.startTime.getTime(),
            servers: [],
            summary: {
                total: this.phases.length,
                running: 0,
                stopped: 0,
                error: 0,
                starting: 0
            }
        };

        for (const [phase, serverInfo] of this.servers) {
            const phaseStatus = {
                phase: serverInfo.phase,
                name: serverInfo.name,
                port: serverInfo.port,
                server: serverInfo.server,
                pid: serverInfo.pid,
                status: serverInfo.status,
                startTime: serverInfo.startTime,
                uptime: Date.now() - serverInfo.startTime.getTime()
            };

            status.servers.push(phaseStatus);
            status.summary[serverInfo.status]++;
        }

        return status;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = MemorAIMCPServerManager;
