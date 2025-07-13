#!/usr/bin/env pwsh
# 🧹 Enterprise Port Cleanup Script for Codai Ecosystem
# Eliminates zombie processes on ports 4030-4056 before daemon startup

param(
    [switch]$Force = $false,
    [switch]$Verbose = $false
)

Write-Host "🧹 Codai Enterprise Port Cleanup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Define port ranges for Codai ecosystem
$NextJSPorts = 4030..4040    # Next.js applications
$ExpressPorts = 4041..4055   # Express.js microservices
$AdditionalPorts = @(4056)   # Mobile app and other services

$AllPorts = $NextJSPorts + $ExpressPorts + $AdditionalPorts

$CleanedCount = 0
$TotalProcesses = 0

Write-Host "🔍 Scanning ports 4030-4056 for zombie processes..." -ForegroundColor Yellow

foreach ($Port in $AllPorts) {
    try {
        # Get process using this port
        $NetstatOutput = netstat -ano | Select-String ":$Port\s"
        
        if ($NetstatOutput) {
            foreach ($Line in $NetstatOutput) {
                if ($Line -match "LISTENING.*?(\d+)$") {
                    $PID = $Matches[1]
                    $TotalProcesses++
                    
                    # Get process details
                    $Process = Get-Process -Id $PID -ErrorAction SilentlyContinue
                    
                    if ($Process) {
                        $ProcessName = $Process.ProcessName
                        $ProcessPath = try { $Process.Path } catch { "Unknown" }
                        
                        Write-Host "🎯 Found: Port $Port -> PID $PID ($ProcessName)" -ForegroundColor Red
                        
                        if ($Verbose) {
                            Write-Host "   Path: $ProcessPath" -ForegroundColor Gray
                            Write-Host "   CPU: $($Process.CPU)" -ForegroundColor Gray
                            Write-Host "   Memory: $([math]::Round($Process.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
                        }
                        
                        # Kill the process
                        if ($Force) {
                            try {
                                Stop-Process -Id $PID -Force
                                Write-Host "✅ Killed PID $PID on port $Port" -ForegroundColor Green
                                $CleanedCount++
                                Start-Sleep -Milliseconds 100
                            } catch {
                                Write-Host "❌ Failed to kill PID $PID: $($_.Exception.Message)" -ForegroundColor Red
                            }
                        } else {
                            try {
                                Stop-Process -Id $PID
                                Write-Host "✅ Terminated PID $PID on port $Port" -ForegroundColor Green
                                $CleanedCount++
                                Start-Sleep -Milliseconds 100
                            } catch {
                                Write-Host "⚠️  Could not gracefully terminate PID $PID, use -Force if needed" -ForegroundColor Yellow
                            }
                        }
                    }
                }
            }
        }
    } catch {
        Write-Host "❌ Error checking port $Port: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "" -ForegroundColor White
Write-Host "📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "  Total processes found: $TotalProcesses" -ForegroundColor White
Write-Host "  Successfully cleaned: $CleanedCount" -ForegroundColor Green
Write-Host "  Failed cleanups: $($TotalProcesses - $CleanedCount)" -ForegroundColor Red

if ($CleanedCount -gt 0) {
    Write-Host "⏳ Waiting 2 seconds for ports to fully release..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    
    # Verify ports are free
    Write-Host "🔍 Verifying port cleanup..." -ForegroundColor Yellow
    $StillOccupied = @()
    
    foreach ($Port in $AllPorts) {
        $Check = netstat -ano | Select-String ":$Port\s.*LISTENING"
        if ($Check) {
            $StillOccupied += $Port
        }
    }
    
    if ($StillOccupied.Count -eq 0) {
        Write-Host "✅ All ports successfully cleaned! Ecosystem ready for startup." -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Some ports still occupied: $($StillOccupied -join ', ')" -ForegroundColor Yellow
        Write-Host "   Consider running with -Force flag for stubborn processes" -ForegroundColor Yellow
    }
} else {
    if ($TotalProcesses -eq 0) {
        Write-Host "✅ No zombie processes found. Ports are clean!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No processes were cleaned. Try running with -Force if needed." -ForegroundColor Yellow
    }
}

Write-Host "" -ForegroundColor White
Write-Host "🚀 Ready for daemon startup!" -ForegroundColor Cyan
