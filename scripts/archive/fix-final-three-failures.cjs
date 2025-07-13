const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Final fixes for the last 3 failing services to achieve 100% success rate
const finalFixes = {
  // Fix codai app Next.js path resolution
  'apps/codai': {
    fixes: [
      'next_config_paths',
      'typescript_paths',
      'install_uuid'
    ]
  },
  
  // Fix studiai app - missing uuid dependency
  'apps/studiai': {
    fixes: [
      'install_uuid',
      'turbopack_config'
    ]
  },
  
  // Fix studiai service - missing uuid dependency
  'services/studiai': {
    fixes: [
      'install_uuid',
      'turbopack_config'
    ]
  }
};

function executeCommand(command, cwd) {
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    return false;
  }
}

function installUuid(servicePath) {
  console.log(`📦 Installing uuid dependency in ${servicePath}...`);
  return executeCommand('npm install uuid @types/uuid', servicePath);
}

function fixNextConfig(servicePath) {
  const configPath = path.join(servicePath, 'next.config.js');
  if (!fs.existsSync(configPath)) return true;
  
  console.log(`🔧 Fixing Next.js config in ${servicePath}...`);
  
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Fix turbopack deprecation warning
    if (content.includes('experimental.turbo')) {
      content = content.replace(
        'experimental: {\n    turbo: {',
        'turbopack: {'
      );
      content = content.replace(
        'experimental: { turbo: {',
        'turbopack: {'
      );
    }
    
    // Ensure proper path resolution
    if (!content.includes('resolve:')) {
      content = content.replace(
        'webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {',
        `webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enhanced path resolution
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.fallback = config.resolve.fallback || {};
    
    // Add current directory to module resolution
    config.resolve.modules = config.resolve.modules || [];
    config.resolve.modules.push(path.resolve(__dirname));
    config.resolve.modules.push(path.resolve(__dirname, 'node_modules'));`
      );
    }
    
    fs.writeFileSync(configPath, content);
    console.log(`✅ Fixed Next.js config in ${servicePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to fix Next.js config in ${servicePath}:`, error.message);
    return false;
  }
}

function fixTsConfig(servicePath) {
  const configPath = path.join(servicePath, 'tsconfig.json');
  if (!fs.existsSync(configPath)) return true;
  
  console.log(`🔧 Fixing TypeScript config in ${servicePath}...`);
  
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const tsConfig = JSON.parse(content);
    
    // Ensure proper path resolution
    tsConfig.compilerOptions = tsConfig.compilerOptions || {};
    tsConfig.compilerOptions.baseUrl = tsConfig.compilerOptions.baseUrl || ".";
    tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {};
    
    // Add common path mappings
    if (!tsConfig.compilerOptions.paths["@/*"]) {
      tsConfig.compilerOptions.paths["@/*"] = ["./*"];
    }
    if (!tsConfig.compilerOptions.paths["@/components/*"]) {
      tsConfig.compilerOptions.paths["@/components/*"] = ["./components/*"];
    }
    
    fs.writeFileSync(configPath, JSON.stringify(tsConfig, null, 2));
    console.log(`✅ Fixed TypeScript config in ${servicePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to fix TypeScript config in ${servicePath}:`, error.message);
    return false;
  }
}

async function applyFinalFixes() {
  console.log('🎯 APPLYING FINAL FIXES FOR 100% SUCCESS RATE...\n');
  
  let totalFixed = 0;
  let totalAttempted = 0;
  
  for (const [serviceName, config] of Object.entries(finalFixes)) {
    const servicePath = path.resolve(__dirname, '..', serviceName);
    
    if (!fs.existsSync(servicePath)) {
      console.log(`⚠️  Service not found: ${serviceName}`);
      continue;
    }
    
    console.log(`\n🔧 Fixing ${serviceName}...`);
    
    let serviceFixed = true;
    totalAttempted++;
    
    for (const fix of config.fixes) {
      switch (fix) {
        case 'install_uuid':
          if (!installUuid(servicePath)) serviceFixed = false;
          break;
          
        case 'next_config_paths':
          if (!fixNextConfig(servicePath)) serviceFixed = false;
          break;
          
        case 'typescript_paths':
          if (!fixTsConfig(servicePath)) serviceFixed = false;
          break;
          
        case 'turbopack_config':
          if (!fixNextConfig(servicePath)) serviceFixed = false;
          break;
          
        default:
          console.log(`⚠️  Unknown fix type: ${fix}`);
      }
    }
    
    if (serviceFixed) {
      totalFixed++;
      console.log(`✅ Successfully fixed ${serviceName}`);
    } else {
      console.log(`❌ Failed to fix ${serviceName}`);
    }
  }
  
  console.log(`\n🎯 FINAL FIXES SUMMARY:`);
  console.log(`   Services Fixed: ${totalFixed}/${totalAttempted}`);
  console.log(`   Success Rate: ${Math.round((totalFixed / totalAttempted) * 100)}%`);
  
  if (totalFixed === totalAttempted) {
    console.log(`\n🚀 ALL FINAL FIXES APPLIED SUCCESSFULLY!`);
    console.log(`🎯 Ready for 100% success rate validation!`);
  } else {
    console.log(`\n⚠️  Some fixes failed - manual intervention may be required`);
  }
}

// Execute the fixes
applyFinalFixes().catch(console.error);
