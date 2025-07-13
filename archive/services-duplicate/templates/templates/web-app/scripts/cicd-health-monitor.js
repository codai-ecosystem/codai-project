#!/usr/bin/env node

/**
 * CI/CD Health Monitor
 * Monitors CI/CD pipeline health and provides optimization recommendations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const log = {
  info: msg => console.log(chalk.blue('ℹ'), msg),
  success: msg => console.log(chalk.green('✓'), msg),
  warning: msg => console.log(chalk.yellow('⚠'), msg),
  error: msg => console.log(chalk.red('✗'), msg),
  step: msg => console.log(chalk.magenta('→'), msg),
};

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      cwd: options.cwd || process.cwd(),
      stdio: options.silent ? 'pipe' : 'inherit',
    });
    return result ? result.trim() : '';
  } catch (error) {
    if (!options.silent) {
      log.error(`Failed to run: ${command}`);
    }
    return null;
  }
}

function analyzeCacheEfficiency() {
  log.step('Analyzing cache efficiency...');

  const cacheDirectories = [
    '.turbo',
    'node_modules/.cache',
    'apps/web/.next/cache',
    '.eslintcache',
  ];

  const cacheStats = {};

  cacheDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        const stats = getCacheStats(dir);
        cacheStats[dir] = stats;
        log.success(`${dir}: ${formatBytes(stats.totalSize)}`);
      } catch (error) {
        log.warning(`Could not analyze ${dir}`);
      }
    } else {
      log.info(`${dir}: Not found`);
    }
  });

  return cacheStats;
}

function getCacheStats(directory) {
  let totalSize = 0;
  let fileCount = 0;

  function calculateSize(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        calculateSize(itemPath);
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    });
  }

  calculateSize(directory);

  return { totalSize, fileCount };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkWorkflowHealth() {
  log.step('Checking GitHub Actions workflow health...');

  const workflowsDir = '.github/workflows';

  if (!fs.existsSync(workflowsDir)) {
    log.warning('No GitHub Actions workflows found');
    return [];
  }

  const workflows = fs
    .readdirSync(workflowsDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

  const workflowAnalysis = [];

  workflows.forEach(workflow => {
    const workflowPath = path.join(workflowsDir, workflow);
    const content = fs.readFileSync(workflowPath, 'utf8');

    const analysis = {
      name: workflow,
      issues: [],
      optimizations: [],
    };

    // Check for common issues
    if (!content.includes('cache@v')) {
      analysis.issues.push('No caching strategy detected');
    }

    if (!content.includes('concurrency:')) {
      analysis.optimizations.push('Consider adding concurrency limits');
    }

    if (content.includes('runs-on: ubuntu-latest') && !content.includes('timeout-minutes:')) {
      analysis.optimizations.push('Add timeout-minutes to prevent hanging jobs');
    }

    if (!content.includes('if: failure()') && content.includes('steps:')) {
      analysis.optimizations.push('Consider adding failure handling');
    }

    workflowAnalysis.push(analysis);
    log.success(`Analyzed ${workflow}`);
  });

  return workflowAnalysis;
}

function analyzeBuildPerformance() {
  log.step('Analyzing build performance...');

  const buildCommands = [
    { name: 'TypeScript compilation', command: 'turbo type-check --dry-run' },
    { name: 'ESLint', command: 'turbo lint --dry-run' },
    { name: 'Build', command: 'turbo build --dry-run' },
    { name: 'Tests', command: 'turbo test --dry-run' },
  ];

  const performanceData = {};

  buildCommands.forEach(({ name, command }) => {
    log.info(`Checking ${name}...`);

    const startTime = Date.now();
    const result = runCommand(command, { silent: true });
    const endTime = Date.now();

    performanceData[name] = {
      duration: endTime - startTime,
      success: result !== null,
    };

    if (result !== null) {
      log.success(`${name}: ${endTime - startTime}ms`);
    } else {
      log.warning(`${name}: Failed`);
    }
  });

  return performanceData;
}

function checkDependencyOptimization() {
  log.step('Checking dependency optimization...');

  const packageJsonPaths = [
    'package.json',
    'apps/web/package.json',
    'apps/backend/package.json',
    'packages/ui/package.json',
    'packages/utils/package.json',
  ];

  const optimization = {
    issues: [],
    recommendations: [],
  };

  packageJsonPaths.forEach(pkgPath => {
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

      // Check for dev dependencies in production dependencies
      if (pkg.dependencies && pkg.devDependencies) {
        const prodDeps = Object.keys(pkg.dependencies);
        const devDeps = Object.keys(pkg.devDependencies);

        const overlap = prodDeps.filter(dep => devDeps.includes(dep));
        if (overlap.length > 0) {
          optimization.issues.push({
            file: pkgPath,
            issue: `Duplicate dependencies: ${overlap.join(', ')}`,
          });
        }
      }

      // Check for unused peer dependencies
      if (pkg.peerDependencies && !pkg.dependencies) {
        optimization.recommendations.push({
          file: pkgPath,
          recommendation: 'Consider if peer dependencies are actually needed',
        });
      }
    }
  });

  return optimization;
}

function generateOptimizationReport(
  cacheStats,
  workflowAnalysis,
  performanceData,
  depOptimization
) {
  console.log(chalk.bold('\n🚀 CI/CD Optimization Report\n'));

  // Cache Analysis
  console.log(chalk.bold('📦 Cache Analysis:'));
  Object.entries(cacheStats).forEach(([dir, stats]) => {
    console.log(`  ${dir}: ${formatBytes(stats.totalSize)} (${stats.fileCount} files)`);
  });

  // Workflow Health
  console.log(chalk.bold('\n🔄 Workflow Health:'));
  workflowAnalysis.forEach(workflow => {
    console.log(`  ${workflow.name}:`);

    if (workflow.issues.length > 0) {
      console.log(chalk.red('    Issues:'));
      workflow.issues.forEach(issue => {
        console.log(`      • ${issue}`);
      });
    }

    if (workflow.optimizations.length > 0) {
      console.log(chalk.yellow('    Optimizations:'));
      workflow.optimizations.forEach(opt => {
        console.log(`      • ${opt}`);
      });
    }

    if (workflow.issues.length === 0 && workflow.optimizations.length === 0) {
      console.log(chalk.green('    ✓ Looks good'));
    }
  });

  // Build Performance
  console.log(chalk.bold('\n⚡ Build Performance:'));
  Object.entries(performanceData).forEach(([name, data]) => {
    const status = data.success ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${status} ${name}: ${data.duration}ms`);
  });

  // Dependency Optimization
  console.log(chalk.bold('\n📋 Dependency Optimization:'));
  if (depOptimization.issues.length > 0) {
    console.log(chalk.red('  Issues:'));
    depOptimization.issues.forEach(issue => {
      console.log(`    • ${issue.file}: ${issue.issue}`);
    });
  }

  if (depOptimization.recommendations.length > 0) {
    console.log(chalk.yellow('  Recommendations:'));
    depOptimization.recommendations.forEach(rec => {
      console.log(`    • ${rec.file}: ${rec.recommendation}`);
    });
  }

  if (depOptimization.issues.length === 0 && depOptimization.recommendations.length === 0) {
    console.log(chalk.green('  ✓ Dependencies look optimized'));
  }
}

function provideGeneralRecommendations() {
  console.log(chalk.bold('\n💡 General CI/CD Recommendations:\n'));

  const recommendations = [
    {
      category: 'Caching Strategy',
      items: [
        'Use Turbo for monorepo task caching',
        'Cache node_modules and build artifacts',
        'Implement incremental builds',
        'Cache test results and coverage reports',
      ],
    },
    {
      category: 'Parallel Execution',
      items: [
        'Run linting, type-checking, and testing in parallel',
        'Use matrix builds for multiple environments',
        'Parallelize E2E tests by spec files',
        'Run package builds in dependency order',
      ],
    },
    {
      category: 'Optimization',
      items: [
        'Use specific node and dependency versions',
        'Implement proper artifact caching',
        'Add job timeouts to prevent hanging',
        'Use conditional job execution based on changed files',
      ],
    },
    {
      category: 'Monitoring',
      items: [
        'Track build times and failure rates',
        'Monitor cache hit rates',
        'Set up alerts for build failures',
        'Implement performance regression detection',
      ],
    },
  ];

  recommendations.forEach(({ category, items }) => {
    console.log(chalk.bold.blue(category + ':'));
    items.forEach(item => {
      console.log(`  • ${item}`);
    });
    console.log('');
  });
}

async function main() {
  console.log(chalk.bold.blue('\n🔧 CI/CD Health Monitor\n'));

  // Run all analyses
  const cacheStats = analyzeCacheEfficiency();
  const workflowAnalysis = checkWorkflowHealth();
  const performanceData = analyzeBuildPerformance();
  const depOptimization = checkDependencyOptimization();

  // Generate comprehensive report
  generateOptimizationReport(cacheStats, workflowAnalysis, performanceData, depOptimization);
  provideGeneralRecommendations();

  console.log(chalk.bold.green('\n✅ CI/CD health check complete!\n'));

  // Calculate overall health score
  const totalIssues =
    workflowAnalysis.reduce((sum, w) => sum + w.issues.length, 0) + depOptimization.issues.length;

  if (totalIssues === 0) {
    log.success('CI/CD pipeline is healthy!');
  } else if (totalIssues <= 3) {
    log.warning(`Found ${totalIssues} minor issues - consider addressing them`);
  } else {
    log.error(`Found ${totalIssues} issues - pipeline optimization recommended`);
  }
}

main().catch(error => {
  log.error('CI/CD health check failed:');
  console.error(error);
  process.exit(1);
});
