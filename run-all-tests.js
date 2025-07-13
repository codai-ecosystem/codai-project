#!/usr/bin/env node

/**
 * Global Test Runner for All Apps
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runAllTests() {
  console.log('🧪 Running comprehensive tests for all apps...\n');
  
  const appsDir = path.join(__dirname, 'apps');
  const apps = fs.readdirSync(appsDir).filter(item => {
    return fs.statSync(path.join(appsDir, item)).isDirectory();
  });
  
  const results = [];
  
  for (const app of apps) {
    console.log(`📋 Testing ${app}...`);
    
    try {
      const appPath = path.join(appsDir, app);
      const configPath = path.join(appPath, 'vitest.config.ts');
      
      if (fs.existsSync(configPath)) {
        execSync('pnpm vitest run', { 
          cwd: appPath, 
          stdio: 'inherit',
          timeout: 60000 
        });
        results.push({ app, status: 'PASSED' });
        console.log(`   ✅ ${app} tests passed\n`);
      } else {
        console.log(`   ⚠️  No test config found for ${app}\n`);
        results.push({ app, status: 'SKIPPED' });
      }
    } catch (error) {
      console.error(`   ❌ ${app} tests failed\n`);
      results.push({ app, status: 'FAILED' });
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const skipped = results.filter(r => r.status === 'SKIPPED').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Check the output above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
  }
}

runAllTests().catch(console.error);