#!/usr/bin/env node

/**
 * CODAI Ecosystem Comprehensive Test Suite
 * Tests all deployed services and validates ecosystem readiness
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Ecosystem Configuration
const ECOSYSTEM_CONFIG = {
  services: [
    { name: 'CODAI', url: 'http://localhost:4030', port: 4030 },
    { name: 'MEMORAI', url: 'http://localhost:4031', port: 4031 },
    { name: 'BANCAI', url: 'http://localhost:4033', port: 4033 },
    { name: 'STOCAI', url: 'http://localhost:4066', port: 4066 },
    { name: 'PREZENTAI', url: 'http://localhost:4081', port: 4081 },
    { name: 'AIDE', url: 'http://localhost:4051', port: 4051 }
  ],
  apiGateway: 'http://localhost:8080',
  timeout: 10000
};

class EcosystemTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      services: {},
      apiGateway: null,
      summary: {}
    };
  }

  async makeRequest(url, timeout = 5000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = http.get(url, { timeout }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            success: true,
            statusCode: res.statusCode,
            responseTime,
            data: data.substring(0, 1000), // First 1KB
            error: null
          });
        });
      });

      req.on('error', (err) => {
        const responseTime = Date.now() - startTime;
        resolve({
          success: false,
          statusCode: null,
          responseTime,
          data: null,
          error: err.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        resolve({
          success: false,
          statusCode: null,
          responseTime,
          data: null,
          error: 'Request timeout'
        });
      });
    });
  }

  async testService(service) {
    console.log(`🔍 Testing ${service.name} at ${service.url}...`);
    
    const result = await this.makeRequest(service.url, ECOSYSTEM_CONFIG.timeout);
    
    // Enhanced validation
    const isHealthy = result.success && 
                     result.statusCode === 200 && 
                     result.responseTime < 5000;

    const serviceResult = {
      ...result,
      isHealthy,
      validation: {
        hasValidResponse: result.success,
        hasAcceptableLatency: result.responseTime < 5000,
        hasValidStatusCode: result.statusCode === 200,
        hasContent: result.data && result.data.length > 0
      }
    };

    this.results.services[service.name] = serviceResult;
    
    const status = isHealthy ? '✅' : '❌';
    console.log(`${status} ${service.name}: ${result.success ? 'UP' : 'DOWN'} (${result.responseTime}ms)`);
    
    return serviceResult;
  }

  async testApiGateway() {
    console.log('\n🌐 Testing API Gateway...');
    
    const result = await this.makeRequest(ECOSYSTEM_CONFIG.apiGateway);
    this.results.apiGateway = result;
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} API Gateway: ${result.success ? 'UP' : 'DOWN'}`);
    
    return result;
  }

  async testServiceDiscovery() {
    console.log('\n🔍 Testing Service Discovery through API Gateway...');
    
    const discoveryResults = {};
    
    for (const service of ECOSYSTEM_CONFIG.services) {
      const proxyUrl = `${ECOSYSTEM_CONFIG.apiGateway}/${service.name.toLowerCase()}`;
      const result = await this.makeRequest(proxyUrl);
      discoveryResults[service.name] = result;
      
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${service.name} via proxy: ${result.success ? 'OK' : 'FAIL'}`);
    }
    
    this.results.serviceDiscovery = discoveryResults;
    return discoveryResults;
  }

  generateSummary() {
    const services = Object.values(this.results.services);
    const healthyServices = services.filter(s => s.isHealthy).length;
    const totalServices = services.length;
    
    this.results.summary = {
      totalServices,
      healthyServices,
      healthPercentage: Math.round((healthyServices / totalServices) * 100),
      apiGatewayStatus: this.results.apiGateway?.success ? 'UP' : 'DOWN',
      averageResponseTime: Math.round(
        services.reduce((sum, s) => sum + s.responseTime, 0) / totalServices
      ),
      ecosystemHealth: healthyServices === totalServices ? 'HEALTHY' : 'DEGRADED'
    };
  }

  printDetailedReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 CODAI ECOSYSTEM COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Summary:`);
    console.log(`  • Services: ${this.results.summary.healthyServices}/${this.results.summary.totalServices} healthy (${this.results.summary.healthPercentage}%)`);
    console.log(`  • API Gateway: ${this.results.summary.apiGatewayStatus}`);
    console.log(`  • Average Response Time: ${this.results.summary.averageResponseTime}ms`);
    console.log(`  • Ecosystem Health: ${this.results.summary.ecosystemHealth}`);
    
    console.log(`\n🔍 Service Details:`);
    for (const [name, result] of Object.entries(this.results.services)) {
      const status = result.isHealthy ? '✅' : '❌';
      console.log(`  ${status} ${name}:`);
      console.log(`    - URL: ${ECOSYSTEM_CONFIG.services.find(s => s.name === name)?.url}`);
      console.log(`    - Status: ${result.statusCode || 'N/A'}`);
      console.log(`    - Response Time: ${result.responseTime}ms`);
      console.log(`    - Error: ${result.error || 'None'}`);
    }
    
    if (this.results.serviceDiscovery) {
      console.log(`\n🌐 Service Discovery (via API Gateway):`);
      for (const [name, result] of Object.entries(this.results.serviceDiscovery)) {
        const status = result.success ? '✅' : '❌';
        console.log(`  ${status} ${name}: ${result.success ? 'Reachable' : 'Unreachable'}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
  }

  async saveReport() {
    const reportPath = path.join(__dirname, 'ecosystem-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}`);
  }

  async runCompleteTest() {
    console.log('🚀 Starting CODAI Ecosystem Comprehensive Test...\n');
    
    // Test individual services
    for (const service of ECOSYSTEM_CONFIG.services) {
      await this.testService(service);
    }
    
    // Test API Gateway
    await this.testApiGateway();
    
    // Test Service Discovery if API Gateway is up
    if (this.results.apiGateway?.success) {
      await this.testServiceDiscovery();
    }
    
    // Generate summary
    this.generateSummary();
    
    // Print detailed report
    this.printDetailedReport();
    
    // Save detailed results
    await this.saveReport();
    
    // Return ecosystem readiness status
    return {
      ready: this.results.summary.ecosystemHealth === 'HEALTHY',
      summary: this.results.summary,
      details: this.results
    };
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const tester = new EcosystemTester();
  
  tester.runCompleteTest()
    .then(result => {
      const exitCode = result.ready ? 0 : 1;
      console.log(`\n🎯 Ecosystem Status: ${result.ready ? 'READY' : 'NOT READY'}`);
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = EcosystemTester;
