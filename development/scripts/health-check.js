#!/usr/bin/env node

/**
 * Simple health check script for CODAI ecosystem
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 CODAI Ecosystem Health Check');
console.log('================================\n');

// Check if services are running
function checkRunningProcesses() {
    try {
        console.log('📊 Running Node.js Processes:');
        const result = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8' });
        const lines = result.split('\n').filter(line => line.includes('node.exe'));
        console.log(`   Found ${lines.length} Node.js processes running\n`);
        return lines.length;
    } catch (error) {
        console.log('   Error checking processes:', error.message);
        return 0;
    }
}

// Check app directories
function checkApplications() {
    const appsDir = path.join(__dirname, '..', 'apps');
    try {
        const apps = fs.readdirSync(appsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        console.log(`📱 Applications Found: ${apps.length}`);
        console.log(`   ${apps.slice(0, 10).join(', ')}${apps.length > 10 ? '...' : ''}\n`);
        return apps.length;
    } catch (error) {
        console.log('   Error reading apps directory:', error.message);
        return 0;
    }
}

// Check packages
function checkPackages() {
    const packagesDir = path.join(__dirname, '..', 'packages');
    try {
        const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        console.log(`📦 Packages Found: ${packages.length}`);
        console.log(`   ${packages.slice(0, 10).join(', ')}${packages.length > 10 ? '...' : ''}\n`);
        return packages.length;
    } catch (error) {
        console.log('   Error reading packages directory:', error.message);
        return 0;
    }
}

// Check for built packages
function checkBuiltPackages() {
    const corePackages = ['core', 'sdk', 'cli', 'logai-sdk'];
    let builtCount = 0;

    console.log('🔨 Build Status:');
    for (const pkg of corePackages) {
        const distPath = path.join(__dirname, '..', 'packages', pkg, 'dist');
        const exists = fs.existsSync(distPath);
        console.log(`   ${pkg}: ${exists ? '✅ Built' : '❌ Not built'}`);
        if (exists) builtCount++;
    }
    console.log();
    return builtCount;
}

// Check task availability
function checkTasks() {
    const tasksConfigPath = path.join(__dirname, '..', '.vscode', 'tasks.json');
    try {
        if (fs.existsSync(tasksConfigPath)) {
            const tasksConfig = JSON.parse(fs.readFileSync(tasksConfigPath, 'utf8'));
            const taskCount = tasksConfig.tasks ? tasksConfig.tasks.length : 0;
            console.log(`⚙️  VS Code Tasks: ${taskCount} configured\n`);
            return taskCount;
        } else {
            console.log('⚙️  VS Code Tasks: No tasks.json found\n');
            return 0;
        }
    } catch (error) {
        console.log('⚙️  VS Code Tasks: Error reading tasks.json\n');
        return 0;
    }
}

// Main health check
async function main() {
    const processes = checkRunningProcesses();
    const apps = checkApplications();
    const packages = checkPackages();
    const built = checkBuiltPackages();
    const tasks = checkTasks();

    console.log('📋 Summary:');
    console.log(`   Node.js Processes: ${processes}`);
    console.log(`   Applications: ${apps}`);
    console.log(`   Packages: ${packages}`);
    console.log(`   Built Packages: ${built}/4 core packages`);
    console.log(`   VS Code Tasks: ${tasks}`);

    const overallHealth = (processes > 0 ? 25 : 0) +
        (apps > 0 ? 25 : 0) +
        (packages > 0 ? 25 : 0) +
        (built >= 3 ? 25 : 0);

    console.log(`\n🏥 Overall Health: ${overallHealth}% ${overallHealth >= 75 ? '✅' : overallHealth >= 50 ? '⚠️' : '❌'}`);

    if (overallHealth < 75) {
        console.log('\n💡 Recommendations:');
        if (processes === 0) console.log('   - Start development services');
        if (built < 3) console.log('   - Build core packages (sdk, core, cli)');
        if (apps === 0) console.log('   - Check apps directory structure');
    }
}

main().catch(console.error);
