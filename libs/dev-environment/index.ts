/**
 * CODAI Development Environment Manager - Phase 2.1 Implementation
 * Advanced development environment setup and optimization
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import EventEmitter from 'events';

const execAsync = promisify(exec);

class DevelopmentEnvironmentManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.config = {
      projectRoot: options.projectRoot || process.cwd(),
      nodeVersion: options.nodeVersion || 'lts',
      packageManager: options.packageManager || 'pnpm',
      developmentPorts: options.developmentPorts || {
        gateway: 4000,
        codai: 4001,
        admin: 4002,
        hub: 4003,
        id: 4004,
        bancai: 4005,
        memorai: 4006,
        cbd: 4007,
        metu_backend: 4010,
        metu_web: 3000,
        metu_electron: 3001
      },
      environmentChecks: options.environmentChecks || true,
      autoSetup: options.autoSetup || false,
      ...options
    };

    this.environment = {
      system: {},
      nodejs: {},
      tools: {},
      services: {},
      dependencies: {},
      configuration: {}
    };

    this.setupTasks = [];
    this.healthChecks = [];
  }

  /**
   * Initialize development environment analysis
   */
  async initialize() {
    console.log('🚀 Initializing CODAI Development Environment Manager...');

    try {
      await this.analyzeSystemEnvironment();
      await this.analyzeNodeJsEnvironment();
      await this.analyzeDevelopmentTools();
      await this.analyzeProjectStructure();
      await this.analyzeServiceConfiguration();

      this.emit('initialized', this.environment);
      console.log('✅ Development environment analysis complete');

      return this.environment;
    } catch (error) {
      console.error('❌ Environment initialization failed:', error.message);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Analyze system environment
   */
  async analyzeSystemEnvironment() {
    console.log('🔍 Analyzing system environment...');

    this.environment.system = {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB',
      freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + 'GB',
      uptime: Math.round(os.uptime() / 3600) + 'h',
      shell: process.env.SHELL || process.env.ComSpec || 'unknown',
      user: os.userInfo().username,
      homedir: os.homedir()
    };

    // Check development prerequisites
    const prerequisites = await this.checkSystemPrerequisites();
    this.environment.system.prerequisites = prerequisites;

    console.log(`✅ System: ${this.environment.system.platform} ${this.environment.system.arch}`);
    console.log(`   CPUs: ${this.environment.system.cpus}, RAM: ${this.environment.system.totalMemory}`);
  }

  /**
   * Check system prerequisites for development
   */
  async checkSystemPrerequisites() {
    const prerequisites = {
      git: await this.checkCommand('git --version'),
      powershell: await this.checkCommand('pwsh --version'),
      vscode: await this.checkVSCode(),
      wsl: await this.checkWSL()
    };

    return prerequisites;
  }

  /**
   * Check if a command is available
   */
  async checkCommand(command) {
    try {
      const { stdout, stderr } = await execAsync(command);
      return {
        available: true,
        version: stdout.split('\n')[0].trim(),
        command: command.split(' ')[0]
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        command: command.split(' ')[0]
      };
    }
  }

  /**
   * Check VS Code installation
   */
  async checkVSCode() {
    const vscodeCommands = ['code --version', 'code-insiders --version'];

    for (const cmd of vscodeCommands) {
      const result = await this.checkCommand(cmd);
      if (result.available) {
        return {
          ...result,
          type: cmd.includes('insiders') ? 'VS Code Insiders' : 'VS Code'
        };
      }
    }

    return { available: false, message: 'VS Code not found in PATH' };
  }

  /**
   * Check WSL availability (Windows only)
   */
  async checkWSL() {
    if (os.platform() !== 'win32') {
      return { available: false, reason: 'Not Windows platform' };
    }

    try {
      const { stdout } = await execAsync('wsl --list --verbose');
      return {
        available: true,
        distributions: stdout.split('\n').filter(line => line.trim()).slice(1),
        version: 'WSL2'
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  /**
   * Analyze Node.js environment
   */
  async analyzeNodeJsEnvironment() {
    console.log('🔍 Analyzing Node.js environment...');

    this.environment.nodejs = {
      version: process.version,
      executable: process.execPath,
      arch: process.arch,
      platform: process.platform,
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PATH: process.env.PATH ? 'configured' : 'missing'
      }
    };

    // Check package managers
    const packageManagers = await this.checkPackageManagers();
    this.environment.nodejs.packageManagers = packageManagers;

    // Check global packages
    const globalPackages = await this.checkGlobalPackages();
    this.environment.nodejs.globalPackages = globalPackages;

    console.log(`✅ Node.js: ${this.environment.nodejs.version}`);
    console.log(`   Package Manager: ${packageManagers.preferred?.name || 'npm'}`);
  }

  /**
   * Check available package managers
   */
  async checkPackageManagers() {
    const managers = ['npm', 'yarn', 'pnpm'];
    const results = {};
    let preferred = null;

    for (const manager of managers) {
      const result = await this.checkCommand(`${manager} --version`);
      results[manager] = result;

      if (result.available && !preferred) {
        preferred = { name: manager, version: result.version };
      }

      // Prefer pnpm if available
      if (result.available && manager === 'pnpm') {
        preferred = { name: manager, version: result.version };
      }
    }

    return { ...results, preferred };
  }

  /**
   * Check global Node.js packages
   */
  async checkGlobalPackages() {
    try {
      const { stdout } = await execAsync('npm list -g --depth=0 --json');
      const globalList = JSON.parse(stdout);

      const importantPackages = [
        'typescript', 'ts-node', 'nodemon', 'pm2',
        'eslint', 'prettier', 'vitest', 'playwright'
      ];

      const installed = {};
      const missing = [];

      for (const pkg of importantPackages) {
        if (globalList.dependencies && globalList.dependencies[pkg]) {
          installed[pkg] = globalList.dependencies[pkg].version;
        } else {
          missing.push(pkg);
        }
      }

      return { installed, missing, total: Object.keys(installed).length };
    } catch (error) {
      return { error: error.message, installed: {}, missing: [] };
    }
  }

  /**
   * Analyze development tools
   */
  async analyzeDevelopmentTools() {
    console.log('🔍 Analyzing development tools...');

    const tools = [
      'docker --version',
      'docker-compose --version',
      'kubectl version --client',
      'az --version',
      'github --version',
      'postman --version'
    ];

    const toolResults = {};

    for (const tool of tools) {
      const toolName = tool.split(' ')[0];
      toolResults[toolName] = await this.checkCommand(tool);
    }

    this.environment.tools = toolResults;

    const availableTools = Object.entries(toolResults)
      .filter(([name, result]) => result.available)
      .map(([name]) => name);

    console.log(`✅ Development Tools: ${availableTools.length} available`);
    console.log(`   Tools: ${availableTools.join(', ')}`);
  }

  /**
   * Analyze project structure and configuration
   */
  async analyzeProjectStructure() {
    console.log('🔍 Analyzing project structure...');

    const projectFiles = [
      'package.json',
      'pnpm-workspace.yaml',
      'tsconfig.json',
      'eslint.config.js',
      'vitest.config.ts',
      'playwright.config.ts',
      '.env',
      '.env.example',
      'docker-compose.yml',
      'Dockerfile'
    ];

    const structure = {
      files: {},
      directories: {},
      configuration: {}
    };

    // Check project files
    for (const file of projectFiles) {
      try {
        const filePath = path.join(this.config.projectRoot, file);
        const stats = await fs.stat(filePath);
        structure.files[file] = {
          exists: true,
          size: stats.size,
          modified: stats.mtime
        };

        // Read configuration files  
        if (file === 'package.json') {
          const content = await fs.readFile(filePath, 'utf8');
          structure.configuration.package = JSON.parse(content);
        }
      } catch (error) {
        structure.files[file] = { exists: false, error: error.code };
      }
    }

    // Check important directories
    const directories = [
      'apps', 'packages', 'libs', 'tools', 'scripts',
      'docs', 'tests', 'config', 'deployment'
    ];

    for (const dir of directories) {
      try {
        const dirPath = path.join(this.config.projectRoot, dir);
        const stats = await fs.stat(dirPath);
        const files = await fs.readdir(dirPath);

        structure.directories[dir] = {
          exists: true,
          fileCount: files.length,
          modified: stats.mtime
        };
      } catch (error) {
        structure.directories[dir] = { exists: false, error: error.code };
      }
    }

    this.environment.configuration = structure;

    const existingFiles = Object.entries(structure.files)
      .filter(([name, info]) => info.exists)
      .map(([name]) => name);

    console.log(`✅ Project Structure: ${existingFiles.length}/${projectFiles.length} config files`);
    console.log(`   Configuration: ${existingFiles.join(', ')}`);
  }

  /**
   * Analyze service configuration and health
   */
  async analyzeServiceConfiguration() {
    console.log('🔍 Analyzing service configuration...');

    const services = {};

    for (const [serviceName, port] of Object.entries(this.config.developmentPorts)) {
      services[serviceName] = {
        name: serviceName,
        port: port,
        status: await this.checkServiceStatus(port),
        configuration: await this.findServiceConfiguration(serviceName)
      };
    }

    this.environment.services = services;

    const runningServices = Object.values(services)
      .filter(service => service.status.running).length;

    console.log(`✅ Services: ${runningServices}/${Object.keys(services).length} running`);
  }

  /**
   * Check if service is running on port
   */
  async checkServiceStatus(port) {
    try {
      const { createConnection } = await import('net');

      return new Promise((resolve) => {
        const socket = createConnection({ port, host: 'localhost' });
        const timeout = 2000;

        socket.setTimeout(timeout);

        socket.on('connect', () => {
          socket.destroy();
          resolve({ running: true, port, accessible: true });
        });

        socket.on('timeout', () => {
          socket.destroy();
          resolve({ running: false, port, reason: 'timeout' });
        });

        socket.on('error', (error) => {
          socket.destroy();
          resolve({ running: false, port, reason: error.code });
        });
      });
    } catch (error) {
      return { running: false, port, error: error.message };
    }
  }

  /**
   * Find service configuration files
   */
  async findServiceConfiguration(serviceName) {
    const possiblePaths = [
      `apps/${serviceName}/package.json`,
      `packages/${serviceName}/package.json`,
      `services/${serviceName}/package.json`,
      `${serviceName}/package.json`
    ];

    const config = { found: false, paths: [] };

    for (const configPath of possiblePaths) {
      try {
        const fullPath = path.join(this.config.projectRoot, configPath);
        await fs.access(fullPath);
        config.found = true;
        config.paths.push(configPath);

        // Read the first found configuration
        if (!config.content) {
          const content = await fs.readFile(fullPath, 'utf8');
          config.content = JSON.parse(content);
          config.mainPath = configPath;
        }
      } catch (error) {
        // Configuration not found at this path
      }
    }

    return config;
  }

  /**
   * Generate development environment report
   */
  generateEnvironmentReport() {
    const report = {
      timestamp: Date.now(),
      environment: this.environment,
      summary: this.generateEnvironmentSummary(),
      recommendations: this.generateSetupRecommendations(),
      healthScore: this.calculateEnvironmentHealth()
    };

    return report;
  }

  /**
   * Generate environment summary
   */
  generateEnvironmentSummary() {
    const summary = {
      system: {
        platform: this.environment.system.platform,
        ready: this.environment.system.prerequisites?.git?.available &&
          this.environment.system.prerequisites?.powershell?.available
      },
      nodejs: {
        version: this.environment.nodejs.version,
        packageManager: this.environment.nodejs.packageManagers?.preferred?.name,
        ready: !!this.environment.nodejs.packageManagers?.preferred
      },
      tools: {
        available: Object.values(this.environment.tools || {})
          .filter(tool => tool.available).length,
        total: Object.keys(this.environment.tools || {}).length
      },
      project: {
        configured: Object.values(this.environment.configuration?.files || {})
          .filter(file => file.exists).length,
        services: Object.values(this.environment.services || {})
          .filter(service => service.status.running).length
      }
    };

    return summary;
  }

  /**
   * Generate setup recommendations
   */
  generateSetupRecommendations() {
    const recommendations = [];

    // System recommendations
    if (!this.environment.system.prerequisites?.git?.available) {
      recommendations.push({
        type: 'system',
        priority: 'high',
        title: 'Install Git',
        description: 'Git is required for version control and development workflow',
        action: 'Download and install Git from https://git-scm.com/'
      });
    }

    // Node.js recommendations
    if (!this.environment.nodejs.packageManagers?.pnpm?.available) {
      recommendations.push({
        type: 'nodejs',
        priority: 'high',
        title: 'Install pnpm',
        description: 'pnpm is the preferred package manager for this monorepo',
        action: 'Run: npm install -g pnpm'
      });
    }

    // Development tools recommendations
    if (!this.environment.tools?.docker?.available) {
      recommendations.push({
        type: 'tools',
        priority: 'medium',
        title: 'Install Docker',
        description: 'Docker is recommended for containerized development',
        action: 'Download Docker Desktop from https://docker.com/'
      });
    }

    // VS Code recommendations
    if (!this.environment.system.prerequisites?.vscode?.available) {
      recommendations.push({
        type: 'editor',
        priority: 'medium',
        title: 'Install VS Code',
        description: 'VS Code is the recommended editor with CODAI extensions',
        action: 'Download VS Code from https://code.visualstudio.com/'
      });
    }

    return recommendations;
  }

  /**
   * Calculate environment health score
   */
  calculateEnvironmentHealth() {
    let score = 0;
    let maxScore = 0;

    // System health (30%)
    maxScore += 30;
    if (this.environment.system.prerequisites?.git?.available) score += 15;
    if (this.environment.system.prerequisites?.powershell?.available) score += 10;
    if (this.environment.system.prerequisites?.vscode?.available) score += 5;

    // Node.js health (25%)
    maxScore += 25;
    if (this.environment.nodejs.version) score += 10;
    if (this.environment.nodejs.packageManagers?.pnpm?.available) score += 15;

    // Tools health (20%)
    maxScore += 20;
    const toolsAvailable = Object.values(this.environment.tools || {})
      .filter(tool => tool.available).length;
    const totalTools = Object.keys(this.environment.tools || {}).length;
    if (totalTools > 0) {
      score += Math.round((toolsAvailable / totalTools) * 20);
    }

    // Project configuration health (25%)
    maxScore += 25;
    const configFiles = Object.values(this.environment.configuration?.files || {})
      .filter(file => file.exists).length;
    const totalConfigFiles = Object.keys(this.environment.configuration?.files || {}).length;
    if (totalConfigFiles > 0) {
      score += Math.round((configFiles / totalConfigFiles) * 25);
    }

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Setup development environment
   */
  async setupDevelopmentEnvironment() {
    console.log('🔧 Setting up development environment...');

    const setupResults = {
      completed: [],
      failed: [],
      skipped: []
    };

    // Install missing dependencies
    const recommendations = this.generateSetupRecommendations();

    for (const rec of recommendations) {
      if (rec.priority === 'high') {
        try {
          await this.executeSetupAction(rec);
          setupResults.completed.push(rec);
          console.log(`✅ ${rec.title}: Complete`);
        } catch (error) {
          setupResults.failed.push({ ...rec, error: error.message });
          console.log(`❌ ${rec.title}: Failed - ${error.message}`);
        }
      } else {
        setupResults.skipped.push(rec);
        console.log(`⏭️ ${rec.title}: Skipped (${rec.priority} priority)`);
      }
    }

    return setupResults;
  }

  /**
   * Execute setup action
   */
  async executeSetupAction(recommendation) {
    switch (recommendation.type) {
      case 'nodejs':
        if (recommendation.title === 'Install pnpm') {
          await execAsync('npm install -g pnpm');
        }
        break;

      default:
        console.log(`Manual action required: ${recommendation.action}`);
        break;
    }
  }

  /**
   * Start development services
   */
  async startDevelopmentServices() {
    console.log('🚀 Starting development services...');

    const startResults = {
      started: [],
      failed: [],
      alreadyRunning: []
    };

    for (const [serviceName, serviceInfo] of Object.entries(this.environment.services)) {
      if (serviceInfo.status.running) {
        startResults.alreadyRunning.push(serviceName);
        console.log(`✅ ${serviceName}: Already running on port ${serviceInfo.port}`);
        continue;
      }

      try {
        const result = await this.startService(serviceName, serviceInfo);
        if (result.success) {
          startResults.started.push(serviceName);
          console.log(`🚀 ${serviceName}: Started on port ${serviceInfo.port}`);
        } else {
          startResults.failed.push({ service: serviceName, error: result.error });
          console.log(`❌ ${serviceName}: Failed to start - ${result.error}`);
        }
      } catch (error) {
        startResults.failed.push({ service: serviceName, error: error.message });
        console.log(`❌ ${serviceName}: Error - ${error.message}`);
      }
    }

    return startResults;
  }

  /**
   * Start individual service
   */
  async startService(serviceName, serviceInfo) {
    // This would integrate with existing VS Code tasks
    // For now, return a simulated result
    return {
      success: false,
      error: 'Service startup requires VS Code task integration'
    };
  }

  /**
   * Save environment report
   */
  async saveEnvironmentReport(filename) {
    try {
      const report = this.generateEnvironmentReport();
      const filepath = path.join(this.config.projectRoot, 'logs', filename);

      // Ensure logs directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });

      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
      console.log(`📊 Environment report saved: ${filepath}`);

      return filepath;
    } catch (error) {
      console.error('❌ Failed to save environment report:', error.message);
      throw error;
    }
  }
}

export default DevelopmentEnvironmentManager;

