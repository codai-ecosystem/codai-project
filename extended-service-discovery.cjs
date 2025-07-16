#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

// CODAI Ecosystem Extended Service Discovery
// Autonomous Agent Task: Discover all 30+ services
console.log('🔍 CODAI ECOSYSTEM EXTENDED SERVICE DISCOVERY');
console.log('=' .repeat(60));

const DISCOVERY_CONFIG = {
  portRange: {
    start: 4000,
    end: 4099
  },
  timeout: 5000,
  knownServices: [
    { name: 'CODAI', port: 4030 },
    { name: 'MEMORAI', port: 4031 },
    { name: 'BANCAI', port: 4033 },
    { name: 'STOCAI', port: 4063 },
    { name: 'STUDIAI', port: 4012 },
    { name: 'JUCAI', port: 4070 },
    { name: 'CURTAI', port: 4050 },
    { name: 'ADMIN', port: 4062 },
    { name: 'EXPLORER', port: 4060 },
    { name: 'HUB', port: 4001 },
    { name: 'PREZENTAI', port: 4081 },
    { name: 'AIDE', port: 4051 }
  ]
};

const discoveredServices = [];
const failedPorts = [];

function testService(port) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: DISCOVERY_CONFIG.timeout
    }, (res) => {
      const responseTime = Date.now() - startTime;
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const service = {
          port: port,
          status: res.statusCode,
          responseTime: responseTime,
          contentLength: data.length,
          contentType: res.headers['content-type'] || 'unknown',
          title: extractTitle(data),
          isHealthy: res.statusCode >= 200 && res.statusCode < 400
        };
        
        if (service.isHealthy) {
          discoveredServices.push(service);
          console.log(`✅ Port ${port}: ${service.title || 'Unknown Service'} (${responseTime}ms)`);
        } else {
          failedPorts.push({ port, error: `HTTP ${res.statusCode}` });
          console.log(`❌ Port ${port}: HTTP ${res.statusCode} (${responseTime}ms)`);
        }
        
        resolve(service);
      });
    });
    
    req.on('error', (err) => {
      failedPorts.push({ port, error: err.message });
      console.log(`❌ Port ${port}: ${err.message}`);
      resolve(null);
    });
    
    req.on('timeout', () => {
      failedPorts.push({ port, error: 'Timeout' });
      console.log(`⏱️ Port ${port}: Timeout`);
      req.destroy();
      resolve(null);
    });
    
    req.end();
  });
}

function extractTitle(html) {
  if (!html || typeof html !== 'string') return null;
  
  // Try to extract title from HTML
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();
  
  // Try to extract from h1
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h1Match) return h1Match[1].trim();
  
  // Try to extract from meta description
  const metaMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  if (metaMatch) return metaMatch[1].trim();
  
  return null;
}

async function runDiscovery() {
  console.log(`🚀 Scanning ports ${DISCOVERY_CONFIG.portRange.start}-${DISCOVERY_CONFIG.portRange.end}...`);
  console.log();
  
  const promises = [];
  
  for (let port = DISCOVERY_CONFIG.portRange.start; port <= DISCOVERY_CONFIG.portRange.end; port++) {
    promises.push(testService(port));
  }
  
  // Process in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    await Promise.all(batch);
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log();
  console.log('=' .repeat(60));
  console.log('🔍 EXTENDED SERVICE DISCOVERY REPORT');
  console.log('=' .repeat(60));
  
  console.log(`📊 Summary:`);
  console.log(`  • Total Services Discovered: ${discoveredServices.length}`);
  console.log(`  • Total Ports Scanned: ${DISCOVERY_CONFIG.portRange.end - DISCOVERY_CONFIG.portRange.start + 1}`);
  console.log(`  • Success Rate: ${((discoveredServices.length / (DISCOVERY_CONFIG.portRange.end - DISCOVERY_CONFIG.portRange.start + 1)) * 100).toFixed(1)}%`);
  console.log(`  • Average Response Time: ${discoveredServices.length > 0 ? Math.round(discoveredServices.reduce((sum, s) => sum + s.responseTime, 0) / discoveredServices.length) : 0}ms`);
  console.log();
  
  console.log('🔍 Discovered Services:');
  discoveredServices
    .sort((a, b) => a.port - b.port)
    .forEach((service, index) => {
      console.log(`  ${index + 1}. Port ${service.port}: ${service.title || 'Unknown Service'}`);
      console.log(`     Status: ${service.status} | Response: ${service.responseTime}ms | Type: ${service.contentType}`);
    });
  
  console.log();
  console.log('❌ Failed Ports:');
  if (failedPorts.length === 0) {
    console.log('  None - All scanned ports are healthy!');
  } else {
    failedPorts.slice(0, 10).forEach((fail, index) => {
      console.log(`  ${index + 1}. Port ${fail.port}: ${fail.error}`);
    });
    if (failedPorts.length > 10) {
      console.log(`  ... and ${failedPorts.length - 10} more`);
    }
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalDiscovered: discoveredServices.length,
      totalScanned: DISCOVERY_CONFIG.portRange.end - DISCOVERY_CONFIG.portRange.start + 1,
      successRate: ((discoveredServices.length / (DISCOVERY_CONFIG.portRange.end - DISCOVERY_CONFIG.portRange.start + 1)) * 100).toFixed(1),
      averageResponseTime: discoveredServices.length > 0 ? Math.round(discoveredServices.reduce((sum, s) => sum + s.responseTime, 0) / discoveredServices.length) : 0
    },
    services: discoveredServices,
    failures: failedPorts
  };
  
  const reportPath = path.join(__dirname, 'extended-service-discovery-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log();
  console.log('=' .repeat(60));
  console.log(`📄 Detailed report saved to: ${reportPath}`);
  console.log('🎯 Extended Service Discovery Status: COMPLETE');
  console.log('=' .repeat(60));
  
  return report;
}

// Run discovery
runDiscovery().catch(console.error);
