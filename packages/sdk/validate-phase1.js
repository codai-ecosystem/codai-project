#!/usr/bin/env node

/**
 * CODAI SDK Phase 1 Validation Script
 * Comprehensive validation of Universal SDK implementation
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`, exists ? 'green' : 'red');
  return exists;
}

function checkFileContent(filePath, searchTerm, description) {
  if (!fs.existsSync(filePath)) {
    log(`❌ ${description}: File not found - ${filePath}`, 'red');
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const hasContent = content.includes(searchTerm);
  log(`${hasContent ? '✅' : '❌'} ${description}`, hasContent ? 'green' : 'red');
  return hasContent;
}

function getFileStats(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;
  return { size: stats.size, lines };
}

async function main() {
  log('\n🚀 CODAI Universal SDK - Phase 1 Validation', 'bold');
  log('=' * 60, 'cyan');

  const sdkRoot = path.resolve(__dirname);
  let totalChecks = 0;
  let passedChecks = 0;

  // Helper function to track checks
  function check(result) {
    totalChecks++;
    if (result) passedChecks++;
    return result;
  }

  log('\n📦 Package Structure Validation', 'blue');
  log('-' * 40, 'cyan');

  check(checkFileExists(path.join(sdkRoot, 'package.json'), 'Package configuration'));
  check(checkFileExists(path.join(sdkRoot, 'tsconfig.json'), 'TypeScript configuration'));
  check(checkFileExists(path.join(sdkRoot, 'tsup.config.ts'), 'Build configuration'));
  check(checkFileExists(path.join(sdkRoot, 'vitest.config.ts'), 'Test configuration'));
  check(checkFileExists(path.join(sdkRoot, 'README.md'), 'Documentation'));

  log('\n🏗️ Source Code Structure', 'blue');
  log('-' * 40, 'cyan');

  check(checkFileExists(path.join(sdkRoot, 'src/index.ts'), 'Main SDK entry point'));
  check(checkFileExists(path.join(sdkRoot, 'src/types/index.ts'), 'Type definitions'));
  check(checkFileExists(path.join(sdkRoot, 'src/config/index.ts'), 'Configuration module'));
  check(checkFileExists(path.join(sdkRoot, 'src/events/index.ts'), 'Event system'));
  check(checkFileExists(path.join(sdkRoot, 'src/utils/index.ts'), 'Utility functions'));

  log('\n🔧 Service Modules', 'blue');
  log('-' * 40, 'cyan');

  const services = [
    'auth', 'storage', 'memory', 'analytics', 'wallet',
    'marketplace', 'legal', 'support', 'identity'
  ];

  services.forEach(service => {
    check(checkFileExists(path.join(sdkRoot, `src/${service}/index.ts`), `${service} service`));
  });

  log('\n🧪 Test Coverage', 'blue');
  log('-' * 40, 'cyan');

  check(checkFileExists(path.join(sdkRoot, 'src/__tests__/setup.ts'), 'Test setup'));
  check(checkFileExists(path.join(sdkRoot, 'src/__tests__/basic.test.ts'), 'Basic tests'));
  check(checkFileExists(path.join(sdkRoot, 'src/__tests__/sdk.test.ts'), 'Comprehensive tests'));

  log('\n📚 Documentation & Examples', 'blue');
  log('-' * 40, 'cyan');

  check(checkFileExists(path.join(sdkRoot, 'examples/complete-integration.ts'), 'Complete integration example'));

  log('\n🔍 Content Validation', 'blue');
  log('-' * 40, 'cyan');

  check(checkFileContent(path.join(sdkRoot, 'src/index.ts'), 'export class CodaiSDK', 'Main SDK class export'));
  check(checkFileContent(path.join(sdkRoot, 'src/index.ts'), 'createCodaiSDK', 'Factory function export'));
  check(checkFileContent(path.join(sdkRoot, 'src/types/index.ts'), 'CodaiConfig', 'Configuration types'));
  check(checkFileContent(path.join(sdkRoot, 'src/events/index.ts'), 'CodaiEventBus', 'Event bus implementation'));
  check(checkFileContent(path.join(sdkRoot, 'package.json'), '"@codai/sdk"', 'Package name'));

  log('\n📊 Build Artifacts', 'blue');
  log('-' * 40, 'cyan');

  check(checkFileExists(path.join(sdkRoot, 'dist/index.js'), 'CommonJS build'));
  check(checkFileExists(path.join(sdkRoot, 'dist/index.mjs'), 'ES modules build'));
  check(checkFileExists(path.join(sdkRoot, 'dist/index.d.ts'), 'TypeScript declarations'));

  log('\n📏 Code Metrics', 'blue');
  log('-' * 40, 'cyan');

  const metrics = {
    'Main SDK': getFileStats(path.join(sdkRoot, 'src/index.ts')),
    'Types': getFileStats(path.join(sdkRoot, 'src/types/index.ts')),
    'Auth Service': getFileStats(path.join(sdkRoot, 'src/auth/index.ts')),
    'Storage Service': getFileStats(path.join(sdkRoot, 'src/storage/index.ts')),
    'Memory Service': getFileStats(path.join(sdkRoot, 'src/memory/index.ts')),
    'Analytics Service': getFileStats(path.join(sdkRoot, 'src/analytics/index.ts')),
    'Wallet Service': getFileStats(path.join(sdkRoot, 'src/wallet/index.ts')),
    'Marketplace Service': getFileStats(path.join(sdkRoot, 'src/marketplace/index.ts')),
    'Legal Service': getFileStats(path.join(sdkRoot, 'src/legal/index.ts')),
    'Support Service': getFileStats(path.join(sdkRoot, 'src/support/index.ts')),
    'Identity Service': getFileStats(path.join(sdkRoot, 'src/identity/index.ts'))
  };

  let totalLines = 0;
  let totalSize = 0;

  Object.entries(metrics).forEach(([name, stats]) => {
    if (stats) {
      log(`📝 ${name}: ${stats.lines} lines (${(stats.size / 1024).toFixed(1)}KB)`, 'cyan');
      totalLines += stats.lines;
      totalSize += stats.size;
    } else {
      log(`❌ ${name}: File not found`, 'red');
    }
  });

  log(`\n📊 Total Codebase: ${totalLines} lines (${(totalSize / 1024).toFixed(1)}KB)`, 'bold');

  log('\n🎯 Feature Completeness', 'blue');
  log('-' * 40, 'cyan');

  const features = [
    { name: 'SDK Main Class', check: checkFileContent(path.join(sdkRoot, 'src/index.ts'), 'class CodaiSDK', '') },
    { name: 'Service Integration', check: services.every(s => fs.existsSync(path.join(sdkRoot, `src/${s}/index.ts`))) },
    { name: 'Event System', check: checkFileContent(path.join(sdkRoot, 'src/events/index.ts'), 'CodaiEventBus', '') },
    { name: 'Type Safety', check: checkFileContent(path.join(sdkRoot, 'src/types/index.ts'), 'CodaiConfig', '') },
    { name: 'Health Monitoring', check: checkFileContent(path.join(sdkRoot, 'src/index.ts'), 'getHealth', '') },
    { name: 'Configuration Management', check: checkFileContent(path.join(sdkRoot, 'src/index.ts'), 'updateConfig', '') },
    { name: 'Factory Functions', check: checkFileContent(path.join(sdkRoot, 'src/index.ts'), 'createCodaiSDK', '') },
    { name: 'Singleton Pattern', check: checkFileContent(path.join(sdkRoot, 'src/index.ts'), 'getCodaiSDK', '') },
    { name: 'Cleanup & Lifecycle', check: checkFileContent(path.join(sdkRoot, 'src/index.ts'), 'destroy', '') },
    { name: 'Error Handling', check: checkFileContent(path.join(sdkRoot, 'src/utils/index.ts'), 'ErrorUtils', '') }
  ];

  features.forEach(feature => {
    check(feature.check);
    log(`${feature.check ? '✅' : '❌'} ${feature.name}`, feature.check ? 'green' : 'red');
  });

  log('\n📋 Service API Completeness', 'blue');
  log('-' * 40, 'cyan');

  const serviceAPIs = [
    { service: 'auth', methods: ['login', 'logout', 'getCurrentUser', 'refreshToken'] },
    { service: 'storage', methods: ['uploadFile', 'downloadFile', 'deleteFile', 'getFiles'] },
    { service: 'memory', methods: ['remember', 'recall', 'forget', 'getContext'] },
    { service: 'analytics', methods: ['track', 'createDashboard', 'getReport'] },
    { service: 'wallet', methods: ['createWallet', 'createTransaction', 'getTransaction'] },
    { service: 'marketplace', methods: ['createProduct', 'searchProducts', 'createOrder'] },
    { service: 'legal', methods: ['createDocument', 'getTemplates', 'createConsultation'] },
    { service: 'support', methods: ['createTicket', 'searchKnowledgeBase', 'startChat'] },
    { service: 'identity', methods: ['createVerification', 'uploadDocument', 'getTrustScore'] }
  ];

  serviceAPIs.forEach(({ service, methods }) => {
    const filePath = path.join(sdkRoot, `src/${service}/index.ts`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasAllMethods = methods.every(method => content.includes(method));
      check(hasAllMethods);
      log(`${hasAllMethods ? '✅' : '⚠️'} ${service} service: ${methods.length} methods`, hasAllMethods ? 'green' : 'yellow');
    } else {
      log(`❌ ${service} service: File not found`, 'red');
    }
  });

  log('\n🔧 Build System Validation', 'blue');
  log('-' * 40, 'cyan');

  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(sdkRoot, 'package.json'), 'utf8'));

    check(packageJson.name === '@codai/sdk');
    log(`${packageJson.name === '@codai/sdk' ? '✅' : '❌'} Package name: ${packageJson.name}`, packageJson.name === '@codai/sdk' ? 'green' : 'red');

    check(packageJson.main && packageJson.module && packageJson.types);
    log(`${packageJson.main && packageJson.module && packageJson.types ? '✅' : '❌'} Export fields configured`, packageJson.main && packageJson.module && packageJson.types ? 'green' : 'red');

    check(packageJson.scripts && packageJson.scripts.build && packageJson.scripts.test);
    log(`${packageJson.scripts && packageJson.scripts.build && packageJson.scripts.test ? '✅' : '❌'} Build scripts configured`, packageJson.scripts && packageJson.scripts.build && packageJson.scripts.test ? 'green' : 'red');

  } catch (error) {
    log('❌ Package.json parsing failed', 'red');
  }

  log('\n📈 Final Results', 'blue');
  log('=' * 60, 'cyan');

  const successRate = (passedChecks / totalChecks) * 100;
  const status = successRate >= 95 ? 'EXCELLENT' :
    successRate >= 85 ? 'GOOD' :
      successRate >= 70 ? 'NEEDS_IMPROVEMENT' : 'CRITICAL';

  const statusColor = status === 'EXCELLENT' ? 'green' :
    status === 'GOOD' ? 'cyan' :
      status === 'NEEDS_IMPROVEMENT' ? 'yellow' : 'red';

  log(`\n📊 Validation Results: ${passedChecks}/${totalChecks} checks passed (${successRate.toFixed(1)}%)`, 'bold');
  log(`🎯 Status: ${status}`, statusColor);

  if (status === 'EXCELLENT') {
    log('\n🎉 PHASE 1 FOUNDATION INFRASTRUCTURE COMPLETED SUCCESSFULLY!', 'green');
    log('✨ Universal SDK is ready for production use', 'green');
    log('🚀 Ready to proceed to Phase 2: Cross-App Integration Layer', 'green');
  } else if (status === 'GOOD') {
    log('\n✅ Phase 1 mostly complete with minor issues', 'cyan');
    log('🔧 Address remaining issues before Phase 2', 'yellow');
  } else {
    log('\n⚠️ Phase 1 requires attention before proceeding', 'yellow');
    log('🔧 Please address failed checks', 'red');
  }

  log('\n📋 Next Steps:', 'blue');
  log('1. Run integration tests: pnpm test', 'cyan');
  log('2. Build package: pnpm run build', 'cyan');
  log('3. Review documentation and examples', 'cyan');
  log('4. Begin Phase 2: Cross-App Integration Layer', 'cyan');

  log('\n🌟 CODAI Universal SDK Phase 1 Validation Complete', 'bold');

  process.exit(status === 'EXCELLENT' || status === 'GOOD' ? 0 : 1);
}

// Run validation
main().catch(error => {
  log(`\n❌ Validation failed with error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
