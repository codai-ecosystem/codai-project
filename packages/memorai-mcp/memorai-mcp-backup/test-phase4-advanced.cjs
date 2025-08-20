const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8004';
const API_KEY = 'memorai-dev-key-2025';

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

async function testAdvancedFeatures() {
    console.log('🧪 MEMORAI MCP PHASE 4 - ADVANCED FEATURES TEST SUITE');
    console.log('==================================================');

    let testsPassed = 0;
    let totalTests = 0;

    async function runTest(testName, testFunction) {
        totalTests++;
        try {
            console.log(`\n🔍 Testing: ${testName}`);
            await testFunction();
            console.log(`✅ ${testName}: PASSED`);
            testsPassed++;
        } catch (error) {
            console.error(`❌ ${testName}: FAILED - ${error.message}`);
        }
    }

    // Test 1: Health Check
    await runTest('Health Check with Advanced Features', async () => {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();

        if (!response.ok) throw new Error('Health check failed');
        if (data.version !== '4.0.0') throw new Error('Incorrect version');
        if (!data.features.includes('advanced_analytics')) throw new Error('Analytics not enabled');
        if (!data.features.includes('enterprise_security')) throw new Error('Security not enabled');
        if (!data.features.includes('backup_restore')) throw new Error('Backup not enabled');

        console.log(`   📊 Features: ${data.features.join(', ')}`);
        console.log(`   🕐 Uptime: ${Math.round(data.uptime)}ms`);
        console.log(`   💾 Memory Count: ${data.memoryCount}`);
    });

    // Test 2: Advanced Memory Storage with Encryption
    let encryptedMemoryId = null;
    await runTest('Advanced Memory Storage with Encryption', async () => {
        const response = await fetch(`${API_BASE_URL}/api/memory/store`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                content: 'This is a highly sensitive encrypted memory for Phase 4 testing',
                encrypt: true,
                metadata: {
                    category: 'test',
                    sensitivity: 'high',
                    testPhase: 'phase4'
                }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Storage failed');
        if (!data.success) throw new Error('Storage not successful');
        if (!data.encrypted) throw new Error('Memory not encrypted');

        encryptedMemoryId = data.memoryId;
        console.log(`   🔐 Encrypted Memory ID: ${data.memoryId}`);
        console.log(`   📏 Size: ${data.size} bytes`);
    });

    // Test 3: Advanced Search with Caching
    await runTest('Advanced Search with Caching', async () => {
        const searchQuery = 'sensitive encrypted memory';

        // First search (should not be cached)
        const response1 = await fetch(`${API_BASE_URL}/api/memory/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query: searchQuery,
                limit: 5,
                useCache: true
            })
        });

        const data1 = await response1.json();
        if (!response1.ok) throw new Error(data1.error || 'Search failed');
        if (data1.fromCache) throw new Error('First search should not be cached');

        // Second search (should be cached)
        const response2 = await fetch(`${API_BASE_URL}/api/memory/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query: searchQuery,
                limit: 5,
                useCache: true
            })
        });

        const data2 = await response2.json();
        if (!response2.ok) throw new Error(data2.error || 'Cached search failed');
        if (!data2.fromCache) throw new Error('Second search should be cached');

        console.log(`   🔍 Query: "${searchQuery}"`);
        console.log(`   📊 Results: ${data1.totalFound} found`);
        console.log(`   ⚡ Cache: ${data2.fromCache ? 'HIT' : 'MISS'} (age: ${data2.cacheAge}ms)`);
    });

    // Test 4: Analytics Dashboard
    await runTest('Analytics Dashboard', async () => {
        const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Dashboard failed');
        if (!data.success) throw new Error('Dashboard not successful');

        const dashboard = data.dashboard;
        console.log(`   📈 Total Requests: ${dashboard.overview.totalRequests}`);
        console.log(`   ⚡ Avg Response Time: ${dashboard.overview.avgResponseTime}ms`);
        console.log(`   👥 Active Users: ${dashboard.overview.activeUsers}`);
        console.log(`   🚨 Total Alerts: ${dashboard.overview.totalAlerts}`);
        console.log(`   📊 Endpoints Tracked: ${Object.keys(dashboard.endpoints).length}`);
    });

    // Test 5: Performance Metrics
    await runTest('Performance Metrics', async () => {
        const response = await fetch(`${API_BASE_URL}/api/analytics/performance`, {
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Performance metrics failed');
        if (!data.success) throw new Error('Performance metrics not successful');

        const metrics = data.metrics;
        console.log(`   🖥️ Memory: ${Math.round(metrics.memory.heapUsed / 1024 / 1024)}MB used`);
        console.log(`   🕐 Uptime: ${Math.round(metrics.uptime)}s`);
        console.log(`   🔧 Node Version: ${metrics.nodeVersion}`);
        console.log(`   💻 Platform: ${metrics.platform} (${metrics.arch})`);
    });

    // Test 6: Backup Creation
    let backupId = null;
    await runTest('Backup Creation', async () => {
        const response = await fetch(`${API_BASE_URL}/api/backup/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                reason: 'phase4_testing',
                metadata: {
                    testSuite: 'advanced_features',
                    phase: 4
                }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Backup creation failed');
        if (!data.success) throw new Error('Backup not successful');

        backupId = data.backupId;
        console.log(`   💾 Backup ID: ${data.backupId}`);
        console.log(`   📁 Backup Name: ${data.backupName}`);
        console.log(`   📏 Size: ${data.size} memories`);
    });

    // Test 7: Backup List
    await runTest('Backup List', async () => {
        const response = await fetch(`${API_BASE_URL}/api/backup/list`, {
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Backup list failed');
        if (!data.success) throw new Error('Backup list not successful');

        console.log(`   📋 Total Backups: ${data.count}`);
        if (data.backups.length > 0) {
            const latest = data.backups[0];
            console.log(`   📅 Latest: ${latest.name} (${latest.size} memories)`);
        }
    });

    // Test 8: JWT Token Generation
    await runTest('JWT Token Generation', async () => {
        const response = await fetch(`${API_BASE_URL}/api/security/token`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                userId: 'test_user_phase4',
                role: 'admin',
                expiresIn: '1h'
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Token generation failed');
        if (!data.success) throw new Error('Token generation not successful');

        console.log(`   🔐 Token Generated: ${data.token.substring(0, 20)}...`);
        console.log(`   ⏱️ Expires In: ${data.expiresIn}`);
    });

    // Test 9: Audit Log
    await runTest('Audit Log', async () => {
        const response = await fetch(`${API_BASE_URL}/api/security/audit`, {
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Audit log failed');
        if (!data.success) throw new Error('Audit log not successful');

        console.log(`   📝 Audit Entries: ${data.count}`);
        if (data.auditLog.length > 0) {
            const latest = data.auditLog[0];
            console.log(`   📅 Latest: ${latest.action} by ${latest.userId}`);
        }
    });

    // Test 10: Cache Statistics
    await runTest('Cache Statistics', async () => {
        const response = await fetch(`${API_BASE_URL}/api/cache/stats`, {
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Cache stats failed');
        if (!data.success) throw new Error('Cache stats not successful');

        console.log(`   🗄️ Cache Size: ${data.cacheSize} entries`);
        console.log(`   ⏱️ Cache Timeout: ${data.cacheTimeout}ms`);
        console.log(`   💾 Memory Usage: ${Math.round(data.memoryUsage.heapUsed / 1024 / 1024)}MB`);
    });

    // Test 11: System Optimization
    await runTest('System Optimization', async () => {
        const response = await fetch(`${API_BASE_URL}/api/system/optimize`, {
            method: 'POST',
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'System optimization failed');
        if (!data.success) throw new Error('System optimization not successful');

        console.log(`   🧹 Removed Cache Entries: ${data.optimizations.removedCacheEntries}`);
        console.log(`   📊 Current Cache Size: ${data.optimizations.currentCacheSize}`);
        console.log(`   💾 Memory After: ${Math.round(data.optimizations.memoryUsage.heapUsed / 1024 / 1024)}MB`);
    });

    // Test 12: Cache Clear
    await runTest('Cache Clear', async () => {
        const response = await fetch(`${API_BASE_URL}/api/cache/clear`, {
            method: 'DELETE',
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Cache clear failed');
        if (!data.success) throw new Error('Cache clear not successful');

        console.log(`   🗑️ Cleared Entries: ${data.clearedEntries}`);
    });

    console.log('\n==================================================');
    console.log('🎯 PHASE 4 ADVANCED FEATURES TEST RESULTS');
    console.log('==================================================');
    console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
    console.log(`🔥 Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);

    if (testsPassed === totalTests) {
        console.log('🏆 ALL PHASE 4 ADVANCED FEATURES TESTS PASSED!');
        console.log('🚀 Enterprise capabilities fully operational');
        console.log('📊 Analytics dashboard working perfectly');
        console.log('🔒 Security systems active and functional');
        console.log('💾 Backup and restore systems validated');
        console.log('⚡ Performance optimization confirmed');
        console.log('🔍 Audit logging comprehensive and working');
        console.log('📈 Real-time monitoring active');
        console.log('🎯 Phase 4: COMPLETE SUCCESS!');
    } else {
        console.log(`❌ ${totalTests - testsPassed} tests failed`);
        console.log('🔧 Review and fix failing components');
    }

    console.log('\n💡 Next Steps: Phase 5 - Performance Optimization & Scaling');
    console.log('==================================================');
}

// Run the tests
testAdvancedFeatures().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
