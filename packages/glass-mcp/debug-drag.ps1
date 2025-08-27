Write-Host "Testing PowerShell drag functionality..." -ForegroundColor Green

Add-Type -TypeDefinition '
using System;
using System.Runtime.InteropServices;
public class Mouse {
    [DllImport("user32.dll")]
    public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);
    
    public const int MOUSEEVENTF_LEFTDOWN = 0x02;
    public const int MOUSEEVENTF_LEFTUP = 0x04;
    public const int MOUSEEVENTF_MOVE = 0x01;
}' -ErrorAction SilentlyContinue

$fromX = -1500
$fromY = 600
$toX = -1300
$toY = 700
$duration = 1000

Write-Host "Testing drag from ($fromX, $fromY) to ($toX, $toY)" -ForegroundColor Cyan

try {
    # Move to start position
    Write-Host "Moving to start position..." -ForegroundColor Yellow
    [Mouse]::SetCursorPos($fromX, $fromY)
    Start-Sleep -Milliseconds 100
    
    # Press mouse button down
    Write-Host "Pressing mouse button down..." -ForegroundColor Yellow
    [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    Start-Sleep -Milliseconds 50
    
    # Calculate intermediate points for smooth drag
    $steps = [Math]::Max(10, [Math]::Min(50, $duration / 20))
    $stepX = ($toX - $fromX) / $steps
    $stepY = ($toY - $fromY) / $steps
    $stepDelay = $duration / $steps
    
    Write-Host "Dragging with $steps steps..." -ForegroundColor Yellow
    
    # Perform drag
    for ($i = 1; $i -le $steps; $i++) {
        $currentX = $fromX + ($stepX * $i)
        $currentY = $fromY + ($stepY * $i)
        [Mouse]::SetCursorPos([Math]::Round($currentX), [Math]::Round($currentY))
        Start-Sleep -Milliseconds ([Math]::Max(10, $stepDelay))
    }
    
    # Release mouse button
    Write-Host "Releasing mouse button..." -ForegroundColor Yellow
    [Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    
    Write-Host "Drag completed successfully!" -ForegroundColor Green
    Write-Output "SUCCESS|Drag and drop completed from ($fromX, $fromY) to ($toX, $toY)"
}
catch {
    Write-Host "Drag failed: $_" -ForegroundColor Red
    Write-Output "ERROR|$($_.Exception.Message)"
}