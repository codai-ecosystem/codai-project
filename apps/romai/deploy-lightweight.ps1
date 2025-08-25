#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Production Deployment (Lightweight)
# Deploy core services without Docker orchestration
# ==============================================================================

param(
    [ValidateSet("start", "stop", "status", "health")]
    [string]$Action = "start",
    [string]$LogLevel = "INFO"
)

$ErrorActionPreference = "Continue"

function Write-ColorOutput {
    param($Message, $Color = "White")
    if ($Color -eq "Green") { Write-Host $Message -ForegroundColor Green }
    elseif ($Color -eq "Red") { Write-Host $Message -ForegroundColor Red }
    elseif ($Color -eq "Yellow") { Write-Host $Message -ForegroundColor Yellow }
    elseif ($Color -eq "Cyan") { Write-Host $Message -ForegroundColor Cyan }
    else { Write-Host $Message }
}

Write-ColorOutput "🚀 RomAI AGI Production Deployment (Lightweight)" "Cyan"
Write-ColorOutput "Action: $Action | Log Level: $LogLevel" "Yellow"
Write-ColorOutput "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Yellow"
Write-Host ""

switch ($Action) {
    "start" {
        Write-ColorOutput "🔄 Starting RomAI AGI Services..." "Cyan"
        
        # Check if model server is already running
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:6101/health" -Method Get -TimeoutSec 5
            Write-ColorOutput "✅ AGI Model Server already running" "Green"
        }
        catch {
            Write-ColorOutput "🔄 Starting AGI Model Server..." "Yellow"
            
            # Start the model server in background
            $startModelServer = @{
                FilePath = "python"
                ArgumentList = @(
                    "model_server.py",
                    "--port", "6101",
                    "--host", "0.0.0.0",
                    "--dev"
                )
                WorkingDirectory = "e:\GitHub\codai-project\apps\romai\src\ml\serving"
                NoNewWindow = $true
                PassThru = $true
            }
            
            try {
                $process = Start-Process @startModelServer
                Start-Sleep -Seconds 10  # Give it time to start
                
                # Check if it started successfully
                $health = Invoke-RestMethod -Uri "http://localhost:6101/health" -Method Get -TimeoutSec 5
                Write-ColorOutput "✅ AGI Model Server started successfully (PID: $($process.Id))" "Green"
            }
            catch {
                Write-ColorOutput "❌ Failed to start AGI Model Server: $($_.Exception.Message)" "Red"
            }
        }
        
        # Check other services that should be running
        $services = @(
            @{ Name = "CBD Database"; URL = "http://localhost:4180/health"; Port = 4180 },
            @{ Name = "MemorAI MCP"; URL = "http://localhost:4950/health"; Port = 4950 },
            @{ Name = "MemorAI App"; URL = "http://localhost:4006/api/health"; Port = 4006 }
        )
        
        foreach ($service in $services) {
            Write-Host "Checking $($service.Name)..." -NoNewline
            try {
                $health = Invoke-RestMethod -Uri $service.URL -Method Get -TimeoutSec 3
                Write-ColorOutput " ✅ Running" "Green"
            }
            catch {
                Write-ColorOutput " ❌ Not running" "Red"
                Write-ColorOutput "   💡 Start manually: Use VS Code tasks or run service directly" "Yellow"
            }
        }
    }
    
    "status" {
        Write-ColorOutput "📊 RomAI AGI Service Status" "Cyan"
        
        $services = @(
            @{ Name = "AGI Model Server"; URL = "http://localhost:6101/health" },
            @{ Name = "CBD Database"; URL = "http://localhost:4180/health" },
            @{ Name = "MemorAI MCP Server"; URL = "http://localhost:4950/health" },
            @{ Name = "MemorAI App"; URL = "http://localhost:4006/api/health" },
            @{ Name = "MemorAI GraphQL"; URL = "http://localhost:4500/health" }
        )
        
        $runningCount = 0
        foreach ($service in $services) {
            Write-Host "$($service.Name)..." -NoNewline
            try {
                $health = Invoke-RestMethod -Uri $service.URL -Method Get -TimeoutSec 3
                Write-ColorOutput " ✅ RUNNING" "Green"
                $runningCount++
            }
            catch {
                Write-ColorOutput " ❌ STOPPED" "Red"
            }
        }
        
        Write-Host ""
        $healthPercentage = ($runningCount / $services.Count) * 100
        Write-ColorOutput "📈 System Health: $([math]::Round($healthPercentage, 1))% ($runningCount/$($services.Count) services)" $(if ($healthPercentage -ge 80) { "Green" } elseif ($healthPercentage -ge 60) { "Yellow" } else { "Red" })
    }
    
    "health" {
        Write-ColorOutput "🏥 Comprehensive Health Check" "Cyan"
        
        # AGI Model Server detailed health
        Write-Host "AGI Model Server Health..." -NoNewline
        try {
            $agiHealth = Invoke-RestMethod -Uri "http://localhost:6101/health" -Method Get -TimeoutSec 5
            Write-ColorOutput " ✅ Healthy" "Green"
            
            # Test key endpoints
            $endpoints = @(
                @{ Name = "Mathematical Reasoning"; URL = "http://localhost:6101/reasoning" },
                @{ Name = "Consciousness Processing"; URL = "http://localhost:6101/consciousness/process" },
                @{ Name = "Autonomous Problem Solving"; URL = "http://localhost:6101/autonomous/reasoning" }
            )
            
            $functionalCount = 0
            foreach ($endpoint in $endpoints) {
                Write-Host "  Testing $($endpoint.Name)..." -NoNewline
                try {
                    $testPayload = @{ text = "test" } | ConvertTo-Json
                    $response = Invoke-RestMethod -Uri $endpoint.URL -Method Post -Body $testPayload -ContentType "application/json" -TimeoutSec 5
                    Write-ColorOutput " ✅" "Green"
                    $functionalCount++
                }
                catch {
                    if ($_.Exception.Response.StatusCode -eq 422) {
                        Write-ColorOutput " 🔄" "Yellow"  # Endpoint exists
                        $functionalCount += 0.5
                    }
                    else {
                        Write-ColorOutput " ❌" "Red"
                    }
                }
            }
            
            $functionalPercentage = ($functionalCount / $endpoints.Count) * 100
            Write-ColorOutput "  AGI Functionality: $([math]::Round($functionalPercentage, 1))%" $(if ($functionalPercentage -ge 70) { "Green" } elseif ($functionalPercentage -ge 50) { "Yellow" } else { "Red" })
        }
        catch {
            Write-ColorOutput " ❌ Unhealthy" "Red"
        }
    }
    
    "stop" {
        Write-ColorOutput "🛑 Stopping RomAI AGI Services..." "Cyan"
        
        # Find and stop Python processes running the model server
        $processes = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*model_server.py*" }
        
        if ($processes) {
            foreach ($process in $processes) {
                Write-ColorOutput "🛑 Stopping AGI Model Server (PID: $($process.Id))..." "Yellow"
                Stop-Process -Id $process.Id -Force
            }
            Write-ColorOutput "✅ AGI Model Server stopped" "Green"
        }
        else {
            Write-ColorOutput "ℹ️ AGI Model Server was not running" "Yellow"
        }
    }
}

Write-Host ""
Write-ColorOutput "✅ Deployment action '$Action' completed" "Green"

if ($Action -eq "start") {
    Write-ColorOutput "🌐 Available Services:" "Cyan"
    Write-ColorOutput "  • AGI Model Server: http://localhost:6101" "White"
    Write-ColorOutput "  • API Documentation: http://localhost:6101/docs" "White"
    Write-ColorOutput "  • Health Check: http://localhost:6101/health" "White"
    Write-Host ""
    Write-ColorOutput "📖 Next Steps:" "Cyan"
    Write-ColorOutput "  1. Run './deploy-lightweight.ps1 -Action health' for detailed health check" "White"
    Write-ColorOutput "  2. Run './model-server-validation-simple.ps1' for capability testing" "White"
    Write-ColorOutput "  3. Start other services using VS Code tasks if needed" "White"
}