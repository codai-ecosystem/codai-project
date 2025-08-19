#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Stops all Firebase emulator processes and cleans up Java processes.

.DESCRIPTION
    This script stops all running Firebase emulator processes by:
    1. Killing any running Firebase CLI processes
    2. Stopping Java processes that might be running Firebase emulators
    3. Freeing up ports used by emulators

.EXAMPLE
    .\stop-emulators.ps1
#>

Write-Host "🔥 Stopping Firebase Emulators..." -ForegroundColor Yellow

# Function to kill processes by name
function Stop-ProcessByName {
    param([string]$ProcessName)
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "   Stopping $($processes.Count) $ProcessName process(es)..." -ForegroundColor Cyan
        $processes | Stop-Process -Force -ErrorAction SilentlyContinue
        return $true
    }
    return $false
}

# Function to kill processes using specific ports
function Stop-ProcessByPort {
    param([int[]]$Ports)
    
    foreach ($port in $Ports) {
        try {
            $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($connection) {
                $processId = $connection.OwningProcess
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "   Stopping process using port $port (PID: $processId, Name: $($process.ProcessName))..." -ForegroundColor Cyan
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                }
            }
        }
        catch {
            # Port not in use, continue
        }
    }
}

# Stop Firebase CLI processes
$stopped = $false
$stopped = Stop-ProcessByName "firebase" -or $stopped
$stopped = Stop-ProcessByName "node" -or $stopped

# Stop Java processes (Firebase emulators often run on Java)
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*firestore*" -or 
    $_.CommandLine -like "*firebase*" -or
    $_.CommandLine -like "*emulator*"
}

if ($javaProcesses) {
    Write-Host "   Stopping $($javaProcesses.Count) Firebase Java process(es)..." -ForegroundColor Cyan
    $javaProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    $stopped = $true
}

# Stop processes using Firebase emulator ports
$emulatorPorts = @(9099, 8080, 9199, 9000, 5005, 4002, 4402, 5004)
Stop-ProcessByPort -Ports $emulatorPorts

# Wait a moment for processes to clean up
if ($stopped) {
    Write-Host "   Waiting for cleanup..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

Write-Host "✅ Firebase Emulator cleanup complete!" -ForegroundColor Green
