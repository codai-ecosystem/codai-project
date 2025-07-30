/**
 * CODAI Quality Gates Engine
 * Advanced automated quality gates and continuous integration
 * Phase 2.3: Code Quality Tools
 */

import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';

export default class QualityGatesEngine extends EventEmitter {
  constructor(options = {}) {
    super();

    this.projectRoot = options.projectRoot || process.cwd();
    this.gates = new Map();
    this.checks = new Map();
    this.results = new Map();
    this.thresholds = new Map();
    this.hooks = new Map();

    console.log('🚧 CODAI Quality Gates Engine initialized');
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Quality Gates Engine...');

      // Load quality gates configuration
      await this.loadQualityGatesConfiguration();

      // Setup automated checks
      await this.setupAutomatedChecks();

      // Configure Git hooks
      await this.configureGitHooks();

      // Setup CI/CD integration
      await this.setupCICDIntegration();

      // Initialize monitoring
      await this.initializeMonitoring();

      console.log('✅ Quality gates engine ready');
      this.emit('gates-engine-ready', {
        gates: this.gates.size,
        checks: this.checks.size,
        hooks: this.hooks.size
      });

      return this.generateEngineStatus();

    } catch (error) {
      console.error('❌ Quality gates engine initialization failed:', error.message);
      this.emit('gates-engine-error', error);
      throw error;
    }
  }

  async loadQualityGatesConfiguration() {
    console.log('📋 Loading quality gates configuration...');

    // Load quality gates config if exists
    const configPath = path.join(this.projectRoot, 'quality-gates.config.json');
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);

      // Load gates
      for (const [gateName, gateConfig] of Object.entries(config.gates)) {
        this.gates.set(gateName, {
          name: gateName,
          enabled: gateConfig.enabled,
          checks: gateConfig.checks,
          config: gateConfig
        });
      }

      // Load thresholds
      if (config.thresholds) {
        for (const [key, value] of Object.entries(config.thresholds)) {
          this.thresholds.set(key, value);
        }
      }

      console.log(`✅ Loaded ${this.gates.size} quality gates`);
    } catch (error) {
      console.log('⚠️  Quality gates config not found, creating defaults');
      await this.createDefaultGates();
    }
  }

  async createDefaultGates() {
    const defaultGates = {
      'pre-commit': {
        enabled: true,
        checks: [
          { tool: 'prettier', action: 'check', failOnError: true },
          { tool: 'eslint', action: 'lint', failOnError: true },
          { tool: 'typescript', action: 'check', failOnError: true }
        ]
      },
      'pre-push': {
        enabled: true,
        checks: [
          { tool: 'eslint', action: 'lint', failOnError: true },
          { tool: 'typescript', action: 'build', failOnError: true },
          { tool: 'tests', action: 'unit', failOnError: true }
        ]
      },
      'ci-build': {
        enabled: true,
        checks: [
          { tool: 'eslint', action: 'lint', failOnError: true },
          { tool: 'typescript', action: 'build', failOnError: true },
          { tool: 'tests', action: 'all', failOnError: true },
          { tool: 'coverage', action: 'check', threshold: 80, failOnError: true }
        ]
      }
    };

    for (const [gateName, gateConfig] of Object.entries(defaultGates)) {
      this.gates.set(gateName, {
        name: gateName,
        enabled: gateConfig.enabled,
        checks: gateConfig.checks,
        config: gateConfig
      });
    }

    // Default thresholds
    this.thresholds.set('coverage', 80);
    this.thresholds.set('complexity', 10);
    this.thresholds.set('duplicates', 3);
    this.thresholds.set('maintainability', 70);
  }

  async setupAutomatedChecks() {
    console.log('⚙️  Setting up automated checks...');

    const checkDefinitions = {
      'eslint-lint': {
        command: 'npx',
        args: ['eslint', '.', '--ext', '.js,.ts,.tsx'],
        timeout: 60000,
        successCodes: [0]
      },
      'eslint-fix': {
        command: 'npx',
        args: ['eslint', '.', '--ext', '.js,.ts,.tsx', '--fix'],
        timeout: 120000,
        successCodes: [0]
      },
      'prettier-check': {
        command: 'npx',
        args: ['prettier', '--check', '.'],
        timeout: 30000,
        successCodes: [0]
      },
      'prettier-write': {
        command: 'npx',
        args: ['prettier', '--write', '.'],
        timeout: 60000,
        successCodes: [0]
      },
      'typescript-check': {
        command: 'npx',
        args: ['tsc', '--noEmit'],
        timeout: 120000,
        successCodes: [0]
      },
      'typescript-build': {
        command: 'npx',
        args: ['tsc'],
        timeout: 180000,
        successCodes: [0]
      },
      'tests-unit': {
        command: 'npm',
        args: ['run', 'test:unit'],
        timeout: 300000,
        successCodes: [0]
      },
      'tests-all': {
        command: 'npm',
        args: ['run', 'test:all'],
        timeout: 600000,
        successCodes: [0]
      },
      'coverage-check': {
        command: 'npm',
        args: ['run', 'test:coverage'],
        timeout: 300000,
        successCodes: [0],
        thresholdCheck: 'coverage'
      }
    };

    for (const [checkName, checkConfig] of Object.entries(checkDefinitions)) {
      this.checks.set(checkName, checkConfig);
    }

    console.log(`✅ Configured ${this.checks.size} automated checks`);
  }

  async runQualityGate(gateName, options = {}) {
    const gate = this.gates.get(gateName);
    if (!gate) {
      throw new Error(`Quality gate not found: ${gateName}`);
    }

    if (!gate.enabled) {
      console.log(`⏭️  Quality gate '${gateName}' is disabled, skipping`);
      return { passed: true, skipped: true, gate: gateName };
    }

    console.log(`🔍 Running quality gate: ${gateName}`);

    const gateResult = {
      gate: gateName,
      timestamp: new Date().toISOString(),
      passed: true,
      checks: [],
      duration: 0,
      summary: {}
    };

    const startTime = Date.now();

    try {
      for (const check of gate.checks) {
        const checkResult = await this.runCheck(check, options);
        gateResult.checks.push(checkResult);

        if (checkResult.failed && check.failOnError) {
          gateResult.passed = false;
          if (options.failFast) {
            break;
          }
        }
      }

      gateResult.duration = Date.now() - startTime;
      gateResult.summary = this.generateGateSummary(gateResult);

      this.results.set(gateName, gateResult);

      if (gateResult.passed) {
        console.log(`✅ Quality gate '${gateName}' passed`);
        this.emit('gate-passed', gateResult);
      } else {
        console.log(`❌ Quality gate '${gateName}' failed`);
        this.emit('gate-failed', gateResult);
      }

      return gateResult;

    } catch (error) {
      gateResult.passed = false;
      gateResult.error = error.message;
      gateResult.duration = Date.now() - startTime;

      console.error(`💥 Quality gate '${gateName}' error:`, error.message);
      this.emit('gate-error', gateResult);

      throw error;
    }
  }

  async runCheck(check, options = {}) {
    const checkKey = `${check.tool}-${check.action}`;
    const checkConfig = this.checks.get(checkKey);

    if (!checkConfig) {
      return {
        check: checkKey,
        passed: false,
        failed: true,
        error: `Check configuration not found: ${checkKey}`
      };
    }

    console.log(`   🔧 Running check: ${checkKey}`);

    const checkStartTime = Date.now();

    try {
      const result = await this.executeCheck(checkConfig, options);

      const checkResult = {
        check: checkKey,
        tool: check.tool,
        action: check.action,
        passed: result.exitCode === 0,
        failed: result.exitCode !== 0,
        exitCode: result.exitCode,
        duration: Date.now() - checkStartTime,
        output: result.stdout,
        error: result.stderr,
        command: result.command
      };

      // Apply threshold checks if configured
      if (check.threshold && checkConfig.thresholdCheck) {
        const thresholdPassed = await this.checkThreshold(
          checkConfig.thresholdCheck,
          check.threshold,
          result
        );
        checkResult.thresholdPassed = thresholdPassed;
        if (!thresholdPassed) {
          checkResult.passed = false;
          checkResult.failed = true;
        }
      }

      return checkResult;

    } catch (error) {
      return {
        check: checkKey,
        tool: check.tool,
        action: check.action,
        passed: false,
        failed: true,
        duration: Date.now() - checkStartTime,
        error: error.message
      };
    }
  }

  async executeCheck(checkConfig, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      const child = spawn(checkConfig.command, checkConfig.args, {
        cwd: this.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        timeout: checkConfig.timeout || 60000
      });

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        resolve({
          exitCode: code,
          duration,
          stdout,
          stderr,
          command: `${checkConfig.command} ${checkConfig.args.join(' ')}`
        });
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Handle timeout
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Check timed out after ${checkConfig.timeout}ms`));
      }, checkConfig.timeout || 60000);
    });
  }

  async checkThreshold(thresholdType, expectedValue, result) {
    switch (thresholdType) {
      case 'coverage':
        return this.checkCoverageThreshold(expectedValue, result);
      case 'complexity':
        return this.checkComplexityThreshold(expectedValue, result);
      default:
        return true;
    }
  }

  checkCoverageThreshold(expectedCoverage, result) {
    // Simple coverage extraction - in real implementation, parse coverage reports
    const coverageMatch = result.stdout.match(/(\d+(?:\.\d+)?)%/);
    if (coverageMatch) {
      const actualCoverage = parseFloat(coverageMatch[1]);
      return actualCoverage >= expectedCoverage;
    }
    return false;
  }

  checkComplexityThreshold(expectedComplexity, result) {
    // Simple complexity check - in real implementation, parse complexity reports
    return !result.stdout.includes('complexity too high');
  }

  generateGateSummary(gateResult) {
    const summary = {
      totalChecks: gateResult.checks.length,
      passedChecks: gateResult.checks.filter(c => c.passed).length,
      failedChecks: gateResult.checks.filter(c => c.failed).length,
      avgDuration: gateResult.checks.length > 0 ?
        Math.round(gateResult.checks.reduce((sum, c) => sum + c.duration, 0) / gateResult.checks.length) : 0
    };

    summary.successRate = summary.totalChecks > 0 ?
      Math.round((summary.passedChecks / summary.totalChecks) * 100) : 0;

    return summary;
  }

  async configureGitHooks() {
    console.log('🪝 Configuring Git hooks...');

    const hooksDir = path.join(this.projectRoot, '.git', 'hooks');

    // Check if .git directory exists
    try {
      await fs.access(path.join(this.projectRoot, '.git'));
    } catch (error) {
      console.log('⚠️  .git directory not found, skipping Git hooks setup');
      return;
    }

    // Create hooks directory if it doesn't exist
    await fs.mkdir(hooksDir, { recursive: true });

    // Pre-commit hook
    const preCommitHook = `#!/bin/sh
# CODAI Quality Gates - Pre-commit Hook
# Generated automatically by CODAI Quality Gates Engine

echo "🔍 Running pre-commit quality checks..."

# Run quality gate
node -e "
const QualityGatesEngine = require('./libs/quality-gates/index.js').default;
const engine = new QualityGatesEngine();
engine.initialize().then(() => {
  return engine.runQualityGate('pre-commit', { failFast: true });
}).then(result => {
  if (!result.passed) {
    console.error('❌ Pre-commit quality gate failed');
    process.exit(1);
  }
  console.log('✅ Pre-commit quality gate passed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Pre-commit quality gate error:', error.message);
  process.exit(1);
});
"
`;

    const preCommitPath = path.join(hooksDir, 'pre-commit');
    await fs.writeFile(preCommitPath, preCommitHook, { mode: 0o755 });

    // Pre-push hook
    const prePushHook = `#!/bin/sh
# CODAI Quality Gates - Pre-push Hook
# Generated automatically by CODAI Quality Gates Engine

echo "🚀 Running pre-push quality checks..."

# Run quality gate
node -e "
const QualityGatesEngine = require('./libs/quality-gates/index.js').default;
const engine = new QualityGatesEngine();
engine.initialize().then(() => {
  return engine.runQualityGate('pre-push', { failFast: false });
}).then(result => {
  if (!result.passed) {
    console.error('❌ Pre-push quality gate failed');
    process.exit(1);
  }
  console.log('✅ Pre-push quality gate passed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Pre-push quality gate error:', error.message);
  process.exit(1);
});
"
`;

    const prePushPath = path.join(hooksDir, 'pre-push');
    await fs.writeFile(prePushPath, prePushHook, { mode: 0o755 });

    this.hooks.set('pre-commit', preCommitPath);
    this.hooks.set('pre-push', prePushPath);

    console.log('✅ Git hooks configured');
  }

  async setupCICDIntegration() {
    console.log('🚀 Setting up CI/CD integration...');

    const ciConfig = {
      github: {
        workflow: {
          name: 'CODAI Quality Gates',
          on: ['push', 'pull_request'],
          jobs: {
            'quality-gates': {
              'runs-on': 'ubuntu-latest',
              steps: [
                { uses: 'actions/checkout@v4' },
                { uses: 'actions/setup-node@v4', with: { 'node-version': '18' } },
                { run: 'npm ci' },
                { run: 'npm run quality:check', name: 'Run Quality Gates' },
                { run: 'npm run test:coverage', name: 'Check Coverage' }
              ]
            }
          }
        }
      },
      scripts: {
        'quality:pre-commit': 'node -e "const QualityGatesEngine = require(\'./libs/quality-gates\').default; const engine = new QualityGatesEngine(); engine.initialize().then(() => engine.runQualityGate(\'pre-commit\'));"',
        'quality:pre-push': 'node -e "const QualityGatesEngine = require(\'./libs/quality-gates\').default; const engine = new QualityGatesEngine(); engine.initialize().then(() => engine.runQualityGate(\'pre-push\'));"',
        'quality:ci': 'node -e "const QualityGatesEngine = require(\'./libs/quality-gates\').default; const engine = new QualityGatesEngine(); engine.initialize().then(() => engine.runQualityGate(\'ci-build\'));"'
      }
    };

    // Create GitHub workflow
    const workflowDir = path.join(this.projectRoot, '.github', 'workflows');
    await fs.mkdir(workflowDir, { recursive: true });

    const workflowPath = path.join(workflowDir, 'quality-gates.yml');
    const workflowContent = `name: ${ciConfig.github.workflow.name}

on: ${JSON.stringify(ciConfig.github.workflow.on)}

jobs:
${Object.entries(ciConfig.github.workflow.jobs).map(([jobName, job]) => `  ${jobName}:
    runs-on: ${job['runs-on']}
    steps:
${job.steps.map(step => `      - ${Object.entries(step).map(([key, value]) =>
      typeof value === 'object' ? `${key}:\n${Object.entries(value).map(([k, v]) => `          ${k}: ${v}`).join('\n')}` : `${key}: ${value}`
    ).join('\n        ')}`).join('\n')}`).join('\n')}
`;

    await fs.writeFile(workflowPath, workflowContent, 'utf-8');

    // Create CI scripts
    const scriptsPath = path.join(this.projectRoot, 'ci-quality-scripts.json');
    await fs.writeFile(scriptsPath, JSON.stringify(ciConfig.scripts, null, 2), 'utf-8');

    console.log('✅ CI/CD integration configured');
  }

  async initializeMonitoring() {
    console.log('📊 Initializing quality monitoring...');

    // Setup result tracking
    this.on('gate-passed', (result) => {
      this.trackGateResult(result, 'passed');
    });

    this.on('gate-failed', (result) => {
      this.trackGateResult(result, 'failed');
    });

    this.on('gate-error', (result) => {
      this.trackGateResult(result, 'error');
    });

    console.log('✅ Quality monitoring initialized');
  }

  trackGateResult(result, status) {
    const tracking = {
      timestamp: result.timestamp,
      gate: result.gate,
      status,
      duration: result.duration,
      checks: result.checks?.length || 0,
      summary: result.summary
    };

    // In a real implementation, this would send to monitoring system
    console.log(`📈 Gate tracking: ${result.gate} - ${status} (${result.duration}ms)`);
  }

  generateEngineStatus() {
    return {
      initialized: true,
      gates: {
        total: this.gates.size,
        enabled: Array.from(this.gates.values()).filter(g => g.enabled).length,
        names: Array.from(this.gates.keys())
      },
      checks: {
        total: this.checks.size,
        types: Array.from(new Set(Array.from(this.checks.keys()).map(key => key.split('-')[0])))
      },
      hooks: {
        total: this.hooks.size,
        configured: Array.from(this.hooks.keys())
      },
      thresholds: {
        total: this.thresholds.size,
        configured: Array.from(this.thresholds.keys())
      },
      capabilities: {
        preCommit: true,
        prePush: true,
        cicd: true,
        monitoring: true,
        thresholds: true
      }
    };
  }

  async getHealthScore() {
    let score = 0;
    let maxScore = 100;

    // Gates configuration (25 points)
    const enabledGates = Array.from(this.gates.values()).filter(g => g.enabled).length;
    score += Math.min(25, enabledGates * 8);

    // Checks availability (25 points)
    score += Math.min(25, this.checks.size * 3);

    // Git hooks (20 points)
    score += Math.min(20, this.hooks.size * 10);

    // Thresholds configuration (15 points)
    score += Math.min(15, this.thresholds.size * 3);

    // CI/CD integration (15 points)
    const cicdFiles = [
      '.github/workflows/quality-gates.yml',
      'ci-quality-scripts.json'
    ];

    let cicdScore = 0;
    for (const file of cicdFiles) {
      try {
        await fs.access(path.join(this.projectRoot, file));
        cicdScore += 7.5;
      } catch (error) {
        // File doesn't exist
      }
    }
    score += cicdScore;

    return Math.round(score);
  }
}
