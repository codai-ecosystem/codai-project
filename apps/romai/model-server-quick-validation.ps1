#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Model Server Quick Validation
# Fast check of model server availability and core functionality
# ==============================================================================

param(
    [string]$ServerUrl = "http://localhost:6101",
    [int]$Timeout = 10
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

Write-ColorOutput "🧠 RomAI AGI Model Server Quick Validation" "Cyan"
Write-ColorOutput "Server: $ServerUrl" "Yellow"
Write-ColorOutput "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Yellow"
Write-Host ""

$testsPassed = 0
$totalTests = 6

# Test 1: Server accessibility
Write-Host "1. Server Accessibility..." -NoNewline
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connectTask = $tcpClient.ConnectAsync("localhost", 6101)
    $connected = $connectTask.Wait(3000)
    $tcpClient.Close()
    
    if ($connected) {
        Write-ColorOutput " ✅ Server listening on port 6101" "Green"
        $testsPassed++
    }
    else {
        Write-ColorOutput " ❌ Server not responding on port 6101" "Red"
    }
}
catch {
    Write-ColorOutput " ❌ Connection failed: $($_.Exception.Message)" "Red"
}

# Test 2: Health endpoint
Write-Host "2. Health Endpoint..." -NoNewline
try {
    $health = Invoke-RestMethod -Uri "$ServerUrl/health" -Method Get -TimeoutSec $Timeout
    if ($health) {
        Write-ColorOutput " ✅ Health endpoint operational" "Green"
        $testsPassed++
    }
    else {
        Write-ColorOutput " ❌ Health endpoint returned empty response" "Red"
    }
}
catch {
    Write-ColorOutput " ❌ Health endpoint failed: $($_.Exception.Message)" "Red"
}

# Test 3: Model status
Write-Host "3. Model Status..." -NoNewline
try {
    $models = Invoke-RestMethod -Uri "$ServerUrl/models/status" -Method Get -TimeoutSec $Timeout
    if ($models) {
        Write-ColorOutput " ✅ Model status endpoint working" "Green"
        $testsPassed++
    }
    else {
        Write-ColorOutput " ❌ Model status endpoint failed" "Red"
    }
}
catch {
    Write-ColorOutput " ❌ Model status failed: $($_.Exception.Message)" "Red"
}

# Test 4: Training metrics
Write-Host "4. Training Metrics..." -NoNewline
try {
    $metrics = Invoke-RestMethod -Uri "$ServerUrl/training/metrics" -Method Get -TimeoutSec $Timeout
    if ($metrics) {
        Write-ColorOutput " ✅ Training metrics available" "Green"
        $testsPassed++
    }
    else {
        Write-ColorOutput " ❌ Training metrics unavailable" "Red"
    }
}
catch {
    Write-ColorOutput " ❌ Training metrics failed: $($_.Exception.Message)" "Red"
}

# Test 5: Romanian language processing (basic)
Write-Host "5. Romanian Language..." -NoNewline
try {
    $payload = @{
        text = "Salut! Cum te numești?"
    } | ConvertTo-Json
    
    $romanian = Invoke-RestMethod -Uri "$ServerUrl/romanian/analyze_text" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec $Timeout
    if ($romanian) {
        Write-ColorOutput " ✅ Romanian processing functional" "Green"
        $testsPassed++
    }
    else {
        Write-ColorOutput " ❌ Romanian processing failed" "Red"
    }
}
catch {
    Write-ColorOutput " ❌ Romanian processing error: $($_.Exception.Message)" "Red"
}

# Test 6: General analysis endpoint
Write-Host "6. General Analysis..." -NoNewline
try {
    $payload = @{
        text = "This is a test of the general analysis capabilities."
    } | ConvertTo-Json
    
    $analysis = Invoke-RestMethod -Uri "$ServerUrl/reasoning" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec $Timeout
    if ($analysis) {
        Write-ColorOutput " ✅ General analysis working" "Green"
        $testsPassed++
    }
    else {
        Write-ColorOutput " ❌ General analysis failed" "Red"
    }
}
catch {
    Write-ColorOutput " ❌ General analysis error: $($_.Exception.Message)" "Red"
}

# Summary
Write-Host ""
Write-ColorOutput "===============================================" "Cyan"
$successRate = ($testsPassed / $totalTests) * 100
Write-ColorOutput "📊 SUMMARY:" "Cyan"
Write-ColorOutput "  Tests Passed: $testsPassed/$totalTests" $(if ($testsPassed -eq $totalTests) { "Green" } else { "Yellow" })
Write-ColorOutput "  Success Rate: $([math]::Round($successRate, 1))%" $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

$overallStatus = if ($successRate -ge 80) { "READY FOR VALIDATION" } elseif ($successRate -ge 60) { "PARTIALLY READY" } else { "NOT READY" }
$statusColor = if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" }

Write-ColorOutput "`n🎯 STATUS: $overallStatus" $statusColor

if ($successRate -ge 60) {
    Write-ColorOutput "`n✅ Model server is operational. Run 'model-server-validation.ps1' for comprehensive testing." "Green"
}
else {
    Write-ColorOutput "`n❌ Model server has critical issues. Check server logs and configuration." "Red"
}

# Return appropriate exit code
exit $(if ($successRate -ge 60) { 0 } else { 1 })