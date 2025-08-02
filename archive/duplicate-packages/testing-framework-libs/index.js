/**
 * CODAI Testing Framework Integration - Phase 2.1 Implementation
 * Advanced testing capabilities with Playwright, Vitest, and Jest integration
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import EventEmitter from 'events';

const execAsync = promisify(exec);

class TestingFrameworkManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      projectRoot: options.projectRoot || process.cwd(),
      testFrameworks: options.testFrameworks || ['vitest', 'playwright', 'jest'],
      testTypes: options.testTypes || ['unit', 'integration', 'e2e', 'performance'],
      coverageThreshold: options.coverageThreshold || 80,
      parallelExecution: options.parallelExecution || true,
      autoWatch: options.autoWatch || false,
      ...options
    };

    this.frameworks = {
      vitest: {
        name: 'Vitest',
        type: 'unit',
        configFile: 'vitest.config.ts',
        command: 'vitest'
      },
      playwright: {
        name: 'Playwright',
        type: 'e2e',
        configFile: 'playwright.config.ts',
        command: 'playwright'
      },
      jest: {
        name: 'Jest',
        type: 'unit',
        configFile: 'jest.config.js',
        command: 'jest'
      }
    };

    this.testResults = {
      frameworks: {},
      coverage: {},
      performance: {},
      summary: {}
    };
  }

  /**
   * Initialize testing framework analysis
   */
  async initialize() {
    console.log('🧪 Initializing CODAI Testing Framework Manager...');

    try {
      await this.analyzeTestingEnvironment();
      await this.analyzeTestConfiguration();
      await this.analyzeTestSuites();
      await this.validateTestSetup();

      this.emit('initialized', this.frameworks);
      console.log('✅ Testing framework analysis complete');

      return this.frameworks;
    } catch (error) {
      console.error('❌ Testing framework initialization failed:', error.message);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Analyze testing environment
   */
  async analyzeTestingEnvironment() {
    console.log('🔍 Analyzing testing environment...');

    for (const [frameworkName, framework] of Object.entries(this.frameworks)) {
      try {
        // Check if framework is installed
        const availability = await this.checkFrameworkAvailability(frameworkName);
        framework.available = availability.available;
        framework.version = availability.version;
        framework.globalInstall = availability.global;

        // Check configuration file
        const configPath = path.join(this.config.projectRoot, framework.configFile);
        const configExists = await this.fileExists(configPath);
        framework.configured = configExists;

        if (configExists) {
          framework.configPath = configPath;
          framework.configuration = await this.loadConfiguration(configPath);
        }

        console.log(`${availability.available ? '✅' : '❌'} ${framework.name}: ${availability.available ? availability.version : 'Not available'}`);
      } catch (error) {
        framework.available = false;
        framework.error = error.message;
        console.log(`❌ ${framework.name}: Error - ${error.message}`);
      }
    }
  }

  /**
   * Check if testing framework is available
   */
  async checkFrameworkAvailability(frameworkName) {
    try {
      // Check local installation first
      const localCheck = await execAsync(`npx ${frameworkName} --version`);
      return {
        available: true,
        version: localCheck.stdout.trim(),
        global: false
      };
    } catch (localError) {
      try {
        // Check global installation
        const globalCheck = await execAsync(`${frameworkName} --version`);
        return {
          available: true,
          version: globalCheck.stdout.trim(),
          global: true
        };
      } catch (globalError) {
        return {
          available: false,
          error: globalError.message
        };
      }
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filepath) {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load configuration file
   */
  async loadConfiguration(configPath) {
    try {
      const content = await fs.readFile(configPath, 'utf8');

      if (configPath.endsWith('.json')) {
        return JSON.parse(content);
      } else if (configPath.endsWith('.js') || configPath.endsWith('.ts')) {
        // For JS/TS config files, return basic info
        return {
          type: 'module_config',
          size: content.length,
          hasTests: content.includes('test'),
          hasCoverage: content.includes('coverage')
        };
      }

      return { raw: content.substring(0, 200) };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Analyze test configuration
   */
  async analyzeTestConfiguration() {
    console.log('🔍 Analyzing test configuration...');

    const testDirectories = ['tests', 'test', '__tests__', 'spec'];
    const testPatterns = ['*.test.js', '*.test.ts', '*.spec.js', '*.spec.ts'];

    const testConfig = {
      directories: {},
      patterns: {},
      coverage: {}
    };

    // Check test directories
    for (const dir of testDirectories) {
      const dirPath = path.join(this.config.projectRoot, dir);
      const exists = await this.fileExists(dirPath);

      if (exists) {
        try {
          const files = await fs.readdir(dirPath, { recursive: true });
          testConfig.directories[dir] = {
            exists: true,
            fileCount: files.length,
            testFiles: files.filter(file =>
              testPatterns.some(pattern =>
                file.includes(pattern.replace('*', ''))
              )
            ).length
          };
        } catch (error) {
          testConfig.directories[dir] = { exists: true, error: error.message };
        }
      } else {
        testConfig.directories[dir] = { exists: false };
      }
    }

    // Check for test files in source directories
    const sourceDirectories = ['src', 'lib', 'libs', 'apps', 'packages'];
    for (const dir of sourceDirectories) {
      const dirPath = path.join(this.config.projectRoot, dir);
      if (await this.fileExists(dirPath)) {
        try {
          const testFiles = await this.findTestFiles(dirPath);
          testConfig.patterns[dir] = {
            testFiles: testFiles.length,
            files: testFiles
          };
        } catch (error) {
          testConfig.patterns[dir] = { error: error.message };
        }
      }
    }

    this.testConfiguration = testConfig;

    const totalTestFiles = Object.values(testConfig.directories)
      .reduce((sum, dir) => sum + (dir.testFiles || 0), 0) +
      Object.values(testConfig.patterns)
        .reduce((sum, pattern) => sum + (pattern.testFiles || 0), 0);

    console.log(`✅ Test Configuration: ${totalTestFiles} test files found`);
  }

  /**
   * Find test files recursively
   */
  async findTestFiles(directory) {
    const testFiles = [];
    const testPatterns = ['.test.', '.spec.'];

    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.findTestFiles(fullPath);
          testFiles.push(...subFiles);
        } else if (entry.isFile()) {
          if (testPatterns.some(pattern => entry.name.includes(pattern))) {
            testFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory not accessible
    }

    return testFiles;
  }

  /**
   * Analyze test suites
   */
  async analyzeTestSuites() {
    console.log('🔍 Analyzing test suites...');

    const testSuites = {
      unit: { files: [], frameworks: [] },
      integration: { files: [], frameworks: [] },
      e2e: { files: [], frameworks: [] },
      performance: { files: [], frameworks: [] }
    };

    // Analyze by framework
    for (const [frameworkName, framework] of Object.entries(this.frameworks)) {
      if (framework.available && framework.configured) {
        const suiteInfo = await this.analyzeFrameworkTestSuite(frameworkName, framework);
        testSuites[framework.type].frameworks.push({
          name: frameworkName,
          ...suiteInfo
        });
      }
    }

    this.testSuites = testSuites;
    console.log('✅ Test suites analyzed');
  }

  /**
   * Analyze framework-specific test suite
   */
  async analyzeFrameworkTestSuite(frameworkName, framework) {
    const suiteInfo = {
      configured: framework.configured,
      available: framework.available,
      testCount: 0,
      lastRun: null,
      coverage: null
    };

    // Check for recent test results
    const resultsPath = await this.findTestResults(frameworkName);
    if (resultsPath) {
      try {
        const results = await this.loadTestResults(resultsPath);
        suiteInfo.lastRun = results.timestamp;
        suiteInfo.testCount = results.testCount;
        suiteInfo.coverage = results.coverage;
      } catch (error) {
        suiteInfo.resultsError = error.message;
      }
    }

    return suiteInfo;
  }

  /**
   * Find test results files
   */
  async findTestResults(frameworkName) {
    const possiblePaths = [
      `test-results/${frameworkName}`,
      `coverage/${frameworkName}`,
      `reports/${frameworkName}`,
      `.${frameworkName}`
    ];

    for (const relativePath of possiblePaths) {
      const fullPath = path.join(this.config.projectRoot, relativePath);
      if (await this.fileExists(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  /**
   * Load test results
   */
  async loadTestResults(resultsPath) {
    try {
      const files = await fs.readdir(resultsPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      if (jsonFiles.length > 0) {
        const latestFile = jsonFiles.sort().pop();
        const content = await fs.readFile(path.join(resultsPath, latestFile), 'utf8');
        return JSON.parse(content);
      }

      return { testCount: files.length, timestamp: Date.now() };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Validate test setup
   */
  async validateTestSetup() {
    console.log('🔍 Validating test setup...');

    const validation = {
      frameworks: {},
      coverage: {},
      ci: {},
      recommendations: []
    };

    // Validate each framework
    for (const [frameworkName, framework] of Object.entries(this.frameworks)) {
      validation.frameworks[frameworkName] = {
        available: framework.available,
        configured: framework.configured,
        ready: framework.available && framework.configured,
        issues: []
      };

      if (!framework.available) {
        validation.frameworks[frameworkName].issues.push(
          `${framework.name} is not installed`
        );
      }

      if (!framework.configured) {
        validation.frameworks[frameworkName].issues.push(
          `${framework.configFile} configuration file missing`
        );
      }
    }

    // Check coverage setup
    validation.coverage = await this.validateCoverageSetup();

    // Check CI/CD integration
    validation.ci = await this.validateCIIntegration();

    // Generate recommendations
    validation.recommendations = this.generateTestingRecommendations(validation);

    this.testValidation = validation;
    console.log('✅ Test setup validation complete');
  }

  /**
   * Validate coverage setup
   */
  async validateCoverageSetup() {
    const coverage = {
      configured: false,
      tools: [],
      thresholds: {},
      reporting: []
    };

    // Check for coverage configuration
    const coverageFiles = [
      '.nycrc.json',
      'coverage/lcov-report/index.html',
      'coverage/coverage-final.json'
    ];

    for (const file of coverageFiles) {
      if (await this.fileExists(path.join(this.config.projectRoot, file))) {
        coverage.configured = true;
        coverage.tools.push(file);
      }
    }

    return coverage;
  }

  /**
   * Validate CI/CD integration
   */
  async validateCIIntegration() {
    const ci = {
      configured: false,
      platforms: [],
      workflows: []
    };

    // Check for CI configuration files
    const ciFiles = [
      '.github/workflows',
      '.gitlab-ci.yml',
      'azure-pipelines.yml',
      'Jenkinsfile'
    ];

    for (const file of ciFiles) {
      if (await this.fileExists(path.join(this.config.projectRoot, file))) {
        ci.configured = true;
        ci.platforms.push(file);
      }
    }

    return ci;
  }

  /**
   * Generate testing recommendations
   */
  generateTestingRecommendations(validation) {
    const recommendations = [];

    // Framework recommendations
    for (const [frameworkName, framework] of Object.entries(validation.frameworks)) {
      if (!framework.ready) {
        if (!framework.available) {
          recommendations.push({
            type: 'installation',
            priority: 'high',
            framework: frameworkName,
            title: `Install ${this.frameworks[frameworkName].name}`,
            action: `npm install -D ${frameworkName}`
          });
        }

        if (!framework.configured) {
          recommendations.push({
            type: 'configuration',
            priority: 'high',
            framework: frameworkName,
            title: `Configure ${this.frameworks[frameworkName].name}`,
            action: `Create ${this.frameworks[frameworkName].configFile} configuration file`
          });
        }
      }
    }

    // Coverage recommendations
    if (!validation.coverage.configured) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        title: 'Setup test coverage',
        action: 'Configure coverage reporting with nyc or c8'
      });
    }

    // CI/CD recommendations
    if (!validation.ci.configured) {
      recommendations.push({
        type: 'ci',
        priority: 'medium',
        title: 'Setup CI/CD testing',
        action: 'Configure automated testing in CI/CD pipeline'
      });
    }

    return recommendations;
  }

  /**
   * Run test suite
   */
  async runTests(options = {}) {
    console.log('🧪 Running test suite...');

    const testOptions = {
      framework: options.framework || 'all',
      type: options.type || 'all',
      coverage: options.coverage !== false,
      watch: options.watch || false,
      ...options
    };

    const results = {
      started: Date.now(),
      frameworks: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };

    // Run tests for each available framework
    for (const [frameworkName, framework] of Object.entries(this.frameworks)) {
      if (!framework.available || !framework.configured) {
        results.frameworks[frameworkName] = {
          skipped: true,
          reason: !framework.available ? 'not_installed' : 'not_configured'
        };
        continue;
      }

      if (testOptions.framework !== 'all' && testOptions.framework !== frameworkName) {
        results.frameworks[frameworkName] = { skipped: true, reason: 'not_selected' };
        continue;
      }

      try {
        console.log(`🏃 Running ${framework.name} tests...`);
        const frameworkResult = await this.runFrameworkTests(frameworkName, framework, testOptions);
        results.frameworks[frameworkName] = frameworkResult;

        // Update summary
        results.summary.total += frameworkResult.total || 0;
        results.summary.passed += frameworkResult.passed || 0;
        results.summary.failed += frameworkResult.failed || 0;
        results.summary.skipped += frameworkResult.skipped || 0;

        console.log(`${frameworkResult.success ? '✅' : '❌'} ${framework.name}: ${frameworkResult.total} tests`);
      } catch (error) {
        results.frameworks[frameworkName] = {
          success: false,
          error: error.message
        };
        console.log(`❌ ${framework.name}: Error - ${error.message}`);
      }
    }

    results.completed = Date.now();
    results.duration = results.completed - results.started;

    this.testResults = results;
    this.emit('tests_completed', results);

    return results;
  }

  /**
   * Run tests for specific framework
   */
  async runFrameworkTests(frameworkName, framework, options) {
    const command = this.buildTestCommand(frameworkName, framework, options);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.config.projectRoot,
        timeout: 300000 // 5 minutes
      });

      return this.parseTestOutput(frameworkName, stdout, stderr);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        total: 0,
        passed: 0,
        failed: 1
      };
    }
  }

  /**
   * Build test command for framework
   */
  buildTestCommand(frameworkName, framework, options) {
    let command = `npx ${framework.command}`;

    switch (frameworkName) {
      case 'vitest':
        command += ' run';
        if (options.coverage) command += ' --coverage';
        if (options.watch) command += ' --watch';
        break;

      case 'playwright':
        command += ' test';
        if (options.coverage) command += ' --reporter=html';
        break;

      case 'jest':
        if (options.coverage) command += ' --coverage';
        if (options.watch) command += ' --watch';
        break;
    }

    return command;
  }

  /**
   * Parse test output
   */
  parseTestOutput(frameworkName, stdout, stderr) {
    const result = {
      success: true,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      output: stdout,
      errors: stderr
    };

    // Parse framework-specific output
    switch (frameworkName) {
      case 'vitest':
        result.success = !stdout.includes('FAILED') && !stderr.includes('ERROR');
        break;

      case 'playwright':
        result.success = !stdout.includes('failed') && !stderr.includes('Error');
        break;

      case 'jest':
        result.success = !stdout.includes('FAIL') && !stderr.includes('Error');
        break;
    }

    // Extract test counts (simplified parsing)
    const testMatches = stdout.match(/(\d+)\s+passed/i);
    if (testMatches) {
      result.passed = parseInt(testMatches[1]);
      result.total = result.passed;
    }

    return result;
  }

  /**
   * Generate testing report
   */
  generateTestingReport() {
    const report = {
      timestamp: Date.now(),
      frameworks: this.frameworks,
      configuration: this.testConfiguration,
      suites: this.testSuites,
      validation: this.testValidation,
      results: this.testResults,
      summary: this.generateTestingSummary(),
      recommendations: this.testValidation?.recommendations || []
    };

    return report;
  }

  /**
   * Generate testing summary
   */
  generateTestingSummary() {
    const availableFrameworks = Object.values(this.frameworks)
      .filter(framework => framework.available).length;
    const configuredFrameworks = Object.values(this.frameworks)
      .filter(framework => framework.configured).length;
    const readyFrameworks = Object.values(this.frameworks)
      .filter(framework => framework.available && framework.configured).length;

    return {
      frameworks: {
        total: Object.keys(this.frameworks).length,
        available: availableFrameworks,
        configured: configuredFrameworks,
        ready: readyFrameworks
      },
      tests: {
        totalFiles: Object.values(this.testConfiguration?.directories || {})
          .reduce((sum, dir) => sum + (dir.testFiles || 0), 0),
        lastRun: this.testResults?.completed || null,
        coverage: this.testValidation?.coverage?.configured || false
      },
      healthScore: this.calculateTestingHealth()
    };
  }

  /**
   * Calculate testing health score
   */
  calculateTestingHealth() {
    let score = 0;
    let maxScore = 100;

    // Framework availability (40%)
    const availableFrameworks = Object.values(this.frameworks)
      .filter(framework => framework.available).length;
    const totalFrameworks = Object.keys(this.frameworks).length;
    score += (availableFrameworks / totalFrameworks) * 40;

    // Configuration (30%)
    const configuredFrameworks = Object.values(this.frameworks)
      .filter(framework => framework.configured).length;
    score += (configuredFrameworks / totalFrameworks) * 30;

    // Test files presence (20%)
    const hasTestFiles = Object.values(this.testConfiguration?.directories || {})
      .some(dir => (dir.testFiles || 0) > 0);
    if (hasTestFiles) score += 20;

    // Coverage and CI (10%)
    if (this.testValidation?.coverage?.configured) score += 5;
    if (this.testValidation?.ci?.configured) score += 5;

    return Math.round(score);
  }

  /**
   * Save testing report
   */
  async saveTestingReport(filename) {
    try {
      const report = this.generateTestingReport();
      const filepath = path.join(this.config.projectRoot, 'logs', filename);

      // Ensure logs directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });

      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
      console.log(`📊 Testing report saved: ${filepath}`);

      return filepath;
    } catch (error) {
      console.error('❌ Failed to save testing report:', error.message);
      throw error;
    }
  }
}

export default TestingFrameworkManager;
