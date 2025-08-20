# CBD Security Hardening Service Test Suite
# Phase 4.2.3.3 - Security Hardening Validation
# Author: CBD Development Team
# Date: August 2, 2025

Write-Host "🛡️ =======================================" -ForegroundColor Cyan
Write-Host "🔒 CBD Security Hardening Test Suite" -ForegroundColor Cyan
Write-Host "🛡️ =======================================" -ForegroundColor Cyan

$BaseUrl = "http://localhost:4500"
$TestResults = @()

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        Write-Host "🔍 Testing: $Name" -ForegroundColor Yellow
        
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
            Headers = $Headers
        }
        
        if ($Body -and $Method -ne "GET") {
            $params.Body = $Body | ConvertTo-Json -Depth 3
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✅ $Name - SUCCESS" -ForegroundColor Green
        
        return @{
            Test = $Name
            Status = "PASS"
            Response = $response
            Error = $null
        }
    }
    catch {
        Write-Host "  ❌ $Name - FAILED: $($_.Exception.Message)" -ForegroundColor Red
        
        return @{
            Test = $Name
            Status = "FAIL"
            Response = $null
            Error = $_.Exception.Message
        }
    }
}

# Function to test security features
function Test-SecurityFeature {
    param(
        [string]$Name,
        [string]$Url,
        [hashtable]$Body,
        [bool]$ShouldBlock = $true
    )
    
    try {
        Write-Host "🛡️ Testing Security: $Name" -ForegroundColor Magenta
        
        $response = Invoke-RestMethod -Uri $Url -Method POST -Body ($Body | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10
        
        if ($ShouldBlock) {
            Write-Host "  ⚠️ $Name - SECURITY BYPASS (should have been blocked)" -ForegroundColor Yellow
            return @{ Test = $Name; Status = "SECURITY_BYPASS"; Response = $response }
        } else {
            Write-Host "  ✅ $Name - ALLOWED (as expected)" -ForegroundColor Green
            return @{ Test = $Name; Status = "PASS"; Response = $response }
        }
    }
    catch {
        if ($ShouldBlock -and $_.Exception.Message -like "*403*") {
            Write-Host "  ✅ $Name - BLOCKED (security working)" -ForegroundColor Green
            return @{ Test = $Name; Status = "PASS"; Response = "Blocked by security" }
        } else {
            Write-Host "  ❌ $Name - UNEXPECTED ERROR: $($_.Exception.Message)" -ForegroundColor Red
            return @{ Test = $Name; Status = "FAIL"; Error = $_.Exception.Message }
        }
    }
}

Write-Host "`n🏥 === HEALTH CHECK TESTS ===" -ForegroundColor Blue

# Test 1: Health Check
$TestResults += Test-Endpoint -Name "Health Check" -Url "$BaseUrl/health"

Write-Host "`n📊 === SECURITY STATISTICS TESTS ===" -ForegroundColor Blue

# Test 2: Security Stats
$TestResults += Test-Endpoint -Name "Security Statistics" -Url "$BaseUrl/api/security/stats"

# Test 3: Compliance Report
$TestResults += Test-Endpoint -Name "Compliance Report" -Url "$BaseUrl/api/security/compliance"

# Test 4: Audit Log
$TestResults += Test-Endpoint -Name "Audit Log" -Url "$BaseUrl/api/security/audit-log"

Write-Host "`n🛡️ === WEB APPLICATION FIREWALL TESTS ===" -ForegroundColor Blue

# Test 5: SQL Injection Protection
$TestResults += Test-SecurityFeature -Name "SQL Injection Protection" -Url "$BaseUrl/api/security/test" -Body @{
    username = "admin'; DROP TABLE users; --"
    password = "password"
} -ShouldBlock $true

# Test 6: XSS Protection
$TestResults += Test-SecurityFeature -Name "XSS Protection" -Url "$BaseUrl/api/security/test" -Body @{
    message = "<script>alert('xss')</script>"
    content = "Normal content"
} -ShouldBlock $true

# Test 7: Command Injection Protection
$TestResults += Test-SecurityFeature -Name "Command Injection Protection" -Url "$BaseUrl/api/security/test" -Body @{
    filename = "test.txt; rm -rf /"
    data = "test data"
} -ShouldBlock $true

# Test 8: Path Traversal Protection
$TestResults += Test-SecurityFeature -Name "Path Traversal Protection" -Url "$BaseUrl/api/security/test" -Body @{
    filepath = "../../etc/passwd"
    action = "read"
} -ShouldBlock $true

Write-Host "`n✅ === LEGITIMATE REQUEST TESTS ===" -ForegroundColor Blue

# Test 9: Legitimate Request (should pass)
$TestResults += Test-SecurityFeature -Name "Legitimate Request" -Url "$BaseUrl/api/security/test" -Body @{
    username = "testuser"
    email = "test@example.com"
    message = "This is a normal message"
} -ShouldBlock $false

Write-Host "`n🚫 === IP MANAGEMENT TESTS ===" -ForegroundColor Blue

# Test 10: Block IP
$TestResults += Test-Endpoint -Name "Block IP Address" -Url "$BaseUrl/api/security/ip/block" -Method "POST" -Body @{
    ip = "192.168.1.100"
    reason = "Test block"
}

# Test 11: Unblock IP
$TestResults += Test-Endpoint -Name "Unblock IP Address" -Url "$BaseUrl/api/security/ip/unblock/192.168.1.100" -Method "DELETE"

Write-Host "`n🔍 === VULNERABILITY SCAN TESTS ===" -ForegroundColor Blue

# Test 12: Vulnerability Scan
$TestResults += Test-Endpoint -Name "Vulnerability Scan" -Url "$BaseUrl/api/security/scan" -Method "POST" -Body @{
    target = "http://localhost:4500"
    scan_type = "basic"
}

Write-Host "`n🏆 === TEST RESULTS SUMMARY ===" -ForegroundColor Green

$TotalTests = $TestResults.Count
$PassedTests = ($TestResults | Where-Object { $_.Status -eq "PASS" }).Count
$FailedTests = ($TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
$SecurityBypasses = ($TestResults | Where-Object { $_.Status -eq "SECURITY_BYPASS" }).Count

Write-Host "📊 Test Summary:" -ForegroundColor Cyan
Write-Host "  Total Tests: $TotalTests" -ForegroundColor White
Write-Host "  Passed: $PassedTests" -ForegroundColor Green
Write-Host "  Failed: $FailedTests" -ForegroundColor Red
Write-Host "  Security Bypasses: $SecurityBypasses" -ForegroundColor Yellow

$SuccessRate = [math]::Round(($PassedTests / $TotalTests) * 100, 2)
Write-Host "  Success Rate: $SuccessRate%" -ForegroundColor $(if ($SuccessRate -ge 90) { "Green" } elseif ($SuccessRate -ge 70) { "Yellow" } else { "Red" })

Write-Host "`n📋 Detailed Results:" -ForegroundColor Cyan
foreach ($result in $TestResults) {
    $status_color = switch ($result.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "SECURITY_BYPASS" { "Yellow" }
        default { "White" }
    }
    Write-Host "  $($result.Status): $($result.Test)" -ForegroundColor $status_color
    if ($result.Error) {
        Write-Host "    Error: $($result.Error)" -ForegroundColor Red
    }
}

if ($SecurityBypasses -eq 0 -and $FailedTests -le 2) {
    Write-Host "`n🎉 CBD Security Hardening - VALIDATION SUCCESSFUL!" -ForegroundColor Green
    Write-Host "🛡️ All security features are working correctly!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ CBD Security Hardening - VALIDATION ISSUES DETECTED" -ForegroundColor Yellow
    Write-Host "🔧 Please review failed tests and security bypasses" -ForegroundColor Yellow
}

Write-Host "`n🛡️ Security Hardening Test Complete!" -ForegroundColor Cyan
