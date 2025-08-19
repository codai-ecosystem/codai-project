/**
 * CODAI Test Suite Orchestrator
 * Advanced test suite execution and management
 * Phase 2.2: Testing Framework Integration
 */

import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';

export default class TestSuiteOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();

    this.projectRoot = options.projectRoot || process.cwd();
    this.frameworks = options.frameworks || ['vitest', 'playwright', 'jest'];
    this.suites = new Map();
    this.runners = new Map();
    this.results = new Map();
    this.concurrency = options.concurrency || 4;

    console.log('🎭 CODAI Test Suite Orchestrator initialized');
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Test Suite Orchestrator...');

      // Load test suite configurations
      await this.loadTestSuiteConfigurations();

      // Initialize test runners
      await this.initializeTestRunners();

      // Setup result aggregation
      await this.setupResultAggregation();

      console.log('✅ Test suite orchestrator ready');
      this.emit('orchestrator-ready');

      return this.generateOrchestratorStatus();

    } catch (error) {
      console.error('❌ Test orchestrator initialization failed:', error.message);
      this.emit('orchestrator-error', error);
      throw error;
    }
  }

  async loadTestSuiteConfigurations() {
    console.log('📋 Loading test suite configurations...');

    // Load test suite organization
    const testSuiteOrgPath = path.join(this.projectRoot, 'TEST_SUITE_ORGANIZATION.json');
    try {
      const orgContent = await fs.readFile(testSuiteOrgPath, 'utf-8');
      const organization = JSON.parse(orgContent);

      for (const [category, config] of Object.entries(organization.testSuites)) {
        this.suites.set(category, {
          category,
          files: config.files,
          count: config.count,
          framework: this.determineFrameworkForCategory(category),
          config: await this.loadCategoryConfig(category)
        });
      }

      console.log(`✅ Loaded ${this.suites.size} test suite categories`);
    } catch (error) {
      console.warn('⚠️  Test suite organization not found, using defaults');
      await this.createDefaultSuites();
    }
  }

  determineFrameworkForCategory(category) {
    const frameworkMap = {
      unit: 'vitest',
      integration: 'jest',
      e2e: 'playwright',
      performance: 'playwright',
      security: 'jest'
    };

    return frameworkMap[category] || 'vitest';
  }

  async loadCategoryConfig(category) {
    const configFiles = {
      unit: 'vitest.config.optimized.ts',
      integration: 'jest.config.optimized.js',
      e2e: 'playwright.config.optimized.ts',
      performance: 'playwright.config.optimized.ts',
      security: 'jest.config.optimized.js'
    };

    const configFile = configFiles[category];
    if (!configFile) return {};

    const configPath = path.join(this.projectRoot, configFile);
    try {
      const exists = await fs.access(configPath).then(() => true).catch(() => false);
      if (exists) {
        return { configFile, configPath };
      }
    } catch (error) {
      // Config not found, will use defaults
    }

    return {};
  }

  async createDefaultSuites() {
    const defaultSuites = [
      { category: 'unit', framework: 'vitest', files: [], count: 0 },
      { category: 'integration', framework: 'jest', files: [], count: 0 },
      { category: 'e2e', framework: 'playwright', files: [], count: 0 }
    ];

    for (const suite of defaultSuites) {
      this.suites.set(suite.category, suite);
    }
  }

  async initializeTestRunners() {
    console.log('🏃‍♂️ Initializing test runners...');

    for (const [category, suite] of this.suites) {
      const runner = await this.createTestRunner(suite);
      this.runners.set(category, runner);
      console.log(`✅ ${category}: ${suite.framework} runner ready`);
    }
  }

  async createTestRunner(suite) {
    const { category, framework, config } = suite;

    const baseRunner = {
      category,
      framework,
      config,
      status: 'ready',
      lastRun: null,
      results: null
    };

    switch (framework) {
      case 'vitest':
        return {
          ...baseRunner,
          command: 'npx',
          args: ['vitest', 'run'],
          configArg: config.configFile ? ['--config', config.configFile] : [],
          runCommand: this.runVitest.bind(this, category)
        };

      case 'playwright':
        return {
          ...baseRunner,
          command: 'npx',
          args: ['playwright', 'test'],
          configArg: config.configFile ? ['--config', config.configFile] : [],
          runCommand: this.runPlaywright.bind(this, category)
        };

      case 'jest':
        return {
          ...baseRunner,
          command: 'npx',
          args: ['jest'],
          configArg: config.configFile ? ['--config', config.configFile] : [],
          runCommand: this.runJest.bind(this, category)
        };

      default:
        throw new Error(`Unknown framework: ${framework}`);
    }
  }

  async runTestSuite(category, options = {}) {
    const runner = this.runners.get(category);
    if (!runner) {
      throw new Error(`Test runner not found for category: ${category}`);
    }

    console.log(`🧪 Running ${category} tests with ${runner.framework}...`);
    runner.status = 'running';

    try {
      const result = await runner.runCommand(options);
      runner.status = 'completed';
      runner.lastRun = new Date().toISOString();
      runner.results = result;

      this.results.set(category, result);
      this.emit('test-suite-completed', { category, result });

      return result;
    } catch (error) {
      runner.status = 'failed';
      runner.results = { error: error.message };
      this.emit('test-suite-failed', { category, error });
      throw error;
    }
  }

  async runVitest(category, options = {}) {
    const runner = this.runners.get(category);
    const suite = this.suites.get(category);

    const args = [
      ...runner.args,
      ...runner.configArg
    ];

    if (options.coverage) {
      args.push('--coverage');
    }

    if (options.reporter) {
      args.push('--reporter', options.reporter);
    }

    // Add specific test files if provided
    if (suite.files && suite.files.length > 0) {
      args.push(...suite.files);
    }

    return await this.executeTestCommand(runner.command, args, {
      cwd: this.projectRoot,
      timeout: options.timeout || 300000 // 5 minutes default
    });
  }

  async runPlaywright(category, options = {}) {
    const runner = this.runners.get(category);

    const args = [
      ...runner.args,
      ...runner.configArg
    ];

    if (options.headed) {
      args.push('--headed');
    }

    if (options.browser) {
      args.push('--project', options.browser);
    }

    if (options.grep) {
      args.push('--grep', options.grep);
    }

    return await this.executeTestCommand(runner.command, args, {
      cwd: this.projectRoot,
      timeout: options.timeout || 600000 // 10 minutes default
    });
  }

  async runJest(category, options = {}) {
    const runner = this.runners.get(category);
    const suite = this.suites.get(category);

    const args = [
      ...runner.args,
      ...runner.configArg
    ];

    if (options.coverage) {
      args.push('--coverage');
    }

    if (options.verbose) {
      args.push('--verbose');
    }

    if (options.testNamePattern) {
      args.push('--testNamePattern', options.testNamePattern);
    }

    return await this.executeTestCommand(runner.command, args, {
      cwd: this.projectRoot,
      timeout: options.timeout || 300000 // 5 minutes default
    });
  }

  async executeTestCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      const child = spawn(command, args, {
        cwd: options.cwd || this.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      // Set timeout
      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Test execution timed out after ${options.timeout}ms`));
      }, options.timeout || 300000);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;

        const result = {
          exitCode: code,
          duration,
          stdout,
          stderr,
          command: `${command} ${args.join(' ')}`,
          success: code === 0,
          timestamp: new Date().toISOString()
        };

        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`Test execution failed with code ${code}\nstderr: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async runAllSuites(options = {}) {
    console.log('🚀 Running all test suites...');

    const results = new Map();
    const startTime = Date.now();

    // Determine execution strategy
    const strategy = options.parallel ? 'parallel' : 'sequential';
    console.log(`📋 Execution strategy: ${strategy}`);

    try {
      if (strategy === 'parallel') {
        const promises = Array.from(this.suites.keys()).map(async (category) => {
          try {
            const result = await this.runTestSuite(category, options);
            return { category, result, success: true };
          } catch (error) {
            return { category, error, success: false };
          }
        });

        const outcomes = await Promise.allSettled(promises);

        for (const outcome of outcomes) {
          if (outcome.status === 'fulfilled') {
            results.set(outcome.value.category, outcome.value);
          } else {
            results.set('unknown', { error: outcome.reason, success: false });
          }
        }
      } else {
        // Sequential execution
        for (const category of this.suites.keys()) {
          try {
            const result = await this.runTestSuite(category, options);
            results.set(category, { category, result, success: true });
          } catch (error) {
            results.set(category, { category, error, success: false });

            if (options.failFast) {
              break;
            }
          }
        }
      }

      const totalDuration = Date.now() - startTime;

      // Generate comprehensive results
      const summary = this.generateTestSummary(results, totalDuration);

      this.emit('all-suites-completed', summary);
      return summary;

    } catch (error) {
      console.error('❌ Test suite execution failed:', error.message);
      this.emit('all-suites-failed', error);
      throw error;
    }
  }

  generateTestSummary(results, totalDuration) {
    const summary = {
      timestamp: new Date().toISOString(),
      totalDuration,
      suites: {
        total: results.size,
        passed: 0,
        failed: 0
      },
      results: {},
      overall: {
        success: true,
        coverage: null,
        performance: null
      }
    };

    for (const [category, outcome] of results) {
      if (outcome.success) {
        summary.suites.passed++;
        summary.results[category] = {
          status: 'passed',
          duration: outcome.result?.duration || 0,
          exitCode: outcome.result?.exitCode || 0
        };
      } else {
        summary.suites.failed++;
        summary.overall.success = false;
        summary.results[category] = {
          status: 'failed',
          error: outcome.error?.message || 'Unknown error',
          duration: outcome.result?.duration || 0
        };
      }
    }

    // Calculate success rate
    summary.overall.successRate = summary.suites.total > 0 ?
      (summary.suites.passed / summary.suites.total) * 100 : 0;

    return summary;
  }

  async setupResultAggregation() {
    console.log('📊 Setting up result aggregation...');

    // Create results directory
    const resultsDir = path.join(this.projectRoot, 'test-results');
    await fs.mkdir(resultsDir, { recursive: true });

    // Setup result listeners
    this.on('test-suite-completed', async (data) => {
      const resultFile = path.join(resultsDir, `${data.category}-result.json`);
      await fs.writeFile(resultFile, JSON.stringify(data.result, null, 2), 'utf-8');
    });

    this.on('all-suites-completed', async (summary) => {
      const summaryFile = path.join(resultsDir, 'test-summary.json');
      await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2), 'utf-8');

      // Generate HTML report
      await this.generateHTMLReport(summary, resultsDir);
    });

    console.log('✅ Result aggregation configured');
  }

  async generateHTMLReport(summary, resultsDir) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CODAI Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
        .success { border-left: 4px solid #4caf50; }
        .failed { border-left: 4px solid #f44336; }
        .suite { margin: 10px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .suite.passed { background: #e8f5e8; }
        .suite.failed { background: #ffeaea; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 CODAI Test Results</h1>
        <p>Generated: ${summary.timestamp}</p>
        <p>Total Duration: ${(summary.totalDuration / 1000).toFixed(2)}s</p>
    </div>
    
    <div class="summary">
        <div class="metric ${summary.overall.success ? 'success' : 'failed'}">
            <h3>Overall Status</h3>
            <p>${summary.overall.success ? '✅ PASSED' : '❌ FAILED'}</p>
        </div>
        <div class="metric">
            <h3>Success Rate</h3>
            <p>${summary.overall.successRate.toFixed(1)}%</p>
        </div>
        <div class="metric">
            <h3>Total Suites</h3>
            <p>${summary.suites.total}</p>
        </div>
        <div class="metric success">
            <h3>Passed</h3>
            <p>${summary.suites.passed}</p>
        </div>
        <div class="metric failed">
            <h3>Failed</h3>
            <p>${summary.suites.failed}</p>
        </div>
    </div>
    
    <h2>Test Suite Results</h2>
    ${Object.entries(summary.results).map(([category, result]) => `
        <div class="suite ${result.status}">
            <h3>${category.toUpperCase()} Tests</h3>
            <p>Status: ${result.status.toUpperCase()}</p>
            <p>Duration: ${(result.duration / 1000).toFixed(2)}s</p>
            ${result.error ? `<p>Error: ${result.error}</p>` : ''}
        </div>
    `).join('')}
    
    <footer style="margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <p>Generated by CODAI Test Suite Orchestrator - Phase 2.2</p>
    </footer>
</body>
</html>`;

    const htmlFile = path.join(resultsDir, 'test-report.html');
    await fs.writeFile(htmlFile, htmlContent, 'utf-8');

    console.log(`✅ HTML report generated: ${htmlFile}`);
  }

  generateOrchestratorStatus() {
    return {
      initialized: true,
      suites: {
        total: this.suites.size,
        categories: Array.from(this.suites.keys()),
        runners: this.runners.size
      },
      frameworks: Array.from(new Set(Array.from(this.suites.values()).map(s => s.framework))),
      capabilities: {
        parallel: true,
        sequential: true,
        coverage: true,
        reporting: true
      }
    };
  }

  async getHealthScore() {
    let score = 0;
    let maxScore = 100;

    // Test suite availability (30 points)
    score += Math.min(30, this.suites.size * 6);

    // Runner initialization (30 points)
    score += (this.runners.size / this.suites.size) * 30;

    // Framework coverage (20 points)
    const uniqueFrameworks = new Set(Array.from(this.suites.values()).map(s => s.framework));
    score += Math.min(20, uniqueFrameworks.size * 7);

    // Configuration files (20 points)
    const configuredSuites = Array.from(this.suites.values()).filter(s => s.config.configFile);
    score += (configuredSuites.length / this.suites.size) * 20;

    return Math.round(score);
  }
}
