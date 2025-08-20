#!/usr/bin/env node

// CBD Service Validation with Node.js
import https from 'https';
import http from 'http';

console.log('🌐 CBD Universal Database - Service Validation');
console.log('===============================================');

async function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`   ✅ ${name}: OK`);
          console.log(`   📊 Status: ${parsed.status || 'OK'}`);
          if (parsed.service) console.log(`   📦 Service: ${parsed.service}`);
          if (parsed.paradigms) console.log(`   🏛️ Paradigms: ${parsed.paradigms}`);
          if (parsed.uptime) console.log(`   ⏱️ Uptime: ${parsed.uptime}s`);
          resolve(true);
        } catch (e) {
          console.log(`   ✅ ${name}: Response received (${data.length} bytes)`);
          resolve(true);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ ${name}: FAILED - ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ❌ ${name}: TIMEOUT`);
      req.destroy();
      resolve(false);
    });
  });
}

async function validateServices() {
  console.log('');
  console.log('1️⃣ Testing Standard CBD Service...');
  await testEndpoint('http://localhost:4180/health', 'Health Check');
  
  console.log('');
  console.log('2️⃣ Testing CBD Statistics...');
  await testEndpoint('http://localhost:4180/stats', 'Statistics');
  
  console.log('');
  console.log('3️⃣ Testing Cloud-Enhanced Service...');
  await testEndpoint('http://localhost:8002/health', 'Cloud-Enhanced Health');
  
  console.log('');
  console.log('🎯 Validation Complete!');
  console.log('===============================================');
}

validateServices().catch(console.error);
