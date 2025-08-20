#!/usr/bin/env node

import { SimpleAuthenticator } from './dist/auth/SimpleAuthenticator.js';

async function testAuthentication() {
    console.log('🧪 Testing SimpleAuthenticator...\n');

    try {
        const authenticator = new SimpleAuthenticator();

        // Wait a moment for initialization
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('1️⃣ Testing valid admin login...');
        const validResult = await authenticator.authenticateUser({
            email: 'admin@codai.ro',
            password: 'admin123'
        });

        if (validResult.success) {
            console.log('✅ Admin authentication: SUCCESS');
            console.log('👤 User:', validResult.user?.name);
            console.log('🔑 Token:', validResult.token ? 'Generated' : 'Missing');
            console.log('🛡️ Role:', validResult.user?.role);
        } else {
            console.log('❌ Admin authentication: FAILED');
            console.log('Error:', validResult.reason);
        }

        console.log('\n2️⃣ Testing invalid password...');
        const invalidResult = await authenticator.authenticateUser({
            email: 'admin@codai.ro',
            password: 'wrongpassword'
        });

        if (!invalidResult.success) {
            console.log('✅ Invalid password rejected: SUCCESS');
            console.log('Reason:', invalidResult.reason);
        } else {
            console.log('❌ Invalid password accepted: FAILED');
        }

        console.log('\n3️⃣ Testing security stats...');
        const stats = authenticator.getSecurityStats();
        console.log('📊 Security Stats:', JSON.stringify(stats, null, 2));

        console.log('\n4️⃣ Testing security health...');
        const health = authenticator.getSecurityHealth();
        console.log('❤️ Security Health:', JSON.stringify(health, null, 2));

        console.log('\n✅ All authentication tests completed successfully!');

    } catch (error) {
        console.error('❌ Authentication test failed:', error);
        process.exit(1);
    }
}

testAuthentication();
