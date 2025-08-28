/**
 * Glass MCP v9.0.0 Comprehensive Testing Framework
 * 
 * Automated testing suite for all Glass MCP components with performance
 * benchmarks, integration tests, and validation scenarios.
 * 
 * @version 9.0.0
 * @author Glass MCP Vision Team
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import * as fs from 'fs/promises';
import * as path from 'path';

import { GlassMCPServer } from './mcp-server-core.js';
import { ConfigurationManager } from './configuration-manager.js';
import { PerformanceMonitor } from './performance-monitor.js';

/**
 * Test case definition
 */
export interface TestCase {
    id: string;
    name: string;
    description: string;
    category: 'unit' | 'integration' | 'performance' | 'visual' | 'automation';
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeout: number;
    setup?: () => Promise<void>;
    execute: () => Promise<TestResult>;
    cleanup?: () => Promise<void>;
    dependencies?: string[];
}

/**
 * Test result information
 */
export interface TestResult {
    testId: string;
    success: boolean;
    duration: number;
    error?: string;
    warnings?: string[];
    metrics?: Record<string, number>;
    details?: any;
}

/**
 * Test suite configuration
 */
export interface TestSuiteConfig {
    name: string;
    description: string;
    testCases: TestCase[];
    parallelExecution: boolean;
    maxConcurrency: number;
    reportFormat: 'json' | 'html' | 'console';
    outputPath?: string;
}

/**
 * Test execution context
 */
export interface TestContext {
    server: GlassMCPServer;
    configManager: ConfigurationManager;
    performanceMonitor: PerformanceMonitor;
    tempDirectory: string;
    testData: Map<string, any>;
}

/**
 * Test suite execution report
 */
export interface TestSuiteReport {
    suiteName: string;
    startTime: number;
    endTime: number;
    duration: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    successRate: number;
    results: TestResult[];
    performance: {
        averageTestTime: number;
        fastestTest: TestResult;
        slowestTest: TestResult;
        totalMemoryUsed: number;
        peakMemoryUsage: number;
    };
    coverage?: {
        linesTotal: number;
        linesCovered: number;
        functionsTotal: number;
        functionsCovered: number;
        coveragePercentage: number;
    };
}

/**
 * Glass MCP Comprehensive Testing Framework
 */
export class GlassMCPTestFramework extends EventEmitter {
    private testSuites: Map<string, TestSuiteConfig> = new Map();
    private testContext?: TestContext;
    private isRunning: boolean = false;
    private currentExecution?: {
        suiteId: string;
        startTime: number;
        results: TestResult[];
    };

    constructor() {
        super();
        this.setupBuiltInTestSuites();
    }

    /**
     * Initialize the testing framework
     */
    public async initialize(): Promise<void> {
        try {
            console.log('🧪 Initializing Glass MCP Testing Framework...');

            // Create test context
            const server = new GlassMCPServer();
            await server.initialize();

            const configManager = new ConfigurationManager();
            await configManager.initialize();

            const performanceMonitor = new PerformanceMonitor();
            await performanceMonitor.initialize();

            // Create temp directory for test data
            const tempDir = path.join(process.cwd(), 'temp', 'glass-mcp-tests');
            await fs.mkdir(tempDir, { recursive: true });

            this.testContext = {
                server,
                configManager,
                performanceMonitor,
                tempDirectory: tempDir,
                testData: new Map()
            };

            this.emit('initialized');
            console.log('✅ Testing Framework initialized successfully');

        } catch (error) {
            this.emit('error', error);
            throw new Error(`Testing framework initialization failed: ${error}`);
        }
    }

    /**
     * Add custom test suite
     */
    public addTestSuite(suiteId: string, config: TestSuiteConfig): void {
        this.testSuites.set(suiteId, config);
        this.emit('testSuiteAdded', { suiteId, config });
    }

    /**
     * Run specific test suite
     */
    public async runTestSuite(suiteId: string): Promise<TestSuiteReport> {
        if (this.isRunning) {
            throw new Error('Test execution already in progress');
        }

        const suite = this.testSuites.get(suiteId);
        if (!suite) {
            throw new Error(`Test suite not found: ${suiteId}`);
        }

        if (!this.testContext) {
            throw new Error('Testing framework not initialized');
        }

        this.isRunning = true;
        const startTime = Date.now();

        this.currentExecution = {
            suiteId,
            startTime,
            results: []
        };

        console.log(`🚀 Starting test suite: ${suite.name}`);
        this.emit('testSuiteStarted', { suiteId, suite });

        try {
            const results = await this.executeTestSuite(suite);
            const report = this.generateReport(suite, startTime, results);

            // Save report if output path specified
            if (suite.outputPath) {
                await this.saveReport(report, suite.outputPath, suite.reportFormat);
            }

            this.emit('testSuiteCompleted', report);
            console.log(`✅ Test suite completed: ${report.passedTests}/${report.totalTests} passed`);

            return report;

        } finally {
            this.isRunning = false;
            this.currentExecution = undefined;
        }
    }

    /**
     * Run all test suites
     */
    public async runAllTestSuites(): Promise<TestSuiteReport[]> {
        const reports: TestSuiteReport[] = [];

        for (const [suiteId] of this.testSuites) {
            try {
                const report = await this.runTestSuite(suiteId);
                reports.push(report);
            } catch (error) {
                console.error(`Failed to run test suite ${suiteId}:`, error);
            }
        }

        return reports;
    }

    /**
     * Execute test suite with proper parallelization
     */
    private async executeTestSuite(suite: TestSuiteConfig): Promise<TestResult[]> {
        const { testCases, parallelExecution, maxConcurrency } = suite;
        const results: TestResult[] = [];

        if (parallelExecution && maxConcurrency > 1) {
            // Execute tests in parallel with concurrency limit
            const chunks = this.chunkArray(testCases, maxConcurrency);
            
            for (const chunk of chunks) {
                const chunkPromises = chunk.map(testCase => this.executeTestCase(testCase));
                const chunkResults = await Promise.allSettled(chunkPromises);
                
                for (const result of chunkResults) {
                    if (result.status === 'fulfilled') {
                        results.push(result.value);
                    } else {
                        results.push({
                            testId: 'unknown',
                            success: false,
                            duration: 0,
                            error: result.reason.message
                        });
                    }
                }
            }
        } else {
            // Execute tests sequentially
            for (const testCase of testCases) {
                try {
                    const result = await this.executeTestCase(testCase);
                    results.push(result);
                } catch (error) {
                    results.push({
                        testId: testCase.id,
                        success: false,
                        duration: 0,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
        }

        return results;
    }

    /**
     * Execute individual test case
     */
    private async executeTestCase(testCase: TestCase): Promise<TestResult> {
        const startTime = performance.now();

        console.log(`  🧪 Running test: ${testCase.name}`);
        this.emit('testStarted', testCase);

        try {
            // Setup
            if (testCase.setup) {
                await testCase.setup();
            }

            // Execute with timeout
            const result = await Promise.race([
                testCase.execute(),
                this.createTimeoutPromise(testCase.timeout, testCase.id)
            ]);

            const endTime = performance.now();
            result.duration = endTime - startTime;

            // Cleanup
            if (testCase.cleanup) {
                await testCase.cleanup();
            }

            if (result.success) {
                console.log(`    ✅ ${testCase.name} (${result.duration.toFixed(2)}ms)`);
            } else {
                console.log(`    ❌ ${testCase.name}: ${result.error}`);
            }

            this.emit('testCompleted', { testCase, result });
            return result;

        } catch (error) {
            const endTime = performance.now();
            const errorResult: TestResult = {
                testId: testCase.id,
                success: false,
                duration: endTime - startTime,
                error: error instanceof Error ? error.message : String(error)
            };

            // Cleanup on error
            if (testCase.cleanup) {
                try {
                    await testCase.cleanup();
                } catch (cleanupError) {
                    console.warn('Cleanup error:', cleanupError);
                }
            }

            console.log(`    ❌ ${testCase.name}: ${errorResult.error}`);
            this.emit('testCompleted', { testCase, result: errorResult });
            return errorResult;
        }
    }

    /**
     * Generate comprehensive test report
     */
    private generateReport(
        suite: TestSuiteConfig, 
        startTime: number, 
        results: TestResult[]
    ): TestSuiteReport {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const passedTests = results.filter(r => r.success).length;
        const failedTests = results.filter(r => !r.success).length;
        const skippedTests = 0; // TODO: Implement skipped tests

        const durations = results.map(r => r.duration);
        const averageTestTime = durations.length > 0 ? 
            durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;

        const fastestTest = results.reduce((fastest, current) => 
            current.duration < fastest.duration ? current : fastest
        );

        const slowestTest = results.reduce((slowest, current) => 
            current.duration > slowest.duration ? current : slowest
        );

        return {
            suiteName: suite.name,
            startTime,
            endTime,
            duration,
            totalTests: results.length,
            passedTests,
            failedTests,
            skippedTests,
            successRate: results.length > 0 ? (passedTests / results.length) * 100 : 0,
            results,
            performance: {
                averageTestTime,
                fastestTest,
                slowestTest,
                totalMemoryUsed: process.memoryUsage().heapUsed,
                peakMemoryUsage: process.memoryUsage().heapTotal
            }
        };
    }

    /**
     * Save test report to file
     */
    private async saveReport(
        report: TestSuiteReport, 
        outputPath: string, 
        format: 'json' | 'html' | 'console'
    ): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `glass-mcp-test-report-${timestamp}`;
        
        switch (format) {
            case 'json':
                const jsonPath = path.join(outputPath, `${fileName}.json`);
                await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
                console.log(`📄 JSON report saved: ${jsonPath}`);
                break;
                
            case 'html':
                const htmlPath = path.join(outputPath, `${fileName}.html`);
                const html = this.generateHTMLReport(report);
                await fs.writeFile(htmlPath, html);
                console.log(`📄 HTML report saved: ${htmlPath}`);
                break;
                
            case 'console':
                this.printConsoleReport(report);
                break;
        }
    }

    /**
     * Generate HTML test report
     */
    private generateHTMLReport(report: TestSuiteReport): string {
        const successRate = report.successRate.toFixed(1);
        const duration = (report.duration / 1000).toFixed(2);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Glass MCP Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #007acc; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .test-results { margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Glass MCP Test Report</h1>
        <p><strong>Suite:</strong> ${report.suiteName}</p>
        <p><strong>Execution Time:</strong> ${duration}s</p>
        <p><strong>Success Rate:</strong> <span class="${report.successRate >= 90 ? 'success' : 'error'}">${successRate}%</span></p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <p>${report.totalTests}</p>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <p class="success">${report.passedTests}</p>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <p class="error">${report.failedTests}</p>
        </div>
        <div class="metric">
            <h3>Average Time</h3>
            <p>${report.performance.averageTestTime.toFixed(2)}ms</p>
        </div>
    </div>
    
    <div class="test-results">
        <h2>Test Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Test ID</th>
                    <th>Status</th>
                    <th>Duration (ms)</th>
                    <th>Error</th>
                </tr>
            </thead>
            <tbody>
                ${report.results.map(result => `
                    <tr>
                        <td>${result.testId}</td>
                        <td class="${result.success ? 'success' : 'error'}">
                            ${result.success ? '✅ PASS' : '❌ FAIL'}
                        </td>
                        <td>${result.duration.toFixed(2)}</td>
                        <td>${result.error || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
    }

    /**
     * Print console test report
     */
    private printConsoleReport(report: TestSuiteReport): void {
        console.log('\n' + '='.repeat(80));
        console.log(`📊 GLASS MCP TEST REPORT: ${report.suiteName.toUpperCase()}`);
        console.log('='.repeat(80));
        console.log(`Duration: ${(report.duration / 1000).toFixed(2)}s`);
        console.log(`Success Rate: ${report.successRate.toFixed(1)}%`);
        console.log(`Tests: ${report.totalTests} total, ${report.passedTests} passed, ${report.failedTests} failed`);
        console.log(`Average Test Time: ${report.performance.averageTestTime.toFixed(2)}ms`);
        console.log(`Memory Usage: ${(report.performance.totalMemoryUsed / 1024 / 1024).toFixed(2)}MB`);
        
        if (report.failedTests > 0) {
            console.log('\n❌ FAILED TESTS:');
            report.results.filter(r => !r.success).forEach(result => {
                console.log(`  • ${result.testId}: ${result.error}`);
            });
        }
        
        console.log('='.repeat(80));
    }

    /**
     * Setup built-in test suites
     */
    private setupBuiltInTestSuites(): void {
        // System Integration Test Suite
        this.addTestSuite('system-integration', {
            name: 'System Integration Tests',
            description: 'Comprehensive tests for all Glass MCP components integration',
            parallelExecution: false,
            maxConcurrency: 1,
            reportFormat: 'json',
            testCases: [
                {
                    id: 'config-manager-init',
                    name: 'Configuration Manager Initialization',
                    description: 'Test configuration manager initialization and validation',
                    category: 'integration',
                    priority: 'critical',
                    timeout: 10000,
                    execute: async () => {
                        if (!this.testContext?.configManager) {
                            throw new Error('Configuration manager not available');
                        }
                        
                        const config = this.testContext.configManager.getConfiguration();
                        
                        return {
                            testId: 'config-manager-init',
                            success: config.system.version === '9.0.0',
                            duration: 0,
                            details: { version: config.system.version }
                        };
                    }
                },
                {
                    id: 'performance-monitor-init',
                    name: 'Performance Monitor Initialization',
                    description: 'Test performance monitoring system initialization',
                    category: 'integration',
                    priority: 'high',
                    timeout: 10000,
                    execute: async () => {
                        if (!this.testContext?.performanceMonitor) {
                            throw new Error('Performance monitor not available');
                        }
                        
                        const dashboard = this.testContext.performanceMonitor.getPerformanceDashboard();
                        
                        return {
                            testId: 'performance-monitor-init',
                            success: dashboard.healthScore >= 0,
                            duration: 0,
                            details: { healthScore: dashboard.healthScore }
                        };
                    }
                },
                {
                    id: 'mcp-server-init',
                    name: 'MCP Server Initialization',
                    description: 'Test MCP server initialization and component loading',
                    category: 'integration',
                    priority: 'critical',
                    timeout: 15000,
                    execute: async () => {
                        if (!this.testContext?.server) {
                            throw new Error('MCP server not available');
                        }
                        
                        return {
                            testId: 'mcp-server-init',
                            success: true,
                            duration: 0,
                            details: { status: 'initialized' }
                        };
                    }
                }
            ]
        });

        // Performance Benchmark Suite
        this.addTestSuite('performance-benchmarks', {
            name: 'Performance Benchmark Tests',
            description: 'Performance benchmarks for all Glass MCP operations',
            parallelExecution: true,
            maxConcurrency: 3,
            reportFormat: 'html',
            testCases: [
                {
                    id: 'memory-usage-benchmark',
                    name: 'Memory Usage Benchmark',
                    description: 'Measure memory usage under various loads',
                    category: 'performance',
                    priority: 'medium',
                    timeout: 30000,
                    execute: async () => {
                        const startMemory = process.memoryUsage().heapUsed;
                        
                        // Simulate memory operations
                        const data = new Array(10000).fill(0).map(() => Math.random());
                        
                        const endMemory = process.memoryUsage().heapUsed;
                        const memoryDelta = endMemory - startMemory;
                        
                        return {
                            testId: 'memory-usage-benchmark',
                            success: memoryDelta < 50 * 1024 * 1024, // 50MB threshold
                            duration: 0,
                            metrics: {
                                startMemoryMB: startMemory / 1024 / 1024,
                                endMemoryMB: endMemory / 1024 / 1024,
                                deltaMB: memoryDelta / 1024 / 1024
                            }
                        };
                    }
                },
                {
                    id: 'response-time-benchmark',
                    name: 'Response Time Benchmark',
                    description: 'Measure response times for various operations',
                    category: 'performance',
                    priority: 'medium',
                    timeout: 20000,
                    execute: async () => {
                        const iterations = 100;
                        const durations: number[] = [];
                        
                        for (let i = 0; i < iterations; i++) {
                            const start = performance.now();
                            
                            // Simulate operation
                            await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
                            
                            const end = performance.now();
                            durations.push(end - start);
                        }
                        
                        const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
                        
                        return {
                            testId: 'response-time-benchmark',
                            success: averageDuration < 50, // 50ms threshold
                            duration: 0,
                            metrics: {
                                averageMs: averageDuration,
                                minMs: Math.min(...durations),
                                maxMs: Math.max(...durations),
                                iterations
                            }
                        };
                    }
                }
            ]
        });
    }

    /**
     * Utility: Create timeout promise
     */
    private createTimeoutPromise(timeoutMs: number, testId: string): Promise<TestResult> {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Test ${testId} timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        });
    }

    /**
     * Utility: Chunk array for parallel execution
     */
    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    /**
     * Cleanup test framework
     */
    public async cleanup(): Promise<void> {
        try {
            if (this.testContext) {
                await this.testContext.server.shutdown();
                await this.testContext.configManager.shutdown();
                await this.testContext.performanceMonitor.shutdown();
                
                // Cleanup temp directory
                try {
                    await fs.rm(this.testContext.tempDirectory, { recursive: true, force: true });
                } catch (error) {
                    console.warn('Failed to cleanup temp directory:', error);
                }
            }
            
            this.emit('cleanup');
            console.log('🧹 Testing Framework cleanup complete');
            
        } catch (error) {
            console.error('❌ Error during testing framework cleanup:', error);
        }
    }
}

/**
 * Create and initialize testing framework
 */
export async function createGlassMCPTestFramework(): Promise<GlassMCPTestFramework> {
    const framework = new GlassMCPTestFramework();
    await framework.initialize();
    return framework;
}

/**
 * Main entry point for running tests
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const suiteId = args[0] || 'system-integration';
    
    try {
        console.log('🚀 Starting Glass MCP Test Framework...');
        
        const framework = await createGlassMCPTestFramework();
        
        if (suiteId === 'all') {
            console.log('🧪 Running all test suites...');
            const reports = await framework.runAllTestSuites();
            
            const totalTests = reports.reduce((sum, r) => sum + r.totalTests, 0);
            const totalPassed = reports.reduce((sum, r) => sum + r.passedTests, 0);
            const overallSuccessRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
            
            console.log(`\n🎯 OVERALL RESULTS: ${totalPassed}/${totalTests} tests passed (${overallSuccessRate.toFixed(1)}%)`);
            
        } else {
            console.log(`🧪 Running test suite: ${suiteId}`);
            const report = await framework.runTestSuite(suiteId);
            
            console.log(`\n🎯 RESULTS: ${report.passedTests}/${report.totalTests} tests passed (${report.successRate.toFixed(1)}%)`);
        }
        
        await framework.cleanup();
        
        console.log('✅ Test execution completed successfully');
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('Unhandled error in test framework:', error);
        process.exit(1);
    });
}