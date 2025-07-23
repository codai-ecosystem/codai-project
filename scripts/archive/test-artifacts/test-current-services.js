#!/usr/bin/env node

const services = [
  { name: 'Gateway', url: 'http://localhost:4000/health' },
  { name: 'CODAI', url: 'http://localhost:4001/' },
  { name: 'Admin', url: 'http://localhost:4002/health' },
  { name: 'Hub', url: 'http://localhost:4003/' },
  { name: 'ID', url: 'http://localhost:4004/' },
  { name: 'BancAI', url: 'http://localhost:4005/' }
];

async function testService(service) {
  try {
    const response = await fetch(service.url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const status = response.ok ? '✅ ONLINE' : `❌ ERROR (${response.status})`;
    const text = await response.text();

    console.log(`${service.name.padEnd(10)} | ${status.padEnd(15)} | ${service.url}`);
    if (!response.ok) {
      console.log(`  └─ Response: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`${service.name.padEnd(10)} | ❌ OFFLINE     | ${service.url}`);
    console.log(`  └─ Error: ${error.message}`);
  }
}

async function testAllServices() {
  console.log('\n🔍 Testing CODAI Ecosystem Services...\n');
  console.log('Service    | Status          | URL');
  console.log('-----------|-----------------|--------------------');

  for (const service of services) {
    await testService(service);
  }

  console.log('\n✅ Service test completed!\n');
}

testAllServices().catch(console.error);
