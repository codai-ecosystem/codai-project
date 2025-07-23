#!/usr/bin/env node

/**
 * Real Integration Test Runner
 * Orchestrates service startup, health checks, and real data testing
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const CONFIG = {
    scripts: {
        infrastructure: 'node scripts/test-infrastructure.js',
        portDiscovery: 'node scripts/port-discovery.js',
        test: 'pnpm test'
    },
    phases: {
        infrastructure: {
            name: 'Service Infrastructure',
            timeout: 120000 // 2 minutes
        },
        discovery: {
            name: 'Port Discovery',
            timeout: 30000 // 30 seconds
        },
        tests: {
            name: 'Integration Tests',
            timeout: 300000 // 5 minutes
        }
    }
};

class RealTestRunner {
    constructor() {
        this.infrastructure = null;
        this.results = {
            infrastructure: null,
            discovery: null,
            tests: null,
            totalTime: 0,
            success: false
        };
    }

    /**
     * Run complete testing pipeline
     */
    async run() {
        const startTime = Date.now();

        console.log(chalk.blue('\n🚀 Real Integration Test Runner Starting...\n'));
        console.log(chalk.yellow('This will:'));
        console.log('  ✅ Start all primary service dev servers');
        console.log('  ✅ Discover and validate service ports');
        console.log('  ✅ Run integration tests with real data');
        console.log('  ✅ Clean up services after testing\n');

        try {
            // Phase 1: Service Infrastructure
            await this.runPhase('infrastructure', () => this.setupInfrastructure());

            // Phase 2: Port Discovery
            await this.runPhase('discovery', () => this.discoverPorts());

            // Phase 3: Run Tests
            await this.runPhase('tests', () => this.runTests());

            this.results.success = true;
            this.results.totalTime = Date.now() - startTime;

            await this.generateSummary();

        } catch (error) {
            console.error(chalk.red(`\n💥 Test pipeline failed: ${error.message}\n`));
            this.results.success = false;
            this.results.totalTime = Date.now() - startTime;

            await this.generateSummary();
            process.exit(1);

        } finally {
            await this.cleanup();
        }
    }

    /**
     * Run a test phase with timeout and error handling
     */
    async runPhase(phaseName, phaseFunction) {
        const phase = CONFIG.phases[phaseName];
        console.log(chalk.blue(`\n📋 Phase: ${phase.name}\n`));

        const startTime = Date.now();

        try {
            const result = await Promise.race([
                phaseFunction(),
                this.timeout(phase.timeout, `${phase.name} timed out after ${phase.timeout}ms`)
            ]);

            const duration = Date.now() - startTime;
            this.results[phaseName] = { success: true, duration, result };

            console.log(chalk.green(`✅ ${phase.name} completed in ${duration}ms\n`));

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.results[phaseName] = { success: false, duration, error: error.message };

            console.error(chalk.red(`❌ ${phase.name} failed after ${duration}ms: ${error.message}\n`));
            throw error;
        }
    }

    /**
     * Setup service infrastructure
     */
    async setupInfrastructure() {
        console.log(chalk.yellow('🔄 Starting service infrastructure...\n'));

        // Import and run infrastructure setup
        const TestInfrastructure = (await import('./test-infrastructure.js')).default;
        this.infrastructure = new TestInfrastructure();

        const result = await this.infrastructure.startServices();

        console.log(chalk.green('✅ Service infrastructure ready\n'));
        console.log(`   Services started: ${result.services.filter(s => s.success).length}/${result.services.length}`);
        console.log(`   Health checks: ${result.healthChecks.healthy}/${result.healthChecks.total}`);
        console.log(`   Success rate: ${Math.round(result.successRate * 100)}%\n`);

        return result;
    }

    /**
     * Discover and validate ports
     */
    async discoverPorts() {
        console.log(chalk.yellow('🔍 Discovering service ports...\n'));

        // Import and run port discovery
        const PortDiscovery = (await import('./port-discovery.js')).default;
        const discovery = new PortDiscovery();

        const discoveryResult = await discovery.discoverAllPorts();
        const validationResult = await discovery.validatePorts();

        console.log(chalk.green('✅ Port discovery completed\n'));
        console.log(`   Ports discovered: ${discoveryResult.discovered}/${discoveryResult.total}`);
        console.log(`   Ports accessible: ${validationResult.accessible}/${validationResult.total}\n`);

        return { discovery: discoveryResult, validation: validationResult };
    }

    /**
     * Run integration tests
     */
    async runTests() {
        console.log(chalk.yellow('🧪 Running integration tests...\n'));

        // Run tests using the test command
        const testResult = await this.runCommand('pnpm', ['test'], {
            cwd: process.cwd(),
            env: {
                ...process.env,
                NODE_ENV: 'test',
                TEST_MODE: 'integration',
                REAL_DATA: 'true'
            }
        });

        if (testResult.code === 0) {
            console.log(chalk.green('✅ All tests passed\n'));
        } else {
            throw new Error(`Tests failed with exit code ${testResult.code}`);
        }

        return testResult;
    }

    /**
     * Run a command and return result
     */
    async runCommand(command, args, options = {}) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                stdio: 'inherit',
                ...options
            });

            child.on('close', (code) => {
                resolve({ code, command, args });
            });

            child.on('error', (error) => {
                reject(new Error(`Command failed: ${command} ${args.join(' ')} - ${error.message}`));
            });
        });
    }

    /**
     * Create timeout promise
     */
    timeout(ms, message) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error(message)), ms);
        });
    }

    /**
     * Generate test summary
     */
    async generateSummary() {
        console.log(chalk.blue('\n📊 Test Run Summary\n'));

        // Overall status
        const status = this.results.success ? '✅ SUCCESS' : '❌ FAILED';
        const statusColor = this.results.success ? chalk.green : chalk.red;
        console.log(statusColor(`Status: ${status}`));
        console.log(`Total Time: ${this.results.totalTime}ms\n`);

        // Phase results
        console.log(chalk.blue('Phase Results:'));
        Object.entries(this.results).forEach(([phase, result]) => {
            if (phase === 'totalTime' || phase === 'success' || !result) return;

            const icon = result.success ? '✅' : '❌';
            const duration = result.duration ? `(${result.duration}ms)` : '';
            console.log(`  ${icon} ${CONFIG.phases[phase]?.name || phase}: ${duration}`);

            if (!result.success && result.error) {
                console.log(`     Error: ${result.error}`);
            }
        });

        // Save summary to file
        const summaryFile = join(process.cwd(), 'test-results', 'integration-test-summary.json');
        try {
            await fs.mkdir(join(process.cwd(), 'test-results'), { recursive: true });
            await fs.writeFile(summaryFile, JSON.stringify({
                timestamp: new Date().toISOString(),
                success: this.results.success,
                totalTime: this.results.totalTime,
                phases: this.results
            }, null, 2));

            console.log(chalk.gray(`\nSummary saved to: ${summaryFile}`));
        } catch (error) {
            console.log(chalk.yellow(`Warning: Could not save summary - ${error.message}`));
        }
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        console.log(chalk.blue('\n🧹 Cleaning up...\n'));

        if (this.infrastructure) {
            try {
                await this.infrastructure.shutdown();
                console.log(chalk.green('✅ Service infrastructure stopped'));
            } catch (error) {
                console.log(chalk.yellow(`⚠️  Cleanup warning: ${error.message}`));
            }
        }

        console.log(chalk.blue('\n🏁 Test run complete\n'));
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new RealTestRunner();

    // Handle process termination
    process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n\n⚠️  Test run interrupted by user'));
        await runner.cleanup();
        process.exit(1);
    });

    process.on('SIGTERM', async () => {
        console.log(chalk.yellow('\n\n⚠️  Test run terminated'));
        await runner.cleanup();
        process.exit(1);
    });

    // Run the test pipeline
    runner.run().catch((error) => {
        console.error(chalk.red(`\n💥 Unhandled error: ${error.message}`));
        process.exit(1);
    });
}

export default RealTestRunner;
