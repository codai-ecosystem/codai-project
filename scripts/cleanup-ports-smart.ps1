# Smart PowerShell Port Cleanup Utility
# Cleans up ports while preserving specified processes/ports
param(
    [int[]]$Ports = @(4950),  # Only cleanup MemorAI MCP port
    [int[]]$ExcludePorts = @(4180),  # Preserve CBD Database port
    [string[]]$ExcludeProcessNames = @("tsx", "node"),  # Be selective about which Node processes to kill
    [switch]$Verbose = $false,
    [switch]$Force = $false
)

Write-Host "🧠 Smart CODAI Port Cleanup Utility" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

function Kill-ProcessOnPort {
    param(
        [int]$Port,
        [bool]$ShouldExclude = $false
    )
    
    if ($ShouldExclude) {
        if ($Verbose) {
            Write-Host "⏭️ Skipping excluded port $Port" -ForegroundColor Yellow
        }
        return
    }
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                
                if ($process) {
                    $processName = $process.ProcessName
                    
                    # Check if we should exclude this process
                    $shouldExcludeProcess = $false
                    if (-not $Force) {
                        foreach ($excludeName in $ExcludeProcessNames) {
                            if ($processName -like "*$excludeName*") {
                                # Additional check: only exclude if it's NOT on the target port
                                if ($Port -notin $Ports) {
                                    $shouldExcludeProcess = $true
                                    break
                                }
                            }
                        }
                    }
                    
                    if ($shouldExcludeProcess) {
                        if ($Verbose) {
                            Write-Host "⏭️ Preserving $processName (PID: $processId) on port $Port" -ForegroundColor Yellow
                        }
                    } else {
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

# Clean up specified ports
Write-Host "🎯 Target ports: $($Ports -join ', ')" -ForegroundColor Cyan
if ($ExcludePorts.Count -gt 0) {
    Write-Host "🛡️ Protected ports: $($ExcludePorts -join ', ')" -ForegroundColor Cyan
}

foreach ($port in $Ports) {
    $shouldExclude = $port -in $ExcludePorts
    Kill-ProcessOnPort -Port $port -ShouldExclude $shouldExclude
}

# Verify cleanup
Write-Host "`n🔍 Verification:" -ForegroundColor Cyan
$stillRunning = @()

foreach ($port in $Ports) {
    if ($port -notin $ExcludePorts) {
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
}

if ($stillRunning.Count -eq 0) {
    Write-Host "🎉 Target ports cleaned successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some ports still have active connections: $($stillRunning -join ', ')" -ForegroundColor Yellow
}

Write-Host "====================================" -ForegroundColor Cyan
