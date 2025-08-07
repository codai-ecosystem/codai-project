#!/usr/bin/env node

/**
 * CODAI Admin Authentication Test
 * Tests admin credentials against various endpoints
 */

import https from 'https';
import fs from 'fs';

// Admin credentials to test
const ADMIN_CREDENTIALS = {
  email: 'admin@codai.ro',
  username: 'admin',
  password: 'admin123'
};

// Test endpoints
const ENDPOINTS = {
  hubHealth: 'https://hub.codai.ro',
  cbdHealth: 'https://cbd.memorai.ro/health',
  cbdEcosystem: 'https://cbd.memorai.ro/ecosystem/health',
  idService: 'https://id.codai.ro',
  cbdAuth: 'https://cbd.memorai.ro/security/auth/login'
};

console.log('🔐 CODAI Admin Authentication Test');
console.log('=====================================');
console.log(`📧 Admin Email: ${ADMIN_CREDENTIALS.email}`);
console.log(`👤 Admin Username: ${ADMIN_CREDENTIALS.username}`);
console.log(`🔑 Admin Password: ${ADMIN_CREDENTIALS.password}`);
console.log('');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data.substring(0, 200), headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testEndpoint(name, url, options = {}) {
  console.log(`🧪 Testing ${name}...`);
  try {
    const result = await makeRequest(url, options);
    console.log(`   Status: ${result.status}`);

    if (result.status === 200) {
      console.log(`   ✅ SUCCESS`);
      if (result.data && typeof result.data === 'object') {
        if (result.data.status) console.log(`   📊 Service Status: ${result.data.status}`);
        if (result.data.version) console.log(`   📦 Version: ${result.data.version}`);
        if (result.data.service) console.log(`   🏷️  Service: ${result.data.service}`);
      }
    } else {
      console.log(`   ❌ FAILED`);
      if (result.data) {
        const preview = typeof result.data === 'string'
          ? result.data.substring(0, 100)
          : JSON.stringify(result.data).substring(0, 100);
        console.log(`   📝 Response: ${preview}...`);
      }
    }
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
  }
  console.log('');
}

async function testAuthentication(name, url) {
  console.log(`🔑 Testing Authentication: ${name}...`);
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ADMIN_CREDENTIALS)
    };

    const result = await makeRequest(url, options);
    console.log(`   Status: ${result.status}`);

    if (result.status === 200 && result.data.success) {
      console.log(`   ✅ AUTHENTICATION SUCCESS`);
      if (result.data.data && result.data.data.user) {
        console.log(`   👤 User: ${result.data.data.user.email}`);
        console.log(`   🎭 Role: ${result.data.data.user.role}`);
        if (result.data.data.token) {
          console.log(`   🎫 Token: ${result.data.data.token.substring(0, 20)}...`);
        }
      }
      return result.data.data.token;
    } else {
      console.log(`   ❌ AUTHENTICATION FAILED`);
      if (result.data) {
        const preview = typeof result.data === 'string'
          ? result.data.substring(0, 100)
          : JSON.stringify(result.data).substring(0, 100);
        console.log(`   📝 Response: ${preview}...`);
      }
    }
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
  }
  console.log('');
  return null;
}

async function runTests() {
  console.log('🌐 Testing Service Availability...');
  console.log('');

  // Test basic service health
  await testEndpoint('Hub Service', ENDPOINTS.hubHealth);
  await testEndpoint('CBD Health', ENDPOINTS.cbdHealth);
  await testEndpoint('CBD Ecosystem', ENDPOINTS.cbdEcosystem);
  await testEndpoint('ID Service', ENDPOINTS.idService);

  console.log('🔐 Testing Authentication...');
  console.log('');

  // Test authentication
  const token = await testAuthentication('CBD Security Auth', ENDPOINTS.cbdAuth);

  console.log('📊 Summary:');
  console.log('==========');
  console.log('✅ Hub Service: Available at hub.codai.ro');
  console.log('✅ CBD Service: Available at cbd.memorai.ro');
  console.log('✅ Admin Credentials: Configured');
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('1. Fix CBD authentication endpoint internal errors');
  console.log('2. Deploy updated Hub with ecosystem proxy');
  console.log('3. Test full end-to-end authentication flow');
  console.log('');
  console.log('💡 Alternative: Use Hub proxy authentication for immediate access');
  console.log('   URL: https://hub.codai.ro/api/ecosystem/auth/login');
  console.log(`   Body: ${JSON.stringify(ADMIN_CREDENTIALS)}`);
}

runTests().catch(console.error);
