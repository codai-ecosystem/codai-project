/**
 * Bundle Analyzer and Optimization Tool
 *
 * This tool analyzes the application bundle to identify optimization opportunities
 * and provides recommendations for reducing bundle size.
 */

const fs = require('fs');
const path = require('path');
const { readdir, stat, readFile } = require('fs').promises;
const chalk = require('chalk');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'apps/web/.next');
const SIZE_THRESHOLD = 250 * 1024; // 250KB
const CHUNK_THRESHOLD = 100 * 1024; // 100KB

// Results storage
const results = {
  totalSize: 0,
  largeFiles: [],
  duplicates: [],
  optimizations: [],
};

// Helper for formatting file sizes
function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

// Analyze bundle files
async function analyzeBundleFiles() {
  try {
    const staticDir = path.join(BUILD_DIR, 'static');
    if (!fs.existsSync(staticDir)) {
      console.log(chalk.yellow('Build directory not found. Please run "npm run build" first.'));
      return;
    }

    const files = await getFilesRecursively(staticDir);

    for (const file of files) {
      const stats = await stat(file);
      const relativePath = path.relative(BUILD_DIR, file);

      results.totalSize += stats.size;

      if (stats.size > SIZE_THRESHOLD) {
        results.largeFiles.push({
          path: relativePath,
          size: stats.size,
          formattedSize: formatSize(stats.size),
        });
      }
    }

    // Sort large files by size
    results.largeFiles.sort((a, b) => b.size - a.size);
  } catch (error) {
    console.error(chalk.red('Error analyzing bundle files:'), error);
  }
}

// Get all files recursively
async function getFilesRecursively(dir) {
  const files = [];
  const items = await readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      const subFiles = await getFilesRecursively(fullPath);
      files.push(...subFiles);
    } else if (item.endsWith('.js') || item.endsWith('.css')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Analyze package.json dependencies
async function analyzeDependencies() {
  try {
    const packagePath = path.join(ROOT_DIR, 'apps/web/package.json');
    const packageContent = await readFile(packagePath, 'utf-8');
    const packageData = JSON.parse(packageContent);

    const heavyPackages = ['lodash', 'moment', '@material-ui/core', 'antd', 'bootstrap', 'jquery'];

    const alternatives = {
      lodash: 'lodash-es (tree-shakable) or individual functions',
      moment: 'date-fns or dayjs (smaller alternatives)',
      '@material-ui/core': '@mui/material with tree-shaking',
      antd: 'Individual component imports',
      bootstrap: 'Tailwind CSS (smaller, utility-first)',
      jquery: 'Vanilla JavaScript or modern framework',
    };

    const dependencies = {
      ...packageData.dependencies,
      ...packageData.devDependencies,
    };

    for (const [pkg, version] of Object.entries(dependencies)) {
      if (heavyPackages.includes(pkg)) {
        results.optimizations.push({
          type: 'dependency',
          package: pkg,
          current: version,
          suggestion: alternatives[pkg] || `Consider lighter alternative for ${pkg}`,
        });
      }
    }
  } catch (error) {
    console.error(chalk.red('Error analyzing dependencies:'), error);
  }
}

// Check for common optimization opportunities
function checkOptimizations() {
  // Check for large chunks that should be split
  results.largeFiles.forEach(file => {
    if (file.size > CHUNK_THRESHOLD && file.path.includes('chunks/')) {
      results.optimizations.push({
        type: 'code-splitting',
        file: file.path,
        size: file.formattedSize,
        suggestion: 'Consider dynamic imports to split this chunk',
      });
    }
  });

  // Check for duplicate code patterns (basic heuristic)
  const jsFiles = results.largeFiles.filter(f => f.path.endsWith('.js'));
  if (jsFiles.length > 5) {
    results.optimizations.push({
      type: 'duplicate-code',
      suggestion:
        'Multiple large JS files detected. Review for duplicate code and consider shared chunks',
    });
  }
}

// Generate report
function generateReport() {
  console.log(chalk.bold('\n🔍 Bundle Analysis Report\n'));

  console.log(chalk.blue(`Total bundle size: ${formatSize(results.totalSize)}\n`));

  if (results.largeFiles.length > 0) {
    console.log(chalk.yellow('📦 Large files (>250KB):'));
    results.largeFiles.slice(0, 10).forEach(file => {
      console.log(`  ${file.path}: ${chalk.red(file.formattedSize)}`);
    });
    console.log('');
  }

  if (results.optimizations.length > 0) {
    console.log(chalk.green('💡 Optimization opportunities:'));
    results.optimizations.forEach((opt, index) => {
      console.log(`  ${index + 1}. ${chalk.cyan(opt.type.toUpperCase())}`);
      if (opt.package) {
        console.log(`     Package: ${opt.package}`);
        console.log(`     Current: ${opt.current}`);
      }
      if (opt.file) {
        console.log(`     File: ${opt.file} (${opt.size})`);
      }
      console.log(`     ${chalk.green('→')} ${opt.suggestion}`);
      console.log('');
    });
  }

  // Provide general recommendations
  console.log(chalk.bold('📋 General Recommendations:'));
  console.log('  • Use dynamic imports for large components');
  console.log('  • Implement route-based code splitting');
  console.log('  • Use tree-shaking friendly libraries');
  console.log('  • Optimize images and static assets');
  console.log('  • Consider lazy loading for non-critical components');
  console.log('  • Review and remove unused dependencies');
}

// Main function
async function main() {
  console.log(chalk.bold('🚀 Starting bundle analysis...\n'));

  await analyzeBundleFiles();
  await analyzeDependencies();
  checkOptimizations();
  generateReport();

  if (results.totalSize > 2 * 1024 * 1024) {
    // 2MB
    console.log(
      chalk.red(
        '\n⚠️  Bundle size is quite large. Consider implementing the suggested optimizations.'
      )
    );
  } else {
    console.log(chalk.green('\n✅ Bundle size looks reasonable!'));
  }
}

main().catch(err => {
  console.error(chalk.red('Error during analysis:'), err);
  process.exit(1);
});
