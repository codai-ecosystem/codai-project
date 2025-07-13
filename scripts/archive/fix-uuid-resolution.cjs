const fs = require('fs');
const path = require('path');

// Targeted fix for uuid module resolution in studiai services
// This addresses the "Can't resolve 'uuid'" webpack error despite uuid being in package.json

const services = [
  'apps/studiai',
  'services/studiai'
];

function fixUuidModuleResolution(servicePath) {
  console.log(`🔧 Fixing uuid module resolution in ${servicePath}...`);
  
  // Fix 1: Update next.config.js to properly resolve uuid as ES module
  const nextConfigPath = path.join(servicePath, 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    try {
      let content = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Ensure webpack config handles uuid properly
      if (!content.includes('config.resolve.alias')) {
        const webpackConfigRegex = /webpack:\s*\(config[^}]+\)\s*=>\s*{/;
        if (webpackConfigRegex.test(content)) {
          content = content.replace(
            webpackConfigRegex,
            `webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix UUID module resolution
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.fallback = config.resolve.fallback || {};
    
    // Explicitly resolve uuid package
    config.resolve.alias['uuid'] = require.resolve('uuid');
    
    // Add ES module support for uuid
    config.resolve.extensionAlias = config.resolve.extensionAlias || {};
    config.resolve.extensionAlias['.js'] = ['.js', '.ts', '.tsx'];
    
    // Handle ES modules properly
    config.experiments = config.experiments || {};
    config.experiments.topLevelAwait = true;`
          );
        } else {
          // Add webpack config if it doesn't exist
          const configBodyRegex = /(module\.exports\s*=\s*{[^}]*)(}\s*$)/s;
          if (configBodyRegex.test(content)) {
            content = content.replace(
              configBodyRegex,
              `$1,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix UUID module resolution
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['uuid'] = require.resolve('uuid');
    
    // Add ES module support
    config.resolve.extensionAlias = config.resolve.extensionAlias || {};
    config.resolve.extensionAlias['.js'] = ['.js', '.ts', '.tsx'];
    
    config.experiments = config.experiments || {};
    config.experiments.topLevelAwait = true;
    
    return config;
  }
$2`
            );
          }
        }
      }
      
      fs.writeFileSync(nextConfigPath, content);
      console.log(`✅ Updated next.config.js for ${servicePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to update next.config.js for ${servicePath}:`, error.message);
      return false;
    }
  }
  
  return true;
}

function fixTsConfigPaths(servicePath) {
  console.log(`🔧 Fixing TypeScript paths in ${servicePath}...`);
  
  const tsConfigPath = path.join(servicePath, 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    try {
      const content = fs.readFileSync(tsConfigPath, 'utf8');
      const tsConfig = JSON.parse(content);
      
      // Ensure proper module resolution
      tsConfig.compilerOptions = tsConfig.compilerOptions || {};
      tsConfig.compilerOptions.moduleResolution = "node";
      tsConfig.compilerOptions.allowSyntheticDefaultImports = true;
      tsConfig.compilerOptions.esModuleInterop = true;
      
      // Add specific path for uuid
      tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {};
      tsConfig.compilerOptions.paths["uuid"] = ["node_modules/uuid"];
      
      fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      console.log(`✅ Updated tsconfig.json for ${servicePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to update tsconfig.json for ${servicePath}:`, error.message);
      return false;
    }
  }
  
  return true;
}

function ensureUuidInstallation(servicePath) {
  console.log(`🔧 Ensuring uuid installation in ${servicePath}...`);
  
  const nodeModulesPath = path.join(servicePath, 'node_modules', 'uuid');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`⚠️  UUID not found in node_modules for ${servicePath}`);
    return false;
  }
  
  console.log(`✅ UUID found in node_modules for ${servicePath}`);
  return true;
}

async function applyUuidFixes() {
  console.log('🎯 APPLYING UUID MODULE RESOLUTION FIXES...\n');
  
  let totalFixed = 0;
  let totalAttempted = 0;
  
  for (const serviceName of services) {
    const servicePath = path.resolve(__dirname, '..', serviceName);
    
    if (!fs.existsSync(servicePath)) {
      console.log(`⚠️  Service not found: ${serviceName}`);
      continue;
    }
    
    console.log(`\n🔧 Fixing ${serviceName}...`);
    totalAttempted++;
    
    let success = true;
    
    // Check UUID installation
    if (!ensureUuidInstallation(servicePath)) {
      success = false;
    }
    
    // Fix Next.js config
    if (!fixUuidModuleResolution(servicePath)) {
      success = false;
    }
    
    // Fix TypeScript config
    if (!fixTsConfigPaths(servicePath)) {
      success = false;
    }
    
    if (success) {
      totalFixed++;
      console.log(`✅ Successfully fixed ${serviceName}`);
    } else {
      console.log(`❌ Failed to fix ${serviceName}`);
    }
  }
  
  console.log(`\n🎯 UUID FIXES SUMMARY:`);
  console.log(`   Services Fixed: ${totalFixed}/${totalAttempted}`);
  console.log(`   Success Rate: ${Math.round((totalFixed / totalAttempted) * 100)}%`);
  
  if (totalFixed === totalAttempted) {
    console.log(`\n🚀 ALL UUID FIXES APPLIED SUCCESSFULLY!`);
    console.log(`🎯 Ready for 100% success rate validation!`);
  } else {
    console.log(`\n⚠️  Some fixes failed - manual intervention may be required`);
  }
}

// Execute the fixes
applyUuidFixes().catch(console.error);
