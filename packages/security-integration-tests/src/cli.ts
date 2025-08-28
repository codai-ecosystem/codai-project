#!/usr/bin/env node

/**
 * Security Integration Testing CLI
 * Command-line interface for Essential CodAI Services security testing
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { SecurityTestRunner } from './test-runner';
import { SecurityReportGenerator } from './report-generator';
import { SecurityMonitor } from './monitor';
import { getSecurityTestConfig, ENV_CONFIG } from './config';
import { ESSENTIAL_CODAI_SERVICES } from './types';

const program = new Command();

program
  .name('security-test')
  .description('Comprehensive security testing suite for Essential CodAI Services')
  .version('1.0.0');

/**
 * Run all security tests
 */
program
  .command('run-all-tests')
  .description('Execute all security test suites across all services')
  .option('--parallel', 'Run tests in parallel', false)
  .option('--timeout <timeout>', 'Test timeout in milliseconds', '30000')
  .option('--retries <retries>', 'Number of retries for failed tests', '3')
  .option('--output <dir>', 'Output directory for reports', './reports')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('🔐 Starting Comprehensive Security Integration Tests'));
      console.log(chalk.yellow('=========================================================\n'));

      const runner = new SecurityTestRunner();
      const executions = await runner.runAllTests();

      console.log(chalk.green('\n✅ All security tests completed successfully!'));

      // Generate reports
      if (options.output) {
        const reportGenerator = new SecurityReportGenerator();
        await reportGenerator.generateReport(executions, options.output);
        console.log(chalk.blue(`📊 Reports generated in: ${options.output}`));
      }

    } catch (error) {
      console.error(chalk.red('❌ Security testing failed:'), error);
      process.exit(1);
    }
  });

/**
 * Test specific category
 */
program
  .command('test <category>')
  .description('Run tests for a specific security category')
  .argument('<category>', 'Security test category (rate-limiting, authentication, etc.)')
  .option('--service <service>', 'Test specific service only')
  .option('--verbose', 'Enable verbose output', false)
  .action(async (category, options) => {
    try {
      console.log(chalk.cyan(`🧪 Running ${category} security tests`));

      const runner = new SecurityTestRunner();
      const config = getSecurityTestConfig();

      // Find test suite for category
      const suite = config.testSuites.find(s => s.category === category);
      if (!suite) {
        console.error(chalk.red(`❌ Unknown test category: ${category}`));
        console.log(chalk.yellow('Available categories:'));
        config.testSuites.forEach(s => {
          console.log(chalk.white(`  - ${s.category}: ${s.description}`));
        });
        process.exit(1);
      }

      const executions = await runner.runTestSuite(suite);

      console.log(chalk.green(`\n✅ ${category} tests completed!`));
      console.log(chalk.white(`Executed ${executions.length} test scenarios`));

    } catch (error) {
      console.error(chalk.red(`❌ ${category} testing failed:`), error);
      process.exit(1);
    }
  });

/**
 * Generate security report
 */
program
  .command('generate-report')
  .description('Generate security test report from previous results')
  .option('--input <file>', 'Input results file (JSON)', './reports/test-results.json')
  .option('--output <dir>', 'Output directory for reports', './reports')
  .option('--format <format>', 'Report format (html,json,pdf)', 'html')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('📊 Generating Security Test Report'));

      const reportGenerator = new SecurityReportGenerator();
      await reportGenerator.generateReportFromFile(options.input, options.output, options.format);

      console.log(chalk.green(`✅ Report generated in: ${options.output}`));

    } catch (error) {
      console.error(chalk.red('❌ Report generation failed:'), error);
      process.exit(1);
    }
  });

/**
 * Setup security testing environment
 */
program
  .command('setup')
  .description('Setup security testing environment and dependencies')
  .option('--install-tools', 'Install external security tools', false)
  .action(async (options) => {
    try {
      console.log(chalk.cyan('⚙️ Setting up Security Testing Environment'));

      // Create directories
      console.log(chalk.blue('📁 Creating directories...'));
      const fs = await import('fs');
      const path = await import('path');

      const dirs = ['./reports', './logs', './tmp', './evidence'];
      for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(chalk.green(`  ✅ Created: ${dir}`));
        }
      }

      // Create configuration files
      console.log(chalk.blue('📄 Creating configuration files...'));

      const envTemplate = `# Security Testing Configuration
NODE_ENV=development
SECURITY_TEST_TIMEOUT=30000
SECURITY_TEST_RETRIES=3
SECURITY_TEST_PARALLEL=true

# Services Configuration
CODAI_AUTH_API_URL=http://localhost:8100
CODAI_GATEWAY_API_URL=http://localhost:8010
CODAI_HUB_API_URL=http://localhost:8110
CODAI_MEMORAI_MCP_URL=http://localhost:4950
CODAI_CBD_DATABASE_URL=http://localhost:8180
CODAI_MEMORAI_FRONTEND_URL=http://localhost:8006

# Authentication Configuration
TEST_USERNAME=test-admin
TEST_PASSWORD=test-password
TEST_API_KEY=dev-api-key-2025
TEST_JWT_TOKEN=dev-jwt-token

# Reporting Configuration
SECURITY_TEST_OUTPUT_DIR=./reports
SECURITY_REPORT_FORMAT=html,json

# Monitoring Configuration
SECURITY_WEBHOOK_URL=http://localhost:4350/webhook/security
SECURITY_WEBHOOK_TOKEN=dev-token
SECURITY_DASHBOARD_URL=http://localhost:4350/security-dashboard
SLACK_SECURITY_CHANNEL=#security-alerts
`;

      fs.writeFileSync('.env.security-test', envTemplate);
      console.log(chalk.green('  ✅ Created: .env.security-test'));

      console.log(chalk.green('\n✅ Security testing environment setup complete!'));
      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log(chalk.white('  1. Copy .env.security-test to .env and customize settings'));
      console.log(chalk.white('  2. Ensure all Essential CodAI Services are running'));
      console.log(chalk.white('  3. Run: npm run test:security'));

    } catch (error) {
      console.error(chalk.red('❌ Setup failed:'), error);
      process.exit(1);
    }
  });

/**
 * Monitor security test results
 */
program
  .command('monitor')
  .description('Start security monitoring dashboard')
  .option('--port <port>', 'Dashboard port', '4444')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('📊 Starting Security Monitoring Dashboard'));

      const monitor = new SecurityMonitor();
      await monitor.startDashboard(parseInt(options.port));

      console.log(chalk.green(`✅ Dashboard running on http://localhost:${options.port}`));

    } catch (error) {
      console.error(chalk.red('❌ Monitor startup failed:'), error);
      process.exit(1);
    }
  });

/**
 * List available services and test suites
 */
program
  .command('list')
  .description('List available services and test suites')
  .option('--services', 'List Essential CodAI Services', false)
  .option('--suites', 'List test suites', false)
  .action((options) => {
    const config = getSecurityTestConfig();

    if (options.services || (!options.services && !options.suites)) {
      console.log(chalk.cyan('\n🏢 Essential CodAI Services:'));
      ESSENTIAL_CODAI_SERVICES.forEach(service => {
        console.log(chalk.blue(`\n  📍 ${service.name}`));
        console.log(chalk.white(`     Port: ${service.port}`));
        console.log(chalk.white(`     Base URL: ${service.baseUrl}`));
        console.log(chalk.white(`     Health: ${service.healthEndpoint}`));
        console.log(chalk.white(`     Auth Required: ${service.authRequired ? 'Yes' : 'No'}`));
        console.log(chalk.white(`     Rate Limit: ${service.rateLimit.maxRequests}/${service.rateLimit.windowMs}ms`));
      });
    }

    if (options.suites || (!options.services && !options.suites)) {
      console.log(chalk.cyan('\n🧪 Security Test Suites:'));
      config.testSuites.forEach(suite => {
        console.log(chalk.blue(`\n  🧩 ${suite.name}`));
        console.log(chalk.white(`     Category: ${suite.category}`));
        console.log(chalk.white(`     Description: ${suite.description}`));
        console.log(chalk.white(`     Parallel: ${suite.parallel ? 'Yes' : 'No'}`));
        console.log(chalk.white(`     Timeout: ${suite.timeout}ms`));
      });
    }
  });

/**
 * Health check for all services
 */
program
  .command('health')
  .description('Check health of all Essential CodAI Services')
  .option('--verbose', 'Show detailed health information', false)
  .action(async (options) => {
    try {
      console.log(chalk.cyan('🏥 Essential CodAI Services Health Check'));
      console.log(chalk.yellow('==========================================\n'));

      const axios = (await import('axios')).default;
      const results: Array<{ service: string, status: string, responseTime: number }> = [];

      for (const service of ESSENTIAL_CODAI_SERVICES) {
        const startTime = Date.now();

        try {
          const response = await axios.get(
            `${service.baseUrl}${service.healthEndpoint}`,
            { timeout: 10000 }
          );

          const responseTime = Date.now() - startTime;
          results.push({ service: service.name, status: 'HEALTHY', responseTime });

          console.log(chalk.green(`✅ ${service.name} (${service.port}): HEALTHY (${responseTime}ms)`));

          if (options.verbose && response.data) {
            console.log(chalk.gray(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`));
          }

        } catch (error) {
          const responseTime = Date.now() - startTime;
          results.push({ service: service.name, status: 'FAILED', responseTime });

          console.log(chalk.red(`❌ ${service.name} (${service.port}): FAILED (${responseTime}ms)`));

          if (options.verbose) {
            console.log(chalk.gray(`   Error: ${error}`));
          }
        }
      }

      // Summary
      const healthy = results.filter(r => r.status === 'HEALTHY').length;
      const total = results.length;
      const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

      console.log(chalk.blue(`\n📊 Health Summary:`));
      console.log(chalk.white(`   Services: ${healthy}/${total} healthy`));
      console.log(chalk.white(`   Average Response Time: ${Math.round(averageResponseTime)}ms`));

      if (healthy === total) {
        console.log(chalk.green('\n🎉 All services are healthy! Ready for security testing.'));
      } else {
        console.log(chalk.yellow('\n⚠️ Some services are not healthy. Security testing may be limited.'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Health check failed:'), error);
      process.exit(1);
    }
  });

/**
 * Configuration validation
 */
program
  .command('config')
  .description('Show current security testing configuration')
  .action(() => {
    console.log(chalk.cyan('⚙️ Security Testing Configuration'));
    console.log(chalk.yellow('===================================\n'));

    console.log(chalk.blue('Environment:'));
    console.log(chalk.white(`  NODE_ENV: ${ENV_CONFIG.NODE_ENV}`));
    console.log(chalk.white(`  Test Timeout: ${ENV_CONFIG.SECURITY_TEST_TIMEOUT}ms`));
    console.log(chalk.white(`  Test Retries: ${ENV_CONFIG.SECURITY_TEST_RETRIES}`));
    console.log(chalk.white(`  Parallel Testing: ${ENV_CONFIG.SECURITY_TEST_PARALLEL}`));

    console.log(chalk.blue('\nServices:'));
    console.log(chalk.white(`  Auth API: ${ENV_CONFIG.CODAI_AUTH_API_URL}`));
    console.log(chalk.white(`  Gateway API: ${ENV_CONFIG.CODAI_GATEWAY_API_URL}`));
    console.log(chalk.white(`  Hub API: ${ENV_CONFIG.CODAI_HUB_API_URL}`));
    console.log(chalk.white(`  MemorAI MCP: ${ENV_CONFIG.CODAI_MEMORAI_MCP_URL}`));
    console.log(chalk.white(`  CBD Database: ${ENV_CONFIG.CODAI_CBD_DATABASE_URL}`));
    console.log(chalk.white(`  MemorAI Frontend: ${ENV_CONFIG.CODAI_MEMORAI_FRONTEND_URL}`));

    console.log(chalk.blue('\nReporting:'));
    console.log(chalk.white(`  Output Directory: ${ENV_CONFIG.SECURITY_TEST_OUTPUT_DIR}`));
    console.log(chalk.white(`  Report Format: ${ENV_CONFIG.SECURITY_REPORT_FORMAT}`));

    console.log(chalk.blue('\nMonitoring:'));
    console.log(chalk.white(`  Webhook URL: ${ENV_CONFIG.SECURITY_WEBHOOK_URL}`));
    console.log(chalk.white(`  Dashboard URL: ${ENV_CONFIG.SECURITY_DASHBOARD_URL}`));
  });

// Error handling
program.configureOutput({
  outputError: (str, write) => write(chalk.red(str))
});

// Parse command line arguments
program.parse();

export default program;