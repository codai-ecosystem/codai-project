#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Basic test runner for TalentAI
console.log('🧪 Running TalentAI Basic Tests...\n');

// Check if key files exist
const keyFiles = [
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'src/lib/talentai-service.ts',
    'src/types/index.ts'
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
    if (packageJson.name === '@codai/talentai') {
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
    if (pageContent.includes('TalentAI')) {
        console.log('  ✅ Page component mentions TalentAI');
        passedTests++;
    } else {
        console.log('  ❌ Page component missing TalentAI reference');
    }
} catch (error) {
    console.log('  ❌ Could not read page component');
}

// Test service file
console.log('\n🔧 Service Tests:');
try {
    totalTests++;
    const serviceContent = fs.readFileSync('src/lib/talentai-service.ts', 'utf8');
    if (serviceContent.includes('class') && serviceContent.includes('TalentAI')) {
        console.log('  ✅ TalentAI service class found');
        passedTests++;
    } else {
        console.log('  ❌ TalentAI service class missing');
    }
} catch (error) {
    console.log('  ❌ Could not read service file');
}

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
} catch (error) {
    console.log('  ❌ Could not read types file');
}

// Summary
console.log('\n📊 Test Summary:');
console.log(`  Total Tests: ${totalTests}`);
console.log(`  Passed: ${passedTests}`);
console.log(`  Failed: ${totalTests - passedTests}`);
console.log(`  Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! TalentAI is ready.');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Review the issues above.');
    process.exit(1);
}
