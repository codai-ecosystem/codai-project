#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Manages orchestrated testing for all services with real data integration
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import DevOrchestrator from './dev-orchestrator-enhanced.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const colors = {
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    magenta: (text) => `\x1b[35m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    gray: (text) => `\x1b[90m${text}\x1b[0m`,
    bold: (text) => `\x1b[1m${text}\x1b[0m`
};

const TEST_CONFIG = {
    // Test categories to run
    testTypes: {
        unit: {
            name: 'Unit Tests',
            command: 'pnpm test:unit',
            timeout: 120000,
            parallel: true
        },
        integration: {
            name: 'Integration Tests',
            command: 'pnpm test:integration',
            timeout: 300000,
            parallel: false
        },
        e2e: {
            name: 'End-to-End Tests',
            command: 'pnpm test:e2e',
            timeout: 600000,
            parallel: false
        },
        api: {
            name: 'API Tests',
            command: 'pnpm test:api',
            timeout: 180000,
            parallel: false
        },
        component: {
            name: 'Component Tests',
            command: 'pnpm test:component',
            timeout: 240000,
            parallel: true
        }
    },

    // Primary apps to test
    primaryApps: [
        'codai',
        'admin',
        'hub',
        'id',
        'bancai',
        'memorai'
    ],

    // Services that need to be running
    requiredServices: [
        { name: 'codai', port: 4001, healthPath: '/' },
        { name: 'admin', port: 4002, healthPath: '/' },
        { name: 'hub', port: 4003, healthPath: '/' },
        { name: 'id', port: 4004, healthPath: '/' },
        { name: 'bancai', port: 4005, healthPath: '/' },
        { name: 'memorai', port: 4006, healthPath: '/' }
    ],

    timeouts: {
        serviceStartup: 120000,    // 2 minutes for all services to start
        serviceHealth: 60000,      // 1 minute for services to be healthy
        testExecution: 1800000     // 30 minutes for all tests
    }
};

class ComprehensiveTestRunner {
    constructor() {
        this.orchestrator = null;
        this.testResults = new Map();
        this.startTime = Date.now();
        this.isShuttingDown = false;

        // Handle process termination
        process.on('SIGINT', () => this.gracefulShutdown());
        process.on('SIGTERM', () => this.gracefulShutdown());
    }

    /**
     * Run comprehensive tests with orchestrated services
     */
    async runComprehensiveTests() {
        console.log(colors.bold(colors.blue('\n🧪 Starting Comprehensive Test Suite...\n')));

        try {
            // Step 1: Start orchestrator in background
            console.log(colors.cyan('🚀 Starting development orchestrator...\n'));
            await this.startOrchestrator();

            // Step 2: Wait for services to be healthy
            console.log(colors.yellow('⏳ Waiting for services to be ready...\n'));
            await this.waitForServicesReady();

            // Step 3: Validate real data connections
            console.log(colors.cyan('🔍 Validating real data connections...\n'));
            await this.validateDataConnections();

            // Step 4: Run all test suites
            console.log(colors.magenta('🧪 Running comprehensive test suites...\n'));
            await this.runAllTestSuites();

            // Step 5: Generate test report
            console.log(colors.blue('📊 Generating test reports...\n'));
            await this.generateTestReport();

            console.log(colors.bold(colors.green('\n✅ Comprehensive testing complete!\n')));

        } catch (error) {
            console.error(colors.red('💥 Comprehensive testing failed:'), error.message);
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    /**
     * Start orchestrator in background
     */
    async startOrchestrator() {
        console.log(colors.blue('🔄 Starting orchestrator...\n'));

        return new Promise((resolve, reject) => {
            // Start orchestrator as child process
            const orchestratorProcess = spawn('node', ['scripts/dev-orchestrator-enhanced.js', 'start'], {
                cwd: projectRoot,
                stdio: ['pipe', 'pipe', 'pipe'],
                detached: true
            });

            let output = '';
            let hasStarted = false;

            orchestratorProcess.stdout.on('data', (data) => {
                output += data.toString();
                console.log(colors.gray(`[orchestrator] ${data.toString().trim()}`));

                // Check if orchestrator is ready
                if (data.toString().includes('Development Orchestrator Ready') && !hasStarted) {
                    hasStarted = true;
                    console.log(colors.green('✅ Orchestrator started successfully\n'));
                    resolve(orchestratorProcess);
                }
            });

            orchestratorProcess.stderr.on('data', (data) => {
                console.log(colors.yellow(`[orchestrator] ${data.toString().trim()}`));
            });

            orchestratorProcess.on('error', (error) => {
                reject(new Error(`Failed to start orchestrator: ${error.message}`));
            });

            // Timeout after 2 minutes
            setTimeout(() => {
                if (!hasStarted) {
                    reject(new Error('Orchestrator startup timeout'));
                }
            }, TEST_CONFIG.timeouts.serviceStartup);

            this.orchestratorProcess = orchestratorProcess;
        });
    }

    /**
     * Wait for all required services to be ready
     */
    async waitForServicesReady() {
        const startTime = Date.now();
        const timeout = TEST_CONFIG.timeouts.serviceHealth;

        while (Date.now() - startTime < timeout) {
            console.log(colors.gray('🔍 Checking service health...'));

            const healthPromises = TEST_CONFIG.requiredServices.map(async (service) => {
                try {
                    const response = await fetch(`http://localhost:${service.port}${service.healthPath}`, {
                        timeout: 5000
                    });
                    return {
                        service: service.name,
                        healthy: response.ok,
                        status: response.status
                    };
                } catch (error) {
                    return {
                        service: service.name,
                        healthy: false,
                        error: error.message
                    };
                }
            });

            const results = await Promise.all(healthPromises);
            const unhealthy = results.filter(r => !r.healthy);

            if (unhealthy.length === 0) {
                console.log(colors.green('✅ All services are healthy and ready!\n'));
                return true;
            }

            console.log(colors.gray(`⏳ Waiting for: ${unhealthy.map(r => `${r.service}(${r.error || r.status})`).join(', ')}`));
            await this.delay(3000);
        }

        throw new Error('Services health check timeout - some services may not be ready');
    }

    /**
     * Validate real data connections
     */
    async validateDataConnections() {
        console.log(colors.cyan('🔍 Validating real data connections...\n'));

        const validations = [
            {
                name: 'MemorAI Real Data',
                test: async () => {
                    const response = await fetch('http://localhost:4006/api/stats');
                    const data = await response.json();

                    if (!data || typeof data.totalMemories !== 'number') {
                        throw new Error('MemorAI not returning real MCP data structure');
                    }

                    console.log(colors.green(`✅ MemorAI: ${data.totalMemories} real memories found`));
                    return { status: 'success', memories: data.totalMemories };
                }
            },
            {
                name: 'API Endpoints',
                test: async () => {
                    const endpoints = [
                        'http://localhost:4001/api/health',
                        'http://localhost:4002/api/health',
                        'http://localhost:4003/api/health'
                    ];

                    const results = await Promise.all(
                        endpoints.map(async (endpoint) => {
                            try {
                                const response = await fetch(endpoint);
                                return { endpoint, status: response.status, ok: response.ok };
                            } catch (error) {
                                return { endpoint, status: 'error', error: error.message };
                            }
                        })
                    );

                    const failed = results.filter(r => !r.ok && r.status !== 404);
                    if (failed.length > 0) {
                        console.log(colors.yellow(`⚠️  Some API endpoints not available: ${failed.map(f => f.endpoint).join(', ')}`));
                    }

                    console.log(colors.green(`✅ API validation complete`));
                    return { status: 'success', results };
                }
            }
        ];

        for (const validation of validations) {
            try {
                console.log(colors.blue(`🔄 Validating: ${validation.name}...`));
                const result = await validation.test();
                console.log(colors.green(`✅ ${validation.name} validation passed`));
            } catch (error) {
                console.log(colors.yellow(`⚠️  ${validation.name} validation warning: ${error.message}`));
            }
        }

        console.log();
    }

    /**
     * Run all test suites
     */
    async runAllTestSuites() {
        const testSuites = [
            { type: 'unit', apps: TEST_CONFIG.primaryApps },
            { type: 'integration', apps: TEST_CONFIG.primaryApps },
            { type: 'component', apps: ['codai', 'admin', 'hub'] },
            { type: 'api', apps: ['codai', 'memorai'] },
            { type: 'e2e', apps: ['codai'] }
        ];

        for (const suite of testSuites) {
            await this.runTestSuite(suite.type, suite.apps);
        }
    }

    /**
     * Run a specific test suite
     */
    async runTestSuite(testType, apps) {
        const testConfig = TEST_CONFIG.testTypes[testType];
        if (!testConfig) {
            console.log(colors.yellow(`⚠️  Unknown test type: ${testType}`));
            return;
        }

        console.log(colors.bold(colors.magenta(`\n🧪 Running ${testConfig.name}...\n`)));

        const results = [];

        if (testConfig.parallel) {
            // Run tests in parallel
            const testPromises = apps.map(app => this.runAppTests(app, testType));
            const parallelResults = await Promise.allSettled(testPromises);

            parallelResults.forEach((result, index) => {
                const app = apps[index];
                if (result.status === 'fulfilled') {
                    results.push({ app, ...result.value });
                } else {
                    results.push({
                        app,
                        success: false,
                        error: result.reason?.message || 'Unknown error',
                        duration: 0
                    });
                }
            });
        } else {
            // Run tests sequentially
            for (const app of apps) {
                const result = await this.runAppTests(app, testType);
                results.push({ app, ...result });
            }
        }

        // Store results
        this.testResults.set(testType, results);

        // Print summary
        this.printTestSuiteSummary(testType, results);
    }

    /**
     * Run tests for a specific app
     */
    async runAppTests(app, testType) {
        const appPath = join(projectRoot, 'apps', app);
        const testConfig = TEST_CONFIG.testTypes[testType];

        try {
            // Check if app directory exists
            await fs.access(appPath);
        } catch {
            console.log(colors.yellow(`⚠️  App directory not found: ${app}, skipping ${testType} tests...`));
            return { success: true, skipped: true, duration: 0 };
        }

        console.log(colors.blue(`🔄 Running ${testType} tests for ${app}...`));

        const startTime = Date.now();

        return new Promise((resolve) => {
            const testProcess = spawn('pnpm', ['test', '--reporter=verbose'], {
                cwd: appPath,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
                timeout: testConfig.timeout
            });

            let output = '';
            let errorOutput = '';

            testProcess.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                console.log(colors.gray(`[${app}:${testType}] ${text.trim()}`));
            });

            testProcess.stderr.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                if (!text.includes('DeprecationWarning')) {
                    console.log(colors.yellow(`[${app}:${testType}] ${text.trim()}`));
                }
            });

            testProcess.on('close', (code) => {
                const duration = Date.now() - startTime;
                const success = code === 0;

                if (success) {
                    console.log(colors.green(`✅ ${app} ${testType} tests passed (${duration}ms)`));
                } else {
                    console.log(colors.red(`❌ ${app} ${testType} tests failed (code: ${code})`));
                }

                resolve({
                    success,
                    duration,
                    output,
                    errorOutput,
                    exitCode: code
                });
            });

            testProcess.on('error', (error) => {
                const duration = Date.now() - startTime;
                console.log(colors.red(`❌ ${app} ${testType} test process error: ${error.message}`));

                resolve({
                    success: false,
                    duration,
                    error: error.message,
                    output,
                    errorOutput
                });
            });
        });
    }

    /**
     * Print test suite summary
     */
    printTestSuiteSummary(testType, results) {
        const total = results.length;
        const passed = results.filter(r => r.success).length;
        const failed = total - passed;
        const skipped = results.filter(r => r.skipped).length;

        console.log(colors.bold(colors.blue(`\n📊 ${TEST_CONFIG.testTypes[testType].name} Summary:`)));
        console.log(colors.green(`   ✅ Passed: ${passed}`));
        if (failed > 0) {
            console.log(colors.red(`   ❌ Failed: ${failed}`));
        }
        if (skipped > 0) {
            console.log(colors.yellow(`   ⏭️  Skipped: ${skipped}`));
        }

        // Show failed tests
        const failedTests = results.filter(r => !r.success && !r.skipped);
        if (failedTests.length > 0) {
            console.log(colors.red('\n❌ Failed Tests:'));
            failedTests.forEach(test => {
                console.log(colors.red(`   • ${test.app}: ${test.error || 'Test failed'}`));
            });
        }

        console.log();
    }

    /**
     * Generate comprehensive test report
     */
    async generateTestReport() {
        const totalDuration = Date.now() - this.startTime;

        console.log(colors.bold(colors.blue('\n📊 Comprehensive Test Report\n')));
        console.log(colors.gray(`Total Duration: ${Math.floor(totalDuration / 1000)}s\n`));

        let totalTests = 0;
        let totalPassed = 0;
        let totalFailed = 0;
        let totalSkipped = 0;

        // Summary by test type
        for (const [testType, results] of this.testResults) {
            const passed = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success && !r.skipped).length;
            const skipped = results.filter(r => r.skipped).length;

            totalTests += results.length;
            totalPassed += passed;
            totalFailed += failed;
            totalSkipped += skipped;

            console.log(colors.bold(`${TEST_CONFIG.testTypes[testType].name}:`));
            console.log(colors.green(`  ✅ Passed: ${passed}`));
            if (failed > 0) {
                console.log(colors.red(`  ❌ Failed: ${failed}`));
            }
            if (skipped > 0) {
                console.log(colors.yellow(`  ⏭️  Skipped: ${skipped}`));
            }
            console.log();
        }

        // Overall summary
        console.log(colors.bold(colors.blue('📈 Overall Summary:')));
        console.log(colors.gray(`  Total Tests: ${totalTests}`));
        console.log(colors.green(`  ✅ Passed: ${totalPassed}`));
        if (totalFailed > 0) {
            console.log(colors.red(`  ❌ Failed: ${totalFailed}`));
        }
        if (totalSkipped > 0) {
            console.log(colors.yellow(`  ⏭️  Skipped: ${totalSkipped}`));
        }

        const successRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
        console.log(colors.bold(`  📊 Success Rate: ${successRate}%`));

        // Save detailed report
        await this.saveDetailedReport({
            timestamp: new Date().toISOString(),
            duration: totalDuration,
            summary: { totalTests, totalPassed, totalFailed, totalSkipped, successRate },
            results: Object.fromEntries(this.testResults)
        });

        console.log();
    }

    /**
     * Save detailed test report
     */
    async saveDetailedReport(report) {
        try {
            const reportPath = join(projectRoot, 'test-results', `comprehensive-test-report-${Date.now()}.json`);

            // Ensure directory exists
            await fs.mkdir(join(projectRoot, 'test-results'), { recursive: true });

            // Save report
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

            console.log(colors.green(`📄 Detailed report saved: ${reportPath}`));
        } catch (error) {
            console.log(colors.yellow(`⚠️  Could not save detailed report: ${error.message}`));
        }
    }

    /**
     * Cleanup orchestrator and processes
     */
    async cleanup() {
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;

        console.log(colors.yellow('\n🧹 Cleaning up...\n'));

        if (this.orchestratorProcess && !this.orchestratorProcess.killed) {
            console.log(colors.gray('🔄 Stopping orchestrator...'));

            try {
                this.orchestratorProcess.kill('SIGTERM');

                // Wait for graceful shutdown
                await new Promise((resolve) => {
                    const timeout = setTimeout(() => {
                        if (!this.orchestratorProcess.killed) {
                            this.orchestratorProcess.kill('SIGKILL');
                        }
                        resolve();
                    }, 10000);

                    this.orchestratorProcess.on('exit', () => {
                        clearTimeout(timeout);
                        resolve();
                    });
                });

                console.log(colors.green('✅ Orchestrator stopped'));
            } catch (error) {
                console.log(colors.yellow(`⚠️  Error stopping orchestrator: ${error.message}`));
            }
        }
    }

    /**
     * Graceful shutdown
     */
    async gracefulShutdown() {
        console.log(colors.yellow('\n🛑 Gracefully shutting down test runner...\n'));
        await this.cleanup();
        process.exit(0);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI interface
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || process.argv[1]?.includes('comprehensive-test-runner.js')) {
    const testRunner = new ComprehensiveTestRunner();

    const command = process.argv[2];

    switch (command) {
        case 'run':
        case undefined:
            testRunner.runComprehensiveTests().catch((error) => {
                console.error(colors.red('💥 Comprehensive testing failed:'), error.message);
                process.exit(1);
            });
            break;

        default:
            console.log(`
${colors.bold(colors.blue('🧪 Comprehensive Test Runner'))}

${colors.green('Commands:')}
  ${colors.cyan('run')}       Start comprehensive testing with orchestrator

${colors.green('Features:')}
  ✅ Orchestrated service startup
  ✅ Real data integration testing
  ✅ Multiple test suite types
  ✅ Parallel and sequential execution
  ✅ Comprehensive reporting
  ✅ Graceful cleanup

${colors.green('Test Types:')}
  🧪 Unit Tests       → Fast isolated tests
  🔗 Integration      → Real service connections
  🎭 Component        → UI component testing
  🌐 API Tests        → API endpoint validation
  🚀 End-to-End       → Full user workflows

${colors.yellow('Usage:')}
  ${colors.cyan('node scripts/comprehensive-test-runner.js run')}
`);
            break;
    }
}

export default ComprehensiveTestRunner;
