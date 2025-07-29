/**
 * Glass MCP Integration Test Runner
 * 
 * Simple Node.js script to run Glass MCP integration tests.
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runGlassMCPTests() {
    console.log('🧪 METU Glass MCP Integration Test Runner\n');

    const testFile = join(__dirname, 'src', 'services', 'mcp', 'glass-mcp-integration.test.ts');

    console.log('📁 Test file:', testFile);
    console.log('🚀 Starting tests...\n');

    // Use tsx to run TypeScript directly
    const testProcess = spawn('npx', ['tsx', testFile], {
        stdio: 'inherit',
        shell: true,
        cwd: __dirname
    });

    testProcess.on('close', (code) => {
        console.log(`\n📊 Test process exited with code ${code}`);

        if (code === 0) {
            console.log('✅ Glass MCP integration tests completed successfully!');
        } else {
            console.log('❌ Glass MCP integration tests failed.');
        }

        process.exit(code);
    });

    testProcess.on('error', (error) => {
        console.error('❌ Error running tests:', error);
        process.exit(1);
    });
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Test runner interrupted');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Test runner terminated');
    process.exit(1);
});

// Run tests
runGlassMCPTests().catch(console.error);
