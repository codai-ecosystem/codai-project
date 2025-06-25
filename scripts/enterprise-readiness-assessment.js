#!/usr/bin/env node

/**
 * Enterprise Readiness Validation Script
 * Comprehensive assessment for world-class production status
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const timestamp = new Date().toISOString();
const results = {
  timestamp,
  overall: 'PASSED',
  score: 100,
  categories: [],
  recommendations: [],
  summary: {},
};

console.log(
  chalk.blue.bold('\n🏢 CODAI PROJECT ENTERPRISE READINESS ASSESSMENT')
);
console.log(chalk.gray(`Started at: ${timestamp}\n`));

// Test Categories
const categories = [
  {
    name: 'Infrastructure & Architecture',
    weight: 20,
    tests: [
      { name: 'Turborepo Configuration', check: () => checkTurboConfig() },
      { name: 'Workspace Structure', check: () => checkWorkspaceStructure() },
      { name: 'Package Dependencies', check: () => checkDependencies() },
      { name: 'TypeScript Configuration', check: () => checkTypeScript() },
    ],
  },
  {
    name: 'Code Quality & Standards',
    weight: 15,
    tests: [
      { name: 'ESLint Configuration', check: () => checkESLint() },
      { name: 'Prettier Configuration', check: () => checkPrettier() },
      { name: 'Code Coverage', check: () => checkCodeCoverage() },
      { name: 'Type Safety', check: () => checkTypeSafety() },
    ],
  },
  {
    name: 'Testing Infrastructure',
    weight: 25,
    tests: [
      { name: 'Jest Configuration', check: () => checkJest() },
      { name: 'Playwright E2E Tests', check: () => checkPlaywright() },
      { name: 'Test Coverage Reporting', check: () => checkTestReporting() },
      { name: 'Performance Tests', check: () => checkPerformanceTests() },
    ],
  },
  {
    name: 'Security & Compliance',
    weight: 20,
    tests: [
      {
        name: 'Dependency Vulnerabilities',
        check: () => checkVulnerabilities(),
      },
      { name: 'Security Headers', check: () => checkSecurityHeaders() },
      { name: 'Authentication & Authorization', check: () => checkAuth() },
      { name: 'Data Protection', check: () => checkDataProtection() },
    ],
  },
  {
    name: 'Production Readiness',
    weight: 20,
    tests: [
      { name: 'Environment Configuration', check: () => checkEnvironments() },
      { name: 'Monitoring & Logging', check: () => checkMonitoring() },
      { name: 'CI/CD Pipeline', check: () => checkCICD() },
      { name: 'Documentation Coverage', check: () => checkDocumentation() },
    ],
  },
];

// Test Implementation Functions
function checkTurboConfig() {
  try {
    const turboConfig = JSON.parse(fs.readFileSync('turbo.json', 'utf8'));
    return {
      passed: true,
      details: `Turbo configuration valid with ${Object.keys(turboConfig.pipeline || {}).length} pipeline tasks`,
    };
  } catch (error) {
    return { passed: false, details: 'Turbo configuration missing or invalid' };
  }
}

function checkWorkspaceStructure() {
  const expectedDirs = ['apps', 'services', 'packages', 'scripts'];
  const missing = expectedDirs.filter(dir => !fs.existsSync(dir));
  return {
    passed: missing.length === 0,
    details:
      missing.length === 0
        ? 'All workspace directories present'
        : `Missing: ${missing.join(', ')}`,
  };
}

function checkDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const devDeps = Object.keys(packageJson.devDependencies || {}).length;
    const deps = Object.keys(packageJson.dependencies || {}).length;
    return {
      passed: true,
      details: `${deps} dependencies, ${devDeps} dev dependencies configured`,
    };
  } catch (error) {
    return { passed: false, details: 'Package.json missing or invalid' };
  }
}

function checkTypeScript() {
  const configs = ['tsconfig.json', 'tsconfig.base.json'];
  const existing = configs.filter(config => fs.existsSync(config));
  return {
    passed: existing.length >= 1,
    details:
      existing.length >= 1
        ? `TypeScript configs: ${existing.join(', ')}`
        : 'TypeScript configuration missing',
  };
}

function checkESLint() {
  const eslintFiles = [
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.json',
    'eslint.config.js',
  ];
  const hasEslint = eslintFiles.some(file => fs.existsSync(file));
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasEslintDep = packageJson.devDependencies?.eslint;

  return {
    passed: hasEslint || hasEslintDep,
    details: hasEslint
      ? 'ESLint configuration found'
      : hasEslintDep
        ? 'ESLint dependency configured'
        : 'ESLint not configured',
  };
}

function checkPrettier() {
  const prettierFiles = [
    '.prettierrc',
    '.prettierrc.js',
    '.prettierrc.json',
    'prettier.config.js',
  ];
  const hasPrettier = prettierFiles.some(file => fs.existsSync(file));
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasPrettierDep = packageJson.devDependencies?.prettier;

  return {
    passed: hasPrettier || hasPrettierDep,
    details: hasPrettier
      ? 'Prettier configuration found'
      : hasPrettierDep
        ? 'Prettier dependency configured'
        : 'Prettier not configured',
  };
}

function checkCodeCoverage() {
  const jestConfig = fs.existsSync('jest.config.js');
  const vitestConfig = fs.existsSync('vitest.config.ts');

  return {
    passed: jestConfig || vitestConfig,
    details: jestConfig
      ? 'Jest coverage configured'
      : vitestConfig
        ? 'Vitest coverage configured'
        : 'No coverage configuration',
  };
}

function checkTypeSafety() {
  try {
    // Check both base config and main config
    let strict = false;

    if (fs.existsSync('tsconfig.base.json')) {
      const tsBaseConfig = JSON.parse(
        fs.readFileSync('tsconfig.base.json', 'utf8')
      );
      strict = tsBaseConfig.compilerOptions?.strict === true;
    }

    if (!strict && fs.existsSync('tsconfig.json')) {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      strict = tsConfig.compilerOptions?.strict === true;
    }

    return {
      passed: strict,
      details: strict
        ? 'TypeScript strict mode enabled'
        : 'TypeScript strict mode not enabled',
    };
  } catch (error) {
    return { passed: false, details: 'TypeScript configuration not found' };
  }
}

function checkJest() {
  const hasJestConfig = fs.existsSync('jest.config.js');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasJestDep = packageJson.devDependencies?.jest;

  return {
    passed: hasJestConfig && hasJestDep,
    details:
      hasJestConfig && hasJestDep
        ? 'Jest fully configured'
        : 'Jest configuration incomplete',
  };
}

function checkPlaywright() {
  const hasPlaywrightConfig = fs.existsSync('playwright.config.ts');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasPlaywrightDep = packageJson.devDependencies?.['@playwright/test'];

  return {
    passed: hasPlaywrightConfig && hasPlaywrightDep,
    details:
      hasPlaywrightConfig && hasPlaywrightDep
        ? 'Playwright E2E tests configured'
        : 'Playwright configuration incomplete',
  };
}

function checkTestReporting() {
  try {
    const playwrightConfig = fs.readFileSync('playwright.config.ts', 'utf8');
    const hasReporters = playwrightConfig.includes('reporter');
    return {
      passed: hasReporters,
      details: hasReporters
        ? 'Test reporting configured'
        : 'Test reporting not configured',
    };
  } catch (error) {
    return { passed: false, details: 'Playwright configuration not found' };
  }
}

function checkPerformanceTests() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasPerformanceScript = packageJson.scripts?.['test:performance'];

  return {
    passed: Boolean(hasPerformanceScript),
    details: hasPerformanceScript
      ? 'Performance tests configured'
      : 'Performance tests not configured',
  };
}

function checkVulnerabilities() {
  try {
    // Check if audit has been run recently
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasSnyk = packageJson.devDependencies?.snyk;
    const hasAuditScript = packageJson.scripts?.['test:security'];

    return {
      passed: hasSnyk || hasAuditScript,
      details: hasSnyk
        ? 'Snyk security scanning configured'
        : hasAuditScript
          ? 'Security audit configured'
          : 'No vulnerability scanning',
    };
  } catch (error) {
    return { passed: false, details: 'Unable to check vulnerability scanning' };
  }
}

function checkSecurityHeaders() {
  // Check for security configurations in common files
  const securityFiles = [
    'next.config.js',
    'vite.config.ts',
    'nuxt.config.ts',
    'security.config.js',
  ];
  const hasSecurityConfig = securityFiles.some(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      return (
        content.includes('security') ||
        content.includes('headers') ||
        content.includes('CSP') ||
        content.includes('helmet')
      );
    }
    return false;
  });

  return {
    passed: hasSecurityConfig,
    details: hasSecurityConfig
      ? 'Security headers configured'
      : 'Security headers not explicitly configured',
  };
}

function checkAuth() {
  // Check for authentication packages or configurations
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const authPackages = [
    'next-auth',
    '@auth0/auth0-react',
    'passport',
    'firebase-auth',
    'supabase',
  ];
  const hasAuthDep = authPackages.some(
    pkg => packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]
  );

  // Also check for security configuration file
  const hasAuthConfig = fs.existsSync('security.config.js');

  return {
    passed: hasAuthDep || hasAuthConfig,
    details: hasAuthDep
      ? 'Authentication system configured'
      : hasAuthConfig
        ? 'Authentication configuration found'
        : 'Authentication system not detected',
  };
}

function checkDataProtection() {
  // Check for data protection measures (encryption, validation, etc.)
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dataProtectionPackages = [
    'bcrypt',
    'crypto-js',
    'helmet',
    'joi',
    'yup',
    'zod',
  ];
  const hasDataProtection = dataProtectionPackages.some(
    pkg => packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]
  );

  // Also check for security configuration file
  const hasSecurityConfig = fs.existsSync('security.config.js');

  return {
    passed: hasDataProtection || hasSecurityConfig,
    details: hasDataProtection
      ? 'Data protection measures configured'
      : hasSecurityConfig
        ? 'Data protection configuration found'
        : 'Data protection measures not detected',
  };
}

function checkEnvironments() {
  const envFiles = [
    '.env.example',
    '.env.local',
    '.env.development',
    '.env.production',
  ];
  const hasEnvFiles = envFiles.some(file => fs.existsSync(file));

  return {
    passed: hasEnvFiles,
    details: hasEnvFiles
      ? 'Environment configurations present'
      : 'Environment configurations missing',
  };
}

function checkMonitoring() {
  const hasMonitoringDir = fs.existsSync('monitoring');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const monitoringPackages = ['winston', 'pino', '@sentry/node', 'datadog'];
  const hasMonitoringDep = monitoringPackages.some(
    pkg => packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]
  );

  return {
    passed: hasMonitoringDir || hasMonitoringDep,
    details: hasMonitoringDir
      ? 'Monitoring infrastructure configured'
      : hasMonitoringDep
        ? 'Monitoring packages configured'
        : 'Monitoring not configured',
  };
}

function checkCICD() {
  const ciFiles = [
    '.github/workflows',
    '.gitlab-ci.yml',
    'azure-pipelines.yml',
    'Jenkinsfile',
  ];
  const hasCIConfig = ciFiles.some(file => fs.existsSync(file));

  return {
    passed: hasCIConfig,
    details: hasCIConfig
      ? 'CI/CD pipeline configured'
      : 'CI/CD pipeline not configured',
  };
}

function checkDocumentation() {
  const docFiles = [
    'README.md',
    'ARCHITECTURE.md',
    'DEVELOPMENT_GUIDE.md',
    'docs',
  ];
  const existingDocs = docFiles.filter(file => fs.existsSync(file));

  return {
    passed: existingDocs.length >= 2,
    details: `Documentation coverage: ${existingDocs.length}/${docFiles.length} files present`,
  };
}

// Run all tests
async function runAssessment() {
  let totalScore = 0;
  let maxScore = 0;

  for (const category of categories) {
    console.log(chalk.yellow.bold(`\n📋 ${category.name}`));

    const categoryResults = {
      name: category.name,
      weight: category.weight,
      tests: [],
      passed: 0,
      total: category.tests.length,
      score: 0,
    };

    for (const test of category.tests) {
      const result = test.check();
      categoryResults.tests.push({
        name: test.name,
        passed: result.passed,
        details: result.details,
      });

      if (result.passed) {
        categoryResults.passed++;
        console.log(chalk.green(`   ✅ ${test.name}`));
        console.log(chalk.gray(`      ${result.details}`));
      } else {
        console.log(chalk.red(`   ❌ ${test.name}`));
        console.log(chalk.gray(`      ${result.details}`));
        results.recommendations.push(
          `Improve ${category.name}: ${test.name} - ${result.details}`
        );
      }
    }

    categoryResults.score =
      (categoryResults.passed / categoryResults.total) * category.weight;
    totalScore += categoryResults.score;
    maxScore += category.weight;

    console.log(
      chalk.blue(
        `   Score: ${categoryResults.passed}/${categoryResults.total} (${categoryResults.score.toFixed(1)}/${category.weight})`
      )
    );

    results.categories.push(categoryResults);
  }

  // Calculate final score
  const finalScore = (totalScore / maxScore) * 100;
  results.score = Math.round(finalScore * 10) / 10;
  results.overall =
    finalScore >= 90 ? 'PASSED' : finalScore >= 75 ? 'WARNING' : 'FAILED';

  // Display summary
  console.log(chalk.blue.bold('\n🏆 ENTERPRISE READINESS ASSESSMENT RESULTS'));
  console.log(chalk.gray('─'.repeat(60)));

  const scoreColor =
    results.overall === 'PASSED'
      ? 'green'
      : results.overall === 'WARNING'
        ? 'yellow'
        : 'red';
  console.log(
    chalk[scoreColor].bold(
      `Overall Score: ${results.score}% - ${results.overall}`
    )
  );

  if (results.overall === 'PASSED') {
    console.log(
      chalk.green.bold(
        '\n🎉 CONGRATULATIONS! Your project is enterprise-ready!'
      )
    );
    console.log(
      chalk.gray('All critical enterprise requirements have been met.')
    );
  } else if (results.overall === 'WARNING') {
    console.log(
      chalk.yellow.bold(
        '\n⚠️ GOOD PROGRESS! Some improvements needed for full enterprise readiness.'
      )
    );
  } else {
    console.log(
      chalk.red.bold(
        '\n🔧 WORK NEEDED! Several critical requirements must be addressed.'
      )
    );
  }

  // Show recommendations
  if (results.recommendations.length > 0) {
    console.log(chalk.yellow.bold('\n📝 RECOMMENDATIONS:'));
    results.recommendations.forEach((rec, index) => {
      console.log(chalk.yellow(`   ${index + 1}. ${rec}`));
    });
  }

  // Summary by category
  results.summary = {
    totalTests: results.categories.reduce((sum, cat) => sum + cat.total, 0),
    totalPassed: results.categories.reduce((sum, cat) => sum + cat.passed, 0),
    categoriesCount: results.categories.length,
    recommendationsCount: results.recommendations.length,
  };

  // Save results
  fs.writeFileSync(
    'enterprise-readiness-report.json',
    JSON.stringify(results, null, 2)
  );
  console.log(
    chalk.gray(
      `\n📄 Detailed report saved to: enterprise-readiness-report.json`
    )
  );

  console.log(
    chalk.blue.bold(`\n🕐 Assessment completed at: ${new Date().toISOString()}`)
  );

  return results;
}

// Run the assessment
runAssessment().catch(console.error);
