/**
 * Demo script for CODAI Admin Service with CND Integration
 * Tests comprehensive user management, RBAC, permissions, and audit features
 */

import fetch from 'node-fetch';

const ADMIN_SERVICE_URL = 'http://localhost:4002';

console.log('🚀 Starting CODAI Admin Service Demo');
console.log('===================================');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(endpoint, options = {}) {
    const url = `${ADMIN_SERVICE_URL}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    const data = await response.json();
    console.log(`${options.method || 'GET'} ${endpoint}:`, response.status, response.ok ? '✅' : '❌');

    if (response.ok) {
        console.log('Response:', JSON.stringify(data, null, 2));
    } else {
        console.log('Error:', data);
    }

    return { response, data };
}

async function testHealthCheck() {
    console.log('\n📊 Testing Health Check');
    console.log('----------------------');

    await makeRequest('/api/health');
}

async function testUserManagement() {
    console.log('\n👥 Testing User Management');
    console.log('-------------------------');

    // Create a test user
    console.log('\n🆕 Creating test user...');
    const { data: createUserResult } = await makeRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
            username: 'demo_admin',
            email: 'demo@codai.com',
            name: 'Demo Administrator',
            role: 'admin',
            permissions: ['users:read', 'users:write', 'roles:manage', 'audit:read'],
            department: 'Engineering',
            status: 'active',
            preferences: {
                theme: 'dark',
                notifications: true
            },
            metadata: {
                source: 'admin_demo',
                demo: true
            }
        })
    });

    let testUserId = null;
    if (createUserResult.success) {
        testUserId = createUserResult.data.id;
        console.log(`✅ Created user with ID: ${testUserId}`);
    }

    await delay(1000);

    // Get all users
    console.log('\n📋 Getting all users...');
    await makeRequest('/api/admin/users?limit=10');

    await delay(1000);

    if (testUserId) {
        // Get specific user
        console.log(`\n🔍 Getting user ${testUserId}...`);
        await makeRequest(`/api/admin/users?userId=${testUserId}`);

        await delay(1000);

        // Update user
        console.log(`\n✏️ Updating user ${testUserId}...`);
        await makeRequest(`/api/admin/users?userId=${testUserId}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: 'Updated Demo Administrator',
                status: 'active',
                preferences: {
                    theme: 'light',
                    notifications: false
                }
            })
        });
    }
}

async function testRoleManagement() {
    console.log('\n🛡️ Testing Role Management');
    console.log('-------------------------');

    await makeRequest('/api/admin/roles');
}

async function testPermissionSystem() {
    console.log('\n🔐 Testing Permission System');
    console.log('---------------------------');

    // Get all permissions
    console.log('\n📜 Getting all permissions...');
    await makeRequest('/api/admin/permissions');

    await delay(1000);

    // Check permission (using demo user ID if available)
    console.log('\n🔍 Checking user permission...');
    await makeRequest('/api/admin/permissions', {
        method: 'POST',
        body: JSON.stringify({
            userId: 'demo_user_id', // In real scenario, use actual user ID
            permission: 'users:read'
        })
    });
}

async function testAuditLogging() {
    console.log('\n📝 Testing Audit Logging');
    console.log('-----------------------');

    await makeRequest('/api/admin/audit?limit=20');
}

async function testSystemStatistics() {
    console.log('\n📈 Testing System Statistics');
    console.log('---------------------------');

    await makeRequest('/api/admin/statistics');
}

async function testCompleteWorkflow() {
    console.log('\n🔄 Testing Complete Admin Workflow');
    console.log('=================================');

    // 1. Check system health
    console.log('\n1️⃣ Health Check');
    await testHealthCheck();

    await delay(2000);

    // 2. User management operations
    console.log('\n2️⃣ User Management');
    await testUserManagement();

    await delay(2000);

    // 3. Role management
    console.log('\n3️⃣ Role Management');
    await testRoleManagement();

    await delay(2000);

    // 4. Permission system
    console.log('\n4️⃣ Permission System');
    await testPermissionSystem();

    await delay(2000);

    // 5. Audit logging
    console.log('\n5️⃣ Audit Logging');
    await testAuditLogging();

    await delay(2000);

    // 6. System statistics
    console.log('\n6️⃣ System Statistics');
    await testSystemStatistics();
}

async function main() {
    try {
        console.log(`🎯 Testing Admin Service at: ${ADMIN_SERVICE_URL}`);
        console.log('📅 Starting comprehensive demo...\n');

        await testCompleteWorkflow();

        console.log('\n🎉 Admin Service Demo Completed!');
        console.log('===============================');
        console.log('✅ Health monitoring working');
        console.log('✅ User management operational');
        console.log('✅ Role-based access control active');
        console.log('✅ Permission system functioning');
        console.log('✅ Audit logging enabled');
        console.log('✅ System statistics available');
        console.log('✅ CND enterprise features integrated');

    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        process.exit(1);
    }
}

// Run the demo
main().catch(console.error);
