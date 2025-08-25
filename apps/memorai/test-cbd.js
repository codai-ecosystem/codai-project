// Simple test script to verify CBD connectivity from MemorAI app
const CBD_URL = process.env.CBD_BASE_URL || process.env.NEXT_PUBLIC_CBD_URL || 'http://cbd-database:4180';

console.log('Testing CBD connectivity...');
console.log('CBD URL:', CBD_URL);

async function testCBD() {
    try {
        const response = await fetch(`${CBD_URL}/health`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('✅ CBD Connection Success!');
        console.log('CBD Status:', data.status);
        console.log('CBD Service:', data.service);
        console.log('CBD Version:', data.version);
        return true;
    } catch (error) {
        console.log('❌ CBD Connection Failed!');
        console.log('Error:', error.message);
        return false;
    }
}

testCBD().then(success => {
    process.exit(success ? 0 : 1);
});