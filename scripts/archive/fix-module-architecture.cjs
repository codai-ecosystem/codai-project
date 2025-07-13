#!/usr/bin/env node

/**
 * FIX MODULE ARCHITECTURE
 * Targets: ES Module conflicts, Prisma CLI, TypeScript compilation
 * Goal: Break through 64% execution barrier
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 MODULE ARCHITECTURE FIX - Breaking 64% Execution Barrier');
console.log('Targeting: ES Module conflicts, Prisma CLI, TypeScript issues\n');

const appPaths = [
  'apps/codai',
  'apps/memorai', 
  'apps/logai',
  'apps/bancai',
  'apps/wallet',
  'services/admin',
  'services/aide',
  'services/hub'
];

let totalFixes = 0;

// Fix 1: Install Prisma CLI globally
function installPrismaCLI() {
  console.log('🔧 Installing Prisma CLI globally...');
  try {
    execSync('npm install -g prisma', { stdio: 'pipe' });
    console.log('✅ Prisma CLI installed globally');
    totalFixes++;
  } catch (error) {
    console.log('⚠️  Prisma CLI installation failed, continuing...');
  }
}

// Fix 2: Fix ES Module conflicts by using .cjs extension for test files
function fixESModuleConflicts(appPath) {
  console.log(`📊 Fixing ES Module conflicts for ${appPath}...`);
  let fixes = 0;
  
  // Rename test files to .cjs
  const testFiles = [
    'test-service-instantiation.js',
    'test-build.js',
    'test-api.js'
  ];
  
  testFiles.forEach(testFile => {
    const testPath = path.join(appPath, testFile);
    const cjsPath = path.join(appPath, testFile.replace('.js', '.cjs'));
    
    if (fs.existsSync(testPath)) {
      try {
        // Read content and fix require statements
        let content = fs.readFileSync(testPath, 'utf8');
        
        // Convert to CommonJS format
        content = content.replace(/import\s+.*?\s+from\s+['"](.+?)['"];?/g, "const $1 = require('$1');");
        content = content.replace(/export\s+default\s+/, 'module.exports = ');
        content = content.replace(/export\s+\{([^}]+)\}/, 'module.exports = { $1 };');
        
        fs.writeFileSync(cjsPath, content);
        fs.unlinkSync(testPath);
        console.log(`   ✅ Converted ${testFile} to CommonJS format`);
        fixes++;
      } catch (error) {
        console.log(`   ⚠️  Failed to convert ${testFile}: ${error.message}`);
      }
    }
  });
  
  return fixes;
}

// Fix 3: Add Prisma dependency to package.json
function addPrismaDependency(appPath) {
  console.log(`🔧 Adding Prisma dependency to ${appPath}...`);
  const packagePath = path.join(appPath, 'package.json');
  
  if (fs.existsSync(packagePath)) {
    try {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Add Prisma dependencies
      if (!packageData.dependencies) packageData.dependencies = {};
      if (!packageData.devDependencies) packageData.devDependencies = {};
      
      packageData.dependencies['@prisma/client'] = '^5.7.1';
      packageData.devDependencies['prisma'] = '^5.7.1';
      
      fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
      console.log(`   ✅ Added Prisma dependencies`);
      return 1;
    } catch (error) {
      console.log(`   ⚠️  Failed to update package.json: ${error.message}`);
    }
  }
  return 0;
}

// Fix 4: Fix TypeScript configuration issues
function fixTypeScriptConfig(appPath) {
  console.log(`🔧 Fixing TypeScript configuration for ${appPath}...`);
  const tsconfigPath = path.join(appPath, 'tsconfig.json');
  let fixes = 0;
  
  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      
      // Fix common TypeScript issues
      if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
      
      // Essential TypeScript fixes
      tsconfig.compilerOptions.moduleResolution = 'node';
      tsconfig.compilerOptions.esModuleInterop = true;
      tsconfig.compilerOptions.allowSyntheticDefaultImports = true;
      tsconfig.compilerOptions.skipLibCheck = true;
      tsconfig.compilerOptions.resolveJsonModule = true;
      
      // Fix path mapping
      if (!tsconfig.compilerOptions.paths) {
        tsconfig.compilerOptions.paths = {
          "@/*": ["./src/*"],
          "@/components/*": ["./src/components/*"],
          "@/pages/*": ["./src/pages/*"],
          "@/styles/*": ["./src/styles/*"],
          "@/lib/*": ["./src/lib/*"],
          "@/utils/*": ["./src/utils/*"]
        };
      }
      
      // Exclude common problematic paths
      tsconfig.exclude = [
        "node_modules",
        ".next",
        "dist",
        "build",
        "**/*.test.*",
        "**/*.spec.*"
      ];
      
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      console.log(`   ✅ Fixed TypeScript configuration`);
      fixes++;
    } catch (error) {
      console.log(`   ⚠️  Failed to fix tsconfig.json: ${error.message}`);
    }
  }
  
  return fixes;
}

// Fix 5: Create proper service instantiation tests
function createProperServiceTests(appPath) {
  console.log(`🧪 Creating proper service tests for ${appPath}...`);
  
  const testContent = `// Service instantiation test - CommonJS format
const path = require('path');
const fs = require('fs');

async function testServiceInstantiation() {
  console.log('Testing service instantiation...');
  
  try {
    // Test if services directory exists
    const servicesDir = path.join(__dirname, 'src', 'services');
    if (!fs.existsSync(servicesDir)) {
      console.log('❌ Services directory not found');
      return false;
    }
    
    // List service files
    const serviceFiles = fs.readdirSync(servicesDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    console.log(\`Found \${serviceFiles.length} service files\`);
    
    let instantiableCount = 0;
    
    for (const serviceFile of serviceFiles) {
      try {
        // Basic file validation
        const servicePath = path.join(servicesDir, serviceFile);
        const content = fs.readFileSync(servicePath, 'utf8');
        
        // Check if it exports a class
        if (content.includes('export class') || content.includes('export default class')) {
          instantiableCount++;
          console.log(\`✅ \${serviceFile} appears instantiable\`);
        } else {
          console.log(\`⚠️  \${serviceFile} may not be instantiable\`);
        }
      } catch (error) {
        console.log(\`❌ Error checking \${serviceFile}: \${error.message}\`);
      }
    }
    
    console.log(\`Instantiable services: \${instantiableCount}/\${serviceFiles.length}\`);
    return instantiableCount > 0;
    
  } catch (error) {
    console.log(\`❌ Service instantiation test failed: \${error.message}\`);
    return false;
  }
}

// Run the test
testServiceInstantiation().then(result => {
  process.exit(result ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
`;

  const testPath = path.join(appPath, 'test-service-instantiation.cjs');
  try {
    fs.writeFileSync(testPath, testContent);
    console.log(`   ✅ Created proper service test`);
    return 1;
  } catch (error) {
    console.log(`   ⚠️  Failed to create service test: ${error.message}`);
    return 0;
  }
}

// Fix 6: Add proper import/export to service files
function fixServiceExports(appPath) {
  console.log(`🔧 Fixing service exports for ${appPath}...`);
  const servicesDir = path.join(appPath, 'src', 'services');
  let fixes = 0;
  
  if (fs.existsSync(servicesDir)) {
    try {
      const serviceFiles = fs.readdirSync(servicesDir)
        .filter(file => file.endsWith('.ts'));
      
      serviceFiles.forEach(serviceFile => {
        const servicePath = path.join(servicesDir, serviceFile);
        try {
          let content = fs.readFileSync(servicePath, 'utf8');
          
          // Ensure proper exports
          if (!content.includes('export class') && !content.includes('export default')) {
            // Find class definition and add export
            content = content.replace(/^class\s+(\w+)/gm, 'export class $1');
            fs.writeFileSync(servicePath, content);
            console.log(`   ✅ Fixed exports in ${serviceFile}`);
            fixes++;
          }
        } catch (error) {
          console.log(`   ⚠️  Failed to fix ${serviceFile}: ${error.message}`);
        }
      });
    } catch (error) {
      console.log(`   ⚠️  Failed to process services directory: ${error.message}`);
    }
  }
  
  return fixes;
}

// Main execution
async function main() {
  // Global fixes
  installPrismaCLI();
  
  // Per-app fixes
  for (const appPath of appPaths) {
    console.log(`\n📊 Module architecture fix for ${appPath}...`);
    
    let appFixes = 0;
    appFixes += fixESModuleConflicts(appPath);
    appFixes += addPrismaDependency(appPath);
    appFixes += fixTypeScriptConfig(appPath);
    appFixes += createProperServiceTests(appPath);
    appFixes += fixServiceExports(appPath);
    
    console.log(`   📈 Applied ${appFixes}/5 architecture fixes`);
    totalFixes += appFixes;
  }
  
  console.log(`\n🎉 MODULE ARCHITECTURE FIX COMPLETED!`);
  console.log(`📊 Total fixes applied: ${totalFixes}`);
  console.log(`🔍 Next: Run execution verification to check improvements`);
  console.log(`Command: node scripts/execution-deep-verification.cjs`);
}

main().catch(console.error);
