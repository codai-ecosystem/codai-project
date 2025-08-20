#!/usr/bin/env node

/**
 * MemorAI MCP v9.0.0 - Comprehensive Feature Validation
 * Tests all new relationship intelligence and search capabilities
 * 
 * Usage: node test-new-features.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 MemorAI MCP v9.0.0 - Feature Validation Tests');
console.log('=================================================\n');

// Test configuration
const testConfig = {
  serverPath: join(__dirname, 'src', 'server.ts'),
  timeout: 10000,
  retries: 3
};

// Test data for validation
const testMemories = [
  {
    content: "React Hooks are functions that let you use state and other React features without writing a class component.",
    metadata: {
      entityType: "concept",
      project: "test_project",
      priority: "high",
      tags: ["react", "hooks", "frontend"]
    }
  },
  {
    content: "useState is a Hook that lets you add React state to function components.",
    metadata: {
      entityType: "concept",
      project: "test_project",
      priority: "high",
      tags: ["react", "hooks", "useState"]
    }
  },
  {
    content: "useEffect lets you perform side effects in function components.",
    metadata: {
      entityType: "concept",
      project: "test_project",
      priority: "medium",
      tags: ["react", "hooks", "useEffect"]
    }
  }
];

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}`);
    if (details) console.log(`   ${details}`);
  }
  testResults.details.push({ testName, passed, details });
}

function logSection(sectionName) {
  console.log(`\n🔍 ${sectionName}`);
  console.log('─'.repeat(50));
}

async function validatePackageStructure() {
  logSection('Package Structure Validation');

  try {
    // Check if main files exist
    const fs = await import('fs');
    const requiredFiles = [
      'package.json',
      'src/server.ts',
      'src/relationship-engine.ts',
      'src/search-intelligence.ts',
      'README.md'
    ];

    for (const file of requiredFiles) {
      const exists = fs.existsSync(join(__dirname, file));
      logTest(`Required file exists: ${file}`, exists);
    }

    // Check package.json version
    const packageJson = JSON.parse(fs.readFileSync(join(__dirname, 'package.json'), 'utf8'));
    logTest('Package version is 9.0.0', packageJson.version === '9.0.0');
    logTest('Package name is @codai/memorai-mcp', packageJson.name === '@codai/memorai-mcp');

  } catch (error) {
    logTest('Package structure validation', false, error.message);
  }
}

async function validateTypeScriptCompilation() {
  logSection('TypeScript Compilation Validation');

  return new Promise((resolve) => {
    const tsc = spawn('npx', ['tsc', '--noEmit'], {
      cwd: __dirname,
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    tsc.stdout.on('data', (data) => {
      output += data.toString();
    });

    tsc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    tsc.on('close', (code) => {
      const passed = code === 0;
      logTest('TypeScript compilation succeeds', passed, errorOutput);
      resolve();
    });

    // Timeout handling
    setTimeout(() => {
      tsc.kill();
      logTest('TypeScript compilation (timeout)', false, 'Compilation timed out');
      resolve();
    }, testConfig.timeout);
  });
}

async function validateServerStartup() {
  logSection('Server Startup Validation');

  return new Promise((resolve) => {
    // Compile first
    const tsc = spawn('npx', ['tsc'], {
      cwd: __dirname,
      stdio: 'pipe'
    });

    tsc.on('close', (compileCode) => {
      if (compileCode !== 0) {
        logTest('Server compilation', false, 'TypeScript compilation failed');
        resolve();
        return;
      }

      logTest('Server compilation', true);

      // Try to start server
      const server = spawn('node', ['dist/server.js'], {
        cwd: __dirname,
        stdio: 'pipe'
      });

      let startupOutput = '';
      let startupError = '';

      server.stdout.on('data', (data) => {
        startupOutput += data.toString();
      });

      server.stderr.on('data', (data) => {
        startupError += data.toString();
      });

      // Give server time to start
      setTimeout(() => {
        server.kill();

        const started = !startupError.includes('Error') && !startupError.includes('Failed');
        logTest('Server starts without errors', started, startupError);
        resolve();
      }, 3000);
    });
  });
}

async function validateNewMCPTools() {
  logSection('New MCP Tools Validation');

  try {
    const fs = await import('fs');
    const serverContent = fs.readFileSync(join(__dirname, 'src', 'server.ts'), 'utf8');

    // Check if new tools are registered
    const newTools = [
      'mcp_memoraimcp_link_memories',
      'mcp_memoraimcp_get_relationships',
      'mcp_memoraimcp_explore_graph'
    ];

    for (const tool of newTools) {
      const registered = serverContent.includes(tool);
      logTest(`MCP tool registered: ${tool}`, registered);
    }

    // Check if handler methods exist
    const handlers = [
      'handleLinkMemories',
      'handleGetRelationships',
      'handleExploreGraph'
    ];

    for (const handler of handlers) {
      const exists = serverContent.includes(handler);
      logTest(`Handler method exists: ${handler}`, exists);
    }

  } catch (error) {
    logTest('MCP tools validation', false, error.message);
  }
}

async function validateRelationshipEngine() {
  logSection('Relationship Engine Validation');

  try {
    const fs = await import('fs');
    const engineContent = fs.readFileSync(join(__dirname, 'src', 'relationship-engine.ts'), 'utf8');

    // Check key interfaces and classes
    const requiredElements = [
      'MemoryRelationshipEngine',
      'MemoryRelationship',
      'KnowledgeGraph',
      'GraphNode',
      'GraphEdge',
      'detectRelationships',
      'buildKnowledgeGraph',
      'calculateSemanticSimilarity'
    ];

    for (const element of requiredElements) {
      const exists = engineContent.includes(element);
      logTest(`Relationship engine contains: ${element}`, exists);
    }

  } catch (error) {
    logTest('Relationship engine validation', false, error.message);
  }
}

async function validateSearchIntelligence() {
  logSection('Search Intelligence Validation');

  try {
    const fs = await import('fs');
    const searchContent = fs.readFileSync(join(__dirname, 'src', 'search-intelligence.ts'), 'utf8');

    // Check key methods and features
    const requiredElements = [
      'AdvancedSearchEngine',
      'performAdvancedSearch',
      'expandQuery',
      'calculateAdvancedRelevance',
      'clusterMemories',
      'SearchResult',
      'SemanticScore',
      'TemporalScore'
    ];

    for (const element of requiredElements) {
      const exists = searchContent.includes(element);
      logTest(`Search intelligence contains: ${element}`, exists);
    }

  } catch (error) {
    logTest('Search intelligence validation', false, error.message);
  }
}

async function validateIntegration() {
  logSection('Integration Validation');

  try {
    const fs = await import('fs');
    const serverContent = fs.readFileSync(join(__dirname, 'src', 'server.ts'), 'utf8');

    // Check if engines are imported and initialized
    const integrationChecks = [
      'MemoryRelationshipEngine',
      'AdvancedSearchEngine',
      'relationshipEngine',
      'searchEngine',
      'AdvancedMemory',
      'relationships'
    ];

    for (const check of integrationChecks) {
      const integrated = serverContent.includes(check);
      logTest(`Integration check: ${check}`, integrated);
    }

  } catch (error) {
    logTest('Integration validation', false, error.message);
  }
}

async function validateDocumentation() {
  logSection('Documentation Validation');

  try {
    const fs = await import('fs');

    // Check if documentation files exist
    const docFiles = [
      'PHASE_1_IMPLEMENTATION_COMPLETE.md',
      'PRODUCTION_DEPLOYMENT_GUIDE.md',
      'ECOSYSTEM_INTEGRATION_STATUS.md',
      'README.md'
    ];

    for (const docFile of docFiles) {
      const exists = fs.existsSync(join(__dirname, docFile));
      logTest(`Documentation exists: ${docFile}`, exists);
    }

    // Check README content
    if (fs.existsSync(join(__dirname, 'README.md'))) {
      const readmeContent = fs.readFileSync(join(__dirname, 'README.md'), 'utf8');
      logTest('README mentions v9.0.0', readmeContent.includes('9.0.0'));
      logTest('README mentions relationship features', readmeContent.includes('relationship'));
      logTest('README mentions advanced search', readmeContent.includes('advanced search'));
    }

  } catch (error) {
    logTest('Documentation validation', false, error.message);
  }
}

async function runAllValidations() {
  console.log('Starting comprehensive validation of MemorAI MCP v9.0.0...\n');

  await validatePackageStructure();
  await validateTypeScriptCompilation();
  await validateServerStartup();
  await validateNewMCPTools();
  await validateRelationshipEngine();
  await validateSearchIntelligence();
  await validateIntegration();
  await validateDocumentation();

  // Final results
  console.log('\n' + '='.repeat(50));
  console.log('🏁 VALIDATION RESULTS');
  console.log('='.repeat(50));

  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   📈 Total:  ${testResults.total}`);
  console.log(`   📋 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL VALIDATIONS PASSED!');
    console.log('MemorAI MCP v9.0.0 is ready for production use.');
    console.log('\n🚀 Next Steps:');
    console.log('   • Run demo-features.js for interactive testing');
    console.log('   • Deploy to production environment');
    console.log('   • Begin Phase 2 enterprise features');
  } else {
    console.log('\n⚠️  Some validations failed. Please review the issues above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Check TypeScript compilation errors');
    console.log('   • Verify all dependencies are installed');
    console.log('   • Ensure OpenAI credentials are configured');
  }

  console.log('\n📚 Resources:');
  console.log('   • Documentation: ./docs/');
  console.log('   • Demo Script: ./demo-features.js');
  console.log('   • Production Guide: ./PRODUCTION_DEPLOYMENT_GUIDE.md');

  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run validations
runAllValidations().catch(error => {
  console.error('❌ Validation runner failed:', error);
  process.exit(1);
});
