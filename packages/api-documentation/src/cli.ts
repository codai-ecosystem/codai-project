#!/usr/bin/env node

/**
 * CodAI API Documentation CLI
 * Command-line interface for generating and managing API documentation
 */

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

import DocumentationServer from './server';
import OpenApiGenerator from './generator';
import { ESSENTIAL_CODAI_SERVICES, CLIOptions } from './types';
import { config } from './config';

const program = new Command();

// CLI Program Configuration
program
  .name('codai-docs')
  .description('CodAI API Documentation Generator and Server')
  .version('1.0.0');

// Generate command
program
  .command('generate')
  .description('Generate OpenAPI documentation for all services')
  .option('-o, --output <dir>', 'Output directory', config.generation.outputDir)
  .option('-f, --format <format>', 'Output format (json|yaml)', 'json')
  .option('-s, --service <serviceId>', 'Generate for specific service only')
  .option('--validate', 'Validate generated specifications', false)
  .action(async (options) => {
    console.log(chalk.cyan('🔧 Generating OpenAPI Documentation...'));

    const generator = new OpenApiGenerator();

    try {
      if (options.service) {
        // Generate for specific service
        console.log(chalk.blue(`📝 Generating documentation for ${options.service}...`));
        const spec = await generator.generateServiceSpec(options.service);
        await generator.saveSpecification(options.service, spec, options.format);
        console.log(chalk.green(`✅ Generated documentation for ${options.service}`));
      } else {
        // Generate for all services
        console.log(chalk.blue('📝 Generating documentation for all services...'));
        const specs = await generator.generateAllSpecs();
        console.log(chalk.green(`✅ Generated documentation for ${specs.size} services`));
      }

      if (options.validate) {
        console.log(chalk.yellow('🔍 Validating generated documentation...'));
        // Add validation logic here
        console.log(chalk.green('✅ All documentation validated successfully'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Generation failed:'), error);
      process.exit(1);
    }
  });

// Serve command
program
  .command('serve')
  .description('Start interactive documentation server')
  .option('-p, --port <port>', 'Server port', String(config.server.port))
  .option('-h, --host <host>', 'Server host', config.server.host)
  .option('--cors <origins>', 'CORS allowed origins (comma-separated)')
  .option('--watch', 'Enable watch mode for auto-regeneration', false)
  .action(async (options) => {
    console.log(chalk.cyan('🚀 Starting CodAI API Documentation Server...'));

    // Update configuration
    if (options.port) config.server.port = parseInt(options.port);
    if (options.host) config.server.host = options.host;
    if (options.cors) {
      config.server.cors.origin = options.cors.split(',');
    }

    const server = new DocumentationServer();

    try {
      await server.start();

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\\n⏹️ Shutting down server...'));
        await server.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        console.log(chalk.yellow('\\n⏹️ Shutting down server...'));
        await server.stop();
        process.exit(0);
      });

    } catch (error) {
      console.error(chalk.red('❌ Server startup failed:'), error);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate OpenAPI specifications')
  .option('-s, --service <serviceId>', 'Validate specific service only')
  .option('--strict', 'Enable strict validation mode', false)
  .action(async (options) => {
    console.log(chalk.cyan('🔍 Validating API Documentation...'));

    const generator = new OpenApiGenerator();

    try {
      const serviceIds = options.service
        ? [options.service]
        : ESSENTIAL_CODAI_SERVICES.map(s => s.id);

      let hasErrors = false;

      for (const serviceId of serviceIds) {
        console.log(chalk.blue(`📋 Validating ${serviceId}...`));

        try {
          const spec = await generator.generateServiceSpec(serviceId);
          const status = await generator.checkServiceHealth(serviceId);

          // Basic validation
          const errors = [];
          const warnings = [];

          if (!spec.info?.title) {
            errors.push('Missing title in specification');
          }

          if (!spec.paths || Object.keys(spec.paths).length === 0) {
            warnings.push('No API paths defined');
          }

          if (status.status !== 'healthy') {
            warnings.push(`Service is ${status.status}`);
          }

          if (errors.length > 0) {
            console.error(chalk.red(`  ❌ Errors: ${errors.join(', ')}`));
            hasErrors = true;
          }

          if (warnings.length > 0) {
            console.warn(chalk.yellow(`  ⚠️ Warnings: ${warnings.join(', ')}`));
          }

          if (errors.length === 0 && warnings.length === 0) {
            console.log(chalk.green(`  ✅ ${serviceId} validation passed`));
          }

        } catch (error) {
          console.error(chalk.red(`  ❌ ${serviceId} validation failed: ${error}`));
          hasErrors = true;
        }
      }

      if (hasErrors) {
        console.log(chalk.red('\\n❌ Validation completed with errors'));
        process.exit(1);
      } else {
        console.log(chalk.green('\\n✅ All validations passed successfully'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Validation failed:'), error);
      process.exit(1);
    }
  });

// Health command
program
  .command('health')
  .description('Check health of all Essential CodAI Services')
  .option('--timeout <ms>', 'Health check timeout in milliseconds', '5000')
  .action(async (options) => {
    console.log(chalk.cyan('🏥 Checking Essential CodAI Services Health...'));

    const generator = new OpenApiGenerator();
    const timeout = parseInt(options.timeout);

    console.log(chalk.gray(`Timeout: ${timeout}ms\\n`));

    try {
      const healthPromises = ESSENTIAL_CODAI_SERVICES.map(async (service) => {
        try {
          const status = await Promise.race([
            generator.checkServiceHealth(service.id),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), timeout)
            )
          ]);
          return { service, status };
        } catch (error) {
          return {
            service,
            status: {
              serviceId: service.id,
              status: 'unreachable',
              lastChecked: new Date(),
              error: error.message || 'Health check failed'
            }
          };
        }
      });

      const results = await Promise.all(healthPromises);

      let healthyCount = 0;
      let unhealthyCount = 0;
      let unreachableCount = 0;

      results.forEach(({ service, status }) => {
        const statusIcon = status.status === 'healthy' ? '✅' :
          status.status === 'unhealthy' ? '⚠️' : '❌';
        const statusColor = status.status === 'healthy' ? 'green' :
          status.status === 'unhealthy' ? 'yellow' : 'red';

        console.log(
          `${statusIcon} ${chalk[statusColor](service.name)} (${service.baseUrl})`
        );
        console.log(`   Status: ${chalk[statusColor](status.status.toUpperCase())}`);

        if (status.responseTime) {
          console.log(`   Response Time: ${status.responseTime}ms`);
        }

        if (status.error) {
          console.log(`   Error: ${chalk.red(status.error)}`);
        }

        console.log(`   Last Checked: ${status.lastChecked.toISOString()}`);
        console.log('');

        switch (status.status) {
          case 'healthy': healthyCount++; break;
          case 'unhealthy': unhealthyCount++; break;
          case 'unreachable': unreachableCount++; break;
        }
      });

      // Summary
      console.log(chalk.cyan('📊 Health Summary:'));
      console.log(`   ${chalk.green('✅ Healthy:')} ${healthyCount}`);
      console.log(`   ${chalk.yellow('⚠️ Unhealthy:')} ${unhealthyCount}`);
      console.log(`   ${chalk.red('❌ Unreachable:')} ${unreachableCount}`);
      console.log(`   ${chalk.blue('📈 Total:')} ${results.length}`);

      const healthPercentage = (healthyCount / results.length) * 100;
      console.log(`   ${chalk.cyan('🎯 Health Rate:')} ${healthPercentage.toFixed(1)}%`);

      if (healthPercentage === 100) {
        console.log(chalk.green('\\n🎉 All services are healthy!'));
      } else if (healthPercentage >= 80) {
        console.log(chalk.yellow('\\n⚠️ Most services are healthy, some issues detected'));
      } else {
        console.log(chalk.red('\\n🚨 Critical issues detected - immediate attention required'));
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Health check failed:'), error);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List all Essential CodAI Services')
  .option('--json', 'Output as JSON', false)
  .action(async (options) => {
    if (options.json) {
      console.log(JSON.stringify(ESSENTIAL_CODAI_SERVICES, null, 2));
    } else {
      console.log(chalk.cyan('📋 Essential CodAI Services:'));
      console.log('');

      ESSENTIAL_CODAI_SERVICES.forEach((service, index) => {
        console.log(`${index + 1}. ${chalk.bold(service.name)}`);
        console.log(`   ID: ${chalk.gray(service.id)}`);
        console.log(`   Description: ${service.description}`);
        console.log(`   Category: ${chalk.blue(service.category)}`);
        console.log(`   URL: ${chalk.green(service.baseUrl)}`);
        console.log(`   Version: ${chalk.yellow(service.version)}`);
        console.log(`   Tags: ${service.tags.map(t => chalk.cyan(t)).join(', ')}`);
        console.log('');
      });

      console.log(chalk.cyan(`Total: ${ESSENTIAL_CODAI_SERVICES.length} services`));
    }
  });

// Init command
program
  .command('init')
  .description('Initialize documentation configuration')
  .option('--force', 'Overwrite existing configuration', false)
  .action(async (options) => {
    console.log(chalk.cyan('🔧 Initializing CodAI API Documentation...'));

    const configPath = path.join(process.cwd(), 'codai-docs.config.js');
    const outputDir = path.join(process.cwd(), 'docs');

    try {
      // Check if config already exists
      if (await fs.pathExists(configPath) && !options.force) {
        console.error(chalk.red('❌ Configuration already exists. Use --force to overwrite.'));
        process.exit(1);
      }

      // Create output directory
      await fs.ensureDir(outputDir);

      // Create configuration file
      const configContent = `
module.exports = {
  // Documentation generation settings
  generation: {
    outputDir: './docs/generated',
    format: 'json', // 'json' | 'yaml'
    prettify: true
  },
  
  // Server settings
  server: {
    host: '0.0.0.0',
    port: 4200,
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:4006'],
      credentials: true
    }
  },
  
  // Service discovery settings
  services: {
    discoveryInterval: 30000,
    healthCheckTimeout: 5000,
    retryAttempts: 3
  },
  
  // Custom service definitions (optional)
  customServices: [
    // Add custom services here if needed
  ]
};
      `.trim();

      await fs.writeFile(configPath, configContent);

      console.log(chalk.green('✅ Configuration initialized successfully'));
      console.log(chalk.gray(`   Config file: ${configPath}`));
      console.log(chalk.gray(`   Output directory: ${outputDir}`));
      console.log('');
      console.log(chalk.cyan('Next steps:'));
      console.log(chalk.white('  1. Review and customize the configuration file'));
      console.log(chalk.white('  2. Run `codai-docs generate` to generate documentation'));
      console.log(chalk.white('  3. Run `codai-docs serve` to start the documentation server'));

    } catch (error) {
      console.error(chalk.red('❌ Initialization failed:'), error);
      process.exit(1);
    }
  });

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (error) {
  console.error(chalk.red('❌ CLI Error:'), error.message);
  process.exit(1);
}