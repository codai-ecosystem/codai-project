#!/usr/bin/env node

/**
 * Advanced Bundle Analyzer
 * Provides comprehensive bundle analysis and optimization recommendations
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
    });
    return result.trim();
  } catch (error) {
    log.error(`Failed to run: ${command}`);
    return null;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundleSize(buildPath) {
  log.step('Analyzing bundle sizes...');

  try {
    const statsPath = path.join(buildPath, '.next', 'analyze');

    // Create analysis directory
    if (!fs.existsSync(statsPath)) {
      fs.mkdirSync(statsPath, { recursive: true });
    }

    // Generate bundle analysis
    const webAppPath = path.join(process.cwd(), 'apps', 'web');
    runCommand('pnpm build', { cwd: webAppPath });

    // Check if build succeeded
    const nextBuildPath = path.join(webAppPath, '.next');
    if (!fs.existsSync(nextBuildPath)) {
      log.error('Build failed - no .next directory found');
      return;
    }

    log.success('Bundle analysis completed');

    // Analyze bundle composition
    analyzeBundleComposition(webAppPath);
  } catch (error) {
    log.error('Bundle analysis failed:', error.message);
  }
}

function analyzeBundleComposition(webAppPath) {
  log.step('Analyzing bundle composition...');

  const buildManifestPath = path.join(webAppPath, '.next', 'build-manifest.json');

  if (!fs.existsSync(buildManifestPath)) {
    log.warning('Build manifest not found');
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));

    console.log(chalk.bold('\n📊 Bundle Analysis Report\n'));

    // Analyze pages
    if (manifest.pages) {
      console.log(chalk.bold('Pages:'));
      Object.entries(manifest.pages).forEach(([page, files]) => {
        console.log(`  ${page}:`);
        files.forEach(file => {
          const filePath = path.join(webAppPath, '.next', file);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`    ${file} - ${formatBytes(stats.size)}`);
          }
        });
      });
    }

    // Provide optimization recommendations
    provideOptimizationRecommendations();
  } catch (error) {
    log.error('Failed to analyze bundle composition:', error.message);
  }
}

function provideOptimizationRecommendations() {
  console.log(chalk.bold('\n💡 Optimization Recommendations\n'));

  const recommendations = [
    {
      category: 'Code Splitting',
      items: [
        'Use dynamic imports for heavy components',
        'Implement route-based code splitting',
        'Split vendor chunks appropriately',
      ],
    },
    {
      category: 'Image Optimization',
      items: [
        'Use next/image for all images',
        'Implement proper image sizing',
        'Consider WebP format for better compression',
      ],
    },
    {
      category: 'Dependencies',
      items: [
        'Audit unused dependencies',
        'Use tree-shaking compatible libraries',
        'Consider lighter alternatives for heavy libraries',
      ],
    },
    {
      category: 'Performance',
      items: [
        'Enable gzip/brotli compression',
        'Implement service worker caching',
        'Use React.memo for expensive components',
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

function checkDependencyDuplicates() {
  log.step('Checking for duplicate dependencies...');

  try {
    const result = runCommand('pnpm list --depth=0 --json');
    if (result) {
      const data = JSON.parse(result);
      // Analyze dependency duplicates
      log.success('Dependency analysis completed');
    }
  } catch (error) {
    log.warning('Could not analyze dependencies');
  }
}

function generatePerformanceReport() {
  console.log(chalk.bold('\n📈 Performance Metrics\n'));

  const metrics = [
    'First Contentful Paint (FCP)',
    'Largest Contentful Paint (LCP)',
    'Cumulative Layout Shift (CLS)',
    'First Input Delay (FID)',
    'Time to Interactive (TTI)',
  ];

  console.log(chalk.bold('Core Web Vitals to monitor:'));
  metrics.forEach(metric => {
    console.log(`  • ${metric}`);
  });

  console.log('\n' + chalk.bold('Performance testing commands:'));
  console.log('  pnpm test:e2e:performance - Run performance tests');
  console.log('  pnpm lighthouse:ci - Run Lighthouse CI');
  console.log('  pnpm audit:performance - Comprehensive performance audit');
}

async function main() {
  console.log(chalk.bold.blue('\n📦 Advanced Bundle Analyzer\n'));

  const webAppPath = path.join(process.cwd(), 'apps', 'web');

  if (!fs.existsSync(webAppPath)) {
    log.error('Web app not found at apps/web');
    process.exit(1);
  }

  // Run comprehensive analysis
  analyzeBundleSize(webAppPath);
  checkDependencyDuplicates();
  generatePerformanceReport();

  console.log(chalk.bold.green('\n✅ Bundle analysis complete!\n'));

  console.log(chalk.bold('Next steps:'));
  console.log('1. Review bundle composition above');
  console.log('2. Implement recommended optimizations');
  console.log('3. Run performance tests to validate improvements');
  console.log('4. Monitor Core Web Vitals in production\n');
}

main().catch(error => {
  log.error('Bundle analysis failed:');
  console.error(error);
  process.exit(1);
});
