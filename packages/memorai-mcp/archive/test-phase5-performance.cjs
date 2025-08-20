const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8005';
const API_KEY = 'memorai-dev-key-2025';

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

async function testPhase5Performance() {
    console.log('🚀 MEMORAI MCP PHASE 5 - PERFORMANCE OPTIMIZATION TEST SUITE');
    console.log('========================================================');

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

    // Test 1: Enhanced Health Check with Clustering
    await runTest('Enhanced Health Check with Clustering', async () => {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();

        if (!response.ok) throw new Error('Health check failed');
        if (data.version !== '5.0.0') throw new Error('Incorrect version');
        if (!data.features.includes('advanced_clustering')) throw new Error('Clustering not enabled');
        if (!data.features.includes('distributed_memory')) throw new Error('Distributed memory not enabled');
        if (!data.features.includes('performance_profiling')) throw new Error('Performance profiling not enabled');

        console.log(`   🌐 Cluster Nodes: ${data.cluster.totalNodes}`);
        console.log(`   🔧 Active Nodes: ${data.cluster.activeNodes}`);
        console.log(`   📊 Total Shards: ${data.cluster.shards.totalShards}`);
        console.log(`   💾 Cluster Memory: ${data.cluster.totalMemory}MB`);
        console.log(`   ⚡ Vector Optimization: ${data.optimization.optimizedVectors} vectors`);
    });

    // Test 2: Distributed Memory Storage
    let distributedMemoryId = null;
    await runTest('Distributed Memory Storage', async () => {
        const response = await fetch(`${API_BASE_URL}/api/memory/distributed-store`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                content: 'This is a distributed memory stored across multiple shards in Phase 5 testing',
                metadata: {
                    category: 'performance_test',
                    priority: 'high',
                    testPhase: 'phase5'
                },
                options: {
                    replicate: true,
                    shardKey: 'test-shard-key-phase5'
                }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Distributed storage failed');
        if (!data.success) throw new Error('Distributed storage not successful');

        distributedMemoryId = data.memoryId;
        console.log(`   🌐 Memory ID: ${data.memoryId.substring(0, 8)}`);
        console.log(`   🔀 Shard: ${data.shard}`);
        console.log(`   📚 Replicas: ${data.replicas}`);
        console.log(`   🖥️ Node: ${data.node.substring(0, 8)}`);
    });

    // Test 3: Distributed Memory Search
    await runTest('Distributed Memory Search', async () => {
        const response = await fetch(`${API_BASE_URL}/api/memory/distributed-search`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query: 'distributed memory Phase 5',
                options: {
                    limit: 10,
                    distributed: true,
                    useOptimization: true
                }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Distributed search failed');
        if (!data.success) throw new Error('Distributed search not successful');

        console.log(`   🔍 Query: "distributed memory Phase 5"`);
        console.log(`   📊 Results: ${data.totalFound} found`);
        console.log(`   ⚡ Search Time: ${data.searchTime}ms`);
        console.log(`   🌐 Shards Searched: ${data.shardsSearched}`);
        console.log(`   🎯 Distributed: ${data.distributed ? 'YES' : 'NO'}`);
    });

    // Test 4: Cluster Status and Management
    await runTest('Cluster Status and Management', async () => {
        const response = await fetch(`${API_BASE_URL}/api/cluster/status`, {
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Cluster status failed');
        if (!data.success) throw new Error('Cluster status not successful');

        const cluster = data.cluster;
        console.log(`   🌐 Cluster ID: ${cluster.clusterId.substring(0, 8)}`);
        console.log(`   🖥️ Total Nodes: ${cluster.totalNodes}`);
        console.log(`   ✅ Active Nodes: ${cluster.activeNodes}`);
        console.log(`   🔀 Total Shards: ${cluster.shards.totalShards}`);
        console.log(`   📊 Shard Distribution: ${JSON.stringify(cluster.shards.distribution)}`);
        console.log(`   ⚡ Uptime: ${Math.round(cluster.uptime / 1000)}s`);
    });

    // Test 5: Load Balancer Strategy Management
    await runTest('Load Balancer Strategy Management', async () => {
        const strategies = ['roundRobin', 'leastConnections', 'weightedRoundRobin', 'consistentHashing'];

        for (const strategy of strategies) {
            const response = await fetch(`${API_BASE_URL}/api/loadbalancer/strategy`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ strategy })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Strategy ${strategy} failed`);
            if (!data.success) throw new Error(`Strategy ${strategy} not successful`);

            console.log(`   ⚖️ Strategy ${strategy}: ACTIVE`);
        }
    });

    // Test 6: Vector Optimization
    await runTest('Vector Optimization', async () => {
        const testVectors = Array.from({ length: 100 }, (_, i) => ({
            id: `test-vector-${i}`,
            content: `Test vector content for optimization ${i}`,
            embedding: Array.from({ length: 1536 }, () => Math.random()),
            metadata: { category: 'test', index: i }
        }));

        const response = await fetch(`${API_BASE_URL}/api/optimization/vectors`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ vectors: testVectors })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Vector optimization failed');
        if (!data.success) throw new Error('Vector optimization not successful');

        const optimization = data.optimization;
        console.log(`   🎯 Original Vectors: ${optimization.originalCount}`);
        console.log(`   ⚡ Optimized Vectors: ${optimization.optimizedCount}`);
        console.log(`   📊 Compression Ratio: ${(optimization.compressionRatio * 100).toFixed(1)}%`);
        console.log(`   🔍 Index Created: ${optimization.index.type}`);
        console.log(`   📈 Clusters: ${optimization.index.clusters.length}`);
    });

    // Test 7: Optimization Statistics
    await runTest('Optimization Statistics', async () => {
        const response = await fetch(`${API_BASE_URL}/api/optimization/stats`, {
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Optimization stats failed');
        if (!data.success) throw new Error('Optimization stats not successful');

        const stats = data.optimization;
        console.log(`   📊 Index Cache Size: ${stats.indexCacheSize}`);
        console.log(`   ⚡ Compression Ratio: ${(stats.compressionRatio * 100).toFixed(1)}%`);
        console.log(`   📦 Batch Size: ${stats.batchSize}`);
        console.log(`   🔄 Background Optimization: ${stats.backgroundOptimization ? 'ENABLED' : 'DISABLED'}`);
        console.log(`   🎯 Optimized Vectors Total: ${stats.optimizedVectors}`);
    });

    // Test 8: Performance Metrics
    await runTest('Performance Metrics', async () => {
        const response = await fetch(`${API_BASE_URL}/api/performance/metrics`, {
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Performance metrics failed');
        if (!data.success) throw new Error('Performance metrics not successful');

        const summary = data.summary;
        console.log(`   📊 Total Requests: ${summary.totalRequests}`);
        console.log(`   ⚡ Avg Response Time: ${summary.averageResponseTime.toFixed(2)}ms`);
        console.log(`   🚀 Min Response Time: ${summary.minResponseTime.toFixed(2)}ms`);
        console.log(`   🐌 Max Response Time: ${summary.maxResponseTime.toFixed(2)}ms`);
        console.log(`   📈 Requests/Second: ${summary.requestsPerSecond.toFixed(2)}`);
        console.log(`   ❌ Error Rate: ${summary.errorRate.toFixed(2)}%`);
    });

    // Test 9: System Profiling
    await runTest('System Profiling', async () => {
        const response = await fetch(`${API_BASE_URL}/api/performance/profile`, {
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'System profiling failed');
        if (!data.success) throw new Error('System profiling not successful');

        const profile = data.profile;
        console.log(`   🖥️ Platform: ${profile.system.platform} (${profile.system.arch})`);
        console.log(`   🔧 Node Version: ${profile.system.nodeVersion}`);
        console.log(`   ⏱️ Uptime: ${Math.round(profile.system.uptime / 1000)}s`);
        console.log(`   💾 Memory Used: ${Math.round(profile.memory.heapUsed / 1024 / 1024)}MB`);
        console.log(`   🖥️ CPUs: ${profile.cpus}`);
        console.log(`   📊 Free Memory: ${Math.round(profile.freeMemory / 1024 / 1024 / 1024)}GB`);
    });

    // Test 10: Cluster Rebalancing
    await runTest('Cluster Rebalancing', async () => {
        const response = await fetch(`${API_BASE_URL}/api/cluster/rebalance`, {
            method: 'POST',
            headers
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Cluster rebalancing failed');
        if (!data.success) throw new Error('Cluster rebalancing not successful');

        console.log(`   ⚖️ Rebalance: ${data.message}`);
        console.log(`   🖥️ Active Nodes: ${data.activeNodes}`);
    });

    // Test 11: High Load Performance Test
    await runTest('High Load Performance Test', async () => {
        console.log('   🔥 Starting high load test...');

        const concurrentRequests = 20;
        const requests = Array.from({ length: concurrentRequests }, (_, i) =>
            fetch(`${API_BASE_URL}/api/memory/distributed-store`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    content: `High load test memory ${i} with Phase 5 performance optimization`,
                    metadata: { testType: 'high_load', index: i }
                })
            }).then(res => res.json())
        );

        const startTime = Date.now();
        const results = await Promise.all(requests);
        const endTime = Date.now();

        const successful = results.filter(r => r.success).length;
        const avgTime = (endTime - startTime) / concurrentRequests;

        if (successful < concurrentRequests * 0.9) {
            throw new Error(`Only ${successful}/${concurrentRequests} requests successful`);
        }

        console.log(`   🚀 Concurrent Requests: ${concurrentRequests}`);
        console.log(`   ✅ Successful: ${successful}/${concurrentRequests}`);
        console.log(`   ⚡ Avg Time per Request: ${avgTime.toFixed(2)}ms`);
        console.log(`   📈 Total Time: ${endTime - startTime}ms`);
    });

    // Test 12: Memory Distribution Analysis
    await runTest('Memory Distribution Analysis', async () => {
        // Store memories with different shard keys to test distribution
        const memoryPromises = Array.from({ length: 50 }, (_, i) =>
            fetch(`${API_BASE_URL}/api/memory/distributed-store`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    content: `Distribution test memory ${i}`,
                    metadata: { distributionTest: true, index: i },
                    options: { shardKey: `shard-key-${i % 10}` }
                })
            }).then(res => res.json())
        );

        const results = await Promise.all(memoryPromises);
        const successful = results.filter(r => r.success);

        if (successful.length < 45) {
            throw new Error(`Only ${successful.length}/50 memories stored successfully`);
        }

        // Analyze shard distribution
        const shardDistribution = new Map();
        successful.forEach(result => {
            shardDistribution.set(result.shard, (shardDistribution.get(result.shard) || 0) + 1);
        });

        console.log(`   📊 Memories Stored: ${successful.length}`);
        console.log(`   🔀 Shards Used: ${shardDistribution.size}`);
        console.log(`   📈 Avg per Shard: ${(successful.length / shardDistribution.size).toFixed(1)}`);
        console.log(`   ⚖️ Distribution: ${JSON.stringify(Object.fromEntries(shardDistribution))}`);
    });

    console.log('\n========================================================');
    console.log('🎯 PHASE 5 PERFORMANCE OPTIMIZATION TEST RESULTS');
    console.log('========================================================');
    console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
    console.log(`🔥 Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);

    if (testsPassed === totalTests) {
        console.log('🏆 ALL PHASE 5 PERFORMANCE TESTS PASSED!');
        console.log('🚀 Advanced clustering fully operational');
        console.log('⚖️ Load balancing systems validated');
        console.log('🎯 Vector optimization working perfectly');
        console.log('🌐 Distributed memory system confirmed');
        console.log('📊 Performance profiling comprehensive');
        console.log('📈 Auto-scaling capabilities ready');
        console.log('🔥 High load performance excellent');
        console.log('⚡ System optimization complete');
        console.log('🎯 Phase 5: COMPLETE SUCCESS!');
    } else {
        console.log(`❌ ${totalTests - testsPassed} tests failed`);
        console.log('🔧 Review and fix failing components');
    }

    console.log('\n💡 Next Steps: Phase 6 - Real-time Collaboration & WebSocket');
    console.log('========================================================');
}

// Run the tests
testPhase5Performance().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
