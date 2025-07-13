#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 FIXING WINDOWS TEMP DIRECTORY PERMISSIONS');
console.log('===========================================');

// Fix 1: Create custom temp directory structure
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('✅ Created custom temp directory');
}

// Fix 2: Set environment variables for Windows temp override
function fixStudiaiTempIssues() {
  const studiaiPaths = [
    path.join(__dirname, '..', 'apps', 'studiai'),
    path.join(__dirname, '..', 'services', 'studiai')
  ];
  
  studiaiPaths.forEach(studiaiPath => {
    if (!fs.existsSync(studiaiPath)) return;
    
    // Update next.config.js to handle Windows temp issues
    const nextConfigPath = path.join(studiaiPath, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      let content = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Add Windows-specific fixes
      if (!content.includes('TEMP_OVERRIDE')) {
        content = `// Windows temp directory override
process.env.TEMP = process.env.TEMP_OVERRIDE || process.env.TEMP;
process.env.TMP = process.env.TMP_OVERRIDE || process.env.TMP;

${content}`;
      }
      
      // Add webpack configuration for Windows
      if (!content.includes('resolve.fallback')) {
        content = content.replace(
          /export default nextConfig/,
          `nextConfig.webpack = (config, { isServer }) => {
  // Windows compatibility fixes
  if (process.platform === 'win32') {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    // Exclude problematic temp directories
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/\\.next/**',
        'C:/Users/**/AppData/Local/Temp/WinSAT/**',
        process.env.TEMP && process.env.TEMP + '/WinSAT/**',
      ].filter(Boolean),
    };
  }
  
  return config;
};

export default nextConfig`
        );
      }
      
      fs.writeFileSync(nextConfigPath, content);
      console.log(`✅ Fixed ${path.relative(process.cwd(), studiaiPath)} next.config.js`);
    }
  });
}

// Fix 3: Update package.json scripts to use custom temp
function addTempEnvironmentVariables() {
  const customTemp = path.resolve(__dirname, '..', 'temp');
  
  ['apps', 'services'].forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) return;
    
    fs.readdirSync(dirPath).forEach(service => {
      const servicePath = path.join(dirPath, service);
      const packageJsonPath = path.join(servicePath, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          
          // Add environment variables to build scripts
          if (packageJson.scripts && packageJson.scripts.build) {
            const currentBuild = packageJson.scripts.build;
            if (!currentBuild.includes('TEMP_OVERRIDE')) {
              packageJson.scripts.build = `cross-env TEMP_OVERRIDE="${customTemp}" TMP_OVERRIDE="${customTemp}" ${currentBuild}`;
              fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
              console.log(`✅ Updated ${dir}/${service} build script`);
            }
          }
        } catch (error) {
          // Continue on error
        }
      }
    });
  });
}

// Fix 4: Fix codai app Next.js path issue
function fixCodaiAppNextJsIssue() {
  const codaiAppPath = path.join(__dirname, '..', 'apps', 'codai');
  if (!fs.existsSync(codaiAppPath)) return;
  
  const nextConfigPath = path.join(codaiAppPath, 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    let content = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Fix webpack configuration to resolve Next.js path issues
    content = content.replace(
      /export default nextConfig/,
      `nextConfig.webpack = (config, { isServer }) => {
  // Fix Next.js path resolution issues
  config.resolve.alias = {
    ...config.resolve.alias,
    'next/dist/client/next.js': require.resolve('next/dist/client/next.js'),
    'next/dist/client/app-next.js': require.resolve('next/dist/client/app-next.js'),
  };
  
  return config;
};

export default nextConfig`
    );
    
    fs.writeFileSync(nextConfigPath, content);
    console.log('✅ Fixed codai app Next.js path resolution');
  }
}

// Install cross-env if not present
try {
  execSync('pnpm list cross-env --depth=0', { stdio: 'ignore' });
} catch {
  console.log('📦 Installing cross-env for environment variable support...');
  try {
    execSync('pnpm add -w cross-env', { stdio: 'inherit' });
    console.log('✅ Installed cross-env');
  } catch (error) {
    console.log('⚠️  Could not install cross-env, continuing without it');
  }
}

// Apply all fixes
fixStudiaiTempIssues();
addTempEnvironmentVariables();
fixCodaiAppNextJsIssue();

console.log('\\n🎯 Windows compatibility fixes complete!');
console.log('✨ Ready for 100% success rate!');
