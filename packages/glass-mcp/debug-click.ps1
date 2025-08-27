Write-Host "Starting PowerShell mouse click debug..." -ForegroundColor Green

Add-Type -AssemblyName System.Windows.Forms
Write-Host "System.Windows.Forms loaded" -ForegroundColor Yellow

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
        public const int MOUSEEVENTF_RIGHTDOWN = 0x08;
        public const int MOUSEEVENTF_RIGHTUP = 0x10;
        public const int MOUSEEVENTF_MIDDLEDOWN = 0x20;
        public const int MOUSEEVENTF_MIDDLEUP = 0x40;
    }' -ErrorAction SilentlyContinue
    Write-Host "MouseAPI class loaded successfully" -ForegroundColor Yellow
} catch {
    Write-Host "Error loading MouseAPI: $_" -ForegroundColor Red
    exit 1
}

# Test coordinates
$x = 100
$y = 100

Write-Host "Testing mouse click at ($x, $y)" -ForegroundColor Cyan

try {
    # Set cursor position
    Write-Host "Setting cursor position..." -ForegroundColor White
    $result = [MouseAPI]::SetCursorPos($x, $y)
    Write-Host "SetCursorPos result: $result" -ForegroundColor White
    
    Start-Sleep -Milliseconds 100
    
    # Perform left click
    Write-Host "Performing left click..." -ForegroundColor White
    [MouseAPI]::mouse_event([MouseAPI]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 50
    [MouseAPI]::mouse_event([MouseAPI]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    
    Write-Host "Click executed successfully!" -ForegroundColor Green
    Write-Output "SUCCESS|Click performed at ($x, $y)"
} catch {
    Write-Host "Error during click: $_" -ForegroundColor Red
    Write-Output "ERROR|$($_.Exception.Message)"
}