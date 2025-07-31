#!/usr/bin/env node

/**
 * Build Script for @codai/memorai-mcp
 * 
 * This script builds the TypeScript source into JavaScript
 * for the published npm package
 */

const { execSync } = require('child_process');
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');

function log(message) {
  console.log(`[Build] ${message}`);
}

function error(message) {
  console.error(`[Build Error] ${message}`);
}

async function build() {
  try {
    log('Starting build process...');
    
    // Ensure dist directory exists
    const distDir = join(__dirname, '..', 'dist');
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
      log('Created dist directory');
    }
    
    // Run TypeScript compiler
    log('Compiling TypeScript...');
    execSync('npx tsc', { 
      cwd: join(__dirname, '..'),
      stdio: 'inherit' 
    });
    
    // Make the main entry executable
    const mainEntry = join(distDir, 'server.js');
    if (existsSync(mainEntry)) {
      // Add shebang line
      const fs = require('fs');
      const content = fs.readFileSync(mainEntry, 'utf8');
      if (!content.startsWith('#!/usr/bin/env node')) {
        fs.writeFileSync(mainEntry, '#!/usr/bin/env node\n' + content);
        log('Added shebang to server.js');
      }
    }
    
    log('✅ Build completed successfully!');
    log(`   📦 Package: @codai/memorai-mcp`);
    log(`   📁 Output: ${distDir}`);
    log(`   🎯 Entry: dist/server.js`);
    
  } catch (err) {
    error('Build failed:');
    error(err.message);
    process.exit(1);
  }
}

// Run build if script is executed directly
if (require.main === module) {
  build();
}

module.exports = { build };
