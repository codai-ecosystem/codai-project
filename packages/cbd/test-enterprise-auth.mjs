/**
 * Test script for Enterprise Security Orchestrator
 * Tests the advanced authentication system
 */

import fetch from 'node-fetch';

const CBD_URL = 'http://localhost:4180';

async function testEnterpriseAuthentication() {
    console.log('🧪 Testing Enterprise Security Orchestrator...\n');

    try {
        // Test 1: Health check
        console.log('1. Testing CBD service health...');
        const healthResponse = await fetch(`${CBD_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (healthResponse.ok) {
            const health = await healthResponse.json();
            console.log('✅ CBD Health:', health.status);
            console.log('   Version:', health.version);
            console.log('   Services:', health.services?.enterpriseSecurityOrchestrator || 'N/A');
        } else {
            console.log('❌ Health check failed:', healthResponse.status);
        }

        // Test 2: Authentication with admin credentials
        console.log('\n2. Testing enterprise authentication...');
        const authResponse = await fetch(`${CBD_URL}/api/security/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@codai.ro',
                password: 'admin123'
            })
        });

        if (authResponse.ok) {
            const authResult = await authResponse.json();
            console.log('✅ Authentication successful!');
            console.log('   User:', authResult.data?.user?.email);
            console.log('   Role:', authResult.data?.user?.role);
            console.log('   Permissions:', authResult.data?.permissions?.slice(0, 3).join(', ') + '...');
            console.log('   Compliance:', authResult.data?.complianceStatus);
            console.log('   Token expires in:', authResult.data?.expiresIn, 'seconds');

            // Test 3: Get security stats
            console.log('\n3. Testing security statistics...');
            const statsResponse = await fetch(`${CBD_URL}/api/security/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.data?.token}`
                }
            });

            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                console.log('✅ Security stats retrieved:');
                console.log('   Active users:', stats.result?.activeUsers);
                console.log('   Active sessions:', stats.result?.activeSessions);
                console.log('   Security policies:', stats.result?.securityPolicies);
                console.log('   Threat level:', stats.result?.threatLevel);
                console.log('   Compliance score:', stats.result?.complianceScore);
            } else {
                console.log('❌ Stats retrieval failed:', statsResponse.status);
            }

            // Test 4: Get security health
            console.log('\n4. Testing security health endpoint...');
            const healthSecResponse = await fetch(`${CBD_URL}/api/security/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.data?.token}`
                }
            });

            if (healthSecResponse.ok) {
                const secHealth = await healthSecResponse.json();
                console.log('✅ Security health retrieved:');
                console.log('   Status:', secHealth.result?.status);
                console.log('   Policies:', secHealth.result?.policies);
                console.log('   Compliance score:', secHealth.result?.metrics?.complianceScore);
                console.log('   Uptime:', secHealth.result?.metrics?.uptime, '%');
            } else {
                console.log('❌ Security health failed:', healthSecResponse.status);
            }

        } else {
            const errorText = await authResponse.text();
            console.log('❌ Authentication failed:', authResponse.status);
            console.log('   Error:', errorText);
        }

        // Test 5: Invalid credentials
        console.log('\n5. Testing invalid credentials...');
        const invalidAuthResponse = await fetch(`${CBD_URL}/api/security/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'invalid@test.com',
                password: 'wrongpassword'
            })
        });

        if (!invalidAuthResponse.ok) {
            console.log('✅ Invalid credentials properly rejected:', invalidAuthResponse.status);
        } else {
            console.log('❌ Invalid credentials were accepted - security issue!');
        }

        console.log('\n🎉 Enterprise Security Orchestrator testing completed!');

    } catch (error) {
        console.error('🚨 Test error:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 CBD service is not running. Start it with:');
            console.log('   cd packages/cbd && npm run dev');
        }
    }
}

testEnterpriseAuthentication();
