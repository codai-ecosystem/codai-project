#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { SecurityManager } from './security-manager';
import { VulnerabilityScanner } from './vulnerability-scanner';
import { securityConfig, serviceSecurityConfig } from './config';
import { ESSENTIAL_CODAI_SECURITY_PROFILES } from './types';

const program = new Command();

program
  .name('codai-security')
  .description('CodAI Security Measures CLI Tool')
  .version('1.0.0');

// Security scan command
program
  .command('scan')
  .description('Perform vulnerability scan')
  .option('-t, --type <type>', 'Scan type (all, npm, snyk)', 'all')
  .option('-o, --output <file>', 'Output file for results')
  .action(async (options) => {
    console.log(chalk.cyan('🔍 Starting security vulnerability scan...'));

    try {
      const scanner = new VulnerabilityScanner(securityConfig.vulnerability);
      const results = await scanner.performScan();

      console.log(chalk.green(`✅ Scan completed: ${results.vulnerabilities.length} vulnerabilities found`));
      console.log(chalk.yellow(`   Critical: ${results.summary.critical}`));
      console.log(chalk.yellow(`   High: ${results.summary.high}`));
      console.log(chalk.yellow(`   Medium: ${results.summary.medium}`));
      console.log(chalk.yellow(`   Low: ${results.summary.low}`));

      if (results.recommendations.length > 0) {
        console.log(chalk.blue('\n📝 Recommendations:'));
        results.recommendations.forEach(rec => console.log(`   ${rec}`));
      }

      if (options.output) {
        const fs = require('fs');
        fs.writeFileSync(options.output, JSON.stringify(results, null, 2));
        console.log(chalk.green(`📄 Results saved to: ${options.output}`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Scan failed:'), error);
      process.exit(1);
    }
  });

// Security status command
program
  .command('status')
  .description('Check security status of all services')
  .action(async () => {
    console.log(chalk.cyan('🛡️ CodAI Security Status Report'));
    console.log(chalk.gray('='.repeat(50)));

    const manager = new SecurityManager(securityConfig);
    const status = manager.getSecurityStatus();

    console.log(`Status: ${status.enabled ? chalk.green('ENABLED') : chalk.red('DISABLED')}`);
    console.log(`Features: ${status.features.length}`);

    status.features.forEach(feature => {
      console.log(`  ✅ ${feature}`);
    });

    // Check service-specific configurations
    console.log(chalk.cyan('\n📊 Service Security Profiles:'));
    ESSENTIAL_CODAI_SECURITY_PROFILES.forEach(profile => {
      console.log(`  🔧 ${profile.serviceName} (${profile.serviceId})`);
      console.log(`     Port: ${profile.port}`);
      console.log(`     Rate Limiting: ${profile.securityConfig.rateLimit.enabled ? 'ON' : 'OFF'}`);
      console.log(`     CORS: ${profile.securityConfig.cors.enabled ? 'ON' : 'OFF'}`);
      console.log(`     Security Headers: ${profile.securityConfig.headers.enabled ? 'ON' : 'OFF'}`);
    });
  });

// Security health command
program
  .command('health')
  .description('Check security health of services')
  .option('-s, --service <service>', 'Specific service ID')
  .action(async (options) => {
    console.log(chalk.cyan('🏥 Security Health Check'));
    console.log(chalk.gray('='.repeat(30)));

    try {
      const manager = new SecurityManager(securityConfig);

      // This would typically make HTTP requests to running services
      // For now, we'll show the configuration status

      if (options.service) {
        const profile = serviceSecurityConfig.getSecurityProfile(options.service);
        if (profile) {
          console.log(`Service: ${chalk.blue(profile.serviceName)}`);
          console.log(`Status: ${chalk.green('CONFIGURED')}`);
        } else {
          console.log(chalk.red(`Service ${options.service} not found`));
        }
      } else {
        console.log('All Essential CodAI Services:');
        ESSENTIAL_CODAI_SECURITY_PROFILES.forEach(profile => {
          console.log(`  ${chalk.blue(profile.serviceName)}: ${chalk.green('CONFIGURED')}`);
        });
      }
    } catch (error) {
      console.error(chalk.red('Health check failed:'), error);
      process.exit(1);
    }
  });

// Monitor command (starts security monitoring)
program
  .command('monitor')
  .description('Start security monitoring dashboard')
  .option('-p, --port <port>', 'Dashboard port', '8080')
  .action(async (options) => {
    console.log(chalk.cyan(`🖥️ Starting security monitoring dashboard on port ${options.port}...`));

    try {
      const fastify = require('fastify')({ logger: true });
      const manager = new SecurityManager(securityConfig);

      await manager.initializeSecurity(fastify, 'security-monitor');

      await fastify.listen({ port: parseInt(options.port), host: '0.0.0.0' });

      console.log(chalk.green(`✅ Security dashboard running on http://localhost:${options.port}`));
      console.log(chalk.blue(`   Dashboard: http://localhost:${options.port}/security/dashboard`));
      console.log(chalk.blue(`   Metrics: http://localhost:${options.port}/security/metrics`));
      console.log(chalk.blue(`   Events: http://localhost:${options.port}/security/events`));

      console.log(chalk.yellow('\nPress Ctrl+C to stop monitoring'));

      // Handle shutdown gracefully
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n🛑 Shutting down security monitoring...'));
        await fastify.close();
        await manager.cleanup();
        console.log(chalk.green('✅ Security monitoring stopped'));
        process.exit(0);
      });

    } catch (error) {
      console.error(chalk.red('❌ Failed to start monitoring:'), error);
      process.exit(1);
    }
  });

// Configuration command
program
  .command('config')
  .description('Show security configuration')
  .option('-s, --service <service>', 'Show service-specific config')
  .option('-e, --env', 'Show environment variables')
  .action((options) => {
    if (options.env) {
      console.log(chalk.cyan('🔧 Security Environment Variables:'));
      const { environmentVariables } = require('./config');
      Object.entries(environmentVariables).forEach(([key, description]) => {
        const value = process.env[key];
        console.log(`  ${chalk.blue(key)}: ${value || chalk.gray('(not set)')}`);
        console.log(`     ${chalk.gray(description)}`);
      });
      return;
    }

    if (options.service) {
      const profile = serviceSecurityConfig.getSecurityProfile(options.service);
      if (profile) {
        console.log(chalk.cyan(`🔧 ${profile.serviceName} Security Configuration:`));
        console.log(JSON.stringify(profile.securityConfig, null, 2));
      } else {
        console.log(chalk.red(`Service ${options.service} not found`));
      }
      return;
    }

    console.log(chalk.cyan('🔧 Global Security Configuration:'));
    console.log(JSON.stringify(securityConfig, null, 2));
  });

// List services command
program
  .command('list')
  .description('List all Essential CodAI Services with security profiles')
  .action(() => {
    console.log(chalk.cyan('📋 Essential CodAI Services with Security Profiles:'));
    console.log(chalk.gray('='.repeat(60)));

    ESSENTIAL_CODAI_SECURITY_PROFILES.forEach((profile, index) => {
      console.log(`${index + 1}. ${chalk.blue(profile.serviceName)}`);
      console.log(`   Service ID: ${profile.serviceId}`);
      console.log(`   Port: ${profile.port}`);
      console.log(`   Middleware: ${profile.customMiddleware.join(', ')}`);
      console.log('');
    });
  });

// Test security command
program
  .command('test')
  .description('Test security measures')
  .option('-u, --url <url>', 'URL to test', 'http://localhost:8100')
  .action(async (options) => {
    console.log(chalk.cyan(`🧪 Testing security measures for: ${options.url}`));

    try {
      const axios = require('axios');

      // Test rate limiting
      console.log('Testing rate limiting...');
      const requests = Array(10).fill().map(() => axios.get(options.url + '/health').catch(e => e.response));
      const responses = await Promise.all(requests);

      const rateLimited = responses.filter(r => r?.status === 429);
      console.log(`  Rate limited responses: ${rateLimited.length}/10`);

      // Test security headers
      console.log('Testing security headers...');
      try {
        const response = await axios.get(options.url + '/health');
        const headers = response.headers;

        const securityHeaders = [
          'x-content-type-options',
          'x-frame-options',
          'x-xss-protection',
          'strict-transport-security',
          'content-security-policy'
        ];

        securityHeaders.forEach(header => {
          const present = headers[header] ? chalk.green('✅') : chalk.red('❌');
          console.log(`  ${header}: ${present}`);
        });
      } catch (error) {
        console.log(chalk.red('  Failed to test headers'));
      }

      console.log(chalk.green('✅ Security testing completed'));
    } catch (error) {
      console.error(chalk.red('❌ Security testing failed:'), error);
    }
  });

program.parse();