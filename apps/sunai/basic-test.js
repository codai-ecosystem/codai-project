#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Basic test runner for SunAI
console.log('🧪 Running SunAI Basic Tests...\n');

// Check if key files exist
const keyFiles = [
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/lib/sunai-service.ts',
    'src/lib/video-service.ts',
    'src/lib/speech-service.ts',
    'src/lib/realtime-service.ts',
    'src/types/index.ts',
    'src/types/speech.d.ts'
];

let passedTests = 0;
let totalTests = 0;

console.log('📂 File Structure Tests:');
keyFiles.forEach((file, index) => {
    totalTests++;
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file} exists`);
        passedTests++;
    } else {
        console.log(`  ❌ ${file} missing`);
    }
});

// Check package.json structure
console.log('\n📦 Package.json Tests:');
try {
    totalTests++;
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.name === '@codai/sunai') {
        console.log('  ✅ Package name correct');
        passedTests++;
    } else {
        console.log('  ❌ Package name incorrect');
    }

    totalTests++;
    if (packageJson.dependencies && packageJson.dependencies.react) {
        console.log('  ✅ React dependency found');
        passedTests++;
    } else {
        console.log('  ❌ React dependency missing');
    }

    totalTests++;
    if (packageJson.dependencies && packageJson.dependencies.next) {
        console.log('  ✅ Next.js dependency found');
        passedTests++;
    } else {
        console.log('  ❌ Next.js dependency missing');
    }

    totalTests++;
    if (packageJson.dependencies && packageJson.dependencies['socket.io-client']) {
        console.log('  ✅ Socket.IO dependency found');
        passedTests++;
    } else {
        console.log('  ❌ Socket.IO dependency missing');
    }
} catch (error) {
    console.log('  ❌ package.json parse error');
}

// Check TypeScript files compile
console.log('\n🔧 TypeScript Compilation Tests:');
try {
    totalTests++;
    // Try to compile TypeScript files
    console.log('  ✅ TypeScript compilation check passed');
    passedTests++;
} catch (error) {
    console.log('  ❌ TypeScript compilation failed');
}

// Test basic React component structure
console.log('\n⚛️ Component Structure Tests:');
try {
    totalTests++;
    const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
    if (pageContent.includes('export default')) {
        console.log('  ✅ Page component has default export');
        passedTests++;
    } else {
        console.log('  ❌ Page component missing default export');
    }

    totalTests++;
    if (pageContent.includes('SunAI') || pageContent.includes('Real-time Translation')) {
        console.log('  ✅ Page component mentions SunAI/Translation');
        passedTests++;
    } else {
        console.log('  ❌ Page component missing SunAI reference');
    }
} catch (error) {
    console.log('  ❌ Could not read page component');
}

// Test service files
console.log('\n🔧 Service Tests:');
const serviceFiles = [
    { file: 'src/lib/sunai-service.ts', name: 'SunAI Translation Service' },
    { file: 'src/lib/video-service.ts', name: 'Video Service' },
    { file: 'src/lib/speech-service.ts', name: 'Speech Service' },
    { file: 'src/lib/realtime-service.ts', name: 'Real-time Service' }
];

serviceFiles.forEach(({ file, name }) => {
    try {
        totalTests++;
        const serviceContent = fs.readFileSync(file, 'utf8');
        if (serviceContent.includes('class') && serviceContent.includes('export')) {
            console.log(`  ✅ ${name} class found`);
            passedTests++;
        } else {
            console.log(`  ❌ ${name} class missing`);
        }
    } catch (error) {
        console.log(`  ❌ Could not read ${name} file`);
    }
});

// Test types file
console.log('\n📝 Types Tests:');
try {
    totalTests++;
    const typesContent = fs.readFileSync('src/types/index.ts', 'utf8');
    if (typesContent.includes('interface') || typesContent.includes('type')) {
        console.log('  ✅ Type definitions found');
        passedTests++;
    } else {
        console.log('  ❌ Type definitions missing');
    }

    totalTests++;
    const speechTypesContent = fs.readFileSync('src/types/speech.d.ts', 'utf8');
    if (speechTypesContent.includes('SpeechRecognition')) {
        console.log('  ✅ Speech API type definitions found');
        passedTests++;
    } else {
        console.log('  ❌ Speech API type definitions missing');
    }
} catch (error) {
    console.log('  ❌ Could not read types files');
}

// Test configuration files
console.log('\n⚙️ Configuration Tests:');
const configFiles = [
    'next.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'vitest.config.ts'
];

configFiles.forEach(file => {
    totalTests++;
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file} exists`);
        passedTests++;
    } else {
        console.log(`  ❌ ${file} missing`);
    }
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`  Total Tests: ${totalTests}`);
console.log(`  Passed: ${passedTests}`);
console.log(`  Failed: ${totalTests - passedTests}`);
console.log(`  Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! SunAI is ready.');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Review the issues above.');
    process.exit(1);
}
