import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

async function testDirectClick() {
    const script = `
    Write-Host "Starting click test..." -ForegroundColor Green
    
    Add-Type -AssemblyName System.Windows.Forms
    Write-Host "Windows Forms loaded" -ForegroundColor Yellow
    
    try {
        Add-Type -TypeDefinition '
        using System;
        using System.Runtime.InteropServices;
        public class MouseAPI {
            [DllImport("user32.dll")]
            public static extern bool SetCursorPos(int x, int y);
            
            [DllImport("user32.dll")]
            public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);
            
            public const int MOUSEEVENTF_LEFTDOWN = 0x02;
            public const int MOUSEEVENTF_LEFTUP = 0x04;
        }' -ErrorAction SilentlyContinue
        Write-Host "MouseAPI loaded" -ForegroundColor Yellow
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Output "ERROR|$($_.Exception.Message)"
        exit 1
    }
    
    try {
        Write-Host "Setting cursor position..." -ForegroundColor Cyan
        [MouseAPI]::SetCursorPos(100, 100)
        Start-Sleep -Milliseconds 50
        
        Write-Host "Performing click..." -ForegroundColor Cyan
        [MouseAPI]::mouse_event([MouseAPI]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
        Start-Sleep -Milliseconds 10
        [MouseAPI]::mouse_event([MouseAPI]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
        
        Write-Host "Click completed successfully!" -ForegroundColor Green
        Write-Output "SUCCESS|Click performed at (100, 100)"
    } catch {
        Write-Host "Click failed: $_" -ForegroundColor Red
        Write-Output "ERROR|$($_.Exception.Message)"
    }
    `;

    const tempFile = join(tmpdir(), `test-click-${Date.now()}.ps1`);
    writeFileSync(tempFile, script, 'utf8');

    try {
        console.log('Testing with pwsh...');
        const result = await execAsync(`pwsh -NoProfile -ExecutionPolicy Bypass -File "${tempFile}"`);
        console.log('STDOUT:', result.stdout);
        console.log('STDERR:', result.stderr);
        
        // Parse the output
        const output = result.stdout.trim();
        const lines = output.split('\n');
        const resultLine = lines.find(line => line.startsWith('SUCCESS|') || line.startsWith('ERROR|'));
        console.log('Result line:', resultLine);
        
    } catch (error) {
        console.error('Execution failed:', error.message);
        console.error('Full error:', error);
    } finally {
        try {
            unlinkSync(tempFile);
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
    }
}

testDirectClick();