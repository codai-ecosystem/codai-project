const fs = require('fs');
const path = require('path');

// Comprehensive analysis of actual implementation vs. expected functionality
// This will check for real features, flows, and tests in each service

const services = [
  // Priority 1 - Core Platform
  { name: 'codai', type: 'app', description: 'Central Platform & AIDE Hub' },
  { name: 'logai', type: 'app', description: 'Identity & Authentication' },
  { name: 'memorai', type: 'app', description: 'AI Memory & Database Core' },
  
  // Priority 2 - Financial & Services
  { name: 'bancai', type: 'app', description: 'Financial Platform' },
  { name: 'wallet', type: 'app', description: 'Programmable Wallet' },
  { name: 'fabricai', type: 'app', description: 'AI Services Platform' },
  { name: 'x', type: 'app', description: 'AI Trading Platform' },
  
  // Priority 3 - User Applications
  { name: 'studiai', type: 'app', description: 'AI Education Platform' },
  { name: 'sociai', type: 'app', description: 'AI Social Platform' },
  { name: 'cumparai', type: 'app', description: 'AI Shopping Platform' },
  { name: 'publicai', type: 'app', description: 'Public AI Services' }
];

function analyzeServiceImplementation(servicePath, serviceName, description) {
  console.log(`\n🔍 ANALYZING ${serviceName.toUpperCase()}: ${description}`);
  
  const analysis = {
    name: serviceName,
    description,
    exists: false,
    hasPages: false,
    hasComponents: false,
    hasAPI: false,
    hasDatabase: false,
    hasTests: false,
    hasAuth: false,
    hasDocumentation: false,
    actualFeatures: [],
    missingFeatures: [],
    implementationScore: 0
  };
  
  if (!fs.existsSync(servicePath)) {
    console.log(`❌ Service directory not found: ${servicePath}`);
    return analysis;
  }
  
  analysis.exists = true;
  
  // Check for pages/app directory (Next.js apps)
  const appDir = path.join(servicePath, 'app');
  const pagesDir = path.join(servicePath, 'pages');
  if (fs.existsSync(appDir) || fs.existsSync(pagesDir)) {
    analysis.hasPages = true;
    const pageCount = countFiles(appDir, '.tsx') + countFiles(pagesDir, '.tsx');
    analysis.actualFeatures.push(`${pageCount} pages/routes`);
    console.log(`✅ Pages/Routes: ${pageCount} found`);
  } else {
    analysis.missingFeatures.push('Pages/Routes');
    console.log(`❌ No pages/app directory found`);
  }
  
  // Check for components
  const componentsDir = path.join(servicePath, 'components');
  if (fs.existsSync(componentsDir)) {
    analysis.hasComponents = true;
    const componentCount = countFiles(componentsDir, '.tsx');
    analysis.actualFeatures.push(`${componentCount} components`);
    console.log(`✅ Components: ${componentCount} found`);
  } else {
    analysis.missingFeatures.push('Components');
    console.log(`❌ No components directory found`);
  }
  
  // Check for API routes
  const apiDir = path.join(servicePath, 'app/api');
  const pagesApiDir = path.join(servicePath, 'pages/api');
  if (fs.existsSync(apiDir) || fs.existsSync(pagesApiDir)) {
    analysis.hasAPI = true;
    const apiCount = countFiles(apiDir, '.ts') + countFiles(pagesApiDir, '.ts');
    analysis.actualFeatures.push(`${apiCount} API routes`);
    console.log(`✅ API Routes: ${apiCount} found`);
  } else {
    analysis.missingFeatures.push('API Routes');
    console.log(`❌ No API routes found`);
  }
  
  // Check for database schema/models
  const prismaSchema = path.join(servicePath, 'prisma/schema.prisma');
  const dbDir = path.join(servicePath, 'db');
  const modelsDir = path.join(servicePath, 'models');
  if (fs.existsSync(prismaSchema) || fs.existsSync(dbDir) || fs.existsSync(modelsDir)) {
    analysis.hasDatabase = true;
    analysis.actualFeatures.push('Database schema');
    console.log(`✅ Database: Schema/models found`);
  } else {
    analysis.missingFeatures.push('Database Schema');
    console.log(`❌ No database schema found`);
  }
  
  // Check for tests
  const testsDir = path.join(servicePath, 'tests');
  const testDir = path.join(servicePath, 'test');
  const specFiles = countFiles(servicePath, '.test.ts') + countFiles(servicePath, '.spec.ts');
  if (fs.existsSync(testsDir) || fs.existsSync(testDir) || specFiles > 0) {
    analysis.hasTests = true;
    const testCount = countFiles(testsDir, '.test.ts') + countFiles(testDir, '.test.ts') + specFiles;
    analysis.actualFeatures.push(`${testCount} test files`);
    console.log(`✅ Tests: ${testCount} test files found`);
  } else {
    analysis.missingFeatures.push('Tests');
    console.log(`❌ No tests found`);
  }
  
  // Check for authentication
  const authFiles = findFiles(servicePath, ['auth', 'login', 'signup', 'session']);
  if (authFiles.length > 0) {
    analysis.hasAuth = true;
    analysis.actualFeatures.push(`${authFiles.length} auth files`);
    console.log(`✅ Authentication: ${authFiles.length} auth-related files found`);
  } else {
    analysis.missingFeatures.push('Authentication');
    console.log(`❌ No authentication implementation found`);
  }
  
  // Check for documentation
  const readmeFile = path.join(servicePath, 'README.md');
  const docsDir = path.join(servicePath, 'docs');
  if (fs.existsSync(readmeFile) || fs.existsSync(docsDir)) {
    analysis.hasDocumentation = true;
    analysis.actualFeatures.push('Documentation');
    console.log(`✅ Documentation: Found`);
  } else {
    analysis.missingFeatures.push('Documentation');
    console.log(`❌ No documentation found`);
  }
  
  // Calculate implementation score
  const totalChecks = 7; // pages, components, api, db, tests, auth, docs
  const passedChecks = [
    analysis.hasPages,
    analysis.hasComponents,
    analysis.hasAPI,
    analysis.hasDatabase,
    analysis.hasTests,
    analysis.hasAuth,
    analysis.hasDocumentation
  ].filter(Boolean).length;
  
  analysis.implementationScore = Math.round((passedChecks / totalChecks) * 100);
  
  console.log(`📊 Implementation Score: ${analysis.implementationScore}%`);
  console.log(`✅ Features: ${analysis.actualFeatures.join(', ')}`);
  console.log(`❌ Missing: ${analysis.missingFeatures.join(', ')}`);
  
  return analysis;
}

function countFiles(dir, extension) {
  if (!fs.existsSync(dir)) return 0;
  
  let count = 0;
  function countRecursive(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        try {
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
            countRecursive(itemPath);
          } else if (item.endsWith(extension)) {
            count++;
          }
        } catch (error) {
          // Skip files/directories we can't access
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  countRecursive(dir);
  return count;
}

function findFiles(dir, keywords) {
  if (!fs.existsSync(dir)) return [];
  
  const foundFiles = [];
  function searchRecursive(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory() && !item.includes('node_modules')) {
          searchRecursive(itemPath);
        } else if (stat.isFile()) {
          const fileName = item.toLowerCase();
          for (const keyword of keywords) {
            if (fileName.includes(keyword.toLowerCase())) {
              foundFiles.push(itemPath);
              break;
            }
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  searchRecursive(dir);
  return foundFiles;
}

async function analyzeEcosystemImplementation() {
  console.log('🔍 COMPREHENSIVE CODAI ECOSYSTEM IMPLEMENTATION ANALYSIS');
  console.log('========================================================\n');
  
  const results = [];
  let totalScore = 0;
  
  for (const service of services) {
    const appPath = path.resolve(__dirname, '..', 'apps', service.name);
    const servicePath = path.resolve(__dirname, '..', 'services', service.name);
    
    // Check both app and service directories
    if (fs.existsSync(appPath)) {
      const analysis = analyzeServiceImplementation(appPath, `${service.name} (app)`, service.description);
      results.push(analysis);
      totalScore += analysis.implementationScore;
    }
    
    if (fs.existsSync(servicePath)) {
      const analysis = analyzeServiceImplementation(servicePath, `${service.name} (service)`, service.description);
      results.push(analysis);
      totalScore += analysis.implementationScore;
    }
    
    if (!fs.existsSync(appPath) && !fs.existsSync(servicePath)) {
      console.log(`\n❌ ${service.name.toUpperCase()}: COMPLETELY MISSING!`);
      results.push({
        name: service.name,
        description: service.description,
        implementationScore: 0,
        missingFeatures: ['Entire Service Missing']
      });
    }
  }
  
  // Generate comprehensive report
  console.log('\n🎯 ECOSYSTEM IMPLEMENTATION SUMMARY');
  console.log('=====================================');
  
  const averageScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;
  console.log(`📊 Overall Implementation Score: ${averageScore}%`);
  
  // Services by implementation level
  const fullyImplemented = results.filter(r => r.implementationScore >= 80);
  const partiallyImplemented = results.filter(r => r.implementationScore >= 30 && r.implementationScore < 80);
  const barelyImplemented = results.filter(r => r.implementationScore > 0 && r.implementationScore < 30);
  const notImplemented = results.filter(r => r.implementationScore === 0);
  
  console.log(`\n📈 IMPLEMENTATION BREAKDOWN:`);
  console.log(`   Fully Implemented (80%+): ${fullyImplemented.length} services`);
  console.log(`   Partially Implemented (30-79%): ${partiallyImplemented.length} services`);
  console.log(`   Barely Implemented (<30%): ${barelyImplemented.length} services`);
  console.log(`   Not Implemented (0%): ${notImplemented.length} services`);
  
  // Most critical missing features
  const allMissingFeatures = results.flatMap(r => r.missingFeatures || []);
  const featureCounts = {};
  allMissingFeatures.forEach(feature => {
    featureCounts[feature] = (featureCounts[feature] || 0) + 1;
  });
  
  console.log(`\n🚨 MOST CRITICAL MISSING FEATURES:`);
  Object.entries(featureCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([feature, count]) => {
      console.log(`   ${feature}: Missing in ${count} services`);
    });
  
  // Generate detailed recommendations
  console.log(`\n💡 IMPLEMENTATION RECOMMENDATIONS:`);
  if (averageScore < 50) {
    console.log(`   🔥 CRITICAL: Only ${averageScore}% implemented - major development needed!`);
  } else if (averageScore < 80) {
    console.log(`   ⚠️  MODERATE: ${averageScore}% implemented - significant work remains`);
  } else {
    console.log(`   ✅ GOOD: ${averageScore}% implemented - finishing touches needed`);
  }
  
  // Save detailed results
  const reportPath = path.resolve(__dirname, '..', 'IMPLEMENTATION_ANALYSIS.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    overallScore: averageScore,
    totalServices: results.length,
    fullyImplemented: fullyImplemented.length,
    partiallyImplemented: partiallyImplemented.length,
    barelyImplemented: barelyImplemented.length,
    notImplemented: notImplemented.length,
    criticalMissingFeatures: Object.entries(featureCounts).sort(([,a], [,b]) => b - a),
    detailedResults: results
  }, null, 2));
  
  console.log(`\n📄 Detailed analysis saved to: IMPLEMENTATION_ANALYSIS.json`);
  
  return {
    overallScore: averageScore,
    results,
    recommendations: averageScore < 50 ? 'CRITICAL_DEVELOPMENT_NEEDED' : 
                    averageScore < 80 ? 'SIGNIFICANT_WORK_REMAINS' : 
                    'FINISHING_TOUCHES_NEEDED'
  };
}

// Execute the analysis
analyzeEcosystemImplementation().catch(console.error);
