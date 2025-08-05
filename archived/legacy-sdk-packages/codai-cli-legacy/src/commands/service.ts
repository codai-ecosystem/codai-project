import chalk from 'chalk';
import ora from 'ora';
import { table } from 'table';
import axios from 'axios';
import ApiClient from '../utils/api';
import { SERVICES, getService, CLI_CONFIG } from '../config/services';
import type { Service, ServiceHealth } from '../config/services';

export class ServiceCommand {
  private static api = new ApiClient();

  static async list(): Promise<void> {
    const spinner = ora('Fetching service status...').start();
    
    try {
      const services = await ServiceCommand.getAllServices();
      spinner.succeed('Service status retrieved');

      const tableData = [
        [
          chalk.bold('Service'),
          chalk.bold('Port'),
          chalk.bold('Status'),
          chalk.bold('Health'),
          chalk.bold('Uptime')
        ]
      ];

      for (const service of services) {
        const statusColor = service.status === 'running' ? chalk.green : chalk.red;
        const healthColor = service.health === 'healthy' ? chalk.green : 
                           service.health === 'degraded' ? chalk.yellow : chalk.red;
        
        tableData.push([
          service.name,
          service.port.toString(),
          statusColor(service.status),
          healthColor(service.health),
          service.uptime || 'N/A'
        ]);
      }

      console.log('\n' + table(tableData));
      
      const totalServices = services.length;
      const runningServices = services.filter(s => s.status === 'running').length;
      const healthyServices = services.filter(s => s.health === 'healthy').length;
      
      console.log(chalk.cyan(`\n📊 Summary: ${runningServices}/${totalServices} running, ${healthyServices}/${totalServices} healthy`));
      
    } catch (error) {
      spinner.fail('Failed to fetch service status');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    }
  }

  static async start(serviceName: string, options: { port?: string }): Promise<void> {
    const spinner = ora(`Starting ${serviceName}...`).start();
    
    try {
      const service = ServiceConfig.getService(serviceName);
      if (!service) {
        throw new Error(`Service '${serviceName}' not found`);
      }

      const port = options.port || service.port;
      await ServiceCommand.api.post('/api/gateway/services/start', {
        service: serviceName,
        port: parseInt(port.toString())
      });

      spinner.succeed(`${serviceName} started successfully on port ${port}`);
      
      // Wait a moment and check health
      setTimeout(async () => {
        try {
          const health = await ServiceCommand.checkServiceHealth(serviceName);
          if (health === 'healthy') {
            console.log(chalk.green(`✅ ${serviceName} is healthy and ready`));
          } else {
            console.log(chalk.yellow(`⚠️  ${serviceName} is running but not fully healthy`));
          }
        } catch (e) {
          console.log(chalk.red(`❌ ${serviceName} health check failed`));
        }
      }, 3000);
      
    } catch (error) {
      spinner.fail(`Failed to start ${serviceName}`);
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    }
  }

  static async stop(serviceName: string): Promise<void> {
    const spinner = ora(`Stopping ${serviceName}...`).start();
    
    try {
      await ServiceCommand.api.post('/api/gateway/services/stop', {
        service: serviceName
      });

      spinner.succeed(`${serviceName} stopped successfully`);
      
    } catch (error) {
      spinner.fail(`Failed to stop ${serviceName}`);
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    }
  }

  static async restart(serviceName: string): Promise<void> {
    console.log(chalk.cyan(`🔄 Restarting ${serviceName}...`));
    
    await ServiceCommand.stop(serviceName);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await ServiceCommand.start(serviceName, {});
  }

  static async health(options: { verbose?: boolean }): Promise<void> {
    const spinner = ora('Checking service health...').start();
    
    try {
      const healthData = await ServiceCommand.api.get('/health');
      spinner.succeed('Health check completed');

      if (options.verbose) {
        console.log('\n' + chalk.bold('🏥 Detailed Health Report'));
        console.log('═'.repeat(50));
        
        for (const [serviceName, health] of Object.entries(healthData.services || {})) {
          const status = (health as any).status;
          const responseTime = (health as any).responseTime;
          const lastCheck = (health as any).lastCheck;
          
          const statusIcon = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
          const statusColor = status === 'healthy' ? chalk.green : 
                             status === 'degraded' ? chalk.yellow : chalk.red;
          
          console.log(`\n${statusIcon} ${chalk.bold(serviceName)}`);
          console.log(`   Status: ${statusColor(status)}`);
          console.log(`   Response Time: ${responseTime}ms`);
          console.log(`   Last Check: ${new Date(lastCheck).toLocaleString()}`);
        }
      } else {
        const overallStatus = healthData.status;
        const statusColor = overallStatus === 'healthy' ? chalk.green : 
                           overallStatus === 'degraded' ? chalk.yellow : chalk.red;
        
        console.log(`\n🏥 Overall System Status: ${statusColor(overallStatus.toUpperCase())}`);
        
        const services = healthData.services || {};
        const healthyCount = Object.values(services).filter((s: any) => s.status === 'healthy').length;
        const totalCount = Object.keys(services).length;
        
        console.log(chalk.cyan(`📊 Services: ${healthyCount}/${totalCount} healthy`));
      }
      
    } catch (error) {
      spinner.fail('Health check failed');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    }
  }

  static async logs(serviceName: string, options: { follow?: boolean; lines?: string }): Promise<void> {
    const spinner = ora(`Fetching logs for ${serviceName}...`).start();
    
    try {
      const service = ServiceConfig.getService(serviceName);
      if (!service) {
        throw new Error(`Service '${serviceName}' not found`);
      }

      const response = await ServiceCommand.api.get(`/api/gateway/services/${serviceName}/logs`, {
        params: {
          lines: parseInt(options.lines || '50'),
          follow: options.follow || false
        }
      });

      spinner.succeed(`Logs for ${serviceName}`);
      
      console.log(chalk.cyan(`\n📝 Last ${options.lines || '50'} lines for ${serviceName}:`));
      console.log('─'.repeat(80));
      console.log(response.logs);
      
      if (options.follow) {
        console.log(chalk.yellow('\n👁️  Following logs... (Press Ctrl+C to stop)'));
        // Implementation for log following would go here
      }
      
    } catch (error) {
      spinner.fail(`Failed to fetch logs for ${serviceName}`);
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    }
  }

  private static async getAllServices(): Promise<Array<{
    name: string;
    port: number;
    status: string;
    health: string;
    uptime?: string;
  }>> {
    try {
      // Get service status from Gateway
      const healthResponse = await ServiceCommand.api.get('/health');
      const servicesData = healthResponse.services || {};
      
      const services = [];
      for (const [name, data] of Object.entries(servicesData)) {
        const serviceData = data as any;
        services.push({
          name,
          port: ServiceConfig.getServicePort(name),
          status: serviceData.status === 'healthy' ? 'running' : 'stopped',
          health: serviceData.status || 'unknown',
          uptime: serviceData.uptime || 'N/A'
        });
      }
      
      return services;
    } catch (error) {
      // Fallback to service configuration
      return ServiceConfig.getAllServices().map(service => ({
        name: service.name,
        port: service.port,
        status: 'unknown',
        health: 'unknown'
      }));
    }
  }

  private static async checkServiceHealth(serviceName: string): Promise<string> {
    try {
      const service = ServiceConfig.getService(serviceName);
      if (!service) return 'unknown';
      
      const response = await axios.get(`http://localhost:${service.port}/api/health`, {
        timeout: 5000
      });
      
      return response.status === 200 ? 'healthy' : 'degraded';
    } catch (error) {
      return 'unhealthy';
    }
  }
}
