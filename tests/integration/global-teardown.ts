import { FullConfig } from '@playwright/test';
import axios from 'axios';

/**
 * Global Teardown for CODAI Integration Testing
 * Cleans up test environment and resources
 */

async function globalTeardown(config: FullConfig) {
    console.log('\n🧹 Starting CODAI Integration Testing Global Teardown...');

    const API_GATEWAY = 'http://localhost:4000';

    // Clean up test data
    console.log('🗑️  Cleaning up test data...');
    try {
        if (process.env.TEST_AUTH_TOKEN) {
            const headers = { Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}` };

            // Clean up integration test data
            const cleanupResponse = await axios.post(`${API_GATEWAY}/admin/cleanup-test-data`, {
                confirm: true,
                test_run_cleanup: true
            }, {
                headers,
                timeout: 30000
            });

            if (cleanupResponse.status === 200) {
                console.log('✅ Test data cleanup completed');
            } else {
                console.log('⚠️  Test data cleanup partially completed');
            }
        }
    } catch (error) {
        console.log('⚠️  Test data cleanup failed:', error.message);
    }

    // Clear test caches
    console.log('💾 Clearing test caches...');
    try {
        if (process.env.TEST_AUTH_TOKEN) {
            const headers = { Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}` };

            await axios.post(`${API_GATEWAY}/admin/clear-cache`, {
                cache_types: ['test_data', 'integration_test', 'temporary']
            }, {
                headers,
                timeout: 15000
            });

            console.log('✅ Test caches cleared');
        }
    } catch (error) {
        console.log('⚠️  Cache clearing failed:', error.message);
    }

    // Reset test user states
    console.log('👤 Resetting test user states...');
    try {
        if (process.env.TEST_AUTH_TOKEN) {
            const headers = { Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}` };

            const testUsers = [
                'testuser', 'developer', 'business', 'student',
                'loaduser1', 'loaduser2', 'syncuser', 'perfuser',
                'mobileuser', 'a11yuser', 'erroruser', 'datauser'
            ];

            for (const username of testUsers) {
                try {
                    await axios.post(`${API_GATEWAY}/admin/reset-user-state`, {
                        username: username
                    }, { headers, timeout: 5000 });
                } catch (error) {
                    // User might not exist or reset might not be needed
                }
            }

            console.log('✅ Test user states reset');
        }
    } catch (error) {
        console.log('⚠️  User state reset failed:', error.message);
    }

    // Close any remaining connections
    console.log('🔌 Closing remaining connections...');
    try {
        // Close WebSocket connections
        if (global.testWebSocketConnections) {
            for (const ws of global.testWebSocketConnections) {
                if (ws.readyState === 1) { // WebSocket.OPEN
                    ws.close();
                }
            }
        }

        // Close Socket.IO connections
        if (global.testSocketIOConnections) {
            for (const socket of global.testSocketIOConnections) {
                socket.disconnect();
            }
        }

        console.log('✅ Connections closed');
    } catch (error) {
        console.log('⚠️  Connection cleanup failed:', error.message);
    }

    // Generate test summary
    console.log('📊 Generating test summary...');
    try {
        const testSummary = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'test',
            api_gateway: API_GATEWAY,
            performance_baseline: process.env.PERFORMANCE_BASELINE,
            auth_token_used: !!process.env.TEST_AUTH_TOKEN,
            cleanup_completed: true
        };

        console.log('\n📋 Integration Test Session Summary:');
        console.log(`   Timestamp: ${testSummary.timestamp}`);
        console.log(`   Environment: ${testSummary.environment}`);
        console.log(`   API Gateway: ${testSummary.api_gateway}`);
        console.log(`   Performance Baseline: ${testSummary.performance_baseline || 'N/A'}ms`);
        console.log(`   Authentication: ${testSummary.auth_token_used ? '✅' : '❌'}`);
        console.log(`   Cleanup Status: ${testSummary.cleanup_completed ? '✅' : '❌'}`);

    } catch (error) {
        console.log('⚠️  Test summary generation failed:', error.message);
    }

    // Final environment check
    console.log('🔍 Final environment check...');
    try {
        const healthResponse = await axios.get(`${API_GATEWAY}/health`, { timeout: 5000 });

        if (healthResponse.status === 200) {
            console.log('✅ API Gateway still healthy after tests');
        } else {
            console.log('⚠️  API Gateway health check returned:', healthResponse.status);
        }
    } catch (error) {
        console.log('⚠️  Final health check failed:', error.message);
    }

    // Clean up environment variables
    console.log('🌍 Cleaning up environment variables...');
    delete process.env.TEST_AUTH_TOKEN;
    delete process.env.PERFORMANCE_BASELINE;
    console.log('✅ Environment variables cleaned');

    // Generate metrics summary
    console.log('📈 Integration testing metrics summary...');
    try {
        if (process.env.TEST_AUTH_TOKEN) {
            const headers = { Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}` };

            const metricsResponse = await axios.get(`${API_GATEWAY}/admin/test-metrics`, {
                headers,
                timeout: 10000
            });

            if (metricsResponse.ok()) {
                const metrics = metricsResponse.data;
                console.log('\n📊 Test Session Metrics:');
                console.log(`   Total Requests: ${metrics.total_requests || 'N/A'}`);
                console.log(`   Average Response Time: ${metrics.avg_response_time || 'N/A'}ms`);
                console.log(`   Error Rate: ${metrics.error_rate || 'N/A'}%`);
                console.log(`   Peak Memory Usage: ${metrics.peak_memory || 'N/A'}MB`);
                console.log(`   Peak CPU Usage: ${metrics.peak_cpu || 'N/A'}%`);
            }
        }
    } catch (error) {
        console.log('⚠️  Metrics summary generation failed:', error.message);
    }

    // Recommendations for next test run
    console.log('\n💡 Recommendations for next test run:');

    const recommendations = [];

    if (!process.env.TEST_AUTH_TOKEN) {
        recommendations.push('- Ensure authentication system is working before running tests');
    }

    if (!process.env.PERFORMANCE_BASELINE) {
        recommendations.push('- Consider running performance baseline establishment');
    }

    // Check if there were any service issues during tests
    try {
        const serviceHealthResponse = await axios.get(`${API_GATEWAY}/admin/service-health-summary`, {
            timeout: 5000
        });

        if (serviceHealthResponse.ok()) {
            const healthSummary = serviceHealthResponse.data;
            if (healthSummary.unhealthy_services > 0) {
                recommendations.push(`- Fix ${healthSummary.unhealthy_services} unhealthy service(s) before next run`);
            }

            if (healthSummary.avg_response_time > 2000) {
                recommendations.push('- Investigate slow service response times');
            }
        }
    } catch (error) {
        // Service health check not available
    }

    if (recommendations.length > 0) {
        recommendations.forEach(rec => console.log(rec));
    } else {
        console.log('✅ No specific recommendations - system appears healthy');
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎬 CODAI Integration Testing Global Teardown Complete');
    console.log('='.repeat(80) + '\n');
}

export default globalTeardown;
