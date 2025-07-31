import { spawn } from 'child_process';
import path from 'path';

const packageDir = 'E:\\GitHub\\codai-project\\packages\\controlai-mcp';

console.log('🔨 Building ControlAI MCP...');

const tsc = spawn('npx', ['tsc'], {
    cwd: packageDir,
    stdio: 'inherit',
    shell: true
});

tsc.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Build successful!');
        console.log('📦 Package ready for publishing');
        console.log('🚀 Run: npm publish --registry https://registry.npmjs.org/ --access public');
    } else {
        console.log(`❌ Build failed with exit code ${code}`);
        console.log('Check TypeScript errors above');
    }
});

tsc.on('error', (err) => {
    console.error('❌ Build process error:', err);
});
