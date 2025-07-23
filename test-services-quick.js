#!/usr/bin/env node

/**
 * Quick Service Health Check
 * Tests actual running services with current port configuration
 */

const services = [
  { name: 'Gateway', port: 4000, path: '/' },
  { name: 'CODAI', port: 4001, path: '/' },
  { name: 'Admin', port: 4002, path: '/' },
  { name: 'Hub', port: 4003, path: '/' },
  { name: 'ID', port: 4004, path: '/' },
  { name: 'BancAI', port: 4005, path: '/' }
];

async function testService(service) {
  try {
    const url = `http://localhost:${service.port}${service.path}`;
    console.log(`🔍 Testing ${service.name} at ${url}...`);

    const response = await fetch(url);
    const status = response.status;

    // Special handling for Gateway service - 404 with structured response is healthy
    if (service.name === 'Gateway' && status === 404) {
      try {
        const body = await response.text();
        const data = JSON.parse(body);
        if (data.availableServices && Array.isArray(data.availableServices)) {
          console.log(`✅ ${service.name}: OK (${status} - Gateway responding with service directory)`);
          return true;
        }
      } catch (parseError) {
        console.log(`⚠️  ${service.name}: Responding but with malformed 404 (${status})`);
        return false;
      }
    }

    if (status === 200) {
      console.log(`✅ ${service.name}: OK (${status})`);
      return true;
    } else {
      console.log(`⚠️  ${service.name}: Responding but with status ${status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${service.name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 CODAI Ecosystem - Quick Health Check\n');

  const results = await Promise.all(services.map(testService));
  const working = results.filter(r => r).length;
  const total = services.length;

  console.log(`\n📊 Results: ${working}/${total} services operational`);
  console.log(`Success Rate: ${Math.round((working / total) * 100)}%`);

  if (working === total) {
    console.log('🎉 All services are working! Ready for comprehensive testing.');
  } else {
    console.log('⚠️  Some services need attention before full testing.');
  }
}

main().catch(console.error);
