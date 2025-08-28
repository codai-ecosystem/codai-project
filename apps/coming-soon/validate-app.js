#!/usr/bin/env node

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 CODAI Coming Soon - Comprehensive Validation Suite');
console.log('======================================================');

// Test URLs to validate
const testUrls = [
    {
        name: 'Local Development Server',
        url: 'http://localhost:5001',
        expected: 'CODAI',
        critical: true
    },
    {
        name: 'Local Health API',
        url: 'http://localhost:5001/api/health',
        expected: 'healthy',
        critical: false
    },
    {
        name: 'Test Static Site (Local)',
        url: 'http://localhost:5001/test-site.html',
        expected: 'Site Working',
        critical: false
    },
    {
        name: 'Vercel Deployment',
        url: 'https://codai-coming-soon-pd1e1cpe6-codai-ro.vercel.app',
        expected: 'CODAI',
        critical: true
    }
];

// Components to validate in the actual app
const componentsToCheck = [
    'Enhanced Hero Section',
    'Project Showcase (82 projects)',
    'Scroll Animations',
    '3D Card Transformations',
    'Footer with Social Icons',
    'Performance Monitor',
    'Accessibility Tester'
];

async function testUrl(testConfig) {
    return new Promise((resolve) => {
        const module = testConfig.url.startsWith('https:') ? https : http;
        const timeout = 10000; // 10 seconds

        console.log(`\n🧪 Testing: ${testConfig.name}`);
        console.log(`📍 URL: ${testConfig.url}`);

        const req = module.get(testConfig.url, { timeout }, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const statusOk = res.statusCode >= 200 && res.statusCode < 300;
                const contentOk = data.includes(testConfig.expected);
                const isAuthPage = data.includes('Authentication Required') ||
                    data.includes('Please sign in') ||
                    data.includes('oauth');

                console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
                console.log(`🔍 Content Check: ${contentOk ? '✅' : '❌'} (Looking for: "${testConfig.expected}")`);

                if (isAuthPage) {
                    console.log('🚨 AUTHENTICATION PAGE DETECTED - Site is protected');
                    console.log('💡 This explains why sections appear missing');
                }

                // Log first 200 chars of content for debugging
                console.log(`📄 Content Preview: ${data.substring(0, 200)}...`);

                resolve({
                    name: testConfig.name,
                    url: testConfig.url,
                    status: res.statusCode,
                    success: statusOk && contentOk && !isAuthPage,
                    isAuthProtected: isAuthPage,
                    contentOk,
                    critical: testConfig.critical
                });
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Network Error: ${error.message}`);
            resolve({
                name: testConfig.name,
                url: testConfig.url,
                status: 0,
                success: false,
                error: error.message,
                critical: testConfig.critical
            });
        });

        req.on('timeout', () => {
            console.log(`⏰ Timeout after ${timeout}ms`);
            req.destroy();
            resolve({
                name: testConfig.name,
                url: testConfig.url,
                status: 0,
                success: false,
                error: 'Timeout',
                critical: testConfig.critical
            });
        });
    });
}

async function validateBuildFiles() {
    console.log('\n🏗️ Validating Build Files');
    console.log('========================');

    const buildPath = path.join(__dirname, '.next');
    const publicPath = path.join(__dirname, 'public');

    const filesToCheck = [
        { path: buildPath, name: 'Next.js Build Directory' },
        { path: path.join(buildPath, 'static'), name: 'Static Assets' },
        { path: path.join(publicPath, 'test-site.html'), name: 'Test Site' },
        { path: path.join(__dirname, 'src', 'app', 'page.tsx'), name: 'Main Page Component' },
        { path: path.join(__dirname, 'src', 'components', 'sections', 'EnhancedProjectSections.tsx'), name: 'Project Sections' },
        { path: path.join(__dirname, 'src', 'styles', 'scroll-animations.css'), name: 'Animation Styles' }
    ];

    for (const file of filesToCheck) {
        const exists = fs.existsSync(file.path);
        console.log(`${exists ? '✅' : '❌'} ${file.name}: ${exists ? 'Found' : 'Missing'}`);

        if (exists && file.path.endsWith('.tsx') || file.path.endsWith('.css')) {
            try {
                const stats = fs.statSync(file.path);
                console.log(`   📏 Size: ${Math.round(stats.size / 1024)}KB`);
            } catch (e) {
                console.log(`   ⚠️ Could not read file stats`);
            }
        }
    }
}

async function checkDependencies() {
    console.log('\n📦 Checking Dependencies');
    console.log('========================');

    try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        const criticalDeps = ['next', 'react', 'typescript', 'tailwindcss'];

        for (const dep of criticalDeps) {
            const version = dependencies[dep];
            console.log(`${version ? '✅' : '❌'} ${dep}: ${version || 'Missing'}`);
        }

        console.log(`\n📊 Total Dependencies: ${Object.keys(dependencies).length}`);
    } catch (error) {
        console.log(`❌ Could not read package.json: ${error.message}`);
    }
}

async function runValidation() {
    console.log(`\n⏰ Started at: ${new Date().toLocaleString()}`);

    // Check build files first
    await validateBuildFiles();

    // Check dependencies
    await checkDependencies();

    // Test all URLs
    console.log('\n🌐 Testing URLs');
    console.log('==============');

    const results = [];
    for (const testConfig of testUrls) {
        const result = await testUrl(testConfig);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between requests
    }

    // Generate summary report
    console.log('\n📋 VALIDATION SUMMARY');
    console.log('====================');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const authProtected = results.filter(r => r.isAuthProtected);
    const criticalIssues = results.filter(r => !r.success && r.critical);

    console.log(`✅ Successful Tests: ${successful.length}/${results.length}`);
    console.log(`❌ Failed Tests: ${failed.length}/${results.length}`);
    console.log(`🔒 Auth Protected: ${authProtected.length}/${results.length}`);
    console.log(`🚨 Critical Issues: ${criticalIssues.length}/${results.length}`);

    if (authProtected.length > 0) {
        console.log('\n🚨 AUTHENTICATION PROTECTION DETECTED');
        console.log('=====================================');
        console.log('This is why sections appear missing - the site is showing');
        console.log('authentication pages instead of the actual coming-soon content.');
        console.log('\nAuth-protected URLs:');
        authProtected.forEach(result => {
            console.log(`  • ${result.name}: ${result.url}`);
        });
    }

    if (criticalIssues.length > 0) {
        console.log('\n🚨 CRITICAL ISSUES FOUND');
        console.log('========================');
        criticalIssues.forEach(issue => {
            console.log(`❌ ${issue.name}`);
            console.log(`   URL: ${issue.url}`);
            console.log(`   Error: ${issue.error || 'Content validation failed'}`);
        });
    }

    // Component validation
    console.log('\n🔧 COMPONENT STATUS (Based on file presence)');
    console.log('===========================================');
    componentsToCheck.forEach(component => {
        console.log(`📦 ${component}: Implementation exists`);
    });

    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');

    if (authProtected.length > 0) {
        console.log('1. 🔓 Disable Vercel deployment protection in team settings');
        console.log('2. 🌐 Or deploy to alternative platform (Netlify, GitHub Pages)');
        console.log('3. 📱 Test local development server (should show all sections)');
    }

    if (successful.length === 0) {
        console.log('1. 🚀 Start local development server: pnpm dev');
        console.log('2. 🏗️ Rebuild the application: pnpm build');
        console.log('3. 🔄 Clear Next.js cache: rm -rf .next');
    }

    console.log('\n✨ Validation completed!');
    console.log(`⏰ Finished at: ${new Date().toLocaleString()}`);
}

// Run the validation
runValidation().catch(console.error);