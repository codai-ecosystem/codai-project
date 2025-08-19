/**
 * CODAI Code Quality Manager
 * Advanced code quality tools integration and management
 * Phase 2.3: Code Quality Tools
 */

import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';

export default class CodeQualityManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.projectRoot = options.projectRoot || process.cwd();
    this.tools = options.tools || ['eslint', 'prettier', 'typescript'];
    this.configurations = new Map();
    this.qualityRules = new Map();
    this.metrics = new Map();
    this.qualityGates = new Map();

    console.log('🎯 CODAI Code Quality Manager initialized');
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Code Quality Management...');

      // Load existing configurations
      await this.loadExistingConfigurations();

      // Setup ESLint integration
      await this.setupESLintIntegration();

      // Setup Prettier integration
      await this.setupPrettierIntegration();

      // Enhance TypeScript configuration
      await this.enhanceTypeScriptConfiguration();

      // Setup static code analysis
      await this.setupStaticCodeAnalysis();

      // Configure quality gates
      await this.configureQualityGates();

      console.log('✅ Code quality management initialized');
      this.emit('quality-manager-ready', {
        tools: this.tools.length,
        configurations: this.configurations.size,
        rules: this.qualityRules.size,
        gates: this.qualityGates.size
      });

      return this.generateQualityStatus();

    } catch (error) {
      console.error('❌ Code quality initialization failed:', error.message);
      this.emit('quality-manager-error', error);
      throw error;
    }
  }

  async loadExistingConfigurations() {
    console.log('🔍 Loading existing code quality configurations...');

    const configFiles = {
      eslint: ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yaml', 'eslint.config.js'],
      prettier: ['.prettierrc', '.prettierrc.js', '.prettierrc.json', 'prettier.config.js'],
      typescript: ['tsconfig.json', 'tsconfig.base.json', 'tsconfig.build.json']
    };

    for (const [tool, files] of Object.entries(configFiles)) {
      for (const configFile of files) {
        const configPath = path.join(this.projectRoot, configFile);
        try {
          const exists = await fs.access(configPath).then(() => true).catch(() => false);
          if (exists) {
            const content = await fs.readFile(configPath, 'utf-8');
            this.configurations.set(tool, {
              file: configFile,
              path: configPath,
              content: content,
              parsed: this.parseConfiguration(tool, content)
            });
            console.log(`✅ ${tool}: ${configFile} loaded`);
            break;
          }
        } catch (error) {
          // Continue to next config file
        }
      }

      if (!this.configurations.has(tool)) {
        console.log(`⚠️  ${tool}: No configuration found, will create optimized version`);
      }
    }
  }

  parseConfiguration(tool, content) {
    try {
      switch (tool) {
        case 'eslint':
          return this.parseESLintConfig(content);
        case 'prettier':
          return this.parsePrettierConfig(content);
        case 'typescript':
          return this.parseTypeScriptConfig(content);
        default:
          return {};
      }
    } catch (error) {
      console.warn(`⚠️  Failed to parse ${tool} config:`, error.message);
      return {};
    }
  }

  parseESLintConfig(content) {
    try {
      // Handle both JS and JSON formats
      let config = {};
      if (content.trim().startsWith('{')) {
        config = JSON.parse(content);
      } else {
        // Simple extraction for JS format
        config = { type: 'javascript_module' };
      }
      return config;
    } catch (error) {
      return {};
    }
  }

  parsePrettierConfig(content) {
    try {
      if (content.trim().startsWith('{')) {
        return JSON.parse(content);
      }
      return {};
    } catch (error) {
      return {};
    }
  }

  parseTypeScriptConfig(content) {
    try {
      // Remove comments for JSON parsing
      const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      return JSON.parse(cleanContent);
    } catch (error) {
      return {};
    }
  }

  async setupESLintIntegration() {
    console.log('🔧 Setting up ESLint integration...');

    const eslintConfig = {
      env: {
        browser: true,
        es2022: true,
        node: true,
        jest: true
      },
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-requiring-type-checking',
        'prettier'
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json', './apps/*/tsconfig.json', './libs/*/tsconfig.json']
      },
      plugins: [
        '@typescript-eslint',
        'import',
        'security',
        'sonarjs',
        'unicorn'
      ],
      rules: {
        // TypeScript specific rules
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-misused-promises': 'error',

        // Import rules
        'import/order': ['error', {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }],
        'import/no-duplicates': 'error',
        'import/no-unresolved': 'error',

        // Security rules
        'security/detect-object-injection': 'warn',
        'security/detect-non-literal-regexp': 'warn',
        'security/detect-unsafe-regex': 'error',

        // Code quality rules
        'sonarjs/cognitive-complexity': ['error', 20],
        'sonarjs/no-duplicate-string': ['error', 5],
        'sonarjs/no-identical-functions': 'error',

        // Unicorn rules for modern JS
        'unicorn/filename-case': ['error', { case: 'kebabCase' }],
        'unicorn/no-null': 'error',
        'unicorn/prefer-module': 'error',
        'unicorn/prefer-node-protocol': 'error',

        // General rules
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-alert': 'error',
        'prefer-const': 'error',
        'no-var': 'error'
      },
      overrides: [
        {
          files: ['*.test.{js,ts}', '*.spec.{js,ts}'],
          rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off'
          }
        },
        {
          files: ['*.config.{js,ts}', '*.setup.{js,ts}'],
          rules: {
            'import/no-default-export': 'off'
          }
        }
      ],
      ignorePatterns: [
        'dist/',
        'build/',
        'node_modules/',
        '*.min.js',
        'coverage/',
        '.next/',
        '.nuxt/'
      ]
    };

    const configPath = path.join(this.projectRoot, 'eslint.config.optimized.js');
    const configContent = this.generateESLintConfigFile(eslintConfig);

    await fs.writeFile(configPath, configContent, 'utf-8');
    console.log('✅ ESLint: Optimized configuration created');

    this.configurations.set('eslint-optimized', {
      file: 'eslint.config.optimized.js',
      path: configPath,
      content: configContent,
      parsed: eslintConfig
    });

    // Setup ESLint quality rules
    this.qualityRules.set('eslint', {
      errorThreshold: 0,
      warningThreshold: 10,
      complexityThreshold: 20,
      duplicateStringThreshold: 5
    });
  }

  generateESLintConfigFile(config) {
    return `module.exports = ${JSON.stringify(config, null, 2)};
`;
  }

  async setupPrettierIntegration() {
    console.log('🎨 Setting up Prettier integration...');

    const prettierConfig = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: 'avoid',
      endOfLine: 'lf',
      quoteProps: 'as-needed',
      jsxSingleQuote: true,
      proseWrap: 'preserve',
      htmlWhitespaceSensitivity: 'css',
      vueIndentScriptAndStyle: false,
      embeddedLanguageFormatting: 'auto'
    };

    const configPath = path.join(this.projectRoot, '.prettierrc.optimized.json');
    const configContent = JSON.stringify(prettierConfig, null, 2);

    await fs.writeFile(configPath, configContent, 'utf-8');
    console.log('✅ Prettier: Optimized configuration created');

    // Create .prettierignore file
    const prettierIgnore = `
# Dependencies
node_modules/
package-lock.json
pnpm-lock.yaml

# Build outputs
dist/
build/
.next/
.nuxt/
coverage/

# Generated files
*.min.js
*.min.css
*.d.ts

# Config files
*.config.js
*.config.ts

# Documentation
CHANGELOG.md
*.generated.md
`;

    const ignorePath = path.join(this.projectRoot, '.prettierignore.optimized');
    await fs.writeFile(ignorePath, prettierIgnore.trim(), 'utf-8');

    this.configurations.set('prettier-optimized', {
      file: '.prettierrc.optimized.json',
      path: configPath,
      content: configContent,
      parsed: prettierConfig
    });

    // Setup Prettier quality rules
    this.qualityRules.set('prettier', {
      formatOnSave: true,
      requirePragma: false,
      insertPragma: false
    });
  }

  async enhanceTypeScriptConfiguration() {
    console.log('📘 Enhancing TypeScript configuration...');

    const enhancedTSConfig = {
      compilerOptions: {
        // Target and module
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',

        // Strict checks
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        strictFunctionTypes: true,
        strictBindCallApply: true,
        strictPropertyInitialization: true,
        noImplicitReturns: true,
        noImplicitOverride: true,
        noPropertyAccessFromIndexSignature: true,
        noUncheckedIndexedAccess: true,
        exactOptionalPropertyTypes: true,

        // Additional checks
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitThis: true,
        noFallthroughCasesInSwitch: true,

        // Advanced features
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        useDefineForClassFields: true,

        // Output
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        removeComments: false,
        importHelpers: true,

        // Interop
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        forceConsistentCasingInFileNames: true,

        // Resolution
        resolveJsonModule: true,
        isolatedModules: true,
        verbatimModuleSyntax: true,

        // Emit
        noEmitOnError: true,
        preserveWatchOutput: true,

        // Paths
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
          '@/components/*': ['./src/components/*'],
          '@/utils/*': ['./src/utils/*'],
          '@/types/*': ['./src/types/*'],
          '@/libs/*': ['./libs/*']
        }
      },
      include: [
        'src/**/*',
        'libs/**/*',
        'apps/**/*',
        'types/**/*',
        '*.ts',
        '*.tsx'
      ],
      exclude: [
        'node_modules',
        'dist',
        'build',
        'coverage',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      compileOnSave: true,
      typescript: {
        preferences: {
          quoteStyle: 'single',
          includeCompletionsForModuleExports: true,
          includeCompletionsWithSnippetText: true,
          allowTextChangesInNewFiles: true
        }
      }
    };

    const configPath = path.join(this.projectRoot, 'tsconfig.enhanced.json');
    const configContent = JSON.stringify(enhancedTSConfig, null, 2);

    await fs.writeFile(configPath, configContent, 'utf-8');
    console.log('✅ TypeScript: Enhanced configuration created');

    this.configurations.set('typescript-enhanced', {
      file: 'tsconfig.enhanced.json',
      path: configPath,
      content: configContent,
      parsed: enhancedTSConfig
    });

    // Setup TypeScript quality rules
    this.qualityRules.set('typescript', {
      strictMode: true,
      noImplicitAny: true,
      exactOptionalProperties: true,
      noUnusedLocals: true,
      noImplicitReturns: true
    });
  }

  async setupStaticCodeAnalysis() {
    console.log('📊 Setting up static code analysis...');

    const analysisConfig = {
      tools: {
        sonarjs: {
          enabled: true,
          rules: {
            'cognitive-complexity': { threshold: 15 },
            'max-switch-cases': { threshold: 30 },
            'no-duplicate-string': { threshold: 3 },
            'no-identical-functions': { enabled: true }
          }
        },
        complexity: {
          enabled: true,
          maxComplexity: 10,
          maxDepth: 4,
          maxStatements: 20,
          maxParams: 4
        },
        security: {
          enabled: true,
          rules: [
            'detect-object-injection',
            'detect-non-literal-regexp',
            'detect-unsafe-regex',
            'detect-buffer-noassert',
            'detect-eval-with-expression'
          ]
        },
        performance: {
          enabled: true,
          rules: [
            'no-array-constructor',
            'no-new-object',
            'prefer-spread',
            'prefer-template'
          ]
        }
      },
      metrics: {
        maintainabilityIndex: { min: 70 },
        cyclomaticComplexity: { max: 10 },
        linesOfCode: { max: 300 },
        cognitiveComplexity: { max: 15 },
        nestingDepth: { max: 4 }
      },
      reporting: {
        formats: ['json', 'html', 'sarif'],
        outputDir: 'code-analysis-results',
        includeMetrics: true,
        includeSuggestions: true
      }
    };

    const configPath = path.join(this.projectRoot, 'code-analysis.config.json');
    await fs.writeFile(configPath, JSON.stringify(analysisConfig, null, 2), 'utf-8');

    console.log('✅ Static code analysis configured');

    this.configurations.set('code-analysis', {
      file: 'code-analysis.config.json',
      path: configPath,
      content: JSON.stringify(analysisConfig, null, 2),
      parsed: analysisConfig
    });

    // Store analysis metrics
    this.metrics.set('code-analysis', analysisConfig.metrics);
  }

  async configureQualityGates() {
    console.log('🚧 Configuring quality gates...');

    const qualityGatesConfig = {
      gates: {
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
        'pull-request': {
          enabled: true,
          checks: [
            { tool: 'code-analysis', action: 'analyze', failOnError: false },
            { tool: 'coverage', action: 'check', threshold: 80, failOnError: true },
            { tool: 'complexity', action: 'check', threshold: 10, failOnError: true },
            { tool: 'security', action: 'scan', failOnError: true }
          ]
        },
        'release': {
          enabled: true,
          checks: [
            { tool: 'eslint', action: 'lint', failOnError: true },
            { tool: 'typescript', action: 'build', failOnError: true },
            { tool: 'tests', action: 'all', failOnError: true },
            { tool: 'code-analysis', action: 'analyze', failOnError: true },
            { tool: 'security', action: 'audit', failOnError: true }
          ]
        }
      },
      scripts: {
        'quality:check': 'npm run lint && npm run typecheck && npm run test:unit',
        'quality:fix': 'npm run format && npm run lint:fix',
        'quality:analyze': 'npm run analyze && npm run complexity',
        'quality:full': 'npm run quality:check && npm run quality:analyze'
      },
      thresholds: {
        coverage: 80,
        complexity: 10,
        duplicates: 3,
        maintainability: 70,
        security: 0
      }
    };

    const configPath = path.join(this.projectRoot, 'quality-gates.config.json');
    await fs.writeFile(configPath, JSON.stringify(qualityGatesConfig, null, 2), 'utf-8');

    console.log('✅ Quality gates configured');

    this.qualityGates.set('all', qualityGatesConfig);

    // Generate package.json scripts
    const scriptsPath = path.join(this.projectRoot, 'quality-scripts.json');
    await fs.writeFile(scriptsPath, JSON.stringify(qualityGatesConfig.scripts, null, 2), 'utf-8');
  }

  async runQualityCheck(options = {}) {
    console.log('🔍 Running code quality check...');

    const results = {
      timestamp: new Date().toISOString(),
      tools: {},
      overall: {
        passed: true,
        score: 0,
        issues: []
      }
    };

    try {
      // Run ESLint
      if (this.tools.includes('eslint')) {
        results.tools.eslint = await this.runESLint(options);
      }

      // Run Prettier check
      if (this.tools.includes('prettier')) {
        results.tools.prettier = await this.runPrettierCheck(options);
      }

      // Run TypeScript check
      if (this.tools.includes('typescript')) {
        results.tools.typescript = await this.runTypeScriptCheck(options);
      }

      // Calculate overall score
      results.overall = this.calculateOverallScore(results.tools);

      this.emit('quality-check-complete', results);
      return results;

    } catch (error) {
      console.error('❌ Quality check failed:', error.message);
      results.overall.passed = false;
      results.overall.error = error.message;
      this.emit('quality-check-failed', results);
      throw error;
    }
  }

  async runESLint(options = {}) {
    const args = ['eslint', '.', '--ext', '.js,.ts,.tsx'];

    if (options.fix) {
      args.push('--fix');
    }

    if (options.format) {
      args.push('--format', options.format);
    }

    const result = await this.executeCommand('npx', args);

    return {
      passed: result.exitCode === 0,
      exitCode: result.exitCode,
      duration: result.duration,
      issues: this.parseESLintOutput(result.stdout),
      fixed: options.fix ? this.countFixedIssues(result.stdout) : 0
    };
  }

  async runPrettierCheck(options = {}) {
    const args = ['prettier', '--check', '.'];

    if (options.write) {
      args[1] = '--write';
    }

    const result = await this.executeCommand('npx', args);

    return {
      passed: result.exitCode === 0,
      exitCode: result.exitCode,
      duration: result.duration,
      files: this.parsePrettierOutput(result.stdout),
      formatted: options.write ? this.countFormattedFiles(result.stdout) : 0
    };
  }

  async runTypeScriptCheck(options = {}) {
    const args = ['tsc', '--noEmit'];

    if (options.project) {
      args.push('--project', options.project);
    }

    const result = await this.executeCommand('npx', args);

    return {
      passed: result.exitCode === 0,
      exitCode: result.exitCode,
      duration: result.duration,
      errors: this.parseTypeScriptOutput(result.stderr),
      warnings: this.parseTypeScriptWarnings(result.stdout)
    };
  }

  async executeCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      const child = spawn(command, args, {
        cwd: options.cwd || this.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
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
          command: `${command} ${args.join(' ')}`
        });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  parseESLintOutput(output) {
    // Simple parsing - in real implementation, use ESLint JSON formatter
    const lines = output.split('\n');
    const issues = [];

    for (const line of lines) {
      if (line.includes('error') || line.includes('warning')) {
        issues.push(line.trim());
      }
    }

    return issues;
  }

  parsePrettierOutput(output) {
    const lines = output.split('\n').filter(line => line.trim());
    return lines.length;
  }

  parseTypeScriptOutput(output) {
    const lines = output.split('\n');
    const errors = [];

    for (const line of lines) {
      if (line.includes('error TS')) {
        errors.push(line.trim());
      }
    }

    return errors;
  }

  parseTypeScriptWarnings(output) {
    const lines = output.split('\n');
    const warnings = [];

    for (const line of lines) {
      if (line.includes('warning TS')) {
        warnings.push(line.trim());
      }
    }

    return warnings;
  }

  countFixedIssues(output) {
    const matches = output.match(/✖ (\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
    return matches ? parseInt(matches[2]) + parseInt(matches[3]) : 0;
  }

  countFormattedFiles(output) {
    return output.split('\n').filter(line => line.trim()).length;
  }

  calculateOverallScore(toolResults) {
    let totalScore = 0;
    let toolCount = 0;
    const issues = [];
    let passed = true;

    for (const [tool, result] of Object.entries(toolResults)) {
      if (!result.passed) {
        passed = false;
      }

      // Calculate tool score (0-100)
      let toolScore = result.passed ? 100 : 0;

      if (tool === 'eslint' && result.issues) {
        toolScore = Math.max(0, 100 - result.issues.length * 5);
        issues.push(...result.issues);
      }

      if (tool === 'typescript' && result.errors) {
        toolScore = Math.max(0, 100 - result.errors.length * 10);
        issues.push(...result.errors);
      }

      totalScore += toolScore;
      toolCount++;
    }

    return {
      passed,
      score: toolCount > 0 ? Math.round(totalScore / toolCount) : 0,
      issues: issues.slice(0, 10), // Limit to first 10 issues
      toolCount,
      summary: `${toolCount} tools checked, overall score: ${Math.round(totalScore / toolCount)}%`
    };
  }

  generateQualityStatus() {
    return {
      initialized: true,
      tools: {
        total: this.tools.length,
        configured: this.configurations.size,
        rules: this.qualityRules.size
      },
      configurations: Array.from(this.configurations.keys()),
      qualityGates: Array.from(this.qualityGates.keys()),
      metrics: Array.from(this.metrics.keys()),
      capabilities: {
        linting: true,
        formatting: true,
        typeChecking: true,
        staticAnalysis: true,
        qualityGates: true
      }
    };
  }

  async generateComprehensiveReport() {
    const status = this.generateQualityStatus();

    const report = {
      timestamp: new Date().toISOString(),
      phase: 'Phase 2.3 Code Quality Tools',
      status: 'Complete',
      summary: status,
      configurations: Object.fromEntries(this.configurations),
      qualityRules: Object.fromEntries(this.qualityRules),
      metrics: Object.fromEntries(this.metrics),
      qualityGates: Object.fromEntries(this.qualityGates),
      healthScore: this.calculateHealthScore(status)
    };

    const reportPath = path.join(this.projectRoot, 'CODE_QUALITY_INTEGRATION_REPORT.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    return report;
  }

  calculateHealthScore(status) {
    let score = 0;
    let maxScore = 0;

    // Tool configuration (30 points)
    maxScore += 30;
    score += (status.tools.configured / status.tools.total) * 30;

    // Quality rules setup (25 points)
    maxScore += 25;
    score += Math.min(25, status.tools.rules * 8);

    // Quality gates (25 points)
    maxScore += 25;
    if (status.qualityGates.length > 0) score += 25;

    // Capabilities (20 points)
    maxScore += 20;
    const enabledCapabilities = Object.values(status.capabilities).filter(Boolean).length;
    score += (enabledCapabilities / Object.keys(status.capabilities).length) * 20;

    return Math.round((score / maxScore) * 100);
  }
}
