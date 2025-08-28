#!/usr/bin/env node

/**
 * Simple Security Validation Script
 * Quick validation of Essential CodAI Services security posture
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Essential CodAI Services configuration
const SERVICES = [
  { name: 'CodAI Authentication API', port: 8100, path: '/health' },
  { name: 'CodAI API Gateway', port: 8010, path: '/health' },
  { name: 'CodAI Hub API', port: 8110, path: '/health' },
  { name: 'CodAI MemorAI MCP Service', port: 4950, path: '/health' },
  { name: 'CodAI CBD Database Service', port: 8180, path: '/health' },
  { name: 'CodAI MemorAI Frontend', port: 8006, path: '/api/health' }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Simple HTTP request function
function makeRequest(options) {
  return new Promise((resolve) => {
    const client = options.protocol === 'https:' ? https : http;
    const timeout = setTimeout(() => {
      resolve({ error: 'timeout', statusCode: 0, headers: {}, body: '' });
    }, 10000);

    const req = client.request(options, (res) => {
      clearTimeout(timeout);
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
          responseTime: Date.now() - startTime
        });
      });
    });

    const startTime = Date.now();

    req.on('error', (error) => {
      clearTimeout(timeout);
      resolve({ error: error.message, statusCode: 0, headers: {}, body: '' });
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Security header validation
function validateSecurityHeaders(headers) {
  const requiredHeaders = {
    'x-frame-options': 'DENY or SAMEORIGIN',
    'x-content-type-options': 'nosniff',
    'x-xss-protection': '1; mode=block',
    'strict-transport-security': 'max-age directive',
    'content-security-policy': 'CSP policy'
  };

  const findings = [];
  const present = [];

  Object.entries(requiredHeaders).forEach(([header, description]) => {
    const headerValue = headers[header] || headers[header.toLowerCase()];

    if (headerValue) {
      present.push(`✅ ${header}: ${headerValue}`);
    } else {
      findings.push(`❌ Missing ${header} (${description})`);
    }
  });

  return { findings, present };
}

// Basic vulnerability checks
async function performBasicSecurityChecks(service) {
  const baseUrl = `http://localhost:${service.port}`;
  const results = {
    service: service.name,
    port: service.port,
    healthCheck: null,
    securityHeaders: null,
    xssTest: null,
    methodsTest: null,
    findings: []
  };

  log(`\n🔍 Testing ${service.name} (Port ${service.port})`, 'cyan');

  // 1. Health check
  try {
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: service.port,
      path: service.path,
      method: 'GET',
      headers: { 'User-Agent': 'CodAI-Security-Test/1.0' }
    });

    if (healthResponse.error) {
      results.healthCheck = `❌ Health check failed: ${healthResponse.error}`;
      results.findings.push('Service unavailable');
      log(`   ❌ Health check failed: ${healthResponse.error}`, 'red');
      return results;
    } else {
      results.healthCheck = `✅ Service healthy (${healthResponse.statusCode}) - ${healthResponse.responseTime}ms`;
      log(`   ✅ Service healthy (${healthResponse.statusCode}) - ${healthResponse.responseTime}ms`, 'green');
    }

    // 2. Security headers check
    const headerCheck = validateSecurityHeaders(healthResponse.headers);
    results.securityHeaders = {
      present: headerCheck.present,
      missing: headerCheck.findings
    };

    if (headerCheck.present.length > 0) {
      log(`   Security Headers Present:`, 'green');
      headerCheck.present.forEach(header => log(`     ${header}`, 'green'));
    }

    if (headerCheck.findings.length > 0) {
      log(`   Security Headers Missing:`, 'yellow');
      headerCheck.findings.forEach(finding => {
        log(`     ${finding}`, 'yellow');
        results.findings.push(finding);
      });
    }

    // 3. Basic XSS test
    const xssPayload = '<script>alert("xss")</script>';
    const xssResponse = await makeRequest({
      hostname: 'localhost',
      port: service.port,
      path: service.path + '?test=' + encodeURIComponent(xssPayload),
      method: 'GET',
      headers: { 'User-Agent': 'CodAI-Security-Test/1.0' }
    });

    if (xssResponse.body && xssResponse.body.includes(xssPayload)) {
      results.xssTest = `❌ Potential XSS vulnerability detected`;
      results.findings.push('Potential XSS vulnerability');
      log(`   ❌ Potential XSS vulnerability detected`, 'red');
    } else {
      results.xssTest = `✅ Basic XSS test passed`;
      log(`   ✅ Basic XSS test passed`, 'green');
    }

    // 4. HTTP methods test
    const methodsResponse = await makeRequest({
      hostname: 'localhost',
      port: service.port,
      path: service.path,
      method: 'OPTIONS',
      headers: { 'User-Agent': 'CodAI-Security-Test/1.0' }
    });

    const allowHeader = methodsResponse.headers['allow'] || methodsResponse.headers['access-control-allow-methods'];
    if (allowHeader) {
      const dangerousMethods = ['TRACE', 'CONNECT', 'DELETE'].filter(method =>
        allowHeader.toUpperCase().includes(method)
      );

      if (dangerousMethods.length > 0) {
        results.methodsTest = `⚠️ Potentially dangerous HTTP methods allowed: ${dangerousMethods.join(', ')}`;
        results.findings.push(`Dangerous HTTP methods: ${dangerousMethods.join(', ')}`);
        log(`   ⚠️ Potentially dangerous HTTP methods: ${dangerousMethods.join(', ')}`, 'yellow');
      } else {
        results.methodsTest = `✅ HTTP methods check passed`;
        log(`   ✅ HTTP methods check passed`, 'green');
      }
    } else {
      results.methodsTest = `ℹ️ HTTP methods not disclosed`;
      log(`   ℹ️ HTTP methods not disclosed`, 'blue');
    }

  } catch (error) {
    results.findings.push(`Test error: ${error.message}`);
    log(`   ❌ Test error: ${error.message}`, 'red');
  }

  return results;
}

// Generate summary report
function generateSummaryReport(allResults) {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔐 ESSENTIAL CODAI SERVICES - SECURITY VALIDATION REPORT', 'cyan');
  log('='.repeat(80), 'cyan');

  const totalServices = allResults.length;
  const healthyServices = allResults.filter(r => r.healthCheck && r.healthCheck.includes('✅')).length;
  const totalFindings = allResults.reduce((sum, r) => sum + r.findings.length, 0);

  log(`\n📊 Summary:`, 'blue');
  log(`   Total Services Tested: ${totalServices}`, 'blue');
  log(`   Healthy Services: ${healthyServices}/${totalServices}`, healthyServices === totalServices ? 'green' : 'yellow');
  log(`   Total Security Findings: ${totalFindings}`, totalFindings === 0 ? 'green' : totalFindings < 5 ? 'yellow' : 'red');

  if (totalFindings === 0) {
    log(`\n🎉 Excellent! No critical security issues detected.`, 'green');
    log(`   Continue monitoring and maintain security best practices.`, 'green');
  } else {
    log(`\n⚠️  Security findings detected. Review and address:`, 'yellow');

    allResults.forEach(result => {
      if (result.findings.length > 0) {
        log(`\n   ${result.service}:`, 'yellow');
        result.findings.forEach(finding => {
          log(`     • ${finding}`, 'yellow');
        });
      }
    });
  }

  const securityScore = Math.max(0, 100 - (totalFindings * 10));
  log(`\n🎯 Security Score: ${securityScore}/100`, securityScore >= 80 ? 'green' : securityScore >= 60 ? 'yellow' : 'red');

  log(`\n📅 Report generated: ${new Date().toLocaleString()}`, 'blue');
  log('='.repeat(80), 'cyan');
}

// Main execution
async function main() {
  log('🚀 Starting Essential CodAI Services Security Validation', 'cyan');
  log('This quick security check validates basic security posture\n', 'blue');

  const allResults = [];

  for (const service of SERVICES) {
    const result = await performBasicSecurityChecks(service);
    allResults.push(result);
  }

  generateSummaryReport(allResults);

  // Save results to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalServices: allResults.length,
      healthyServices: allResults.filter(r => r.healthCheck && r.healthCheck.includes('✅')).length,
      totalFindings: allResults.reduce((sum, r) => sum + r.findings.length, 0)
    },
    results: allResults
  };

  try {
    const fs = require('fs');
    const path = require('path');

    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(reportsDir, `security-validation-${new Date().getTime()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));

    log(`\n💾 Detailed report saved: ${reportFile}`, 'blue');
  } catch (error) {
    log(`⚠️ Could not save report: ${error.message}`, 'yellow');
  }

  log('\n✨ Security validation completed!', 'green');
}

// Run the security validation
if (require.main === module) {
  main().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main, performBasicSecurityChecks, validateSecurityHeaders };