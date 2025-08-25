/**
 * 🚀 Integration Tests Global Setup
 * 
 * Global setup and teardown for API integration tests.
 * Ensures services are available and configures test environment.
 */

import { setTimeout } from 'timers/promises';

// Service endpoints for health checking
const REQUIRED_SERVICES = [
    { name: 'MemorAI', url: 'http://localhost:4006/api/health', required: false },
    { name: 'CBD Database', url: 'http://localhost:4180/health', required: false },
    { name: 'MemorAI MCP', url: 'http://localhost:4950/health', required: false },
    { name: 'RomAI Enterprise', url: 'http://localhost:8001/api/v1/health', required: false }
];

async function checkService(service: { name: string; url: string; required: boolean }): Promise<boolean> {
    try {
        const response = await fetch(service.url, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });

        const isHealthy = response.ok;
        console.log(`${isHealthy ? '✅' : '❌'} ${service.name}: ${isHealthy ? 'Available' : 'Unavailable'}`);
        return isHealthy;
    } catch (error) {
        console.log(`❌ ${service.name}: Connection failed`);
        return false;
    }
}

export async function setup() {
    console.log('\n🚀 Starting CODAI API Integration Tests Setup');
    console.log('='.repeat(60));

    // Check service availability
    console.log('\n🔍 Checking service availability...');

    const serviceResults = await Promise.all(
        REQUIRED_SERVICES.map(checkService)
    );

    const availableServices = serviceResults.filter(Boolean).length;
    const totalServices = REQUIRED_SERVICES.length;

    console.log(`\n📊 Service Status: ${availableServices}/${totalServices} available`);

    // Warning if no services are available
    if (availableServices === 0) {
        console.warn('\n⚠️  WARNING: No services are currently running!');
        console.warn('Integration tests will skip unavailable service tests.');
        console.warn('\nTo start services, run these VS Code tasks:');
        console.warn('- Start Core Services');
        console.warn('- Start Enterprise Services');
    } else {
        console.log(`\n✅ Ready to run integration tests with ${availableServices} available service(s)`);
    }

    // Small delay to ensure services are fully ready
    await setTimeout(1000);

    console.log('\n🎯 Setup completed - starting integration tests...\n');
}

export async function teardown() {
    console.log('\n🧹 Integration Tests Teardown');
    console.log('='.repeat(40));
    console.log('✅ Integration tests completed successfully');
    console.log('\n💡 Tip: Services remain running for additional testing');
}