# ROMAI API Test Suite
# Comprehensive testing of all API endpoints

Write-Host "🧪 ROMAI API Test Suite Starting..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Yellow

$baseUrl = "http://localhost:8000"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Description,
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    Write-Host "`n🔍 Testing: $Description" -ForegroundColor Green
    Write-Host "   Method: $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            Write-Host "   Body: $($params.Body)" -ForegroundColor Gray
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "   ✅ SUCCESS" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Cyan
        
        $global:testResults += @{
            Test = $Description
            Status = "PASS"
            Response = $response
            Method = $Method
            Url = $Url
        }
        
        return $response
    }
    catch {
        Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        
        $global:testResults += @{
            Test = $Description
            Status = "FAIL"
            Error = $_.Exception.Message
            Method = $Method
            Url = $Url
        }
        
        return $null
    }
}

# Test 1: Health Check
Test-Endpoint -Method "GET" -Url "$baseUrl/health" -Description "Health Check Endpoint"

# Test 2: Root Endpoint
Test-Endpoint -Method "GET" -Url "$baseUrl/" -Description "Root API Endpoint"

# Test 3: OpenAPI Documentation
Test-Endpoint -Method "GET" -Url "$baseUrl/docs" -Description "OpenAPI Documentation (HTML)"

# Test 4: OpenAPI JSON Schema
Test-Endpoint -Method "GET" -Url "$baseUrl/docs/json" -Description "OpenAPI JSON Schema"

# Test 5: Intelligence Endpoint - Romanian Query
$intelligenceBody = @{
    query = "Ce este inteligența artificială și cum funcționează?"
    language = "ro"
    domain = "technology"
}
Test-Endpoint -Method "POST" -Url "$baseUrl/api/intelligence" -Description "Intelligence - Romanian Technology Query" -Body $intelligenceBody

# Test 6: Intelligence Endpoint - English Query
$intelligenceBodyEn = @{
    query = "What are the benefits of artificial intelligence in business?"
    language = "en"
    domain = "business"
}
Test-Endpoint -Method "POST" -Url "$baseUrl/api/intelligence" -Description "Intelligence - English Business Query" -Body $intelligenceBodyEn

# Test 7: Romanian Expert Endpoint
$expertBody = @{
    query = "Care sunt tradițiile importante din România?"
    category = "culture"
}
Test-Endpoint -Method "POST" -Url "$baseUrl/api/romanian-expert" -Description "Romanian Expert - Culture Query" -Body $expertBody

# Test 8: Problem Solver Endpoint
$problemBody = @{
    problem = "Cum pot să îmbunătățesc performanța unei aplicații web?"
    constraints = "Buget limitat și timp scurt"
    goals = "Timp de încărcare sub 2 secunde"
    language = "ro"
}
Test-Endpoint -Method "POST" -Url "$baseUrl/api/problem-solver" -Description "Problem Solver - Web Performance Optimization" -Body $problemBody

# Test 9: Code Assistant Endpoint
$codeBody = @{
    request = "Creează o funcție JavaScript pentru validarea email-urilor"
    language = "javascript"
    framework = "none"
    explain_in = "ro"
}
Test-Endpoint -Method "POST" -Url "$baseUrl/api/code-assistant" -Description "Code Assistant - JavaScript Email Validation" -Body $codeBody

# Test 10: Invalid Endpoint (Should return 404)
Test-Endpoint -Method "GET" -Url "$baseUrl/invalid-endpoint" -Description "Invalid Endpoint (Should fail with 404)"

# Test 11: Invalid Method (Should return 405)
Test-Endpoint -Method "DELETE" -Url "$baseUrl/health" -Description "Invalid Method on Health (Should fail with 405)"

# Test 12: Invalid JSON Body
try {
    Write-Host "`n🔍 Testing: Invalid JSON Body" -ForegroundColor Green
    $headers = @{"Content-Type" = "application/json"}
    $invalidJson = '{"invalid": json}'
    
    Invoke-RestMethod -Method "POST" -Uri "$baseUrl/api/intelligence" -Body $invalidJson -Headers $headers -TimeoutSec 30
    
    Write-Host "   ❌ FAILED: Should have returned error for invalid JSON" -ForegroundColor Red
    $testResults += @{
        Test = "Invalid JSON Body"
        Status = "FAIL"
        Error = "Should have returned error for invalid JSON"
    }
}
catch {
    Write-Host "   ✅ SUCCESS: Correctly rejected invalid JSON" -ForegroundColor Green
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Cyan
    $testResults += @{
        Test = "Invalid JSON Body"
        Status = "PASS"
        Response = "Correctly rejected invalid JSON"
    }
}

# Generate Test Report
Write-Host "`n" -ForegroundColor White
Write-Host "📊 TEST RESULTS SUMMARY" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalTests = $testResults.Count

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passCount / $totalTests) * 100, 2))%" -ForegroundColor Cyan

Write-Host "`nDetailed Results:" -ForegroundColor White
foreach ($result in $testResults) {
    $statusColor = if ($result.Status -eq "PASS") { "Green" } else { "Red" }
    $statusIcon = if ($result.Status -eq "PASS") { "✅" } else { "❌" }
    
    Write-Host "  $statusIcon $($result.Test): $($result.Status)" -ForegroundColor $statusColor
    if ($result.Status -eq "FAIL" -and $result.Error) {
        Write-Host "     Error: $($result.Error)" -ForegroundColor Red
    }
}

# Save detailed results to file
$reportPath = "e:\GitHub\romai\api-test-results.json"
$testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath
Write-Host "`n📄 Detailed results saved to: $reportPath" -ForegroundColor Cyan

Write-Host "`n🎯 API Testing Complete!" -ForegroundColor Yellow
