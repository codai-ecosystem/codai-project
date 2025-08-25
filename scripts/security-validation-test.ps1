# Security Validation Test Suite
# Testing all 5 critical vulnerabilities identified during production testing

$ALB_URL = "http://memorai-alb-prod-2014965749.eu-central-1.elb.amazonaws.com"
$API_KEY = "memorai_gTPuSTeViI8-wn1Ru45P6BIXpesKLiubsSQSnmRHXLA"

Write-Host "🔐 COMPREHENSIVE SECURITY VALIDATION TEST SUITE" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Target: $ALB_URL" -ForegroundColor White
Write-Host ""

$results = @()

# Test 1: Authentication Protection
Write-Host "1️⃣ Testing Authentication Protection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$ALB_URL/api/memories" -Method Get -TimeoutSec 10
    $results += @{Test="Authentication"; Status="FAIL"; Reason="No authentication required"}
    Write-Host "   ❌ FAIL: API accessible without authentication" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        $results += @{Test="Authentication"; Status="PASS"; Reason="401 Unauthorized returned"}
        Write-Host "   ✅ PASS: Authentication required (401 Unauthorized)" -ForegroundColor Green
    } else {
        $results += @{Test="Authentication"; Status="FAIL"; Reason="Unexpected error: $($_.Exception.Message)"}
        Write-Host "   ❌ FAIL: Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Valid API Key Access
Write-Host "2️⃣ Testing Valid API Key Access..." -ForegroundColor Yellow
try {
    $headers = @{
        'X-API-Key' = $API_KEY
        'Content-Type' = 'application/json'
    }
    $response = Invoke-RestMethod -Uri "$ALB_URL/api/memories" -Method Get -Headers $headers -TimeoutSec 10
    $results += @{Test="Valid API Key"; Status="PASS"; Reason="API accessible with valid key"}
    Write-Host "   ✅ PASS: Valid API key grants access" -ForegroundColor Green
} catch {
    $results += @{Test="Valid API Key"; Status="FAIL"; Reason="Valid API key rejected: $($_.Exception.Message)"}
    Write-Host "   ❌ FAIL: Valid API key rejected: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: SQL Injection Protection
Write-Host "3️⃣ Testing SQL Injection Protection..." -ForegroundColor Yellow
$sqlPayloads = @(
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "' UNION SELECT * FROM users --",
    "'; INSERT INTO users VALUES('hacker','password'); --"
)

$sqlTestsPassed = 0
foreach ($payload in $sqlPayloads) {
    try {
        $headers = @{
            'X-API-Key' = $API_KEY
            'Content-Type' = 'application/json'
        }
        $body = @{
            query = $payload
            content = $payload
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$ALB_URL/api/memories/search" -Method Post -Headers $headers -Body $body -TimeoutSec 5
        Write-Host "   ❌ SQL injection payload not blocked: $payload" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            $sqlTestsPassed++
            Write-Host "   ✅ SQL injection blocked: $payload" -ForegroundColor Green
        }
    }
}

if ($sqlTestsPassed -eq $sqlPayloads.Count) {
    $results += @{Test="SQL Injection Protection"; Status="PASS"; Reason="All $($sqlPayloads.Count) SQL injection attempts blocked"}
    Write-Host "   ✅ PASS: All SQL injection attempts blocked" -ForegroundColor Green
} else {
    $results += @{Test="SQL Injection Protection"; Status="FAIL"; Reason="$($sqlPayloads.Count - $sqlTestsPassed) SQL injection attempts not blocked"}
    Write-Host "   ❌ FAIL: Some SQL injection attempts not blocked" -ForegroundColor Red
}

# Test 4: Rate Limiting Protection
Write-Host "4️⃣ Testing Rate Limiting Protection..." -ForegroundColor Yellow
$rateLimitHit = $false
$headers = @{
    'X-API-Key' = $API_KEY
    'Content-Type' = 'application/json'
}

for ($i = 1; $i -le 20; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "$ALB_URL/api/memories" -Method Get -Headers $headers -TimeoutSec 2
        Start-Sleep -Milliseconds 100
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            $rateLimitHit = $true
            Write-Host "   ✅ Rate limit triggered at request $i" -ForegroundColor Green
            break
        }
    }
}

if ($rateLimitHit) {
    $results += @{Test="Rate Limiting"; Status="PASS"; Reason="Rate limiting activated"}
    Write-Host "   ✅ PASS: Rate limiting working" -ForegroundColor Green
} else {
    $results += @{Test="Rate Limiting"; Status="FAIL"; Reason="No rate limiting detected"}
    Write-Host "   ❌ FAIL: No rate limiting detected" -ForegroundColor Red
}

# Test 5: Input Validation Protection
Write-Host "5️⃣ Testing Input Validation Protection..." -ForegroundColor Yellow
$maliciousInputs = @(
    "<script>alert('xss')</script>",
    "javascript:alert('xss')",
    "${7*7}",
    "{{7*7}}",
    "../../etc/passwd"
)

$validationTestsPassed = 0
foreach ($input in $maliciousInputs) {
    try {
        $headers = @{
            'X-API-Key' = $API_KEY
            'Content-Type' = 'application/json'
        }
        $body = @{
            content = $input
            agentId = "test-agent"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$ALB_URL/api/memories" -Method Post -Headers $headers -Body $body -TimeoutSec 5
        Write-Host "   ❌ Malicious input not blocked: $input" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            $validationTestsPassed++
            Write-Host "   ✅ Malicious input blocked: $input" -ForegroundColor Green
        }
    }
}

if ($validationTestsPassed -eq $maliciousInputs.Count) {
    $results += @{Test="Input Validation"; Status="PASS"; Reason="All $($maliciousInputs.Count) malicious inputs blocked"}
    Write-Host "   ✅ PASS: All malicious inputs blocked" -ForegroundColor Green
} else {
    $results += @{Test="Input Validation"; Status="FAIL"; Reason="$($maliciousInputs.Count - $validationTestsPassed) malicious inputs not blocked"}
    Write-Host "   ❌ FAIL: Some malicious inputs not blocked" -ForegroundColor Red
}

# Test 6: Security Headers
Write-Host "6️⃣ Testing Security Headers..." -ForegroundColor Yellow
try {
    $headers = @{
        'X-API-Key' = $API_KEY
    }
    $response = Invoke-WebRequest -Uri "$ALB_URL/api/health" -Method Get -Headers $headers -TimeoutSec 10
    
    $securityHeaders = @(
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security'
    )
    
    $headersPassed = 0
    foreach ($header in $securityHeaders) {
        if ($response.Headers[$header]) {
            $headersPassed++
            Write-Host "   ✅ $header present" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ $header missing" -ForegroundColor Yellow
        }
    }
    
    if ($headersPassed -ge 2) {
        $results += @{Test="Security Headers"; Status="PASS"; Reason="$headersPassed/$($securityHeaders.Count) security headers present"}
    } else {
        $results += @{Test="Security Headers"; Status="PARTIAL"; Reason="Only $headersPassed/$($securityHeaders.Count) security headers present"}
    }
} catch {
    $results += @{Test="Security Headers"; Status="FAIL"; Reason="Cannot test headers: $($_.Exception.Message)"}
    Write-Host "   ❌ FAIL: Cannot test headers: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "🔐 SECURITY VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

$passCount = ($results | Where-Object {$_.Status -eq "PASS"}).Count
$failCount = ($results | Where-Object {$_.Status -eq "FAIL"}).Count
$partialCount = ($results | Where-Object {$_.Status -eq "PARTIAL"}).Count

foreach ($result in $results) {
    $color = switch ($result.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "PARTIAL" { "Yellow" }
    }
    Write-Host "$($result.Test): $($result.Status) - $($result.Reason)" -ForegroundColor $color
}

Write-Host ""
Write-Host "📊 Results: $passCount PASSED, $failCount FAILED, $partialCount PARTIAL" -ForegroundColor White

$overallScore = [math]::Round((($passCount + $partialCount * 0.5) / $results.Count) * 100, 1)
Write-Host "🎯 Overall Security Score: $overallScore%" -ForegroundColor $(if ($overallScore -ge 80) { "Green" } elseif ($overallScore -ge 60) { "Yellow" } else { "Red" })

if ($failCount -eq 0) {
    Write-Host ""
    Write-Host "🛡️ ALL CRITICAL SECURITY VULNERABILITIES RESOLVED!" -ForegroundColor Green
    Write-Host "✅ Production environment is secure and ready for operation" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️ Security issues still present - review failed tests" -ForegroundColor Yellow
}
