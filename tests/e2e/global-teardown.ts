import { FullConfig } from '@playwright/test';

/**
 * Global Teardown for Comprehensive Testing
 * Cleans up test environment and resources
 */

async function globalTeardown(config: FullConfig) {
    console.log('🧹 Starting global teardown...');

    // Clean up test data
    console.log('🗑️  Cleaning up test data...');

    try {
        // Clean up test users (except keep them for development)
        // In a real scenario, you might want to clean up test-specific data

        // Clean up test projects
        const testProjectNames = [
            'Test Project Alpha',
            'Test Project Beta',
            'Test Project Gamma'
        ];

        for (const projectName of testProjectNames) {
            try {
                const response = await fetch(`http://localhost:4001/api/projects?name=${encodeURIComponent(projectName)}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer test-token'
                    }
                });

                if (response.ok) {
                    console.log(`✅ Cleaned up test project: ${projectName}`);
                }
            } catch (error) {
                console.log(`⚠️  Could not clean up test project ${projectName}: ${error.message}`);
            }
        }

        // Clean up test sessions and temporary data
        try {
            await fetch('http://localhost:4004/api/test/cleanup', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log('✅ Cleaned up test sessions');
        } catch (error) {
            console.log(`⚠️  Could not clean up test sessions: ${error.message}`);
        }

    } catch (error) {
        console.log(`⚠️  Test data cleanup failed: ${error.message}`);
    }

    // Generate test summary
    const setupTime = process.env.SETUP_COMPLETED;
    const teardownTime = Date.now();
    const duration = setupTime ? teardownTime - parseInt(setupTime) : 0;

    console.log('\n📊 Test Session Summary:');
    console.log(`   Duration: ${Math.round(duration / 1000)}s`);
    console.log(`   Setup completed: ${setupTime ? new Date(parseInt(setupTime)).toISOString() : 'Unknown'}`);
    console.log(`   Teardown started: ${new Date(teardownTime).toISOString()}`);

    // Save test metrics for analysis
    try {
        const fs = require('fs');
        const path = require('path');

        const metricsDir = path.join(process.cwd(), 'test-results');
        if (!fs.existsSync(metricsDir)) {
            fs.mkdirSync(metricsDir, { recursive: true });
        }

        const metrics = {
            sessionStart: setupTime ? new Date(parseInt(setupTime)).toISOString() : null,
            sessionEnd: new Date(teardownTime).toISOString(),
            duration: duration,
            timestamp: teardownTime
        };

        fs.writeFileSync(
            path.join(metricsDir, 'session-metrics.json'),
            JSON.stringify(metrics, null, 2)
        );

        console.log('✅ Test metrics saved to test-results/session-metrics.json');
    } catch (error) {
        console.log(`⚠️  Could not save test metrics: ${error.message}`);
    }

    console.log('✨ Global teardown completed successfully!');
}

export default globalTeardown;
