#!/usr/bin/env node
/**
 * BRUTAL REALITY CHECK SCRIPT
 * Exposes the REAL truth about implementations
 * No mercy, no false positives, only harsh reality
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 BRUTAL REALITY CHECK - EXPOSING THE TRUTH');
console.log('=' .repeat(60));

// Services to check
const apps = ['codai', 'memorai', 'logai', 'bancai', 'wallet', 'fabricai', 'studiai', 'sociai', 'cumparai', 'x', 'publicai'];
const services = ['admin', 'aide', 'ajutai', 'analizai', 'dash', 'docs', 'explorer', 'hub', 'id', 'jucai', 'kodex', 'legalizai', 'marketai', 'metu', 'mod', 'stocai', 'templates', 'tools'];

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function countFiles(dirPath, extension = '.ts') {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const files = fs.readdirSync(dirPath, { recursive: true });
    return files.filter(file => file.endsWith(extension)).length;
  } catch {
    return 0;
  }
}

function readFileContent(filePath) {
  try {
    if (!fs.existsSync(filePath)) return '';
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function brutallycheckService(serviceName, isApp = false) {
  const baseDir = isApp ? 'apps' : 'services';
  const servicePath = path.join(process.cwd(), baseDir, serviceName);
  
  console.log(`\n🔍 BRUTAL CHECK: ${serviceName.toUpperCase()}`);
  console.log('-'.repeat(40));
  
  if (!fs.existsSync(servicePath)) {
    console.log('❌ SERVICE DOES NOT EXIST!');
    return {
      exists: false,
      apis: 0,
      components: 0,
      integrations: 0,
      services: 0,
      tests: 0,
      config: 0,
      totalScore: 0
    };
  }
  
  // API Routes - be BRUTAL
  const apiPath = path.join(servicePath, 'app', 'api');
  const apiCount = countFiles(apiPath);
  console.log(`📡 API Routes: ${apiCount} files`);
  
  // List actual API files found
  if (apiCount > 0) {
    try {
      const apiFiles = fs.readdirSync(apiPath, { recursive: true }).filter(f => f.endsWith('.ts'));
      console.log(`   Actual APIs: ${apiFiles.join(', ')}`);
    } catch {}
  }
  
  // Components - count REAL implementations
  const componentsPath = path.join(servicePath, 'src', 'components');
  const componentCount = countFiles(componentsPath, '.tsx');
  console.log(`🎨 Components: ${componentCount} files`);
  
  // Integrations
  const integrationsPath = path.join(servicePath, 'lib', 'integrations');
  const integrationCount = countFiles(integrationsPath);
  console.log(`🔗 Integrations: ${integrationCount} files`);
  
  // Services/Business Logic
  const servicesPath = path.join(servicePath, 'src', 'services');
  const serviceCount = countFiles(servicesPath);
  console.log(`🧠 Services: ${serviceCount} files`);
  
  // Tests
  const testsPath = path.join(servicePath, '__tests__');
  const testCount = countFiles(testsPath);
  console.log(`🧪 Tests: ${testCount} files`);
  
  // Config files
  const configFiles = [
    path.join(servicePath, 'package.json'),
    path.join(servicePath, 'next.config.js'),
    path.join(servicePath, 'tsconfig.json'),
    path.join(servicePath, '.env.example')
  ];
  const configCount = configFiles.filter(fileExists).length;
  console.log(`⚙️ Config Files: ${configCount}/4 files`);
  
  // BRUTAL REALITY SCORE
  const totalFiles = apiCount + componentCount + integrationCount + serviceCount + testCount + configCount;
  const expectedMinimum = 20; // Minimum for a real service
  const completionScore = Math.min(totalFiles / expectedMinimum, 1);
  
  console.log(`💯 REALITY SCORE: ${Math.round(completionScore * 100)}% (${totalFiles} total files)`);
  
  if (totalFiles < 10) {
    console.log('🚨 CRITICAL: This service is basically empty!');
  } else if (totalFiles < 20) {
    console.log('⚠️ WARNING: Minimal implementation detected');
  } else {
    console.log('✅ GOOD: Substantial implementation found');
  }
  
  return {
    exists: true,
    apis: apiCount,
    components: componentCount,
    integrations: integrationCount,
    services: serviceCount,
    tests: testCount,
    config: configCount,
    totalFiles: totalFiles,
    totalScore: completionScore
  };
}

// Check all apps
console.log('\n🎯 CHECKING CORE APPLICATIONS');
console.log('=' .repeat(30));

const appResults = {};
apps.forEach(app => {
  appResults[app] = brutallycheckService(app, true);
});

// Check all services  
console.log('\n🛠️ CHECKING EXTENDED SERVICES');
console.log('=' .repeat(30));

const serviceResults = {};
services.forEach(service => {
  serviceResults[service] = brutallycheckService(service, false);
});

// BRUTAL SUMMARY
console.log('\n🚨 BRUTAL REALITY SUMMARY');
console.log('=' .repeat(60));

const allResults = { ...appResults, ...serviceResults };
const existingServices = Object.values(allResults).filter(r => r.exists);
const totalServices = Object.keys(allResults).length;
const existingCount = existingServices.length;

console.log(`📊 SERVICE EXISTENCE: ${existingCount}/${totalServices} (${Math.round(existingCount/totalServices*100)}%)`);

// Average scores
const avgApis = existingServices.reduce((sum, r) => sum + r.apis, 0) / existingCount;
const avgComponents = existingServices.reduce((sum, r) => sum + r.components, 0) / existingCount;
const avgIntegrations = existingServices.reduce((sum, r) => sum + r.integrations, 0) / existingCount;
const avgServices = existingServices.reduce((sum, r) => sum + r.services, 0) / existingCount;
const avgTests = existingServices.reduce((sum, r) => sum + r.tests, 0) / existingCount;
const avgConfig = existingServices.reduce((sum, r) => sum + r.config, 0) / existingCount;
const avgTotalScore = existingServices.reduce((sum, r) => sum + r.totalScore, 0) / existingCount;

console.log(`📡 AVERAGE API ROUTES: ${avgApis.toFixed(1)}`);
console.log(`🎨 AVERAGE COMPONENTS: ${avgComponents.toFixed(1)}`);
console.log(`🔗 AVERAGE INTEGRATIONS: ${avgIntegrations.toFixed(1)}`);
console.log(`🧠 AVERAGE SERVICES: ${avgServices.toFixed(1)}`);
console.log(`🧪 AVERAGE TESTS: ${avgTests.toFixed(1)}`);
console.log(`⚙️ AVERAGE CONFIG: ${avgConfig.toFixed(1)}`);

console.log(`\n💯 OVERALL REALITY SCORE: ${Math.round(avgTotalScore * 100)}%`);

// TOP AND BOTTOM PERFORMERS
const sortedByScore = existingServices.map((result, index) => ({
  name: Object.keys(allResults)[Object.values(allResults).indexOf(result)],
  score: result.totalScore,
  files: result.totalFiles
})).sort((a, b) => b.score - a.score);

console.log('\n🏆 TOP 5 PERFORMERS:');
sortedByScore.slice(0, 5).forEach((service, index) => {
  console.log(`   ${index + 1}. ${service.name}: ${Math.round(service.score * 100)}% (${service.files} files)`);
});

console.log('\n🚨 BOTTOM 5 PERFORMERS:');
sortedByScore.slice(-5).reverse().forEach((service, index) => {
  console.log(`   ${5-index}. ${service.name}: ${Math.round(service.score * 100)}% (${service.files} files)`);
});

// HARSH REALITY CHECK
if (avgTotalScore < 0.3) {
  console.log('\n🚨 HARSH REALITY: The ecosystem is mostly EMPTY!');
  console.log('Most services have minimal or no real implementation.');
} else if (avgTotalScore < 0.6) {
  console.log('\n⚠️ REALITY CHECK: The ecosystem is partially implemented.');
  console.log('Some services have good implementation, others are lacking.');
} else if (avgTotalScore < 0.9) {
  console.log('\n✅ GOOD NEWS: The ecosystem is well implemented.');
  console.log('Most services have substantial functionality.');
} else {
  console.log('\n🎉 EXCELLENT: The ecosystem is fully implemented!');
  console.log('All services have comprehensive functionality.');
}

// Save brutal results
const brutalReport = {
  timestamp: new Date().toISOString(),
  totalServices: totalServices,
  existingServices: existingCount,
  averageScores: {
    apis: avgApis,
    components: avgComponents,
    integrations: avgIntegrations,
    services: avgServices,
    tests: avgTests,
    config: avgConfig,
    overall: avgTotalScore
  },
  detailedResults: allResults,
  topPerformers: sortedByScore.slice(0, 5),
  bottomPerformers: sortedByScore.slice(-5)
};

fs.writeFileSync('BRUTAL_REALITY_CHECK_REPORT.json', JSON.stringify(brutalReport, null, 2));
console.log('\n📄 Brutal reality report saved to: BRUTAL_REALITY_CHECK_REPORT.json');
console.log('\n💀 REALITY EXPOSED! No more false claims allowed!');
