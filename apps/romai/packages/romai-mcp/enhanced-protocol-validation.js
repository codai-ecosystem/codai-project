#!/usr/bin/env node

/**
 * ROMAI Enhanced MCP Server Protocol Validation Test
 * Tests complete MCP protocol implementation: Tools + Resources + Prompts
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';

console.log('🚀 ROMAI ENHANCED MCP SERVER PROTOCOL VALIDATION');
console.log('===============================================');
console.log('🎯 Testing complete MCP protocol: Tools + Resources + Prompts');
console.log('');

let serverProcess;
let testResults = {
  startup: false,
  tools: { count: 0, working: false },
  resources: { count: 0, working: false },
  prompts: { count: 0, working: false },
  performance: { startupTime: 0, memoryUsage: 0 },
  errors: []
};

async function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Starting Enhanced MCP Server...');
    const startTime = Date.now();

    serverProcess = spawn('node', ['dist/server.js'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || 'test-key',
        AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || 'https://test.openai.azure.com',
        AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4'
      }
    });

    let initComplete = false;

    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log(`📋 Server: ${output.trim()}`);

      if (output.includes('Enhanced Server running') && !initComplete) {
        initComplete = true;
        testResults.startup = true;
        testResults.performance.startupTime = Date.now() - startTime;
        console.log(`✅ Server started successfully in ${testResults.performance.startupTime}ms`);
        resolve();
      }
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`📤 Server Output: ${output.trim()}`);
    });

    serverProcess.on('error', (error) => {
      console.error(`❌ Server Error: ${error.message}`);
      testResults.errors.push(error.message);
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!initComplete) {
        reject(new Error('Server startup timeout'));
      }
    }, 10000);
  });
}

async function sendMCPRequest(request) {
  return new Promise((resolve, reject) => {
    let responseData = '';
    let hasStarted = false;

    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 5000);

    serverProcess.stdout.on('data', (data) => {
      responseData += data.toString();

      // Look for complete JSON response
      try {
        const lines = responseData.split('\n');
        for (const line of lines) {
          if (line.trim() && line.startsWith('{')) {
            const response = JSON.parse(line);
            clearTimeout(timeout);
            resolve(response);
            return;
          }
        }
      } catch (e) {
        // Not a complete JSON response yet
      }
    });

    // Send the request
    const requestStr = JSON.stringify(request) + '\n';
    serverProcess.stdin.write(requestStr);
  });
}

async function testToolsSupport() {
  console.log('\n🔧 Testing Tools Support...');

  try {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    };

    const response = await sendMCPRequest(request);

    if (response.result && response.result.tools) {
      testResults.tools.count = response.result.tools.length;
      testResults.tools.working = true;

      console.log(`✅ Tools working: ${testResults.tools.count} tools available`);
      response.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    } else {
      throw new Error('Invalid tools response');
    }
  } catch (error) {
    console.error(`❌ Tools test failed: ${error.message}`);
    testResults.errors.push(`Tools: ${error.message}`);
  }
}

async function testResourcesSupport() {
  console.log('\n📚 Testing Resources Support...');

  try {
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'resources/list'
    };

    const response = await sendMCPRequest(request);

    if (response.result && response.result.resources) {
      testResults.resources.count = response.result.resources.length;
      testResults.resources.working = true;

      console.log(`✅ Resources working: ${testResults.resources.count} resources available`);
      response.result.resources.forEach(resource => {
        console.log(`   - ${resource.name}: ${resource.description}`);
      });

      // Test reading a specific resource
      if (response.result.resources.length > 0) {
        const firstResource = response.result.resources[0];
        const readRequest = {
          jsonrpc: '2.0',
          id: 3,
          method: 'resources/read',
          params: {
            uri: firstResource.uri
          }
        };

        const readResponse = await sendMCPRequest(readRequest);
        if (readResponse.result && readResponse.result.contents) {
          console.log(`✅ Resource reading working: ${firstResource.name}`);
          console.log(`   Content length: ${readResponse.result.contents[0].text.length} characters`);
        }
      }
    } else {
      throw new Error('Invalid resources response');
    }
  } catch (error) {
    console.error(`❌ Resources test failed: ${error.message}`);
    testResults.errors.push(`Resources: ${error.message}`);
  }
}

async function testPromptsSupport() {
  console.log('\n🎯 Testing Prompts Support...');

  try {
    const request = {
      jsonrpc: '2.0',
      id: 4,
      method: 'prompts/list'
    };

    const response = await sendMCPRequest(request);

    if (response.result && response.result.prompts) {
      testResults.prompts.count = response.result.prompts.length;
      testResults.prompts.working = true;

      console.log(`✅ Prompts working: ${testResults.prompts.count} prompts available`);
      response.result.prompts.forEach(prompt => {
        console.log(`   - ${prompt.name}: ${prompt.description}`);
      });

      // Test getting a specific prompt
      if (response.result.prompts.length > 0) {
        const firstPrompt = response.result.prompts[0];
        const getRequest = {
          jsonrpc: '2.0',
          id: 5,
          method: 'prompts/get',
          params: {
            name: firstPrompt.name,
            arguments: firstPrompt.arguments.reduce((acc, arg) => {
              if (arg.required) {
                acc[arg.name] = 'test_value';
              }
              return acc;
            }, {})
          }
        };

        const getResponse = await sendMCPRequest(getRequest);
        if (getResponse.result && getResponse.result.messages) {
          console.log(`✅ Prompt generation working: ${firstPrompt.name}`);
          console.log(`   Generated prompt length: ${getResponse.result.messages[0].content.text.length} characters`);
        }
      }
    } else {
      throw new Error('Invalid prompts response');
    }
  } catch (error) {
    console.error(`❌ Prompts test failed: ${error.message}`);
    testResults.errors.push(`Prompts: ${error.message}`);
  }
}

function generateComplianceReport() {
  console.log('\n📊 MCP PROTOCOL COMPLIANCE REPORT');
  console.log('==================================');

  const protocolCompliance = {
    tools: testResults.tools.working,
    resources: testResults.resources.working,
    prompts: testResults.prompts.working
  };

  const implementedCapabilities = Object.values(protocolCompliance).filter(Boolean).length;
  const totalCapabilities = 3;
  const compliancePercentage = (implementedCapabilities / totalCapabilities) * 100;

  console.log(`🏆 Protocol Compliance: ${compliancePercentage}% (${implementedCapabilities}/${totalCapabilities})`);
  console.log('');

  // Capability breakdown
  console.log('📋 Capability Status:');
  console.log(`   ✅ Tools: ${testResults.tools.working ? 'IMPLEMENTED' : 'MISSING'} (${testResults.tools.count} available)`);
  console.log(`   ✅ Resources: ${testResults.resources.working ? 'IMPLEMENTED' : 'MISSING'} (${testResults.resources.count} available)`);
  console.log(`   ✅ Prompts: ${testResults.prompts.working ? 'IMPLEMENTED' : 'MISSING'} (${testResults.prompts.count} available)`);
  console.log('');

  // Performance metrics
  console.log('⚡ Performance Metrics:');
  console.log(`   Startup Time: ${testResults.performance.startupTime}ms`);
  console.log(`   Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
  console.log('');

  // World-class assessment
  const worldClassScore = calculateWorldClassScore();
  console.log('🌟 World-Class Assessment:');
  console.log(`   Overall Score: ${worldClassScore}/100`);
  console.log(`   Grade: ${getGrade(worldClassScore)}`);
  console.log(`   Status: ${getStatus(worldClassScore)}`);
  console.log('');

  if (testResults.errors.length > 0) {
    console.log('❌ Errors Encountered:');
    testResults.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
    console.log('');
  }

  // Transformation progress
  console.log('🚀 TRANSFORMATION PROGRESS');
  console.log('==========================');
  console.log(`✅ Phase 1 Implementation: ${compliancePercentage}% complete`);
  console.log(`   - MCP Protocol: ${compliancePercentage}% (${implementedCapabilities}/3 capabilities)`);
  console.log(`   - Romanian Resources: ${testResults.resources.working ? '100%' : '0%'}`);
  console.log(`   - Business Prompts: ${testResults.prompts.working ? '100%' : '0%'}`);
  console.log('');

  return {
    compliance: compliancePercentage,
    worldClassScore,
    grade: getGrade(worldClassScore),
    status: getStatus(worldClassScore),
    capabilities: protocolCompliance,
    performance: testResults.performance,
    errors: testResults.errors
  };
}

function calculateWorldClassScore() {
  let score = 0;

  // Protocol compliance (40 points max)
  if (testResults.tools.working) score += 10;
  if (testResults.resources.working) score += 15; // Resources are critical
  if (testResults.prompts.working) score += 15; // Prompts are critical

  // Performance (30 points max)
  if (testResults.performance.startupTime < 1000) score += 15; // Fast startup
  if (testResults.performance.startupTime < 500) score += 5; // Very fast
  if (testResults.startup) score += 10; // Reliable startup

  // Feature completeness (30 points max)
  const featureScore = (testResults.tools.count >= 5 ? 10 : 0) +
    (testResults.resources.count >= 3 ? 10 : 0) +
    (testResults.prompts.count >= 3 ? 10 : 0);
  score += featureScore;

  return Math.min(score, 100);
}

function getGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  return 'D';
}

function getStatus(score) {
  if (score >= 95) return 'WORLD-CLASS ENTERPRISE LEADER';
  if (score >= 90) return 'ENTERPRISE READY';
  if (score >= 80) return 'BUSINESS READY';
  if (score >= 70) return 'GOOD FOUNDATION';
  if (score >= 60) return 'DEVELOPING';
  return 'NEEDS IMPROVEMENT';
}

// Main test execution
async function runTests() {
  try {
    console.log('🎯 Starting comprehensive MCP protocol validation...');
    console.log('');

    await startServer();

    // Wait a moment for server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testToolsSupport();
    await testResourcesSupport();
    await testPromptsSupport();

    const report = generateComplianceReport();

    // Save detailed report
    const detailedReport = {
      timestamp: new Date().toISOString(),
      testResults,
      compliance: report,
      conclusion: {
        protocolCompliance: `${report.compliance}%`,
        worldClassStatus: report.status,
        phase1Progress: report.compliance >= 100 ? 'COMPLETED' : 'IN PROGRESS',
        nextSteps: report.compliance >= 100 ?
          ['Phase 2: Enterprise Infrastructure', 'Add logging & monitoring', 'Multi-tenant support'] :
          ['Complete MCP protocol implementation', 'Fix missing capabilities']
      }
    };

    writeFileSync('enhanced-protocol-validation.json', JSON.stringify(detailedReport, null, 2));
    console.log('📄 Detailed report saved: enhanced-protocol-validation.json');

    // Final assessment
    console.log('\n🏆 FINAL ASSESSMENT');
    console.log('==================');
    if (report.compliance >= 100 && report.worldClassScore >= 90) {
      console.log('🎉 SUCCESS: Phase 1 transformation COMPLETED!');
      console.log('✅ ROMAI now has complete MCP protocol support');
      console.log('🚀 Ready for Phase 2: Enterprise Infrastructure');
    } else if (report.compliance >= 100) {
      console.log('✅ Protocol compliance achieved, performance optimization needed');
    } else {
      console.log('⚠️  Protocol implementation incomplete - continuing development');
    }

  } catch (error) {
    console.error(`❌ Test execution failed: ${error.message}`);
    testResults.errors.push(error.message);
  } finally {
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
    process.exit(testResults.errors.length === 0 ? 0 : 1);
  }
}

runTests().catch(console.error);
