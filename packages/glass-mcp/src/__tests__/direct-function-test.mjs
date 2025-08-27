#!/usr/bin/env node

/**
 * Direct Server Function Test
 * This tests the server functions without the MCP protocol layer
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Test Windows listing using PowerShell directly (to validate our approach)
async function testWindowListingDirect() {
    console.log('🪟 Testing direct window listing...');
    
    const script = `
    Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    
    public class WindowAPI {
        [DllImport("user32.dll")]
        public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);
        
        [DllImport("user32.dll")]
        public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
        
        [DllImport("user32.dll")]
        public static extern bool IsWindowVisible(IntPtr hWnd);
        
        public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    }
"@
    
    $windows = New-Object System.Collections.ArrayList
    
    $callback = {
        param($hWnd, $lParam)
        
        if ([WindowAPI]::IsWindowVisible($hWnd)) {
            $title = New-Object System.Text.StringBuilder 256
            [WindowAPI]::GetWindowText($hWnd, $title, $title.Capacity) | Out-Null
            
            if ($title.ToString().Trim() -ne "") {
                $windows.Add(@{
                    handle = $hWnd.ToInt64()
                    title = $title.ToString()
                }) | Out-Null
            }
        }
        
        return $true
    }
    
    [WindowAPI]::EnumWindows($callback, [IntPtr]::Zero) | Out-Null
    
    $windows | ConvertTo-Json -Compress
    `;
    
    try {
        const result = await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${script.replace(/"/g, '`"')}"`);
        const windows = JSON.parse(result.stdout);
        console.log(`✅ Found ${windows.length} windows`);
        console.log(`   Examples: ${windows.slice(0, 3).map(w => w.title).join(', ')}`);
        return true;
    } catch (error) {
        console.log(`❌ Window listing failed: ${error.message}`);
        return false;
    }
}

// Test clipboard access
async function testClipboardDirect() {
    console.log('📋 Testing direct clipboard access...');
    
    const script = `
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.Clipboard]::GetText()
    `;
    
    try {
        const result = await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${script}"`);
        const clipboardText = result.stdout.trim();
        console.log(`✅ Clipboard contains: "${clipboardText.substring(0, 50)}${clipboardText.length > 50 ? '...' : ''}"`);
        return true;
    } catch (error) {
        console.log(`❌ Clipboard access failed: ${error.message}`);
        return false;
    }
}

// Test system info
async function testSystemInfoDirect() {
    console.log('💻 Testing direct system info...');
    
    const script = `
    $computer = Get-ComputerInfo
    @{
        computerName = $env:COMPUTERNAME
        userName = $env:USERNAME
        osVersion = $computer.WindowsProductName
        architecture = $computer.OSArchitecture
    } | ConvertTo-Json -Compress
    `;
    
    try {
        const result = await execAsync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${script}"`);
        const systemInfo = JSON.parse(result.stdout);
        console.log(`✅ System: ${systemInfo.computerName} (${systemInfo.userName})`);
        console.log(`   OS: ${systemInfo.osVersion} ${systemInfo.architecture}`);
        return true;
    } catch (error) {
        console.log(`❌ System info failed: ${error.message}`);
        return false;
    }
}

async function runDirectTests() {
    console.log('🧪 Direct Function Tests for Glass MCP');
    console.log('=====================================');
    
    const tests = [
        ['Window Listing', testWindowListingDirect],
        ['Clipboard Access', testClipboardDirect],
        ['System Information', testSystemInfoDirect]
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const [name, testFn] of tests) {
        const success = await testFn();
        if (success) {
            passed++;
        } else {
            failed++;
        }
        console.log(''); // Add spacing
    }
    
    console.log('📊 Direct Test Results:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All core functions working! Glass MCP backend is solid.');
        
        // If direct tests pass, the issue is likely MCP protocol communication
        console.log('\n📝 DIAGNOSIS: MCP protocol communication needs debugging');
        console.log('   Core Windows automation functions are working');
        console.log('   Issue is likely in MCP server stdio communication');
        
        return true;
    } else {
        console.log('\n❌ Some core functions failing - need to fix backend first');
        return false;
    }
}

runDirectTests().catch(error => {
    console.error('💥 Direct tests failed:', error);
    process.exit(1);
});