#!/usr/bin/env node

/**
 * CODAI Ecosystem - Current State Analysis Script
 * Analyzes UI/UX, themes, i18n, and integration status across all services
 */

const fs = require('fs').promises;
const path = require('path');

const rootDir = path.join(__dirname, '..');

const SERVICES = ['gateway', 'codai', 'admin', 'hub', 'id', 'bancai'];
const PORTS = { gateway: 4000, codai: 4001, admin: 4002, hub: 4003, id: 4004, bancai: 4005 };

async function analyzeServiceUI(serviceName) {
  const servicePath = path.join(rootDir, 'apps', serviceName);
  const analysis = {
    service: serviceName,
    port: PORTS[serviceName],
    ui: {
      hasGlassmorphism: false,
      hasThemeSystem: false,
      hasResponsiveDesign: false,
      hardcodedStyles: [],
      componentStructure: 'Unknown'
    },
    i18n: {
      hasI18n: false,
      translationFiles: [],
      hardcodedText: [],
      supportedLanguages: []
    },
    themes: {
      hasDarkMode: false,
      hasLightMode: false,
      hasColorScheme: false,
      themeFiles: []
    },
    integration: {
      hasSSO: false,
      hasSharedComponents: false,
      hasSettingsSync: false,
      apiEndpoints: []
    }
  };

  try {
    // Check if service directory exists
    await fs.access(servicePath);
    
    // Analyze package.json
    const packageJson = JSON.parse(await fs.readFile(path.join(servicePath, 'package.json'), 'utf-8'));
    analysis.ui.componentStructure = packageJson.dependencies?.['@codai/shared-ui'] ? 'Shared Components' : 'Independent';
    
    // Check for theme-related dependencies
    analysis.themes.hasThemeSystem = !!(
      packageJson.dependencies?.['next-themes'] || 
      packageJson.dependencies?.['@next-themes/react'] ||
      packageJson.devDependencies?.['tailwindcss']
    );
    
    // Check for i18n dependencies
    analysis.i18n.hasI18n = !!(
      packageJson.dependencies?.['next-i18next'] ||
      packageJson.dependencies?.['i18next'] ||
      packageJson.dependencies?.['react-i18next']
    );
    
    // Analyze source files
    const srcPath = path.join(servicePath, 'src');
    if (await fs.access(srcPath).then(() => true).catch(() => false)) {
      await analyzeSourceFiles(srcPath, analysis);
    }
    
    // Check for translation files
    const publicPath = path.join(servicePath, 'public');
    if (await fs.access(publicPath).then(() => true).catch(() => false)) {
      const localesPath = path.join(publicPath, 'locales');
      if (await fs.access(localesPath).then(() => true).catch(() => false)) {
        analysis.i18n.translationFiles = await fs.readdir(localesPath);
      }
    }
    
  } catch (error) {
    console.warn(`⚠️  Could not analyze ${serviceName}: ${error.message}`);
  }

  return analysis;
}

async function analyzeSourceFiles(srcPath, analysis) {
  try {
    const files = await getJSXFiles(srcPath);
    
    for (const file of files.slice(0, 10)) { // Analyze first 10 files
      const content = await fs.readFile(file, 'utf-8');
      
      // Check for glassmorphism patterns
      if (content.includes('backdrop-blur') || content.includes('bg-opacity') || content.includes('bg-white/')) {
        analysis.ui.hasGlassmorphism = true;
      }
      
      // Check for theme patterns
      if (content.includes('dark:') || content.includes('theme-')) {
        analysis.themes.hasDarkMode = true;
        analysis.themes.hasLightMode = true;
      }
      
      // Check for responsive design
      if (content.includes('sm:') || content.includes('md:') || content.includes('lg:')) {
        analysis.ui.hasResponsiveDesign = true;
      }
      
      // Check for hardcoded styles (simplified check)
      const hardcodedMatches = content.match(/className="[^"]*\d+px[^"]*"/g);
      if (hardcodedMatches) {
        analysis.ui.hardcodedStyles.push(...hardcodedMatches);
      }
      
      // Check for hardcoded text (simplified check)
      const textMatches = content.match(/>[\s]*[A-Z][a-z\s]{3,30}[\s]*</g);
      if (textMatches) {
        analysis.i18n.hardcodedText.push(...textMatches.slice(0, 5)); // First 5 matches
      }
      
      // Check for SSO patterns
      if (content.includes('useAuth') || content.includes('signIn') || content.includes('@codai/sso')) {
        analysis.integration.hasSSO = true;
      }
    }
  } catch (error) {
    console.warn(`Could not analyze source files: ${error.message}`);
  }
}

async function getJSXFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...await getJSXFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function testServiceHealth() {
  const healthStatus = {};
  
  for (const service of SERVICES) {
    const port = PORTS[service];
    try {
      // Use dynamic import for fetch in Node.js
      const { default: fetch } = await import('node-fetch');
      const response = await fetch(`http://localhost:${port}`);
      healthStatus[service] = {
        status: response.status,
        available: response.status < 500
      };
    } catch (error) {
      healthStatus[service] = {
        status: 'Unavailable',
        available: false,
        error: error.message
      };
    }
  }
  
  return healthStatus;
}

async function generateReport(analyses, healthStatus) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalServices: SERVICES.length,
      availableServices: Object.values(healthStatus).filter(s => s.available).length,
      servicesWithGlassmorphism: analyses.filter(a => a.ui.hasGlassmorphism).length,
      servicesWithThemes: analyses.filter(a => a.themes.hasDarkMode).length,
      servicesWithI18n: analyses.filter(a => a.i18n.hasI18n).length,
      servicesWithSSO: analyses.filter(a => a.integration.hasSSO).length
    },
    healthStatus,
    serviceAnalyses: analyses,
    recommendations: []
  };
  
  // Generate recommendations
  if (report.summary.servicesWithGlassmorphism < SERVICES.length) {
    report.recommendations.push('🎨 Implement glassmorphism design system across all services');
  }
  
  if (report.summary.servicesWithThemes < SERVICES.length) {
    report.recommendations.push('🌓 Implement dark/light theme system in all services');
  }
  
  if (report.summary.servicesWithI18n < SERVICES.length) {
    report.recommendations.push('🌍 Add internationalization support to all services');
  }
  
  if (report.summary.servicesWithSSO < SERVICES.length) {
    report.recommendations.push('🔐 Implement SSO integration across all services');
  }
  
  analyses.forEach(analysis => {
    if (analysis.ui.hardcodedStyles.length > 0) {
      report.recommendations.push(`🔧 Remove hardcoded styles from ${analysis.service}`);
    }
    if (analysis.i18n.hardcodedText.length > 0) {
      report.recommendations.push(`📝 Remove hardcoded text from ${analysis.service}`);
    }
  });
  
  return report;
}

async function main() {
  console.log('🔍 CODAI Ecosystem - Current State Analysis Starting...\n');
  
  console.log('📊 Testing service health...');
  const healthStatus = await testServiceHealth();
  
  console.log('🔍 Analyzing service implementations...');
  const analyses = [];
  
  for (const service of SERVICES) {
    console.log(`  📋 Analyzing ${service}...`);
    const analysis = await analyzeServiceUI(service);
    analyses.push(analysis);
  }
  
  console.log('\n📝 Generating comprehensive report...');
  const report = await generateReport(analyses, healthStatus);
  
  // Save report
  const reportsDir = path.join(rootDir, 'reports');
  await fs.mkdir(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, 'current-state-analysis.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  // Display summary
  console.log('\n🎯 ANALYSIS SUMMARY:');
  console.log(`📱 Services Available: ${report.summary.availableServices}/${report.summary.totalServices}`);
  console.log(`🎨 Glassmorphism Design: ${report.summary.servicesWithGlassmorphism}/${report.summary.totalServices}`);
  console.log(`🌓 Theme Support: ${report.summary.servicesWithThemes}/${report.summary.totalServices}`);
  console.log(`🌍 Internationalization: ${report.summary.servicesWithI18n}/${report.summary.totalServices}`);
  console.log(`🔐 SSO Integration: ${report.summary.servicesWithSSO}/${report.summary.totalServices}`);
  
  console.log('\n💡 TOP RECOMMENDATIONS:');
  report.recommendations.slice(0, 5).forEach(rec => console.log(`  ${rec}`));
  
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  console.log('\n✅ Analysis complete! Ready for Phase 2 implementation.');
  
  return report;
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { analyzeCurrentState: main };
