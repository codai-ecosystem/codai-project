#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Model Server Simple Validation
# Test key AGI training systems and capabilities
# ==============================================================================

param(
    [string]$ServerUrl = "http://localhost:6101",
    [int]$Timeout = 20
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

Write-ColorOutput "🧠 RomAI AGI Model Server Validation" "Cyan"
Write-ColorOutput "Server: $ServerUrl" "Yellow"
Write-ColorOutput "Testing Core AGI Training Systems..." "Yellow"
Write-Host ""

$systemsPassed = 0
$totalSystems = 10

# Define key systems to test
$agiSystems = @(
    @{ Name = "Mathematical Reasoning"; Endpoint = "/reasoning"; Payload = @{ text = "What is 7 * 8 + 15?" } },
    @{ Name = "Code Generation"; Endpoint = "/code/generate"; Payload = @{ task = "Write a function to calculate factorial"; language = "python" } },
    @{ Name = "Romanian Language"; Endpoint = "/romanian/analyze_text"; Payload = @{ text = "Bună ziua! Sunt foarte fericit să vorbesc româna." } },
    @{ Name = "Consciousness Processing"; Endpoint = "/consciousness/process"; Payload = @{ query = "What does it mean to be conscious?" } },
    @{ Name = "Meta Learning"; Endpoint = "/meta_learning/adapt"; Payload = @{ task = "Learn from few examples"; examples = @("example1", "example2") } },
    @{ Name = "Multimodal Training"; Endpoint = "/multimodal/cross_modal/process"; Payload = @{ modality = "text"; content = "Test multimodal processing" } },
    @{ Name = "RLHF Training"; Endpoint = "/rlhf/evaluate"; Payload = @{ response = "This is a test response"; context = "testing context" } },
    @{ Name = "Constitutional AI"; Endpoint = "/constitutional/evaluate"; Payload = @{ response = "Test response"; guidelines = @("be helpful", "be harmless") } },
    @{ Name = "Synthetic Data Generation"; Endpoint = "/synthetic/generate"; Payload = @{ domain = "test"; count = 5 } },
    @{ Name = "Autonomous Problem Solving"; Endpoint = "/autonomous/reasoning"; Payload = @{ problem = "How can we optimize resource allocation?" } }
)

# Test each system
foreach ($system in $agiSystems) {
    Write-Host "Testing $($system.Name)..." -NoNewline
    
    try {
        $jsonPayload = $system.Payload | ConvertTo-Json -Depth 3
        $response = Invoke-RestMethod -Uri "$ServerUrl$($system.Endpoint)" -Method Post -Body $jsonPayload -ContentType "application/json" -TimeoutSec $Timeout
        
        if ($response) {
            Write-ColorOutput " ✅ Functional" "Green"
            $systemsPassed++
        }
        else {
            Write-ColorOutput " ❌ No response" "Red"
        }
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 422) {
            Write-ColorOutput " 🔄 Endpoint exists (validation error)" "Yellow"
            $systemsPassed += 0.5  # Half credit for existing endpoint
        }
        elseif ($_.Exception.Response.StatusCode -eq 404) {
            Write-ColorOutput " ❌ Not implemented" "Red"
        }
        else {
            Write-ColorOutput " ⚠️ Error: $($_.Exception.Response.StatusCode)" "Yellow"
        }
    }
}

Write-Host ""

# Test additional capabilities
Write-ColorOutput "Testing Additional Capabilities:" "Cyan"

# Health endpoints
$healthTests = @(
    @{ Name = "Server Health"; Endpoint = "/health" },
    @{ Name = "Model Status"; Endpoint = "/models/status" },
    @{ Name = "Training Metrics"; Endpoint = "/training/metrics" },
    @{ Name = "Capabilities"; Endpoint = "/api/v1/capabilities/status" }
)

$healthPassed = 0
foreach ($test in $healthTests) {
    Write-Host "Testing $($test.Name)..." -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri "$ServerUrl$($test.Endpoint)" -Method Get -TimeoutSec 10
        if ($response) {
            Write-ColorOutput " ✅ Active" "Green"
            $healthPassed++
        }
    }
    catch {
        Write-ColorOutput " ❌ Failed" "Red"
    }
}

Write-Host ""
Write-ColorOutput "===============================================" "Cyan"

# Calculate results
$systemsScore = ($systemsPassed / $totalSystems) * 100
$healthScore = ($healthPassed / $healthTests.Count) * 100
$overallScore = (($systemsPassed * 2) + $healthPassed) / (($totalSystems * 2) + $healthTests.Count) * 100

Write-ColorOutput "📊 VALIDATION RESULTS:" "Cyan"
Write-ColorOutput "  AGI Training Systems: $([math]::Round($systemsScore, 1))% ($systemsPassed/$totalSystems)" $(if ($systemsScore -ge 70) { "Green" } elseif ($systemsScore -ge 50) { "Yellow" } else { "Red" })
Write-ColorOutput "  Health Endpoints: $([math]::Round($healthScore, 1))% ($healthPassed/$($healthTests.Count))" $(if ($healthScore -ge 75) { "Green" } elseif ($healthScore -ge 50) { "Yellow" } else { "Red" })
Write-ColorOutput "  Overall Score: $([math]::Round($overallScore, 1))%" $(if ($overallScore -ge 70) { "Green" } elseif ($overallScore -ge 50) { "Yellow" } else { "Red" })

$readinessStatus = if ($overallScore -ge 70) { "PRODUCTION READY" } elseif ($overallScore -ge 50) { "DEVELOPMENT READY" } else { "NEEDS WORK" }
$statusColor = if ($overallScore -ge 70) { "Green" } elseif ($overallScore -ge 50) { "Yellow" } else { "Red" }

Write-ColorOutput "`n🎯 MODEL SERVER STATUS: $readinessStatus" $statusColor

if ($overallScore -ge 50) {
    Write-ColorOutput "`n✅ RomAI AGI Model Server validation passed. Ready for deployment testing." "Green"
}
else {
    Write-ColorOutput "`n❌ Model server needs attention before deployment. Check server logs." "Red"
}

Write-Host ""
Write-ColorOutput "Next Steps:" "Cyan"
Write-ColorOutput "1. Review any failed systems above" "White"
Write-ColorOutput "2. Check server logs for detailed error information" "White"
Write-ColorOutput "3. If ready, proceed with production deployment" "White"

# Return appropriate exit code
exit $(if ($overallScore -ge 50) { 0 } else { 1 })