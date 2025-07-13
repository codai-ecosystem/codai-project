#!/usr/bin/env node
/**
 * 🎯 CODAI ECOSYSTEM COMPREHENSIVE HEALTH CHECKER
 * Automated testing script for all 26 services
 */

const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');

// Service definitions
const SERVICES = [
  { name: 'CodAI Platform', port: 4030, type: 'nextjs', domain: 'codai.ro' },
  { name: 'MemorAI', port: 4031, type: 'nextjs', domain: 'memorai.ro' },
  { name: 'LogAI', port: 4032, type: 'nextjs', domain: 'logai.ro' },
  { name: 'BancAI', port: 4033, type: 'nextjs', domain: 'bancai.ro' },
  { name: 'Wallet', port: 4034, type: 'nextjs', domain: 'wallet.bancai.ro' },
  { name: 'FabricAI', port: 4035, type: 'nextjs', domain: 'fabricai.ro' },
  { name: 'StudiAI', port: 4036, type: 'nextjs', domain: 'studiai.ro' },
  { name: 'SociAI', port: 4037, type: 'nextjs', domain: 'sociai.ro' },
  { name: 'CumparAI', port: 4038, type: 'nextjs', domain: 'cumparai.ro' },
  { name: 'X Trading', port: 4039, type: 'nextjs', domain: 'x.codai.ro' },
  { name: 'PublicAI', port: 4040, type: 'nextjs', domain: 'publicai.ro' },
  { name: 'AIDE', port: 4041, type: 'express', domain: 'aide.codai.ro' },
  { name: 'AnalizAI', port: 4042, type: 'express', domain: 'analizai.ro' },
  { name: 'MarketAI', port: 4043, type: 'express', domain: 'marketai.ro' },
  { name: 'Explorer', port: 4044, type: 'express', domain: 'explorer.codai.ro' },
  { name: 'Kodex', port: 4045, type: 'express', domain: 'kodex.codai.ro' },
  { name: 'ID Service', port: 4046, type: 'express', domain: 'id.codai.ro' },
  { name: 'Mod Builder', port: 4047, type: 'express', domain: 'mod.codai.ro' },
  { name: 'Tools Hub', port: 4048, type: 'express', domain: 'tools.codai.ro' },
  { name: 'Dashboard', port: 4049, type: 'express', domain: 'dash.codai.ro' },
  { name: 'Integration Hub', port: 4050, type: 'express', domain: 'hub.codai.ro' },
  { name: 'Docs Portal', port: 4051, type: 'express', domain: 'docs.codai.ro' },
  { name: 'Admin Panel', port: 4052, type: 'express', domain: 'admin.codai.ro' },
  { name: 'StocAI', port: 4053, type: 'express', domain: 'stocai.ro' },
  { name: 'AjutAI', port: 4054, type: 'express', domain: 'ajutai.ro' },
  { name: 'LegalizAI', port: 4055, type: 'express', domain: 'legalizai.ro' }
];

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: SERVICES.length,
  services: {},
  startTime: new Date()
};

function testService(service) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const options = {
      hostname: 'localhost',
      port: service.port,
      path: '/',
      method: 'GET',
      timeout: 3000
    };

    console.log(`🧪 Testing ${service.name} (${service.type}) on port ${service.port}...`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);

        const analysis = {
          service: service.name,
          port: service.port,
          domain: service.domain,
          type: service.type,
          statusCode: res.statusCode,
          responseTime: responseTime,
          contentLength: data.length,
          status: 'PASS',
          issues: [],
          features: []
        };

        // Analyze response
        if (res.statusCode !== 200) {
          analysis.status = 'FAIL';
          analysis.issues.push(`HTTP ${res.statusCode}`);
        }

        if (responseTime > 2000) {
          analysis.status = analysis.status === 'FAIL' ? 'FAIL' : 'WARN';
          analysis.issues.push(`Slow: ${responseTime}ms`);
        }

        if (data.length < 100) {
          analysis.status = 'FAIL';
          analysis.issues.push(`Too short: ${data.length}B`);
        }

        // Check for modern UI features
        if (data.includes('gradient')) analysis.features.push('gradient-ui');
        if (data.includes('glass')) analysis.features.push('glass-morphism');
        if (data.includes('animate')) analysis.features.push('animations');
        if (data.includes('tailwind') || data.includes('tw-')) analysis.features.push('tailwind');
        if (data.includes('responsive') || data.includes('md:') || data.includes('sm:')) analysis.features.push('responsive');

        results.services[service.name] = analysis;

        if (analysis.status === 'PASS') {
          results.passed++;
          console.log(`✅ ${service.name}: PASS (${responseTime}ms) [${analysis.features.join(', ')}]`);
        } else if (analysis.status === 'WARN') {
          results.warnings++;
          console.log(`⚠️  ${service.name}: WARN - ${analysis.issues.join(', ')}`);
        } else {
          results.failed++;
          console.log(`❌ ${service.name}: FAIL - ${analysis.issues.join(', ')}`);
        }

        resolve(analysis);
      });
    });

    req.on('error', (err) => {
      results.failed++;
      const failedAnalysis = {
        service: service.name,
        port: service.port,
        status: 'FAIL',
        issues: [err.message],
        features: []
      };
      results.services[service.name] = failedAnalysis;
      console.log(`❌ ${service.name}: FAIL - ${err.message}`);
      resolve(failedAnalysis);
    });

    req.on('timeout', () => {
      req.destroy();
      results.failed++;
      const timeoutAnalysis = {
        service: service.name,
        port: service.port,
        status: 'FAIL',
        issues: ['Timeout'],
        features: []
      };
      results.services[service.name] = timeoutAnalysis;
      console.log(`❌ ${service.name}: FAIL - Timeout`);
      resolve(timeoutAnalysis);
    });

    req.end();
  });
}

async function runHealthCheck() {
  console.log('🎯 CODAI ECOSYSTEM COMPREHENSIVE HEALTH CHECK');
  console.log('='.repeat(60));
  console.log(`📊 Testing ${SERVICES.length} services...`);
  console.log(`⏰ Started at: ${results.startTime.toISOString()}`);
  console.log('');

  // Test all services sequentially to avoid overwhelming the system
  for (const service of SERVICES) {
    await testService(service);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Generate summary
  const endTime = new Date();
  const duration = endTime - results.startTime;

  const summary = {
    total: results.total,
    passed: results.passed,
    warnings: results.warnings,
    failed: results.failed,
    successRate: Math.round((results.passed / results.total) * 100),
    duration: duration,
    endTime: endTime
  };

  console.log('');
  console.log('🎯 FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`📊 Total Services: ${summary.total}`);
  console.log(`✅ Passed: ${summary.passed}`);
  console.log(`⚠️  Warnings: ${summary.warnings}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`📈 Success Rate: ${summary.successRate}%`);
  console.log(`⏱️  Duration: ${Math.round(duration / 1000)}s`);

  // Feature analysis
  const allFeatures = {};
  Object.values(results.services).forEach(service => {
    service.features?.forEach(feature => {
      allFeatures[feature] = (allFeatures[feature] || 0) + 1;
    });
  });

  console.log('');
  console.log('🎨 UI FEATURES DETECTED:');
  Object.entries(allFeatures).forEach(([feature, count]) => {
    console.log(`   ${feature}: ${count}/${results.total} services`);
  });

  // Overall status
  if (summary.successRate >= 95) {
    console.log('');
    console.log('🏆 STATUS: EXCELLENT - Production Ready!');
  } else if (summary.successRate >= 85) {
    console.log('');
    console.log('🎯 STATUS: GOOD - Minor issues to address');
  } else if (summary.successRate >= 70) {
    console.log('');
    console.log('⚠️  STATUS: NEEDS WORK - Several issues found');
  } else {
    console.log('');
    console.log('❌ STATUS: CRITICAL - Major issues require attention');
  }

  // Save detailed report
  const reportData = {
    summary,
    services: results.services,
    features: allFeatures,
    timestamp: endTime.toISOString()
  };

  fs.writeFileSync('./health-check-report.json', JSON.stringify(reportData, null, 2));
  console.log(`📄 Detailed report saved: health-check-report.json`);

  return reportData;
}

// Run if called directly
if (require.main === module) {
  runHealthCheck().catch(console.error);
}

module.exports = { runHealthCheck, SERVICES };
