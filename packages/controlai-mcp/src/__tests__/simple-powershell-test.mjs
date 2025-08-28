#!/usr/bin/env node

/**
 * Simple PowerShell Test
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testBasicPowerShell() {
    console.log('🧪 Testing basic PowerShell execution...');

    try {
        const result = await execAsync('powershell -NoProfile -Command "Write-Output \'Hello from PowerShell\'"');
        console.log('✅ PowerShell works:', result.stdout.trim());
    } catch (error) {
        console.log('❌ PowerShell failed:', error.message);
        return false;
    }

    return true;
}

async function testSimpleWindowList() {
    console.log('🪟 Testing simple window enumeration...');

    const script = 'Get-Process | Where-Object { $_.MainWindowTitle -ne "" } | Select-Object ProcessName, MainWindowTitle | ConvertTo-Json';

    try {
        const result = await execAsync(`powershell -NoProfile -Command "${script}"`);
        console.log('✅ Window processes:', result.stdout.length, 'chars');

        if (result.stdout.trim()) {
            try {
                const windows = JSON.parse(result.stdout);
                console.log(`   Found ${Array.isArray(windows) ? windows.length : 1} window(s)`);
                return true;
            } catch (parseError) {
                console.log('❌ JSON parse error:', parseError.message);
                console.log('Raw output:', result.stdout);
                return false;
            }
        } else {
            console.log('❌ No output from PowerShell');
            return false;
        }
    } catch (error) {
        console.log('❌ PowerShell execution failed:', error.message);
        return false;
    }
}

async function testSystemInfo() {
    console.log('💻 Testing simple system info...');

    const script = '@{ computer = $env:COMPUTERNAME; user = $env:USERNAME } | ConvertTo-Json';

    try {
        const result = await execAsync(`powershell -NoProfile -Command "${script}"`);
        console.log('✅ System info raw:', result.stdout.trim());

        if (result.stdout.trim()) {
            try {
                const info = JSON.parse(result.stdout);
                console.log(`   Computer: ${info.computer}, User: ${info.user}`);
                return true;
            } catch (parseError) {
                console.log('❌ JSON parse error:', parseError.message);
                return false;
            }
        } else {
            console.log('❌ No output from PowerShell');
            return false;
        }
    } catch (error) {
        console.log('❌ PowerShell execution failed:', error.message);
        return false;
    }
}

async function runSimpleTests() {
    console.log('🔧 Simple PowerShell Tests');
    console.log('==========================');

    const tests = [
        testBasicPowerShell,
        testSimpleWindowList,
        testSystemInfo
    ];

    let passed = 0;

    for (const testFn of tests) {
        const success = await testFn();
        if (success) passed++;
        console.log(''); // spacing
    }

    console.log(`📊 Results: ${passed}/${tests.length} tests passed`);

    if (passed === tests.length) {
        console.log('✅ Basic PowerShell functionality confirmed!');
        console.log('🔍 Issue is likely in complex PowerShell scripts or MCP communication');
    } else {
        console.log('❌ Basic PowerShell issues need to be resolved');
    }
}

runSimpleTests().catch(error => {
    console.error('💥 Simple tests failed:', error);
});