/**
 * CODAI Testing Framework Configuration Manager
 * Advanced testing framework optimization and configuration
 * Phase 2.2: Testing Framework Integration
 */

import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';

export default class TestingConfigurationManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.projectRoot = options.projectRoot || process.cwd();
    this.frameworks = options.frameworks || ['vitest', 'playwright', 'jest'];
    this.configurations = new Map();
    this.testSuites = new Map();
    this.coverageConfig = null;
    this.cicdConfig = null;
    this.performanceConfig = null;

    console.log('🧪 CODAI Testing Configuration Manager initialized');
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Testing Framework Configuration...');

      // Load existing configurations
      await this.loadExistingConfigurations();

      // Optimize framework configurations
      await this.optimizeFrameworkConfigurations();

      // Organize test suites
      await this.organizeTestSuites();

      // Configure coverage reporting
      await this.configureCoverageReporting();

      // Setup CI/CD integration
      await this.setupCICDIntegration();

      // Configure performance testing
      await this.configurePerformanceTesting();

      console.log('✅ Testing framework configuration complete');
      this.emit('configuration-complete', {
        frameworks: this.frameworks.length,
        testSuites: this.testSuites.size,
        coverage: !!this.coverageConfig,
        cicd: !!this.cicdConfig,
        performance: !!this.performanceConfig
      });

      return this.generateConfigurationSummary();

    } catch (error) {
      console.error('❌ Testing configuration initialization failed:', error.message);
      this.emit('configuration-error', error);
      throw error;
    }
  }

  async loadExistingConfigurations() {
    console.log('🔍 Loading existing testing configurations...');

    const configFiles = {
      vitest: ['vitest.config.ts', 'vitest.config.js', 'vite.config.ts'],
      playwright: ['playwright.config.ts', 'playwright.config.js'],
      jest: ['jest.config.js', 'jest.config.ts', 'jest.config.json']
    };

    for (const [framework, files] of Object.entries(configFiles)) {
      for (const configFile of files) {
        const configPath = path.join(this.projectRoot, configFile);
        try {
          const exists = await fs.access(configPath).then(() => true).catch(() => false);
          if (exists) {
            const content = await fs.readFile(configPath, 'utf-8');
            this.configurations.set(framework, {
              file: configFile,
              path: configPath,
              content: content,
              parsed: this.parseConfiguration(framework, content)
            });
            console.log(`✅ ${framework}: ${configFile} loaded`);
            break;
          }
        } catch (error) {
          // Continue to next config file
        }
      }

      if (!this.configurations.has(framework)) {
        console.log(`⚠️  ${framework}: No configuration found`);
      }
    }
  }

  parseConfiguration(framework, content) {
    try {
      switch (framework) {
        case 'vitest':
          return this.parseVitestConfig(content);
        case 'playwright':
          return this.parsePlaywrightConfig(content);
        case 'jest':
          return this.parseJestConfig(content);
        default:
          return {};
      }
    } catch (error) {
      console.warn(`⚠️  Failed to parse ${framework} config:`, error.message);
      return {};
    }
  }

  parseVitestConfig(content) {
    // Extract key Vitest configuration options
    const config = {};

    // Test patterns
    if (content.includes('test:')) {
      config.testPattern = this.extractConfigValue(content, 'include') || '**/*.{test,spec}.{js,ts}';
      config.environment = this.extractConfigValue(content, 'environment') || 'node';
      config.coverage = content.includes('coverage') ? 'enabled' : 'disabled';
    }

    return config;
  }

  parsePlaywrightConfig(content) {
    const config = {};

    // Extract Playwright configuration
    config.testDir = this.extractConfigValue(content, 'testDir') || 'tests';
    config.timeout = this.extractConfigValue(content, 'timeout') || 30000;
    config.retries = this.extractConfigValue(content, 'retries') || 0;
    config.workers = this.extractConfigValue(content, 'workers') || 1;

    return config;
  }

  parseJestConfig(content) {
    const config = {};

    // Extract Jest configuration
    config.testMatch = this.extractConfigValue(content, 'testMatch') || ['**/*.test.js'];
    config.collectCoverage = content.includes('collectCoverage');
    config.testEnvironment = this.extractConfigValue(content, 'testEnvironment') || 'node';

    return config;
  }

  extractConfigValue(content, key) {
    // Simple extraction - could be enhanced with proper AST parsing
    const regex = new RegExp(`${key}:\\s*['"](.*?)['"]`, 'i');
    const match = content.match(regex);
    return match ? match[1] : null;
  }

  async optimizeFrameworkConfigurations() {
    console.log('⚙️  Optimizing framework configurations...');

    // Optimize Vitest configuration
    await this.optimizeVitestConfig();

    // Optimize Playwright configuration
    await this.optimizePlaywrightConfig();

    // Optimize Jest configuration
    await this.optimizeJestConfig();

    console.log('✅ Framework configurations optimized');
  }

  async optimizeVitestConfig() {
    const existingConfig = this.configurations.get('vitest');

    const optimizedConfig = {
      test: {
        globals: true,
        environment: 'node',
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
        coverage: {
          reporter: ['text', 'json', 'html', 'lcov'],
          exclude: [
            'coverage/**',
            'dist/**',
            'packages/*/test/**',
            '**/*.d.ts',
            'cypress/**',
            'test/**',
            'tests/**',
            '**/*.test.*',
            '**/*.spec.*'
          ],
          thresholds: {
            global: {
              branches: 80,
              functions: 80,
              lines: 80,
              statements: 80
            }
          }
        },
        pool: 'threads',
        poolOptions: {
          threads: {
            singleThread: false,
            isolate: false
          }
        },
        testTimeout: 10000,
        hookTimeout: 10000
      }
    };

    const configPath = path.join(this.projectRoot, 'vitest.config.optimized.ts');
    const configContent = this.generateVitestConfigFile(optimizedConfig);

    await fs.writeFile(configPath, configContent, 'utf-8');
    console.log('✅ Vitest: Optimized configuration created');

    this.configurations.set('vitest-optimized', {
      file: 'vitest.config.optimized.ts',
      path: configPath,
      content: configContent,
      parsed: optimizedConfig
    });
  }

  async optimizePlaywrightConfig() {
    const optimizedConfig = {
      testDir: './tests/e2e',
      timeout: 30000,
      expect: {
        timeout: 5000
      },
      fullyParallel: true,
      forbidOnly: process.env.CI ? true : false,
      retries: process.env.CI ? 2 : 0,
      workers: process.env.CI ? 1 : undefined,
      reporter: 'html',
      use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
      },
      projects: [
        {
          name: 'chromium',
          use: { browserName: 'chromium' }
        },
        {
          name: 'firefox',
          use: { browserName: 'firefox' }
        },
        {
          name: 'webkit',
          use: { browserName: 'webkit' }
        }
      ],
      webServer: {
        command: 'pnpm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI
      }
    };

    const configPath = path.join(this.projectRoot, 'playwright.config.optimized.ts');
    const configContent = this.generatePlaywrightConfigFile(optimizedConfig);

    await fs.writeFile(configPath, configContent, 'utf-8');
    console.log('✅ Playwright: Optimized configuration created');

    this.configurations.set('playwright-optimized', {
      file: 'playwright.config.optimized.ts',
      path: configPath,
      content: configContent,
      parsed: optimizedConfig
    });
  }

  async optimizeJestConfig() {
    const optimizedConfig = {
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/src', '<rootDir>/tests'],
      testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/*.(test|spec).(ts|tsx|js)'
      ],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
      },
      collectCoverageFrom: [
        'src/**/*.{js,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.*',
        '!src/**/index.ts'
      ],
      coverageDirectory: 'coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testTimeout: 10000
    };

    const configPath = path.join(this.projectRoot, 'jest.config.optimized.js');
    const configContent = this.generateJestConfigFile(optimizedConfig);

    await fs.writeFile(configPath, configContent, 'utf-8');
    console.log('✅ Jest: Optimized configuration created');

    this.configurations.set('jest-optimized', {
      file: 'jest.config.optimized.js',
      path: configPath,
      content: configContent,
      parsed: optimizedConfig
    });
  }

  generateVitestConfigFile(config) {
    return `import { defineConfig } from 'vitest/config';

export default defineConfig(${JSON.stringify(config, null, 2)});
`;
  }

  generatePlaywrightConfigFile(config) {
    return `import { defineConfig, devices } from '@playwright/test';

export default defineConfig(${JSON.stringify(config, null, 2)});
`;
  }

  generateJestConfigFile(config) {
    return `module.exports = ${JSON.stringify(config, null, 2)};
`;
  }

  async organizeTestSuites() {
    console.log('📁 Organizing test suites...');

    // Scan for existing test files
    const testFiles = await this.scanTestFiles();

    // Categorize test files
    const categories = {
      unit: [],
      integration: [],
      e2e: [],
      performance: [],
      security: []
    };

    for (const testFile of testFiles) {
      const category = this.categorizeTestFile(testFile);
      if (categories[category]) {
        categories[category].push(testFile);
      }
    }

    // Create test suite organization
    this.testSuites = new Map(Object.entries(categories));

    // Generate test suite documentation
    await this.generateTestSuiteDocumentation();

    console.log(`✅ Test suites organized: ${testFiles.length} files categorized`);
  }

  async scanTestFiles() {
    const testPatterns = [
      '**/*.test.{js,ts,jsx,tsx}',
      '**/*.spec.{js,ts,jsx,tsx}',
      '**/test/**/*.{js,ts,jsx,tsx}',
      '**/tests/**/*.{js,ts,jsx,tsx}',
      '**/__tests__/**/*.{js,ts,jsx,tsx}'
    ];

    const testFiles = [];

    // Simple file scanning (could be enhanced with glob patterns)
    const scanDirectory = async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            const subFiles = await scanDirectory(fullPath);
            testFiles.push(...subFiles);
          } else if (entry.isFile() && this.isTestFile(entry.name)) {
            testFiles.push(fullPath);
          }
        }
      } catch (error) {
        // Directory not accessible, skip
      }

      return testFiles;
    };

    await scanDirectory(this.projectRoot);
    return testFiles;
  }

  isTestFile(filename) {
    return /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(filename) ||
      filename.includes('/test/') ||
      filename.includes('/tests/') ||
      filename.includes('/__tests__/');
  }

  categorizeTestFile(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    const filename = path.basename(filePath);

    if (relativePath.includes('e2e') || relativePath.includes('playwright')) {
      return 'e2e';
    }

    if (relativePath.includes('integration') || filename.includes('integration')) {
      return 'integration';
    }

    if (relativePath.includes('performance') || filename.includes('performance')) {
      return 'performance';
    }

    if (relativePath.includes('security') || filename.includes('security')) {
      return 'security';
    }

    return 'unit';
  }

  async generateTestSuiteDocumentation() {
    const documentation = {
      testSuites: {},
      summary: {
        totalFiles: 0,
        categories: {}
      }
    };

    for (const [category, files] of this.testSuites) {
      documentation.testSuites[category] = {
        count: files.length,
        files: files.map(file => path.relative(this.projectRoot, file))
      };
      documentation.summary.totalFiles += files.length;
      documentation.summary.categories[category] = files.length;
    }

    const docPath = path.join(this.projectRoot, 'TEST_SUITE_ORGANIZATION.json');
    await fs.writeFile(docPath, JSON.stringify(documentation, null, 2), 'utf-8');

    console.log('✅ Test suite documentation generated');
  }

  async configureCoverageReporting() {
    console.log('📊 Configuring coverage reporting...');

    this.coverageConfig = {
      unified: {
        outputDir: 'coverage',
        formats: ['text', 'html', 'lcov', 'json'],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          },
          perFile: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
          }
        },
        exclude: [
          'coverage/**',
          'dist/**',
          'build/**',
          '**/*.d.ts',
          '**/*.test.*',
          '**/*.spec.*',
          '**/node_modules/**'
        ]
      },
      byFramework: {
        vitest: {
          enabled: true,
          outputDir: 'coverage/vitest'
        },
        jest: {
          enabled: true,
          outputDir: 'coverage/jest'
        },
        playwright: {
          enabled: false, // E2E coverage handled separately
          outputDir: 'coverage/playwright'
        }
      }
    };

    // Generate coverage configuration file
    const coverageConfigPath = path.join(this.projectRoot, 'coverage.config.json');
    await fs.writeFile(coverageConfigPath, JSON.stringify(this.coverageConfig, null, 2), 'utf-8');

    console.log('✅ Coverage reporting configured');
  }

  async setupCICDIntegration() {
    console.log('🚀 Setting up CI/CD integration...');

    this.cicdConfig = {
      github: {
        workflows: {
          test: {
            name: 'Test Suite',
            triggers: ['push', 'pull_request'],
            jobs: {
              unit: {
                framework: 'vitest',
                command: 'pnpm test:unit',
                coverage: true
              },
              integration: {
                framework: 'jest',
                command: 'pnpm test:integration',
                coverage: true
              },
              e2e: {
                framework: 'playwright',
                command: 'pnpm test:e2e',
                browsers: ['chromium', 'firefox', 'webkit']
              }
            }
          }
        }
      },
      scripts: {
        'test:all': 'pnpm test:unit && pnpm test:integration && pnpm test:e2e',
        'test:unit': 'vitest run --config vitest.config.optimized.ts',
        'test:integration': 'jest --config jest.config.optimized.js',
        'test:e2e': 'playwright test --config playwright.config.optimized.ts',
        'test:coverage': 'vitest run --coverage',
        'test:watch': 'vitest --config vitest.config.optimized.ts'
      }
    };

    // Generate package.json scripts addition
    const scriptsPath = path.join(this.projectRoot, 'test-scripts.json');
    await fs.writeFile(scriptsPath, JSON.stringify(this.cicdConfig.scripts, null, 2), 'utf-8');

    console.log('✅ CI/CD integration configured');
  }

  async configurePerformanceTesting() {
    console.log('⚡ Configuring performance testing...');

    this.performanceConfig = {
      frameworks: {
        lighthouse: {
          enabled: true,
          thresholds: {
            performance: 90,
            accessibility: 90,
            bestPractices: 90,
            seo: 90
          }
        },
        loadTesting: {
          enabled: true,
          tool: 'artillery',
          scenarios: {
            api: {
              target: 'http://localhost:4000',
              phases: [
                { duration: '2m', arrivalRate: 10 },
                { duration: '5m', arrivalRate: 20 },
                { duration: '2m', arrivalRate: 10 }
              ]
            }
          }
        }
      },
      metrics: {
        responseTime: { threshold: '< 200ms' },
        throughput: { threshold: '> 100 rps' },
        errorRate: { threshold: '< 1%' },
        memoryUsage: { threshold: '< 512MB' }
      }
    };

    const perfConfigPath = path.join(this.projectRoot, 'performance.config.json');
    await fs.writeFile(perfConfigPath, JSON.stringify(this.performanceConfig, null, 2), 'utf-8');

    console.log('✅ Performance testing configured');
  }

  generateConfigurationSummary() {
    return {
      frameworks: {
        total: this.frameworks.length,
        configured: this.configurations.size,
        optimized: Array.from(this.configurations.keys()).filter(key => key.includes('optimized')).length
      },
      testSuites: {
        categories: this.testSuites.size,
        totalFiles: Array.from(this.testSuites.values()).flat().length,
        distribution: Object.fromEntries(
          Array.from(this.testSuites.entries()).map(([category, files]) => [category, files.length])
        )
      },
      coverage: {
        configured: !!this.coverageConfig,
        unified: !!this.coverageConfig?.unified,
        thresholds: this.coverageConfig?.unified?.thresholds?.global || {}
      },
      cicd: {
        configured: !!this.cicdConfig,
        github: !!this.cicdConfig?.github,
        scripts: Object.keys(this.cicdConfig?.scripts || {}).length
      },
      performance: {
        configured: !!this.performanceConfig,
        lighthouse: !!this.performanceConfig?.frameworks?.lighthouse,
        loadTesting: !!this.performanceConfig?.frameworks?.loadTesting
      }
    };
  }

  async generateComprehensiveReport() {
    const summary = this.generateConfigurationSummary();

    const report = {
      timestamp: new Date().toISOString(),
      phase: 'Phase 2.2 Testing Framework Integration',
      status: 'Complete',
      summary,
      configurations: Object.fromEntries(this.configurations),
      testSuites: Object.fromEntries(this.testSuites),
      coverage: this.coverageConfig,
      cicd: this.cicdConfig,
      performance: this.performanceConfig,
      healthScore: this.calculateHealthScore(summary)
    };

    const reportPath = path.join(this.projectRoot, 'TESTING_FRAMEWORK_INTEGRATION_REPORT.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    return report;
  }

  calculateHealthScore(summary) {
    let score = 0;
    let maxScore = 0;

    // Framework configuration (25 points)
    maxScore += 25;
    score += (summary.frameworks.optimized / summary.frameworks.total) * 25;

    // Test suite organization (25 points)
    maxScore += 25;
    score += Math.min(25, summary.testSuites.categories * 5);

    // Coverage configuration (20 points)
    maxScore += 20;
    if (summary.coverage.configured) score += 20;

    // CI/CD integration (20 points)
    maxScore += 20;
    if (summary.cicd.configured) score += 20;

    // Performance testing (10 points)
    maxScore += 10;
    if (summary.performance.configured) score += 10;

    return Math.round((score / maxScore) * 100);
  }
}
