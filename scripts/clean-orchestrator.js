#!/usr/bin/env node

/**
 * 🧹 CODAI ECOSYSTEM CLEAN ORCHESTRATOR
 *
 * Perfect cleanup orchestration for all 29 services in the Codai ecosystem.
 * Handles cache clearing, dependency cleanup, and workspace optimization.
 */

import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 🧹 Cleanup targets
const CLEANUP_TARGETS = {
  build: ['.next', 'dist', 'build', 'out', '.nuxt', '.output'],
  cache: ['.turbo', 'node_modules/.cache', '.cache', 'tsconfig.tsbuildinfo'],
  temp: ['*.log', '*.tmp', '.DS_Store', 'Thumbs.db', '.vscode-test'],
  deps: ['node_modules', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock'],
};

class CleanOrchestrator {
  constructor() {
    this.results = {
      cleaned: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      spaceSaved: 0,
      duration: 0,
      services: {},
      errors: [],
    };
    this.startTime = Date.now();
    this.cleanAll = process.argv.includes('--all');
    this.cleanDeps = process.argv.includes('--deps');
    this.dryRun = process.argv.includes('--dry-run');
  }

  async run() {
    console.log('🧹 CODAI ECOSYSTEM CLEAN ORCHESTRATOR STARTING...\n');
    console.log(
      `🎯 Clean Level: ${this.cleanAll ? 'DEEP' : this.cleanDeps ? 'DEPENDENCIES' : 'STANDARD'}`
    );
    console.log(
      `🔍 Mode: ${this.dryRun ? 'DRY RUN (no changes)' : 'EXECUTE'}\n`
    );

    try {
      // 1. Pre-clean checks
      await this.preCleanChecks();

      // 2. Discover services
      const services = await this.discoverServices();
      console.log(`✅ Discovered ${services.length} services\n`);

      // 3. Clean services
      await this.cleanServices(services);

      // 4. Clean root workspace
      await this.cleanRootWorkspace();

      // 5. Generate final report
      await this.generateReport();

      console.log('🎉 CLEANUP COMPLETED SUCCESSFULLY!');
    } catch (error) {
      console.error('❌ CRITICAL CLEAN ERROR:', error);
      this.results.errors.push({
        type: 'orchestrator',
        message: error.message,
        stack: error.stack,
      });
      await this.generateReport();
      process.exit(1);
    }
  }

  async preCleanChecks() {
    console.log('🔍 Running pre-clean checks...');

    // Check if we're in the right directory
    const packageJsonPath = join(rootDir, 'package.json');
    try {
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, 'utf8')
      );
      if (packageJson.name !== 'codai-project') {
        throw new Error('Not in Codai project root directory');
      }
    } catch (error) {
      throw new Error(`Invalid project structure: ${error.message}`);
    }

    console.log('✅ Pre-clean checks passed\n');
  }

  async discoverServices() {
    const services = [];

    // Check apps directory
    const appsDir = join(rootDir, 'apps');
    try {
      const apps = await fs.readdir(appsDir);
      for (const app of apps) {
        const appPath = join(appsDir, app);
        const stat = await fs.stat(appPath);
        if (stat.isDirectory()) {
          services.push({
            name: app,
            path: appPath,
            type: 'app',
          });
        }
      }
    } catch {
      console.log('⚠️  Apps directory not found');
    }

    // Check services directory
    const servicesDir = join(rootDir, 'services');
    try {
      const servicesList = await fs.readdir(servicesDir);
      for (const service of servicesList) {
        const servicePath = join(servicesDir, service);
        const stat = await fs.stat(servicePath);
        if (stat.isDirectory()) {
          services.push({
            name: service,
            path: servicePath,
            type: 'service',
          });
        }
      }
    } catch {
      console.log('⚠️  Services directory not found');
    }

    return services;
  }

  async cleanServices(services) {
    console.log('🧹 Cleaning services...\n');

    for (const service of services) {
      await this.cleanService(service);
    }
  }

  async cleanService(service) {
    console.log(`🧹 Cleaning ${service.name} (${service.type})...`);

    const serviceResult = {
      name: service.name,
      type: service.type,
      success: false,
      spaceSaved: 0,
      cleanedItems: [],
      errors: [],
    };

    try {
      // Clean build artifacts
      const buildCleaned = await this.cleanTargets(
        service.path,
        CLEANUP_TARGETS.build,
        'build artifacts'
      );
      serviceResult.spaceSaved += buildCleaned.spaceSaved;
      serviceResult.cleanedItems.push(...buildCleaned.items);

      // Clean cache
      const cacheCleaned = await this.cleanTargets(
        service.path,
        CLEANUP_TARGETS.cache,
        'cache files'
      );
      serviceResult.spaceSaved += cacheCleaned.spaceSaved;
      serviceResult.cleanedItems.push(...cacheCleaned.items);

      // Clean temp files
      const tempCleaned = await this.cleanTargets(
        service.path,
        CLEANUP_TARGETS.temp,
        'temporary files'
      );
      serviceResult.spaceSaved += tempCleaned.spaceSaved;
      serviceResult.cleanedItems.push(...tempCleaned.items);

      // Clean dependencies (if requested)
      if (this.cleanDeps || this.cleanAll) {
        const depsCleaned = await this.cleanTargets(
          service.path,
          CLEANUP_TARGETS.deps,
          'dependencies'
        );
        serviceResult.spaceSaved += depsCleaned.spaceSaved;
        serviceResult.cleanedItems.push(...depsCleaned.items);
      }

      serviceResult.success = true;
      this.results.cleaned++;
    } catch (error) {
      console.log(`   ❌ Error cleaning ${service.name}: ${error.message}`);
      serviceResult.success = false;
      serviceResult.errors.push({
        type: 'clean_error',
        message: error.message,
      });
      this.results.failed++;
    }

    this.results.services[service.name] = serviceResult;
    this.results.total++;
    this.results.spaceSaved += serviceResult.spaceSaved;

    const status = serviceResult.success ? '✅ CLEANED' : '❌ FAILED';
    const space =
      serviceResult.spaceSaved > 0
        ? ` (${this.formatBytes(serviceResult.spaceSaved)} saved)`
        : '';

    console.log(`   ${status} ${service.name}${space}`);

    if (serviceResult.cleanedItems.length > 0) {
      console.log(`     Cleaned: ${serviceResult.cleanedItems.join(', ')}`);
    }

    console.log('');
  }

  async cleanTargets(basePath, targets, description) {
    const result = {
      spaceSaved: 0,
      items: [],
    };

    for (const target of targets) {
      try {
        const targetPath = join(basePath, target);

        // Check if target exists
        const exists = await this.pathExists(targetPath);
        if (!exists) continue;

        // Calculate size before deletion
        const size = await this.getSize(targetPath);

        if (!this.dryRun) {
          // Actually delete
          await this.deletePath(targetPath);
        }

        result.spaceSaved += size;
        result.items.push(target);
      } catch (error) {
        // Ignore individual target errors
        console.log(`     ⚠️  Could not clean ${target}: ${error.message}`);
      }
    }

    return result;
  }

  async cleanRootWorkspace() {
    console.log('🧹 Cleaning root workspace...');

    const rootTargets = [
      '.turbo',
      'node_modules/.cache',
      '*.log',
      'test-results.json',
      'build-results.json',
      'cleanup-report.json',
    ];

    if (this.cleanDeps || this.cleanAll) {
      rootTargets.push('node_modules');
    }

    const cleaned = await this.cleanTargets(
      rootDir,
      rootTargets,
      'root workspace'
    );
    this.results.spaceSaved += cleaned.spaceSaved;

    console.log(
      `✅ Root workspace cleaned (${this.formatBytes(cleaned.spaceSaved)} saved)\n`
    );
  }

  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async getSize(path) {
    try {
      const stats = await fs.stat(path);

      if (stats.isDirectory()) {
        return await this.getDirectorySize(path);
      } else {
        return stats.size;
      }
    } catch {
      return 0;
    }
  }

  async getDirectorySize(dirPath) {
    let totalSize = 0;

    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });

      for (const file of files) {
        const filePath = join(dirPath, file.name);

        if (file.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath);
        } else {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }
    } catch {
      // Directory doesn't exist or can't be accessed
    }

    return totalSize;
  }

  async deletePath(path) {
    try {
      const stats = await fs.stat(path);

      if (stats.isDirectory()) {
        await fs.rm(path, { recursive: true, force: true });
      } else {
        await fs.unlink(path);
      }
    } catch (error) {
      // Ignore deletion errors for now
      console.log(`     ⚠️  Could not delete ${path}: ${error.message}`);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async generateReport() {
    this.results.duration = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(60));
    console.log('🧹 CODAI ECOSYSTEM CLEAN RESULTS');
    console.log('='.repeat(60));

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Services Processed: ${this.results.total}`);
    console.log(`   Successfully Cleaned: ${this.results.cleaned} ✅`);
    console.log(`   Failed: ${this.results.failed} ❌`);
    console.log(
      `   Total Space Saved: ${this.formatBytes(this.results.spaceSaved)} 💾`
    );
    console.log(`   Duration: ${Math.round(this.results.duration / 1000)}s`);

    if (this.dryRun) {
      console.log(`   🔍 DRY RUN - No actual changes made`);
    }

    // Service breakdown
    console.log(`\n📋 SERVICE BREAKDOWN:`);
    Object.entries(this.results.services).forEach(([name, result]) => {
      const status = result.success ? '✅' : '❌';
      const space =
        result.spaceSaved > 0
          ? ` (${this.formatBytes(result.spaceSaved)})`
          : '';
      console.log(`   ${status} ${name}${space}`);

      if (result.cleanedItems.length > 0) {
        console.log(`      Items: ${result.cleanedItems.join(', ')}`);
      }

      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          console.log(`      🔍 ${error.type}: ${error.message}`);
        });
      }
    });

    // Cleanup recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (this.results.spaceSaved > 0) {
      console.log(
        `   • Freed up ${this.formatBytes(this.results.spaceSaved)} of disk space`
      );
    }
    if (!this.cleanDeps && !this.cleanAll) {
      console.log(`   • Use --deps flag to clean node_modules for more space`);
    }
    if (!this.cleanAll) {
      console.log(`   • Use --all flag for deep cleaning`);
    }
    console.log(`   • Run cleanup regularly to maintain optimal performance`);
    console.log(`   • Consider adding .gitignore entries for build artifacts`);

    console.log('\n' + '='.repeat(60));
    console.log(
      this.results.failed === 0
        ? '🎉 CLEANUP COMPLETED SUCCESSFULLY! 🎉'
        : '⚠️  SOME CLEANUPS FAILED - CHECK ERRORS ABOVE'
    );
    console.log('='.repeat(60) + '\n');

    // Save detailed report
    if (!this.dryRun) {
      const reportPath = join(rootDir, 'cleanup-results.json');
      await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Detailed report saved to: ${reportPath}`);
    }
  }
}

// Run if called directly
if (
  process.argv[1] &&
  (process.argv[1].endsWith('clean-orchestrator.js') ||
    import.meta.url === `file://${process.argv[1]}`)
) {
  const orchestrator = new CleanOrchestrator();
  orchestrator.run().catch(console.error);
}

export default CleanOrchestrator;
