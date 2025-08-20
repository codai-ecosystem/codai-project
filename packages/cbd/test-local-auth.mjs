#!/usr/bin/env node

async function testLocalCBDAuthentication() {
    console.log('🧪 Testing Local CBD Authentication Server...\n');

    try {
        // Test health endpoint
        console.log('1️⃣ Testing health endpoint...');
        const healthResponse = await fetch('http://localhost:4180/health');
        if (healthResponse.ok) {
            const health = await healthResponse.json();
            console.log('✅ Health check: SUCCESS');
            console.log('Service:', health.service);
            console.log('Version:', health.version);
        } else {
            console.log('❌ Health check: FAILED');
            return;
        }

        // Test authentication
        console.log('\n2️⃣ Testing admin authentication...');
        const loginResponse = await fetch('http://localhost:4180/security/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@codai.ro',
                password: 'admin123'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Admin authentication: SUCCESS');
            console.log('User ID:', loginData.data.user?.id);
            console.log('User Name:', loginData.data.user?.name);
            console.log('User Role:', loginData.data.user?.role);
            console.log('Token:', loginData.data.token ? 'Generated ✅' : 'Missing ❌');

            // Test security stats
            console.log('\n3️⃣ Testing security stats...');
            const statsResponse = await fetch('http://localhost:4180/security/stats');
            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                console.log('✅ Security stats: SUCCESS');
                console.log('Users:', stats.result.security.users);
                console.log('Active Users:', stats.result.security.activeUsers);
                console.log('Admin Users:', stats.result.security.adminUsers);
            }

        } else {
            console.log('❌ Admin authentication: FAILED');
            console.log('Status:', loginResponse.status);
            const error = await loginResponse.text();
            console.log('Error:', error);
        }

        console.log('\n✅ Local CBD authentication test completed!');

    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testLocalCBDAuthentication();
