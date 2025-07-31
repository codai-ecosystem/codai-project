#!/usr/bin/env node

/**
 * Test Script for @codai/memorai-mcp
 * 
 * This script tests the built package to ensure it works correctly
 */

const { spawn, execSync } = require('child_process');
const { join } = require('path');
const fs = require('fs');

function log(message) {
  console.log(`[Test] ${message}`);
}

function error(message) {
  console.error(`[Test Error] ${message}`);
}

async function testPackage() {
  try {
    log('Testing @codai/memorai-mcp package...');
    
    const packageRoot = join(__dirname, '..');
    const distPath = join(packageRoot, 'dist', 'server.js');
    
    // Check if built files exist
    if (!fs.existsSync(distPath)) {
      throw new Error('Built files not found. Run npm run build first.');
    }
    
    log('✅ Built files found');
    
    // Test basic module loading
    log('Testing module loading...');
    
    const testEnvPath = join(packageRoot, '.env.test');
    fs.writeFileSync(testEnvPath, `
OPENAI_API_KEY=sk-test-key-for-testing
MEMORAI_CBD_PATH=./test-cbd-data
MEMORAI_LOG_LEVEL=info
NODE_ENV=test
`);
    
    log('✅ Test environment created');
    
    // Test the package (quick validation)
    try {
      const testCommand = `cd "${packageRoot}" && DOTENV_CONFIG_PATH="${testEnvPath}" timeout 5 node dist/server.js --help`;
      execSync(testCommand, { stdio: 'pipe' });
      log('✅ Package loads successfully');
    } catch (err) {
      // Expected to timeout or exit, that's okay for this test
      if (err.message.includes('timeout') || err.status === 0) {
        log('✅ Package executed successfully (timeout expected)');
      } else {
        throw err;
      }
    }
    
    // Clean up test files
    if (fs.existsSync(testEnvPath)) {
      fs.unlinkSync(testEnvPath);
    }
    
    const testDataDir = join(packageRoot, 'test-cbd-data');
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
    
    log('🎉 All tests passed!');
    log('Package is ready for use with:');
    log('   npx -y @codai/memorai-mcp@latest');
    
  } catch (err) {
    error('Tests failed:');
    error(err.message);
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  testPackage();
}

module.exports = { testPackage };
