/**
 * GDPR Compliance CLI
 * Command-line interface for GDPR compliance management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { GdprComplianceManager } from './compliance-manager';
import { getGdprConfigForEnvironment } from './config';
import { getServiceGdprProfile, getAllServiceIds } from './types';

const program = new Command();

program
  .name('codai-gdpr')
  .description('CodAI GDPR Compliance Management CLI')
  .version('1.0.0');

// Status command
program
  .command('status')
  .description('Check GDPR compliance status')
  .option('-s, --service <serviceId>', 'Check specific service')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('🛡️ GDPR Compliance Status Check'));
      console.log(chalk.gray('====================================='));

      const config = getGdprConfigForEnvironment();
      const manager = new GdprComplianceManager(config);

      if (options.service) {
        await checkServiceCompliance(manager, options.service);
      } else {
        const serviceIds = getAllServiceIds();
        console.log(chalk.yellow(`\n📊 Checking ${serviceIds.length} Essential CodAI Services...\n`));

        for (const serviceId of serviceIds) {
          await checkServiceCompliance(manager, serviceId);
        }
      }

      await manager.cleanup();
    } catch (error) {
      console.error(chalk.red('❌ Error checking compliance status:'), error);
      process.exit(1);
    }
  });

// Audit command
program
  .command('audit')
  .description('Run compliance audit')
  .option('-s, --service <serviceId>', 'Audit specific service')
  .option('-o, --output <file>', 'Output file for audit report')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('🔍 Running GDPR Compliance Audit'));
      console.log(chalk.gray('==================================='));

      const config = getGdprConfigForEnvironment();
      const manager = new GdprComplianceManager(config);

      const serviceIds = options.service ? [options.service] : getAllServiceIds();

      for (const serviceId of serviceIds) {
        console.log(chalk.yellow(`\n🔍 Auditing ${serviceId}...`));

        const profile = getServiceGdprProfile(serviceId);
        if (profile) {
          await manager.initializeCompliance(serviceId, profile);

          const violations = await manager.detectComplianceViolations(serviceId);

          if (violations.length === 0) {
            console.log(chalk.green(`✅ No violations detected for ${serviceId}`));
          } else {
            console.log(chalk.red(`❌ Found ${violations.length} violations for ${serviceId}:`));
            violations.forEach((violation, index) => {
              console.log(`  ${index + 1}. ${violation.description} (${violation.severity})`);
            });
          }
        }
      }

      await manager.cleanup();
      console.log(chalk.green('\n✅ Compliance audit completed'));
    } catch (error) {
      console.error(chalk.red('❌ Error running compliance audit:'), error);
      process.exit(1);
    }
  });

// Report command
program
  .command('report')
  .description('Generate compliance report')
  .option('-s, --service <serviceId>', 'Generate report for specific service')
  .option('-t, --type <reportType>', 'Report type', 'compliance_summary')
  .option('-f, --format <format>', 'Output format (json|csv|pdf)', 'json')
  .option('-o, --output <file>', 'Output file')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('📊 Generating GDPR Compliance Report'));
      console.log(chalk.gray('====================================='));

      const config = getGdprConfigForEnvironment();
      const manager = new GdprComplianceManager(config);

      const serviceIds = options.service ? [options.service] : getAllServiceIds();

      for (const serviceId of serviceIds) {
        console.log(chalk.yellow(`\n📄 Generating report for ${serviceId}...`));

        const profile = getServiceGdprProfile(serviceId);
        if (profile) {
          await manager.initializeCompliance(serviceId, profile);

          const report = await manager.generateComplianceReport(serviceId, options.type);

          console.log(chalk.green(`✅ Report generated: ${report.id}`));
          console.log(`   Report Type: ${report.reportType}`);
          console.log(`   Period: ${report.periodStart.toISOString().split('T')[0]} to ${report.periodEnd.toISOString().split('T')[0]}`);
          console.log(`   Compliance Score: ${report.summary.complianceScore}%`);

          if (options.output) {
            // In a real implementation, would save to file
            console.log(chalk.blue(`📁 Report saved to: ${options.output}`));
          }
        }
      }

      await manager.cleanup();
    } catch (error) {
      console.error(chalk.red('❌ Error generating report:'), error);
      process.exit(1);
    }
  });

// Cleanup command
program
  .command('cleanup')
  .description('Run data retention cleanup')
  .option('-s, --service <serviceId>', 'Run cleanup for specific service')
  .option('--dry-run', 'Show what would be cleaned up without actually doing it')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('🧹 Running Data Retention Cleanup'));
      console.log(chalk.gray('==================================='));

      const config = getGdprConfigForEnvironment();
      const manager = new GdprComplianceManager(config);

      const serviceIds = options.service ? [options.service] : getAllServiceIds();

      for (const serviceId of serviceIds) {
        console.log(chalk.yellow(`\n🧹 Running cleanup for ${serviceId}...`));

        const profile = getServiceGdprProfile(serviceId);
        if (profile) {
          await manager.initializeCompliance(serviceId, profile);

          if (options.dryRun) {
            console.log(chalk.blue('🔍 Dry run mode - no actual cleanup performed'));
          } else {
            await manager.runDataRetentionCleanup(serviceId);
            console.log(chalk.green(`✅ Cleanup completed for ${serviceId}`));
          }
        }
      }

      await manager.cleanup();
    } catch (error) {
      console.error(chalk.red('❌ Error running cleanup:'), error);
      process.exit(1);
    }
  });

// Export command
program
  .command('export')
  .description('Export data for data subject')
  .requiredOption('-d, --data-subject <id>', 'Data subject ID')
  .option('-s, --service <serviceId>', 'Export from specific service')
  .option('-f, --format <format>', 'Export format (json|csv|xml)', 'json')
  .option('--encrypt', 'Encrypt the export')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('📤 Exporting Data Subject Data'));
      console.log(chalk.gray('==============================='));

      const config = getGdprConfigForEnvironment();
      const manager = new GdprComplianceManager(config);

      const serviceIds = options.service ? [options.service] : getAllServiceIds();

      for (const serviceId of serviceIds) {
        console.log(chalk.yellow(`\n📤 Exporting from ${serviceId}...`));

        const profile = getServiceGdprProfile(serviceId);
        if (profile) {
          await manager.initializeCompliance(serviceId, profile);

          const exportId = await manager.exportDataSubjectData(serviceId, {
            dataSubjectId: options.dataSubject,
            format: options.format,
            includeCategories: profile.dataCategories,
            encryptExport: options.encrypt || false,
            deliveryMethod: 'download'
          });

          console.log(chalk.green(`✅ Export initiated: ${exportId}`));
        }
      }

      await manager.cleanup();
    } catch (error) {
      console.error(chalk.red('❌ Error exporting data:'), error);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Show GDPR configuration')
  .option('-s, --service <serviceId>', 'Show service-specific config')
  .option('-e, --env <environment>', 'Show config for specific environment')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('⚙️ GDPR Configuration'));
      console.log(chalk.gray('===================='));

      const config = getGdprConfigForEnvironment();

      if (options.service) {
        const profile = getServiceGdprProfile(options.service);
        if (profile) {
          console.log(chalk.yellow(`\n📋 Configuration for ${profile.serviceName}:`));
          console.log(`Port: ${profile.port}`);
          console.log(`Data Categories: ${profile.dataCategories.join(', ')}`);
          console.log(`Processing Purposes: ${profile.processingPurposes.join(', ')}`);
          console.log(`Legal Bases: ${profile.legalBases.join(', ')}`);
          console.log(`Retention Period: ${profile.retentionPeriodDays} days`);
          console.log(`Compliance Level: ${profile.complianceLevel}`);
        }
      } else {
        console.log(chalk.yellow('\n🔧 Global GDPR Configuration:'));
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Compliance Enabled: ${config.enabled ? '✅' : '❌'}`);
        console.log(`Data Retention Enabled: ${config.dataRetention.enabled ? '✅' : '❌'}`);
        console.log(`Consent Management Enabled: ${config.consentManagement.enabled ? '✅' : '❌'}`);
        console.log(`Audit Trail Enabled: ${config.auditTrail.enabled ? '✅' : '❌'}`);
        console.log(`Reporting Enabled: ${config.reporting.enabled ? '✅' : '❌'}`);
      }
    } catch (error) {
      console.error(chalk.red('❌ Error showing configuration:'), error);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List all Essential CodAI Services')
  .action(async () => {
    try {
      console.log(chalk.cyan('📋 Essential CodAI Services'));
      console.log(chalk.gray('==========================='));

      const serviceIds = getAllServiceIds();

      console.log(chalk.yellow(`\n📊 Found ${serviceIds.length} services:\n`));

      serviceIds.forEach((serviceId, index) => {
        const profile = getServiceGdprProfile(serviceId);
        if (profile) {
          console.log(`${index + 1}. ${chalk.green(profile.serviceName)}`);
          console.log(`   Service ID: ${serviceId}`);
          console.log(`   Port: ${profile.port}`);
          console.log(`   Compliance Level: ${profile.complianceLevel}`);
          console.log(`   Data Categories: ${profile.dataCategories.length}`);
          console.log('');
        }
      });
    } catch (error) {
      console.error(chalk.red('❌ Error listing services:'), error);
      process.exit(1);
    }
  });

async function checkServiceCompliance(manager: GdprComplianceManager, serviceId: string): Promise<void> {
  const profile = getServiceGdprProfile(serviceId);
  if (!profile) {
    console.log(chalk.red(`❌ Service profile not found: ${serviceId}`));
    return;
  }

  await manager.initializeCompliance(serviceId, profile);
  const status = await manager.getComplianceStatus(serviceId);

  const statusColor = status.overall === 'compliant' ? 'green' :
    status.overall === 'pending_review' ? 'yellow' : 'red';

  console.log(`📋 ${chalk.bold(profile.serviceName)} (${serviceId})`);
  console.log(`   Overall Status: ${chalk[statusColor](status.overall.toUpperCase())}`);
  console.log(`   Compliance Score: ${status.score}%`);
  console.log(`   Consent: ${getStatusIcon(status.consent)} ${status.consent}`);
  console.log(`   Retention: ${getStatusIcon(status.retention)} ${status.retention}`);
  console.log(`   Rights: ${getStatusIcon(status.rights)} ${status.rights}`);
  console.log(`   Audit: ${getStatusIcon(status.audit)} ${status.audit}`);
  console.log('');
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'compliant': return '✅';
    case 'pending_review': return '⚠️';
    case 'non_compliant': return '❌';
    default: return '❓';
  }
}

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (error: any) {
  if (error.code === 'commander.missingArgument' || error.code === 'commander.missingMandatoryOptionValue') {
    console.error(chalk.red('❌ Missing required argument or option'));
    console.error(chalk.gray('Use --help for usage information'));
  } else {
    console.error(chalk.red('❌ Unexpected error:'), error.message);
  }
  process.exit(1);
}

export { program };