# PowerShell Port Cleanup Utility
# Reliably cleans up processes on specified ports
param(
    [int[]]$Ports = @(4180, 4200, 4001, 4004, 4005, 4006, 4007, 4008, 3000),
    [switch]$Verbose = $false
)

Write-Host "🧹 CODAI Port Cleanup Utility" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

function Kill-ProcessOnPort {
    param([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                
                if ($process) {
                    $processName = $process.ProcessName
                    try {
                        Stop-Process -Id $processId -Force -ErrorAction Stop
                        Write-Host "✅ Killed $processName (PID: $processId) on port $Port" -ForegroundColor Green
                    }
                    catch {
                        Write-Host "⚠️ Failed to kill $processName (PID: $processId) on port $Port" -ForegroundColor Yellow
                    }
                }
            }
        }
        else {
            if ($Verbose) {
                Write-Host "ℹ️ Port $Port is already free" -ForegroundColor Gray
            }
        }
    }
    catch {
        Write-Host "❌ Error checking port $Port`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Clean up each port
foreach ($port in $Ports) {
    Kill-ProcessOnPort -Port $port
}

# Verify cleanup
Write-Host "`n🔍 Verification:" -ForegroundColor Cyan
$stillRunning = @()

foreach ($port in $Ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $stillRunning += $port
        Write-Host "❌ Port $port still has active connections" -ForegroundColor Red
    }
    else {
        if ($Verbose) {
            Write-Host "✅ Port $port is clean" -ForegroundColor Green
        }
    }
}

if ($stillRunning.Count -eq 0) {
    Write-Host "🎉 All ports cleaned successfully!" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Some ports still have active connections: $($stillRunning -join ', ')" -ForegroundColor Yellow
}

Write-Host "================================" -ForegroundColor Cyan
