const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 CODAI ECOSYSTEM - REAL FUNCTIONALITY TESTING');
console.log('='.repeat(60));

// Test configurations
const testApps = [
  { name: 'codai', port: 3000 },
  { name: 'bancai', port: 3001 },
  { name: 'memorai', port: 3002 },
  { name: 'stocai', port: 3003 },
  { name: 'romai', port: 3004 }
];

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function runBuildTest(appName) {
  return new Promise((resolve) => {
    console.log(`\n🔨 Testing build for ${appName.toUpperCase()}...`);

    const buildProcess = spawn('pnpm', ['build'], {
      cwd: path.join('apps', appName),
      shell: true,
      stdio: 'pipe'
    });

    let buildOutput = '';
    let buildError = '';

    buildProcess.stdout.on('data', (data) => {
      buildOutput += data.toString();
    });

    buildProcess.stderr.on('data', (data) => {
      buildError += data.toString();
    });

    buildProcess.on('close', (code) => {
      testsRun++;

      if (code === 0) {
        console.log(`  ✅ ${appName} builds successfully`);
        testsPassed++;
        resolve({ success: true, app: appName, test: 'build' });
      } else {
        console.log(`  ❌ ${appName} build failed`);
        console.log(`     Error: ${buildError.slice(0, 200)}...`);
        testsFailed++;
        failedTests.push(`${appName} - build failed`);
        resolve({ success: false, app: appName, test: 'build', error: buildError });
      }
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      buildProcess.kill();
      console.log(`  ⏰ ${appName} build timed out`);
      testsFailed++;
      failedTests.push(`${appName} - build timeout`);
      resolve({ success: false, app: appName, test: 'build', error: 'timeout' });
    }, 60000);
  });
}

function checkAppStructure(appName) {
  console.log(`\n📁 Checking structure for ${appName.toUpperCase()}...`);

  const appPath = path.join('apps', appName);
  const requiredFiles = [
    'package.json',
    'app/layout.tsx',
    'app/page.tsx',
    'app/dashboard/page.tsx',
    'middleware.ts',
    'next.config.js'
  ];

  let structureOk = true;
  const missingFiles = [];

  for (const file of requiredFiles) {
    const filePath = path.join(appPath, file);
    if (!fs.existsSync(filePath)) {
      structureOk = false;
      missingFiles.push(file);
    }
  }

  testsRun++;

  if (structureOk) {
    console.log(`  ✅ ${appName} has all required files`);
    testsPassed++;
    return { success: true, app: appName, test: 'structure' };
  } else {
    console.log(`  ❌ ${appName} missing files: ${missingFiles.join(', ')}`);
    testsFailed++;
    failedTests.push(`${appName} - missing files: ${missingFiles.join(', ')}`);
    return { success: false, app: appName, test: 'structure', missing: missingFiles };
  }
}

function validateAppConfig(appName) {
  console.log(`\n⚙️  Validating config for ${appName.toUpperCase()}...`);

  try {
    const packagePath = path.join('apps', appName, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const hasRequiredDeps = [
      'next',
      'react',
      'react-dom',
      '@codai/shared-ui'
    ].every(dep =>
      packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
    );

    testsRun++;

    if (hasRequiredDeps) {
      console.log(`  ✅ ${appName} has required dependencies`);
      testsPassed++;
      return { success: true, app: appName, test: 'config' };
    } else {
      console.log(`  ❌ ${appName} missing required dependencies`);
      testsFailed++;
      failedTests.push(`${appName} - missing dependencies`);
      return { success: false, app: appName, test: 'config' };
    }
  } catch (error) {
    console.log(`  ❌ ${appName} config validation failed: ${error.message}`);
    testsFailed++;
    failedTests.push(`${appName} - config error: ${error.message}`);
    return { success: false, app: appName, test: 'config', error: error.message };
  }
}

async function runAllTests() {
  console.log(`\n🎯 Testing ${testApps.length} critical apps...\n`);

  for (const { name } of testApps) {
    console.log(`\n${'='.repeat(40)}`);
    console.log(`🧪 TESTING ${name.toUpperCase()}`);
    console.log(`${'='.repeat(40)}`);

    // Test 1: Check app structure
    checkAppStructure(name);

    // Test 2: Validate configuration
    validateAppConfig(name);

    // Test 3: Attempt build (this is the critical test)
    await runBuildTest(name);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`🧪 Total Tests Run: ${testsRun}`);
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%`);

  if (testsFailed > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test}`);
    });
    console.log('\n🚨 ECOSYSTEM IS NOT PRODUCTION READY!');
    console.log('⚠️  Critical issues need to be resolved before deployment.');
  } else {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Ecosystem appears to be production ready!');
  }

  console.log('\n' + '='.repeat(60));
}

// Run the tests
runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
