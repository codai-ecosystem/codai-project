#!/usr/bin/env node
/**
 * 🎯 CODAI ECOSYSTEM COMPREHENSIVE HEALTH CHECKER
 * Automated testing script for all 26 services
 * 
 * Tests: HTTP Response, UI Loading, API Endpoints, Performance
 */

import https from 'https';
import http from 'http';
import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';
import { URL } from 'url';

// Service definitions based on current deployment
const SERVICES = [
  // Foundation Apps (Next.js)
  { name: 'CodAI Platform', url: 'http://localhost:4030', type: 'nextjs', domain: 'codai.ro' },
  { name: 'MemorAI', url: 'http://localhost:4031', type: 'nextjs', domain: 'memorai.ro' },
  { name: 'LogAI', url: 'http://localhost:4032', type: 'nextjs', domain: 'logai.ro' },
  { name: 'BancAI', url: 'http://localhost:4033', type: 'nextjs', domain: 'bancai.ro' },
  { name: 'Wallet', url: 'http://localhost:4034', type: 'nextjs', domain: 'wallet.bancai.ro' },
  { name: 'FabricAI', url: 'http://localhost:4035', type: 'nextjs', domain: 'fabricai.ro' },
  { name: 'StudiAI', url: 'http://localhost:4036', type: 'nextjs', domain: 'studiai.ro' },
  { name: 'SociAI', url: 'http://localhost:4037', type: 'nextjs', domain: 'sociai.ro' },
  { name: 'CumparAI', url: 'http://localhost:4038', type: 'nextjs', domain: 'cumparai.ro' },
  { name: 'X Trading', url: 'http://localhost:4039', type: 'nextjs', domain: 'x.codai.ro' },
  { name: 'PublicAI', url: 'http://localhost:4040', type: 'nextjs', domain: 'publicai.ro' },

  // Express Services
  { name: 'AIDE', url: 'http://localhost:4041', type: 'express', domain: 'aide.codai.ro' },
  { name: 'AnalizAI', url: 'http://localhost:4042', type: 'express', domain: 'analizai.ro' },
  { name: 'MarketAI', url: 'http://localhost:4043', type: 'express', domain: 'marketai.ro' },
  { name: 'Explorer', url: 'http://localhost:4044', type: 'express', domain: 'explorer.codai.ro' },
  { name: 'Kodex', url: 'http://localhost:4045', type: 'express', domain: 'kodex.codai.ro' },
  { name: 'ID Service', url: 'http://localhost:4046', type: 'express', domain: 'id.codai.ro' },
  { name: 'Mod Builder', url: 'http://localhost:4047', type: 'express', domain: 'mod.codai.ro' },
  { name: 'Tools Hub', url: 'http://localhost:4048', type: 'express', domain: 'tools.codai.ro' },
  { name: 'Dashboard', url: 'http://localhost:4049', type: 'express', domain: 'dash.codai.ro' },
  { name: 'Integration Hub', url: 'http://localhost:4050', type: 'express', domain: 'hub.codai.ro' },
  { name: 'Docs Portal', url: 'http://localhost:4051', type: 'express', domain: 'docs.codai.ro' },
  { name: 'Admin Panel', url: 'http://localhost:4052', type: 'express', domain: 'admin.codai.ro' },
  { name: 'StocAI', url: 'http://localhost:4053', type: 'express', domain: 'stocai.ro' },
  { name: 'AjutAI', url: 'http://localhost:4054', type: 'express', domain: 'ajutai.ro' },
  { name: 'LegalizAI', url: 'http://localhost:4055', type: 'express', domain: 'legalizai.ro' }
];

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  total: SERVICES.length,
  services: {},
  summary: {},
  startTime: new Date()
};

// Utility functions
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const endTime = performance.now();
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: Math.round(endTime - startTime),
          contentLength: data.length
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function analyzeResponse(service, response) {
  const analysis = {
    service: service.name,
    url: service.url,
    domain: service.domain,
    type: service.type,
    status: 'PASS',
    issues: [],
    metrics: {}
  };

  // HTTP Status Check
  if (response.statusCode !== 200) {
    analysis.status = 'FAIL';
    analysis.issues.push(`HTTP ${response.statusCode} instead of 200`);
  }

  // Response Time Check
  analysis.metrics.responseTime = response.responseTime;
  if (response.responseTime > 2000) {
    analysis.status = 'WARN';
    analysis.issues.push(`Slow response time: ${response.responseTime}ms`);
  }

  // Content Analysis
  analysis.metrics.contentLength = response.contentLength;
  if (response.contentLength < 100) {
    analysis.status = 'FAIL';
    analysis.issues.push(`Response too short: ${response.contentLength} bytes`);
  }

  // HTML/JSON Content Check
  const contentType = response.headers['content-type'] || '';
  if (service.type === 'nextjs') {
    // Next.js should return HTML
    if (!contentType.includes('text/html')) {
      analysis.status = 'WARN';
      analysis.issues.push(`Expected HTML, got: ${contentType}`);
    }

    // Check for essential HTML elements
    if (!response.data.includes('<html') || !response.data.includes('<title')) {
      analysis.status = 'FAIL';
      analysis.issues.push('Invalid HTML structure');
    }

    // Check for modern UI elements (Tailwind, gradients, etc.)
    if (response.data.includes('gradient') || response.data.includes('glass')) {
      analysis.metrics.modernUI = true;
    }

    // Check for responsive design
    if (response.data.includes('viewport') && response.data.includes('responsive')) {
      analysis.metrics.responsive = true;
    }
  } else {
    // Express services might return JSON or HTML
    analysis.metrics.contentType = contentType;
  }

  // Security Headers Check
  const securityHeaders = ['x-frame-options', 'x-content-type-options', 'x-xss-protection'];
  analysis.metrics.securityHeaders = securityHeaders.filter(header =>
    response.headers[header]
  ).length;

  return analysis;
}

async function testService(service) {
  console.log(`🧪 Testing ${service.name} (${service.type}) at ${service.url}...`);

  try {
    const response = await makeRequest(service.url);
    const analysis = analyzeResponse(service, response);

    // Store results
    results.services[service.name] = analysis;

    if (analysis.status === 'PASS') {
      results.passed++;
      console.log(`✅ ${service.name}: PASS (${analysis.metrics.responseTime}ms)`);
    } else if (analysis.status === 'WARN') {
      console.log(`⚠️  ${service.name}: WARN - ${analysis.issues.join(', ')}`);
    } else {
      results.failed++;
      console.log(`❌ ${service.name}: FAIL - ${analysis.issues.join(', ')}`);
    }

    return analysis;
  } catch (error) {
    results.failed++;
    const failedAnalysis = {
      service: service.name,
      url: service.url,
      status: 'FAIL',
      issues: [error.message],
      metrics: {}
    };
    results.services[service.name] = failedAnalysis;
    console.log(`❌ ${service.name}: FAIL - ${error.message}`);
    return failedAnalysis;
  }
}

async function runHealthCheck() {
  console.log('🎯 CODAI ECOSYSTEM COMPREHENSIVE HEALTH CHECK');
  console.log('='.repeat(60));
  console.log(`📊 Testing ${SERVICES.length} services...`);
  console.log(`⏰ Started at: ${results.startTime.toISOString()}`);
  console.log('');

  // Test all services concurrently for speed
  const testPromises = SERVICES.map(service => testService(service));
  await Promise.all(testPromises);

  // Generate summary
  const endTime = new Date();
  const duration = endTime - results.startTime;

  results.summary = {
    total: results.total,
    passed: results.passed,
    failed: results.failed,
    successRate: Math.round((results.passed / results.total) * 100),
    duration: duration,
    endTime: endTime
  };

  // Print detailed results
  console.log('');
  console.log('📋 DETAILED RESULTS');
  console.log('='.repeat(60));

  // Group by status
  const passed = Object.values(results.services).filter(s => s.status === 'PASS');
  const warned = Object.values(results.services).filter(s => s.status === 'WARN');
  const failed = Object.values(results.services).filter(s => s.status === 'FAIL');

  console.log(`✅ PASSED (${passed.length}):`);
  passed.forEach(s => {
    console.log(`   ${s.service} - ${s.metrics.responseTime}ms`);
  });

  if (warned.length > 0) {
    console.log(`⚠️  WARNINGS (${warned.length}):`);
    warned.forEach(s => {
      console.log(`   ${s.service} - ${s.issues.join(', ')}`);
    });
  }

  if (failed.length > 0) {
    console.log(`❌ FAILED (${failed.length}):`);
    failed.forEach(s => {
      console.log(`   ${s.service} - ${s.issues.join(', ')}`);
    });
  }

  // Print summary
  console.log('');
  console.log('🎯 FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`📊 Total Services: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📈 Success Rate: ${results.summary.successRate}%`);
  console.log(`⏱️  Duration: ${Math.round(duration / 1000)}s`);

  // Overall status
  if (results.summary.successRate >= 95) {
    console.log('🏆 STATUS: EXCELLENT - Production Ready!');
  } else if (results.summary.successRate >= 85) {
    console.log('🎯 STATUS: GOOD - Minor issues to address');
  } else if (results.summary.successRate >= 70) {
    console.log('⚠️  STATUS: NEEDS WORK - Several issues found');
  } else {
    console.log('❌ STATUS: CRITICAL - Major issues require attention');
  }

  // Save results to file
  const reportPath = './health-check-report.json';
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed report saved: ${reportPath}`);

  return results;
}

// Run the health check
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runHealthCheck().catch(console.error);
}

export { runHealthCheck, SERVICES };
