#!/usr/bin/env pwsh
# Complete CODAI Ecosystem Integration Validation

Write-Host "🧪 CODAI Ecosystem Integration Validation" -ForegroundColor Cyan
Write-Host "Testing Hub-CBD Live Integration" -ForegroundColor Yellow

# Test Suite Configuration
$tests = @(
    @{
        Name = "Live Hub Health Check"
        URL = "https://hub.codai.ro"
        Method = "GET"
        Expected = "200"
        Description = "Verify live Hub is accessible"
    },
    @{
        Name = "Live CBD Health Check"
        URL = "https://cbd.memorai.ro/health"
        Method = "GET"
        Expected = "healthy"
        Description = "Verify live CBD service status"
    },
    @{
        Name = "CBD Authentication Endpoint"
        URL = "https://cbd.memorai.ro/api/security/auth/login"
        Method = "POST"
        Body = '{"email":"admin@codai.ro","password":"admin123"}'
        ContentType = "application/json"
        Expected = "token"
        Description = "Test admin authentication"
    },
    @{
        Name = "CBD Projects Endpoint"
        URL = "https://cbd.memorai.ro/api/ecosystem/projects"
        Method = "GET"
        Expected = "200"
        Description = "Verify projects endpoint availability"
    },
    @{
        Name = "Hub Service Status"
        URL = "https://hub.codai.ro/api/health"
        Method = "GET"
        Expected = "200"
        Description = "Check Hub API health"
    }
)

# Results tracking
$results = @()
$passedTests = 0
$totalTests = $tests.Count

Write-Host "`n🔬 Running Integration Tests..." -ForegroundColor Green
Write-Host "=" * 50

foreach ($test in $tests) {
    Write-Host "`n🧪 $($test.Name)" -ForegroundColor Blue
    Write-Host "   $($test.Description)" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $test.URL
            Method = $test.Method
            TimeoutSec = 15
            ErrorAction = 'Stop'
        }
        
        if ($test.ContentType) {
            $params.ContentType = $test.ContentType
        }
        
        if ($test.Body) {
            $params.Body = $test.Body
        }
        
        $response = Invoke-RestMethod @params
        
        # Check response based on expected value
        $success = $false
        if ($test.Expected -eq "200") {
            $success = $true  # If we got here, status was 200
        } elseif ($test.Expected -eq "healthy") {
            $success = $response.status -eq "healthy"
        } elseif ($test.Expected -eq "token") {
            $success = $response.token -ne $null
        } else {
            $success = $true  # Default to success if we got a response
        }
        
        if ($success) {
            Write-Host "   ✅ PASSED" -ForegroundColor Green
            $passedTests++
            $status = "PASSED"
        } else {
            Write-Host "   ❌ FAILED: Response doesn't match expected" -ForegroundColor Red
            $status = "FAILED"
        }
        
        # Log response details
        if ($response.status) {
            Write-Host "   📊 Status: $($response.status)" -ForegroundColor White
        }
        if ($response.version) {
            Write-Host "   📱 Version: $($response.version)" -ForegroundColor White
        }
        if ($response.token) {
            Write-Host "   🔑 Token: $($response.token.Substring(0,20))..." -ForegroundColor White
        }
        
    } catch {
        Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $status = "FAILED"
        
        # Special handling for expected 404s
        if ($_.Exception.Message -like "*404*" -and $test.Name -like "*Authentication*") {
            Write-Host "   📝 Note: This is expected - authentication not yet deployed" -ForegroundColor Yellow
        }
    }
    
    $results += @{
        Test = $test.Name
        Status = $status
        URL = $test.URL
        Description = $test.Description
    }
}

# Summary Report
Write-Host "`n" + "=" * 50
Write-Host "🏆 Integration Test Results" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "`n📊 Summary: $passedTests/$totalTests tests passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

foreach ($result in $results) {
    $color = if ($result.Status -eq "PASSED") { "Green" } else { "Red" }
    $icon = if ($result.Status -eq "PASSED") { "✅" } else { "❌" }
    Write-Host "$icon $($result.Test): $($result.Status)" -ForegroundColor $color
}

# Next Steps Based on Results
Write-Host "`n🚀 Next Steps:" -ForegroundColor Green

if ($results | Where-Object { $_.Test -eq "Live Hub Health Check" -and $_.Status -eq "PASSED" }) {
    Write-Host "✅ Hub is live and accessible at https://hub.codai.ro" -ForegroundColor Green
} else {
    Write-Host "❌ Hub needs attention - check https://hub.codai.ro" -ForegroundColor Red
}

if ($results | Where-Object { $_.Test -eq "Live CBD Health Check" -and $_.Status -eq "PASSED" }) {
    Write-Host "✅ CBD service is healthy at https://cbd.memorai.ro" -ForegroundColor Green
} else {
    Write-Host "❌ CBD service needs attention - check https://cbd.memorai.ro" -ForegroundColor Red
}

if ($results | Where-Object { $_.Test -eq "CBD Authentication Endpoint" -and $_.Status -eq "FAILED" }) {
    Write-Host "🔧 REQUIRED: Deploy SimpleAuthenticator to https://cbd.memorai.ro" -ForegroundColor Yellow
    Write-Host "   See: E:\GitHub\codai-project\deployment\cbd-auth-update\DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor White
}

# Integration Readiness Assessment
Write-Host "`n🎯 Integration Readiness Assessment:" -ForegroundColor Cyan

$hubReady = ($results | Where-Object { $_.Test -eq "Live Hub Health Check" -and $_.Status -eq "PASSED" }) -ne $null
$cbdReady = ($results | Where-Object { $_.Test -eq "Live CBD Health Check" -and $_.Status -eq "PASSED" }) -ne $null

if ($hubReady -and $cbdReady) {
    Write-Host "🟢 Infrastructure Ready: Both Hub and CBD services are operational" -ForegroundColor Green
    Write-Host "🟡 Authentication Pending: SimpleAuthenticator deployment needed" -ForegroundColor Yellow
    Write-Host "📋 Action Required: Deploy authentication to complete integration" -ForegroundColor White
} else {
    Write-Host "🔴 Infrastructure Issues: Service health checks failed" -ForegroundColor Red
    Write-Host "📋 Action Required: Fix service issues before proceeding" -ForegroundColor White
}

Write-Host "`n📝 Deployment Files Ready:" -ForegroundColor Blue
Write-Host "   E:\GitHub\codai-project\deployment\cbd-auth-update\" -ForegroundColor White
Write-Host "   E:\GitHub\codai-project\HUB_CBD_LIVE_INTEGRATION_SUCCESS_PLAN.md" -ForegroundColor White
