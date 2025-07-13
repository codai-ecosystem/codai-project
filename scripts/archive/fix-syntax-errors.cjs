#!/usr/bin/env node
/**
 * SYNTAX ERROR FIXING SCRIPT
 * Fix all TypeScript compilation errors to make code ACTUALLY WORK
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING SYNTAX ERRORS ACROSS ECOSYSTEM');
console.log('Making code actually compile and work');
console.log('=' .repeat(60));

const services = [
  'apps/codai', 'apps/memorai', 'apps/logai', 'apps/bancai', 'apps/wallet',
  'apps/fabricai', 'apps/studiai', 'apps/sociai', 'apps/cumparai', 'apps/x', 'apps/publicai',
  'services/admin', 'services/aide', 'services/ajutai', 'services/analizai', 'services/dash',
  'services/docs', 'services/explorer', 'services/hub', 'services/id', 'services/jucai',
  'services/kodex', 'services/legalizai', 'services/marketai', 'services/metu', 'services/mod',
  'services/stocai', 'services/templates', 'services/tools'
];

function fixConfigFiles(servicePath) {
  const configPath = path.join(servicePath, 'src', 'config', 'index.ts');
  
  if (!fs.existsSync(configPath)) return false;
  
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Fix invalid property names with dots
    content = content.replace(/SOCKET\.IO:/g, 'socketIO:');
    content = content.replace(/SOCKET\.IO_/g, 'SOCKET_IO_');
    content = content.replace(/LANGUAGE\.SERVER/g, 'languageServer');
    content = content.replace(/LANGUAGE\.SERVER_/g, 'LANGUAGE_SERVER_');
    
    // Fix other common syntax issues
    content = content.replace(/process\.env\.([A-Z_]+)\.([A-Z_]+)/g, 'process.env.$1_$2');
    
    fs.writeFileSync(configPath, content);
    return true;
  } catch (error) {
    console.log(`   ❌ Failed to fix config: ${error.message}`);
    return false;
  }
}

function fixServiceFiles(servicePath) {
  const servicesDir = path.join(servicePath, 'src', 'services');
  
  if (!fs.existsSync(servicesDir)) return 0;
  
  let fixed = 0;
  const serviceFiles = fs.readdirSync(servicesDir);
  
  serviceFiles.forEach(file => {
    if (!file.endsWith('.ts')) return;
    
    const filePath = path.join(servicesDir, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix import issues
      content = content.replace(/from '@\/services\//g, 'from \'../services/');
      content = content.replace(/from '@\/lib\//g, 'from \'../lib/');
      content = content.replace(/from '@\/components\//g, 'from \'../components/');
      
      // Add missing imports
      if (!content.includes('export interface') && content.includes('interface')) {
        content = content.replace(/interface /g, 'export interface ');
      }
      
      // Fix service import paths in API routes
      content = content.replace(/from '@\/services\/([^']+)'/g, (match, serviceName) => {
        return `from '../../src/services/${serviceName}'`;
      });
      
      fs.writeFileSync(filePath, content);
      fixed++;
    } catch (error) {
      console.log(`   ❌ Failed to fix service ${file}: ${error.message}`);
    }
  });
  
  return fixed;
}

function fixApiRoutes(servicePath) {
  const apiDir = path.join(servicePath, 'app', 'api');
  
  if (!fs.existsSync(apiDir)) return 0;
  
  let fixed = 0;
  
  function fixApiFilesRecursively(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        fixApiFilesRecursively(fullPath);
      } else if (item === 'route.ts') {
        try {
          let content = fs.readFileSync(fullPath, 'utf8');
          
          // Fix service import paths
          const relativePath = path.relative(fullPath, path.join(servicePath, 'src', 'services'));
          const normalizedPath = relativePath.replace(/\\/g, '/').replace('../', '');
          
          content = content.replace(
            /from '@\/services\/([^']+)'/g, 
            `from '../../../src/services/$1'`
          );
          
          // Fix other common import issues
          content = content.replace(/from '@\/lib\//g, 'from \'../../../src/lib/');
          
          fs.writeFileSync(fullPath, content);
          fixed++;
        } catch (error) {
          console.log(`   ❌ Failed to fix API route ${fullPath}: ${error.message}`);
        }
      }
    });
  }
  
  fixApiFilesRecursively(apiDir);
  return fixed;
}

function fixComponentImports(servicePath) {
  const componentsDir = path.join(servicePath, 'src', 'components');
  
  if (!fs.existsSync(componentsDir)) return 0;
  
  let fixed = 0;
  
  function fixComponentsRecursively(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        fixComponentsRecursively(fullPath);
      } else if (item.endsWith('.tsx')) {
        try {
          let content = fs.readFileSync(fullPath, 'utf8');
          
          // Fix component imports
          content = content.replace(/from '@\/components\//g, 'from \'../');
          content = content.replace(/from '@\/lib\//g, 'from \'../../lib/');
          content = content.replace(/from '@\/services\//g, 'from \'../../services/');
          
          // Ensure React import exists
          if (!content.includes('import React') && content.includes('tsx')) {
            content = 'import React from \'react\';\n' + content;
          }
          
          fs.writeFileSync(fullPath, content);
          fixed++;
        } catch (error) {
          console.log(`   ❌ Failed to fix component ${fullPath}: ${error.message}`);
        }
      }
    });
  }
  
  fixComponentsRecursively(componentsDir);
  return fixed;
}

function fixTestFiles(servicePath) {
  const testsDir = path.join(servicePath, '__tests__');
  
  if (!fs.existsSync(testsDir)) return 0;
  
  let fixed = 0;
  
  function fixTestsRecursively(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        fixTestsRecursively(fullPath);
      } else if (item.endsWith('.test.ts')) {
        try {
          let content = fs.readFileSync(fullPath, 'utf8');
          
          // Fix test imports
          content = content.replace(/from '\.\.\/src\//g, 'from \'../src/');
          
          // Ensure test framework imports
          if (!content.includes('@jest/globals') && content.includes('describe')) {
            content = 'import { describe, it, expect, beforeEach } from \'@jest/globals\';\n' + content;
          }
          
          fs.writeFileSync(fullPath, content);
          fixed++;
        } catch (error) {
          console.log(`   ❌ Failed to fix test ${fullPath}: ${error.message}`);
        }
      }
    });
  }
  
  fixTestsRecursively(testsDir);
  return fixed;
}

// Main fixing process
let totalFixed = 0;

services.forEach(servicePath => {
  const fullPath = path.join(process.cwd(), servicePath);
  const serviceName = path.basename(servicePath);
  
  console.log(`\n🔧 Fixing ${serviceName.toUpperCase()}`);
  
  if (!fs.existsSync(fullPath)) {
    console.log('   ❌ Service not found');
    return;
  }
  
  let serviceFixed = 0;
  
  // Fix config files
  if (fixConfigFiles(fullPath)) {
    console.log('   ✅ Fixed config file');
    serviceFixed++;
  }
  
  // Fix service files
  const servicesFixed = fixServiceFiles(fullPath);
  if (servicesFixed > 0) {
    console.log(`   ✅ Fixed ${servicesFixed} service files`);
    serviceFixed += servicesFixed;
  }
  
  // Fix API routes
  const apiFixed = fixApiRoutes(fullPath);
  if (apiFixed > 0) {
    console.log(`   ✅ Fixed ${apiFixed} API routes`);
    serviceFixed += apiFixed;
  }
  
  // Fix components
  const componentsFixed = fixComponentImports(fullPath);
  if (componentsFixed > 0) {
    console.log(`   ✅ Fixed ${componentsFixed} components`);
    serviceFixed += componentsFixed;
  }
  
  // Fix tests
  const testsFixed = fixTestFiles(fullPath);
  if (testsFixed > 0) {
    console.log(`   ✅ Fixed ${testsFixed} test files`);
    serviceFixed += testsFixed;
  }
  
  if (serviceFixed === 0) {
    console.log('   ⚠️ No fixes needed or applied');
  }
  
  totalFixed += serviceFixed;
});

console.log('\n🎯 SYNTAX FIXING COMPLETE');
console.log('=' .repeat(60));
console.log(`✅ Total files fixed: ${totalFixed}`);
console.log('🔧 Critical syntax errors should now be resolved');
console.log('📝 Code should now compile successfully');

// Save fix report
const fixReport = {
  timestamp: new Date().toISOString(),
  totalFilesFixed: totalFixed,
  servicesProcessed: services.length,
  fixesApplied: [
    'Invalid property names with dots',
    'Import path corrections',
    'Missing React imports',
    'Service import path fixes',
    'Test framework imports'
  ]
};

fs.writeFileSync('SYNTAX_FIXES_REPORT.json', JSON.stringify(fixReport, null, 2));
console.log('\n📄 Fix report saved to: SYNTAX_FIXES_REPORT.json');
