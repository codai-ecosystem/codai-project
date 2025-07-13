// Test database seeding functionality for DEXAI
import { RealDictionaryService } from './src/services/realDictionaryService.js';

console.log('🧪 Testing DEXAI Admin Database Functionality...');

async function testAdminFunctions() {
    try {
        console.log('📊 1. Testing database stats retrieval...');
        const stats = await RealDictionaryService.getDatabaseStats();
        console.log('✅ Database stats:', stats);

        console.log('\n🌱 2. Testing database seeding...');
        await RealDictionaryService.seedDatabase();
        console.log('✅ Database seeding completed');

        console.log('\n📊 3. Testing updated stats after seeding...');
        const newStats = await RealDictionaryService.getDatabaseStats();
        console.log('✅ Updated database stats:', newStats);

        console.log('\n🔍 4. Testing search functionality...');
        const searchResults = await RealDictionaryService.searchEntries('casa');
        console.log('✅ Search results for "casa":', searchResults.length, 'entries found');

        console.log('\n🎉 Admin functionality test: PASSED');
    } catch (error) {
        console.error('❌ Admin functionality test failed:', error.message);
    }
}

testAdminFunctions();
