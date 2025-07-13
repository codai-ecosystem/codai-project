/**
 * CODAI CLI - Universal Command Line Interface
 * Main CLI implementation class
 */

import { execa, execaCommand } from 'execa';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { CodaiSDK } from '@codai/sdk';
import { LogAIClient } from '@codai/logai-sdk';

interface DevOptions {
  port?: string;
  watch?: boolean;
}

interface BuildOptions {
  clean?: boolean;
}

interface DeployOptions {
  force?: boolean;
}

interface StatusOptions {
  detailed?: boolean;
}

interface LogsOptions {
  follow?: boolean;
  lines?: string;
  level?: 'debug' | 'info' | 'warn' | 'error' | 'critical';
}

interface EcosystemStartOptions {
  mode?: 'development' | 'production';
  services?: string;
}

interface EcosystemStopOptions {
  force?: boolean;
}

interface EcosystemSyncOptions {
  force?: boolean;
}

interface EcosystemHealthOptions {
  detailed?: boolean;
}

export class CodaiCLI {
  private sdk: CodaiSDK;
  private logger: LogAIClient;
  private workspaceRoot: string;
  private configData: Record<string, any>;

  constructor() {
    this.workspaceRoot = process.cwd();
    this.configData = this.loadConfig();

    // Initialize SDK with configuration
    this.sdk = new CodaiSDK({
      appId: 'codai-cli',
      environment: (this.configData.environment as 'development' | 'staging' | 'production') || 'development',
      apiVersion: 'v1',
      endpoints: {},
      authentication: {},
      security: {},
      compliance: {},
      debug: this.configData.debug || false,
      timeout: this.configData.timeout || 30000,
      retryAttempts: this.configData.retryAttempts || 3,
      retryDelay: 1000,
      telemetry: true,
      healthCheckInterval: 60000
    });

    // Initialize LogAI
    this.logger = new LogAIClient({
      apiKey: this.configData.logaiApiKey || process.env.LOGAI_API_KEY,
      service: 'codai-cli'
    });
  }

  private loadConfig(): Record<string, any> {
    const configPath = join(this.workspaceRoot, 'codai.config.json');
    if (existsSync(configPath)) {
      try {
        return JSON.parse(readFileSync(configPath, 'utf-8'));
      } catch (error) {
        console.warn(chalk.yellow('Warning: Failed to load config file, using defaults'));
        return {};
      }
    }
    return {};
  }

  private saveConfig(): void {
    const configPath = join(this.workspaceRoot, 'codai.config.json');
    try {
      writeFileSync(configPath, JSON.stringify(this.configData, null, 2));
    } catch (error) {
      console.error(chalk.red('Failed to save configuration'));
    }
  }

  private async runCommand(command: string, cwd?: string): Promise<string> {
    const spinner = ora(`Running: ${command}`).start();
    try {
      const result = await execaCommand(command, {
        cwd: cwd || this.workspaceRoot,
        encoding: 'utf8'
      });
      spinner.succeed();
      return result.stdout;
    } catch (error) {
      spinner.fail();
      throw error;
    }
  }

  private getServicePath(service: string): string {
    const servicePaths = {
      'codai': 'apps/codai',
      'memorai': 'apps/memorai',
      'bancai': 'apps/bancai',
      'stocai': 'apps/stocai',
      'logai': 'apps/logai',
      'marketai': 'apps/marketai',
      'x': 'apps/x',
      'wallet': 'apps/wallet',
      'explorer': 'apps/explorer',
      'admin': 'apps/admin',
      'api': 'apps/api',
      'docs': 'apps/docs',
      'hub': 'apps/hub',
      'dash': 'apps/dash'
    };

    return servicePaths[service as keyof typeof servicePaths] || `apps/${service}`;
  }

  // Core Commands
  async dev(service?: string, options: DevOptions = {}): Promise<void> {
    this.logger.info('Starting development servers', { service, options });

    if (service) {
      const servicePath = this.getServicePath(service);
      const port = options.port ? `--port ${options.port}` : '';
      const command = `pnpm dev ${port}`;

      console.log(chalk.blue(`Starting ${service} in development mode...`));
      await this.runCommand(command, servicePath);
    } else {
      console.log(chalk.blue('Starting all services in development mode...'));
      await this.runCommand('pnpm dev');
    }
  }

  async build(service?: string, options: BuildOptions = {}): Promise<void> {
    this.logger.info('Building services', { service, options });

    if (options.clean) {
      console.log(chalk.yellow('Cleaning previous builds...'));
      await this.runCommand('pnpm clean');
    }

    if (service) {
      const servicePath = this.getServicePath(service);
      console.log(chalk.blue(`Building ${service}...`));
      await this.runCommand('pnpm build', servicePath);
    } else {
      console.log(chalk.blue('Building all services...'));
      await this.runCommand('pnpm build');
    }
  }

  async deploy(service: string, environment: string, options: DeployOptions = {}): Promise<void> {
    this.logger.info('Deploying service', { service, environment, options });

    if (!options.force) {
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `Deploy ${service} to ${environment}?`,
        default: false
      }]);

      if (!confirm) {
        console.log(chalk.yellow('Deployment cancelled'));
        return;
      }
    }

    console.log(chalk.blue(`Deploying ${service} to ${environment}...`));
    const servicePath = this.getServicePath(service);
    await this.runCommand(`pnpm deploy:${environment}`, servicePath);
  }

  async status(service?: string, options: StatusOptions = {}): Promise<void> {
    this.logger.info('Checking service status', { service, options });

    if (service) {
      console.log(chalk.blue(`Checking status of ${service}...`));
      try {
        const health = await this.sdk.getHealth();
        const serviceStatus = health.services[service];

        if (options.detailed) {
          console.log(JSON.stringify(serviceStatus, null, 2));
        } else {
          const status = serviceStatus ? serviceStatus.status : 'unknown';
          console.log(`${service}: ${status}`);
        }
      } catch (error) {
        console.error(chalk.red(`Failed to get status for ${service}:`, error));
      }
    } else {
      console.log(chalk.blue('Checking status of all services...'));
      try {
        const health = await this.sdk.getHealth();

        for (const [serviceName, serviceHealth] of Object.entries(health.services)) {
          const color = serviceHealth.status === 'online' ? 'green' : 'red';
          console.log((chalk as any)[color](`${serviceName}: ${serviceHealth.status}`));
        }
      } catch (error) {
        console.error(chalk.red('Failed to get service statuses:', error));
      }
    }
  }

  async logs(service: string, options: LogsOptions = {}): Promise<void> {
    this.logger.info('Retrieving logs', { service, options });

    console.log(chalk.blue(`Retrieving logs for ${service}...`));

    // For now, use LogAI client directly for log queries
    try {
      if (options.follow) {
        console.log(chalk.yellow('Log streaming not yet implemented. Showing recent logs...'));
      }

      // Use the LogAI client to query logs
      const insights = await this.logger.getAIInsights(
        `Show recent logs for ${service} service`,
        {
          service,
          level: options.level,
          limit: parseInt(options.lines || '100')
        }
      );

      if (insights) {
        console.log(JSON.stringify(insights, null, 2));
      } else {
        console.log(chalk.yellow('No logs available or LogAI service is not accessible'));
      }
    } catch (error) {
      console.error(chalk.red('Failed to retrieve logs:', error));
    }
  }

  async configureSettings(action: string, key?: string, value?: string): Promise<void> {
    this.logger.info('Managing configuration', { action, key, value });

    switch (action) {
      case 'get':
        if (key) {
          console.log(this.configData[key] || 'undefined');
        } else {
          console.log('Key is required for get action');
        }
        break;

      case 'set':
        if (key && value !== undefined) {
          this.configData[key] = value;
          this.saveConfig();
          console.log(chalk.green(`Set ${key} = ${value}`));
        } else {
          console.log('Key and value are required for set action');
        }
        break;

      case 'list':
        console.log(JSON.stringify(this.configData, null, 2));
        break;

      case 'reset':
        this.configData = {};
        this.saveConfig();
        console.log(chalk.yellow('Configuration reset'));
        break;

      default:
        console.log('Valid actions: get, set, list, reset');
    }
  }

  // Service-specific commands
  async memoraiCreateDatabase(options: any): Promise<void> {
    console.log(chalk.blue(`Creating MemorAI database: ${options.name}`));
    try {
      // For now, simulate database creation
      console.log(chalk.green(`Database ${options.name} would be created with type: ${options.type || 'memory'}`));
      console.log(chalk.yellow('Note: Actual MemorAI integration coming soon'));
    } catch (error) {
      console.error(chalk.red('Failed to create database:', error));
    }
  }

  async memoraiQuery(options: any): Promise<void> {
    console.log(chalk.blue(`Querying MemorAI database: ${options.database}`));
    try {
      // For now, simulate query
      console.log(chalk.green(`Query "${options.query}" would be executed on database: ${options.database}`));
      console.log(chalk.yellow('Note: Actual MemorAI integration coming soon'));
    } catch (error) {
      console.error(chalk.red('Failed to query database:', error));
    }
  }

  async logaiQuery(options: any): Promise<void> {
    console.log(chalk.blue(`Querying LogAI for service: ${options.service}`));
    try {
      const results = await this.logger.getAIInsights(options.query, {
        service: options.service,
        timeframe: options.timeframe
      });
      if (results) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        console.log(chalk.yellow('No results or LogAI service not available'));
      }
    } catch (error) {
      console.error(chalk.red('Failed to query LogAI:', error));
    }
  }

  async logaiAnalytics(options: any): Promise<void> {
    console.log(chalk.blue(`Getting LogAI analytics for: ${options.service}`));
    try {
      const analytics = await this.logger.getAnalytics({
        service: options.service,
        timeRange: options.timeframe
      });
      if (analytics) {
        console.log(JSON.stringify(analytics, null, 2));
      } else {
        console.log(chalk.yellow('No analytics or LogAI service not available'));
      }
    } catch (error) {
      console.error(chalk.red('Failed to get analytics:', error));
    }
  }

  async bancaiCreateWallet(options: any): Promise<void> {
    console.log(chalk.blue(`Creating BancAI wallet for user: ${options.user}`));
    try {
      // For now, simulate wallet creation
      const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(chalk.green(`Wallet created: ${walletId}`));
      console.log(chalk.yellow('Note: Actual BancAI integration coming soon'));
    } catch (error) {
      console.error(chalk.red('Failed to create wallet:', error));
    }
  }

  async bancaiBalance(options: any): Promise<void> {
    console.log(chalk.blue(`Checking BancAI wallet balance: ${options.wallet}`));
    try {
      // For now, simulate balance check
      console.log(`Balance: 0.00 USD (simulated)`);
      console.log(chalk.yellow('Note: Actual BancAI integration coming soon'));
    } catch (error) {
      console.error(chalk.red('Failed to get balance:', error));
    }
  }

  async xPlaceOrder(options: any): Promise<void> {
    console.log(chalk.blue(`Placing X trading order: ${options.type} ${options.amount} ${options.symbol}`));
    try {
      // For now, simulate order placement
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(chalk.green(`Order placed: ${orderId}`));
      console.log(chalk.yellow('Note: Actual X trading integration coming soon'));
    } catch (error) {
      console.error(chalk.red('Failed to place order:', error));
    }
  }

  async marketaiCreateCampaign(options: any): Promise<void> {
    console.log(chalk.blue(`Creating MarketAI campaign: ${options.name}`));
    try {
      // For now, simulate campaign creation
      const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(chalk.green(`Campaign created: ${campaignId}`));
      console.log(chalk.yellow('Note: Actual MarketAI integration coming soon'));
    } catch (error) {
      console.error(chalk.red('Failed to create campaign:', error));
    }
  }

  // Ecosystem management
  async ecosystemStart(options: EcosystemStartOptions = {}): Promise<void> {
    this.logger.info('Starting ecosystem', { options });

    console.log(chalk.blue('Starting CODAI ecosystem...'));

    if (options.services) {
      const services = options.services.split(',');
      for (const service of services) {
        await this.dev(service.trim());
      }
    } else {
      await this.runCommand('pnpm dev');
    }
  }

  async ecosystemStop(options: EcosystemStopOptions = {}): Promise<void> {
    this.logger.info('Stopping ecosystem', { options });

    console.log(chalk.yellow('Stopping CODAI ecosystem...'));

    if (options.force) {
      await this.runCommand('pkill -f "pnpm dev"');
    } else {
      // Graceful shutdown
      await this.runCommand('pnpm stop');
    }
  }

  async ecosystemSync(options: EcosystemSyncOptions = {}): Promise<void> {
    this.logger.info('Synchronizing ecosystem', { options });

    console.log(chalk.blue('Synchronizing CODAI ecosystem...'));
    await this.runCommand('pnpm sync-apps');
  }

  async ecosystemHealth(options: EcosystemHealthOptions = {}): Promise<void> {
    this.logger.info('Checking ecosystem health', { options });

    console.log(chalk.blue('Checking CODAI ecosystem health...'));

    try {
      const health = await this.sdk.getHealth();

      if (options.detailed) {
        console.log(JSON.stringify(health, null, 2));
      } else {
        console.log(`Overall Health: ${health.status}`);
        const serviceCount = Object.keys(health.services).length;
        const onlineServices = Object.values(health.services).filter(s => s.status === 'online').length;
        console.log(`Services Online: ${onlineServices}/${serviceCount}`);
        console.log(`SDK Version: ${health.version}`);
        console.log(`Uptime: ${Math.floor(health.uptime / 1000)}s`);
      }
    } catch (error) {
      console.error(chalk.red('Failed to get ecosystem health:', error));
    }
  }
}
