# 🛡️ CBD Security Gateway Test Suite
# Phase 4.2.3.1 - Authentication & Authorization Testing
# 
# Test Coverage:
# - Authentication flows (login, logout, refresh)
# - Authorization & RBAC
# - Session management
# - Security features (rate limiting, input validation)
# - Audit logging

param(
    [string]$BaseUrl = "http://localhost:4400",
    [switch]$Verbose = $true,
    [switch]$SkipCleanup = $false
)

Write-Host "🛡️ CBD Security Gateway Test Suite" -ForegroundColor Cyan
Write-Host "Testing authentication, authorization, and security features" -ForegroundColor Gray
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

# Test counters
$script:TestsPassed = 0
$script:TestsFailed = 0
$script:TestsTotal = 0

# Test results storage
$script:TestResults = @()
$script:AuthTokens = @{}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Details = "",
        [object]$Response = $null
    )
    
    $script:TestsTotal++
    
    if ($Success) {
        $script:TestsPassed++
        Write-Host "✅ $TestName" -ForegroundColor Green
        if ($Verbose -and $Details) {
            Write-Host "   $Details" -ForegroundColor Gray
        }
    } else {
        $script:TestsFailed++
        Write-Host "❌ $TestName" -ForegroundColor Red
        if ($Details) {
            Write-Host "   Error: $Details" -ForegroundColor Red
        }
    }
    
    $script:TestResults += @{
        Name = $TestName
        Success = $Success
        Details = $Details
        Response = $Response
        Timestamp = Get-Date
    }
}

function Invoke-SecureRestMethod {
    param(
        [string]$Uri,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [string]$Token = $null
    )
    
    try {
        $requestHeaders = $Headers.Clone()
        
        if ($Token) {
            $requestHeaders["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $requestHeaders
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        $statusCode = 0
        $errorMessage = $_.Exception.Message
        
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            try {
                $errorResponse = $_.Exception.Response.GetResponseStream()
                $reader = [System.IO.StreamReader]::new($errorResponse)
                $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
                $errorMessage = $errorBody.error
            } catch {
                # Use default error message
            }
        }
        
        return @{ 
            Success = $false
            Error = $errorMessage
            StatusCode = $statusCode
            Data = $null
        }
    }
}

# Test 1: Health Check
Write-Host "🔍 Testing Health Check..." -ForegroundColor Blue
$healthResult = Invoke-SecureRestMethod -Uri "$BaseUrl/health"
if ($healthResult.Success) {
    $health = $healthResult.Data
    Write-TestResult "Health Check" $true "Service: $($health.service), Status: $($health.status)"
} else {
    Write-TestResult "Health Check" $false $healthResult.Error
    Write-Host "⚠️  Security Gateway may not be running. Please start it first." -ForegroundColor Yellow
    exit 1
}

# Test 2: Authentication Tests
Write-Host "`n🔐 Testing Authentication..." -ForegroundColor Blue

# Test 2.1: Login with valid credentials (Admin)
$loginData = @{
    username = "admin"
    password = "Admin123!@#"
}
$loginResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/login" -Method "POST" -Body $loginData
if ($loginResult.Success -and $loginResult.Data.success) {
    $script:AuthTokens["admin"] = $loginResult.Data.accessToken
    $script:AuthTokens["admin_refresh"] = $loginResult.Data.refreshToken
    Write-TestResult "Admin Login" $true "Token received, expires in $($loginResult.Data.expiresIn)"
} else {
    $error = if ($loginResult.Data.error) { $loginResult.Data.error } else { $loginResult.Error }
    Write-TestResult "Admin Login" $false $error
}

# Test 2.2: Login with valid credentials (Developer)
$devLoginData = @{
    username = "developer"
    password = "Dev123!@#"
}
$devLoginResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/login" -Method "POST" -Body $devLoginData
if ($devLoginResult.Success -and $devLoginResult.Data.success) {
    $script:AuthTokens["developer"] = $devLoginResult.Data.accessToken
    $script:AuthTokens["developer_refresh"] = $devLoginResult.Data.refreshToken
    Write-TestResult "Developer Login" $true "Token received, user: $($devLoginResult.Data.user.username)"
} else {
    $error = if ($devLoginResult.Data.error) { $devLoginResult.Data.error } else { $devLoginResult.Error }
    Write-TestResult "Developer Login" $false $error
}

# Test 2.3: Login with invalid credentials
$invalidLoginData = @{
    username = "admin"
    password = "wrongpassword"
}
$invalidLoginResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/login" -Method "POST" -Body $invalidLoginData
if (!$invalidLoginResult.Success -and $invalidLoginResult.StatusCode -eq 401) {
    Write-TestResult "Invalid Login Rejection" $true "Correctly rejected invalid credentials"
} else {
    Write-TestResult "Invalid Login Rejection" $false "Should have rejected invalid credentials"
}

# Test 2.4: Login without credentials
$emptyLoginResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/login" -Method "POST" -Body @{}
if (!$emptyLoginResult.Success -and $emptyLoginResult.StatusCode -eq 400) {
    Write-TestResult "Empty Login Rejection" $true "Correctly rejected empty credentials"
} else {
    Write-TestResult "Empty Login Rejection" $false "Should have rejected empty credentials"
}

# Test 3: Profile Access
Write-Host "`n👤 Testing Profile Access..." -ForegroundColor Blue

# Test 3.1: Get profile with valid token
if ($script:AuthTokens["admin"]) {
    $profileResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/profile" -Token $script:AuthTokens["admin"]
    if ($profileResult.Success -and $profileResult.Data.success) {
        $profile = $profileResult.Data.user
        Write-TestResult "Admin Profile Access" $true "Username: $($profile.username), Roles: $($profile.roles -join ', ')"
    } else {
        Write-TestResult "Admin Profile Access" $false $profileResult.Error
    }
}

# Test 3.2: Get profile without token
$noTokenProfileResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/profile"
if (!$noTokenProfileResult.Success -and $noTokenProfileResult.StatusCode -eq 401) {
    Write-TestResult "Profile Access Without Token" $true "Correctly rejected request without token"
} else {
    Write-TestResult "Profile Access Without Token" $false "Should have rejected request without token"
}

# Test 4: Authorization Tests
Write-Host "`n🛡️ Testing Authorization..." -ForegroundColor Blue

# Test 4.1: Admin access to admin endpoints
if ($script:AuthTokens["admin"]) {
    $sessionsResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/sessions" -Token $script:AuthTokens["admin"]
    if ($sessionsResult.Success -and $sessionsResult.Data.success) {
        Write-TestResult "Admin Sessions Access" $true "Retrieved $($sessionsResult.Data.total) sessions"
    } else {
        Write-TestResult "Admin Sessions Access" $false $sessionsResult.Error
    }
    
    $auditResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/audit-log" -Token $script:AuthTokens["admin"]
    if ($auditResult.Success -and $auditResult.Data.success) {
        Write-TestResult "Admin Audit Log Access" $true "Retrieved $($auditResult.Data.events.Count) audit events"
    } else {
        Write-TestResult "Admin Audit Log Access" $false $auditResult.Error
    }
}

# Test 4.2: Developer access to admin endpoints (should fail)
if ($script:AuthTokens["developer"]) {
    $devSessionsResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/sessions" -Token $script:AuthTokens["developer"]
    if (!$devSessionsResult.Success -and $devSessionsResult.StatusCode -eq 403) {
        Write-TestResult "Developer Admin Access Rejection" $true "Correctly denied admin access to developer"
    } else {
        Write-TestResult "Developer Admin Access Rejection" $false "Should have denied admin access to developer"
    }
}

# Test 5: Token Refresh
Write-Host "`n🔄 Testing Token Refresh..." -ForegroundColor Blue

if ($script:AuthTokens["admin_refresh"]) {
    Start-Sleep -Seconds 1 # Brief pause
    
    $refreshData = @{
        refreshToken = $script:AuthTokens["admin_refresh"]
    }
    $refreshResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/refresh" -Method "POST" -Body $refreshData
    if ($refreshResult.Success -and $refreshResult.Data.success) {
        $script:AuthTokens["admin"] = $refreshResult.Data.accessToken
        Write-TestResult "Token Refresh" $true "New token received, expires in $($refreshResult.Data.expiresIn)"
    } else {
        $error = if ($refreshResult.Data.error) { $refreshResult.Data.error } else { $refreshResult.Error }
        Write-TestResult "Token Refresh" $false $error
    }
}

# Test 6: Stats Access
Write-Host "`n📊 Testing Stats Access..." -ForegroundColor Blue

if ($script:AuthTokens["admin"]) {
    $statsResult = Invoke-SecureRestMethod -Uri "$BaseUrl/stats" -Token $script:AuthTokens["admin"]
    if ($statsResult.Success -and $statsResult.Data.success) {
        $stats = $statsResult.Data.stats
        Write-TestResult "Stats Access" $true "Users: $($stats.users), Sessions: $($stats.activeSessions), Audit Events: $($stats.auditEvents)"
    } else {
        Write-TestResult "Stats Access" $false $statsResult.Error
    }
}

# Test 7: Rate Limiting
Write-Host "`n⏱️ Testing Rate Limiting..." -ForegroundColor Blue

$rateLimitHit = $false
for ($i = 1; $i -le 12; $i++) {
    $rateLimitResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/login" -Method "POST" -Body @{username="test"; password="test"}
    if ($rateLimitResult.StatusCode -eq 429) {
        $rateLimitHit = $true
        break
    }
    Start-Sleep -Milliseconds 100
}

if ($rateLimitHit) {
    Write-TestResult "Rate Limiting" $true "Rate limit triggered after multiple failed attempts"
} else {
    Write-TestResult "Rate Limiting" $false "Rate limit not triggered (may need adjustment)"
}

# Test 8: Session Management
Write-Host "`n📱 Testing Session Management..." -ForegroundColor Blue

# Test multiple logins to check session limit
$sessionTokens = @()
for ($i = 1; $i -le 3; $i++) {
    $sessionLoginResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/login" -Method "POST" -Body $loginData
    if ($sessionLoginResult.Success) {
        $sessionTokens += $sessionLoginResult.Data.accessToken
    }
    Start-Sleep -Milliseconds 200
}

if ($sessionTokens.Count -eq 3) {
    Write-TestResult "Multiple Session Creation" $true "Created $($sessionTokens.Count) sessions"
} else {
    Write-TestResult "Multiple Session Creation" $false "Expected 3 sessions, got $($sessionTokens.Count)"
}

# Test 9: Logout
Write-Host "`n🚪 Testing Logout..." -ForegroundColor Blue

if ($script:AuthTokens["developer"]) {
    $logoutResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/logout" -Method "POST" -Token $script:AuthTokens["developer"]
    if ($logoutResult.Success -and $logoutResult.Data.success) {
        Write-TestResult "Logout" $true $logoutResult.Data.message
        
        # Test that token is invalidated
        $postLogoutProfileResult = Invoke-SecureRestMethod -Uri "$BaseUrl/auth/profile" -Token $script:AuthTokens["developer"]
        if (!$postLogoutProfileResult.Success -and $postLogoutProfileResult.StatusCode -eq 401) {
            Write-TestResult "Token Invalidation After Logout" $true "Token correctly invalidated"
        } else {
            Write-TestResult "Token Invalidation After Logout" $false "Token should be invalidated after logout"
        }
    } else {
        Write-TestResult "Logout" $false $logoutResult.Error
    }
}

# Test 10: Security Headers
Write-Host "`n🔒 Testing Security Headers..." -ForegroundColor Blue

try {
    $webRequest = [System.Net.WebRequest]::Create("$BaseUrl/health")
    $webRequest.Method = "GET"
    $webRequest.Timeout = 5000
    $response = $webRequest.GetResponse()
    
    $securityHeaders = @(
        "X-Content-Type-Options",
        "X-Frame-Options", 
        "X-XSS-Protection",
        "Strict-Transport-Security"
    )
    
    $foundHeaders = 0
    foreach ($header in $securityHeaders) {
        if ($response.Headers[$header]) {
            $foundHeaders++
        }
    }
    
    $response.Close()
    
    if ($foundHeaders -ge 3) {
        Write-TestResult "Security Headers" $true "Found $foundHeaders security headers"
    } else {
        Write-TestResult "Security Headers" $false "Only found $foundHeaders security headers"
    }
} catch {
    Write-TestResult "Security Headers" $false "Failed to check headers: $($_.Exception.Message)"
}

# Test Summary
Write-Host "`n📋 Test Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
Write-Host "✅ Passed: $script:TestsPassed" -ForegroundColor Green
Write-Host "❌ Failed: $script:TestsFailed" -ForegroundColor Red
Write-Host "📊 Total:  $script:TestsTotal" -ForegroundColor Yellow

$successRate = if ($script:TestsTotal -gt 0) { 
    [math]::Round(($script:TestsPassed / $script:TestsTotal) * 100, 1) 
} else { 0 }

Write-Host "🎯 Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 75) { "Yellow" } else { "Red" })

if ($script:TestsFailed -gt 0) {
    Write-Host "`n❌ Failed Tests:" -ForegroundColor Red
    $script:TestResults | Where-Object { !$_.Success } | ForEach-Object {
        Write-Host "   • $($_.Name): $($_.Details)" -ForegroundColor Red
    }
}

# Security Assessment
Write-Host "`n🛡️ Security Assessment" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray

$securityScore = 0
$maxScore = 10

# Check authentication
if (($script:TestResults | Where-Object { $_.Name -eq "Admin Login" }).Success) { $securityScore++ }
if (($script:TestResults | Where-Object { $_.Name -eq "Invalid Login Rejection" }).Success) { $securityScore++ }

# Check authorization  
if (($script:TestResults | Where-Object { $_.Name -eq "Developer Admin Access Rejection" }).Success) { $securityScore++ }

# Check token management
if (($script:TestResults | Where-Object { $_.Name -eq "Token Refresh" }).Success) { $securityScore++ }
if (($script:TestResults | Where-Object { $_.Name -eq "Token Invalidation After Logout" }).Success) { $securityScore++ }

# Check rate limiting
if (($script:TestResults | Where-Object { $_.Name -eq "Rate Limiting" }).Success) { $securityScore++ }

# Check security headers
if (($script:TestResults | Where-Object { $_.Name -eq "Security Headers" }).Success) { $securityScore++ }

# Check session management
if (($script:TestResults | Where-Object { $_.Name -eq "Multiple Session Creation" }).Success) { $securityScore++ }

# Check profile protection
if (($script:TestResults | Where-Object { $_.Name -eq "Profile Access Without Token" }).Success) { $securityScore++ }

# Check logout functionality
if (($script:TestResults | Where-Object { $_.Name -eq "Logout" }).Success) { $securityScore++ }

$securityPercentage = [math]::Round(($securityScore / $maxScore) * 100, 1)

Write-Host "🔒 Security Score: $securityScore/$maxScore ($securityPercentage%)" -ForegroundColor $(
    if ($securityPercentage -ge 90) { "Green" } 
    elseif ($securityPercentage -ge 75) { "Yellow" } 
    else { "Red" }
)

if ($securityPercentage -ge 90) {
    Write-Host "🏆 Excellent! Security implementation is production-ready." -ForegroundColor Green
} elseif ($securityPercentage -ge 75) {
    Write-Host "⚠️  Good security foundation, but some improvements needed." -ForegroundColor Yellow
} else {
    Write-Host "🚨 Security implementation needs significant improvements." -ForegroundColor Red
}

# Performance Metrics
Write-Host "`n⚡ Performance Metrics" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray

$testDuration = (Get-Date) - $script:TestResults[0].Timestamp
Write-Host "⏱️  Total Test Duration: $([math]::Round($testDuration.TotalSeconds, 2)) seconds" -ForegroundColor Gray
Write-Host "🚀 Average Test Time: $([math]::Round($testDuration.TotalMilliseconds / $script:TestsTotal, 0)) ms" -ForegroundColor Gray

Write-Host "`n🎉 CBD Security Gateway testing completed!" -ForegroundColor Green
Write-Host "Ready for Phase 4.2.3.2 - Data Encryption implementation." -ForegroundColor Cyan

# Exit with appropriate code
exit $(if ($script:TestsFailed -eq 0) { 0 } else { 1 })
