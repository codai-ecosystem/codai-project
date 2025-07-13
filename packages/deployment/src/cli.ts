#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { DeploymentOrchestrator } from './orchestrator';
import { KubernetesProvider } from './providers/kubernetes';
import { VercelProvider } from './providers/vercel';
import { AWSProvider } from './providers/aws';

const program = new Command();

program
    .name('codai-deploy')
    .description('CODAI Ecosystem Production Deployment CLI')
    .version('1.0.0');

// Deploy command
program
    .command('deploy')
    .description('Deploy CODAI ecosystem to production')
    .option('-e, --environment <env>', 'Target environment', 'production')
    .option('-s, --services <services>', 'Comma-separated list of services to deploy')
    .option('--dry-run', 'Perform a dry run without actual deployment')
    .option('--parallel', 'Deploy services in parallel', true)
    .action(async (options) => {
        const spinner = ora('Initializing deployment...').start();

        try {
            const orchestrator = new DeploymentOrchestrator({
                environment: options.environment,
                providers: {
                    kubernetes: new KubernetesProvider({ name: 'kubernetes', environment: options.environment, platform: 'kubernetes' }),
                    vercel: new VercelProvider({ name: 'vercel', environment: options.environment, platform: 'vercel' }),
                    aws: new AWSProvider({ name: 'aws', environment: options.environment, platform: 'aws' })
                }
            });

            const services = options.services ? options.services.split(',') : 'all';

            spinner.text = 'Starting deployment process...';

            const result = await orchestrator.deploy({
                services,
                environment: options.environment,
                dryRun: options.dryRun,
                parallel: options.parallel
            });

            spinner.succeed(chalk.green('Deployment completed successfully!'));

            console.log(chalk.cyan('\\n📊 Deployment Summary:'));
            console.log(`✅ Services deployed: ${result.deployed.length}`);
            console.log(`⚠️  Services with warnings: ${result.warnings.length}`);
            console.log(`❌ Failed deployments: ${result.failed.length}`);
            console.log(`⏱️  Total time: ${result.duration}ms`);

            if (result.failed.length > 0) {
                console.log(chalk.red('\\n❌ Failed Services:'));
                result.failed.forEach(failure => {
                    console.log(`  • ${failure.service}: ${failure.error}`);
                });
                process.exit(1);
            }

        } catch (error) {
            spinner.fail(chalk.red('Deployment failed!'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    });

// Status command
program
    .command('status')
    .description('Check deployment status')
    .option('-e, --environment <env>', 'Target environment', 'production')
    .action(async (options) => {
        const spinner = ora('Checking deployment status...').start();

        try {
            const orchestrator = new DeploymentOrchestrator({
                environment: options.environment,
                providers: {
                    kubernetes: new KubernetesProvider({ name: 'kubernetes', environment: options.environment, platform: 'kubernetes' }),
                    vercel: new VercelProvider({ name: 'vercel', environment: options.environment, platform: 'vercel' }),
                    aws: new AWSProvider({ name: 'aws', environment: options.environment, platform: 'aws' })
                }
            });

            const status = await orchestrator.getStatus(options.environment);

            spinner.succeed(chalk.green('Status check completed!'));

            console.log(chalk.cyan('\\n🔍 Deployment Status:'));
            console.log(`Environment: ${chalk.yellow(options.environment)}`);
            console.log(`Overall Health: ${status.healthy ? chalk.green('✅ Healthy') : chalk.red('❌ Unhealthy')}`);
            console.log(`Services Running: ${status.services.running}/${status.services.total}`);
            console.log(`Last Deployment: ${new Date(status.lastDeployment).toLocaleString()}`);

            console.log(chalk.cyan('\\n📋 Services:'));
            status.services.details.forEach((service: any) => {
                const statusIcon = service.status === 'running' ? '✅' : service.status === 'deploying' ? '🔄' : '❌';
                console.log(`  ${statusIcon} ${service.name}: ${service.status} (${service.replicas} replicas)`);
            });

        } catch (error) {
            spinner.fail(chalk.red('Status check failed!'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    });

// Rollback command
program
    .command('rollback')
    .description('Rollback to previous deployment')
    .option('-e, --environment <env>', 'Target environment', 'production')
    .option('-v, --version <version>', 'Specific version to rollback to')
    .action(async (options) => {
        const spinner = ora('Initiating rollback...').start();

        try {
            const orchestrator = new DeploymentOrchestrator({
                environment: options.environment,
                providers: {
                    kubernetes: new KubernetesProvider({ name: 'kubernetes', environment: options.environment, platform: 'kubernetes' }),
                    vercel: new VercelProvider({ name: 'vercel', environment: options.environment, platform: 'vercel' }),
                    aws: new AWSProvider({ name: 'aws', environment: options.environment, platform: 'aws' })
                }
            });

            const result = await orchestrator.rollback({
                environment: options.environment,
                version: options.version
            });

            spinner.succeed(chalk.green('Rollback completed successfully!'));

            console.log(chalk.cyan('\\n↩️  Rollback Summary:'));
            console.log(`Previous version: ${result.previousVersion}`);
            console.log(`Rolled back to: ${result.rolledBackTo}`);
            console.log(`Services affected: ${result.servicesAffected}`);

        } catch (error) {
            spinner.fail(chalk.red('Rollback failed!'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    });

// Scale command
program
    .command('scale')
    .description('Scale services up or down')
    .argument('<service>', 'Service name to scale')
    .argument('<replicas>', 'Number of replicas')
    .option('-e, --environment <env>', 'Target environment', 'production')
    .action(async (service, replicas, options) => {
        const spinner = ora(`Scaling ${service} to ${replicas} replicas...`).start();

        try {
            const orchestrator = new DeploymentOrchestrator({
                environment: options.environment,
                providers: {
                    kubernetes: new KubernetesProvider({ name: 'kubernetes', environment: options.environment, platform: 'kubernetes' }),
                    vercel: new VercelProvider({ name: 'vercel', environment: options.environment, platform: 'vercel' }),
                    aws: new AWSProvider({ name: 'aws', environment: options.environment, platform: 'aws' })
                }
            });

            await orchestrator.scale({
                service,
                replicas: parseInt(replicas),
                environment: options.environment
            });

            spinner.succeed(chalk.green(`Successfully scaled ${service} to ${replicas} replicas!`));

        } catch (error) {
            spinner.fail(chalk.red('Scaling failed!'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    });

// Logs command
program
    .command('logs')
    .description('View service logs')
    .argument('<service>', 'Service name')
    .option('-e, --environment <env>', 'Target environment', 'production')
    .option('-f, --follow', 'Follow log output')
    .option('-t, --tail <lines>', 'Number of lines to show', '100')
    .action(async (service, options) => {
        try {
            const orchestrator = new DeploymentOrchestrator({
                environment: options.environment,
                providers: {
                    kubernetes: new KubernetesProvider({ name: 'kubernetes', environment: options.environment, platform: 'kubernetes' }),
                    vercel: new VercelProvider({ name: 'vercel', environment: options.environment, platform: 'vercel' }),
                    aws: new AWSProvider({ name: 'aws', environment: options.environment, platform: 'aws' })
                }
            });

            console.log(chalk.cyan(`📄 Logs for ${service} (last ${options.tail} lines):\\n`));

            await orchestrator.getLogs({
                service,
                environment: options.environment,
                follow: options.follow,
                tail: parseInt(options.tail)
            });

        } catch (error) {
            console.error(chalk.red('Failed to retrieve logs:'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    });

// Health check command
program
    .command('health')
    .description('Run comprehensive health checks')
    .option('-e, --environment <env>', 'Target environment', 'production')
    .option('--fix', 'Attempt to fix issues automatically')
    .action(async (options) => {
        const spinner = ora('Running health checks...').start();

        try {
            const orchestrator = new DeploymentOrchestrator({
                environment: options.environment,
                providers: {
                    kubernetes: new KubernetesProvider({ name: 'kubernetes', environment: options.environment, platform: 'kubernetes' }),
                    vercel: new VercelProvider({ name: 'vercel', environment: options.environment, platform: 'vercel' }),
                    aws: new AWSProvider({ name: 'aws', environment: options.environment, platform: 'aws' })
                }
            });

            const healthReport = await orchestrator.healthCheck({
                environment: options.environment,
                autoFix: options.fix
            });

            if (healthReport.overall === 'healthy') {
                spinner.succeed(chalk.green('All systems healthy!'));
            } else {
                spinner.warn(chalk.yellow('Issues detected!'));
            }

            console.log(chalk.cyan('\\n🏥 Health Report:'));
            console.log(`Overall Status: ${healthReport.overall === 'healthy' ? chalk.green('✅ Healthy') : chalk.red('❌ Unhealthy')}`);

            healthReport.checks.forEach((check: any) => {
                const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
                console.log(`  ${icon} ${check.name}: ${check.message}`);
            });

        } catch (error) {
            spinner.fail(chalk.red('Health check failed!'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    });

program.parse();
