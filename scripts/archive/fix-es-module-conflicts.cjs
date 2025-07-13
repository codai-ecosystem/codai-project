#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Fix ES Module vs CommonJS conflicts in Next.js config files
 * Convert next.config.js to ES module syntax for services with "type": "module"
 */

console.log('🔧 FIXING ES MODULE CONFLICTS');
console.log('==============================');

const serviceDirs = [
  'apps',
  'services'
].flatMap(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) return [];
  
  return fs.readdirSync(fullPath)
    .map(service => ({ type: dir, name: service, path: path.join(fullPath, service) }))
    .filter(service => fs.statSync(service.path).isDirectory());
});

function fixNextConfig(servicePath) {
  const nextConfigPath = path.join(servicePath, 'next.config.js');
  const packageJsonPath = path.join(servicePath, 'package.json');
  
  if (!fs.existsSync(nextConfigPath) || !fs.existsSync(packageJsonPath)) {
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Only fix if package.json has "type": "module"
    if (packageJson.type === 'module') {
      let content = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Convert CommonJS to ES module syntax
      content = content.replace(/module\.exports\s*=\s*/, 'export default ');
      content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g, 'import $1 from \'$2\'');
      
      // Handle specific Next.js config patterns
      if (content.includes('module.exports')) {
        // Still has CommonJS syntax, let's convert it properly
        content = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
`;
      }
      
      fs.writeFileSync(nextConfigPath, content);
      return true;
    }
  } catch (error) {
    console.log(`    ❌ Error in ${servicePath}: ${error.message}`);
    return false;
  }
  
  return false;
}

// Fix all services
let fixedCount = 0;
console.log(`🔧 Checking ${serviceDirs.length} services for ES module conflicts...`);

for (const service of serviceDirs) {
  if (fixNextConfig(service.path)) {
    console.log(`  ✅ Fixed ${service.type}/${service.name}`);
    fixedCount++;
  }
}

console.log(`\\n🎯 Fixed ${fixedCount} Next.js config files for ES module compatibility!`);

// Also fix any .eslintrc.js files that might have the same issue
console.log('\\n🔧 Fixing ESLint config files...');

let eslintFixedCount = 0;
for (const service of serviceDirs) {
  const eslintConfigPath = path.join(service.path, '.eslintrc.js');
  const packageJsonPath = path.join(service.path, 'package.json');
  
  if (fs.existsSync(eslintConfigPath) && fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.type === 'module') {
        // Rename to .cjs to avoid ES module issues
        const eslintConfigCjsPath = path.join(service.path, '.eslintrc.cjs');
        fs.renameSync(eslintConfigPath, eslintConfigCjsPath);
        console.log(`  ✅ Renamed ${service.type}/${service.name}/.eslintrc.js to .cjs`);
        eslintFixedCount++;
      }
    } catch (error) {
      // Continue on error
    }
  }
}

console.log(`\\n🎯 Fixed ${eslintFixedCount} ESLint config files!`);
console.log('\\n✨ ES Module compatibility fixes complete!');
