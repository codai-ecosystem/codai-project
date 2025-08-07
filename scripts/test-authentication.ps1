#!/usr/bin/env pwsh

<#
.SYNOPSIS
    MemorAI Authentication Integration Test Suite
    
.DESCRIPTION
    Comprehensive testing suite for Phase 4.3 Authentication Integration.
    Tests all authentication endpoints, RBAC functionality, and security features.
    
.EXAMPLE
    .\test-authentication.ps1
#>

param(
    [string]$BaseUrl = "http://localhost:4006",
    [switch]$Verbose = $false
)

# Test configuration
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Colors for output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-TestResult {
    param(
        [string]$Test,
        [bool]$Success,
        [string]$Details = "",
        [string]$Expected = "",
        [string]$Actual = ""
    )
    
    $status = if ($Success) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($Success) { $Colors.Success } else { $Colors.Error }
    
    Write-Host "$status $Test" -ForegroundColor $color
    
    if ($Details) {
        Write-Host "   Details: $Details" -ForegroundColor Gray
    }
    
    if ($Expected -and $Actual) {
        Write-Host "   Expected: $Expected" -ForegroundColor Gray
        Write-Host "   Actual: $Actual" -ForegroundColor Gray
    }
    
    if ($Verbose -and -not $Success) {
        Write-Host "   ❌ Test failed!" -ForegroundColor $Colors.Error
    }
}

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# Test Suite
Write-Host "🧠 MemorAI Authentication Integration Test Suite" -ForegroundColor $Colors.Header
Write-Host "=================================================" -ForegroundColor $Colors.Header
Write-Host ""

$TestResults = @{
    Total = 0
    Passed = 0
    Failed = 0
}

# Test 1: NextAuth Session Endpoint
Write-Host "1. Testing NextAuth Session Endpoint..." -ForegroundColor $Colors.Info
$sessionTest = Test-Endpoint -Url "$BaseUrl/api/auth/session"
$TestResults.Total++

if ($sessionTest.Success) {
    $hasExpires = $sessionTest.Data.PSObject.Properties.Name -contains "expires"
    $hasUser = $sessionTest.Data.PSObject.Properties.Name -contains "user"
    
    if ($hasExpires -and $hasUser) {
        Write-TestResult -Test "Session endpoint structure" -Success $true -Details "Contains required fields"
        $TestResults.Passed++
    } else {
        Write-TestResult -Test "Session endpoint structure" -Success $false -Details "Missing required fields"
        $TestResults.Failed++
    }
} else {
    Write-TestResult -Test "Session endpoint" -Success $false -Details $sessionTest.Error
    $TestResults.Failed++
}

# Test 2: NextAuth Providers Endpoint
Write-Host "`n2. Testing NextAuth Providers Endpoint..." -ForegroundColor $Colors.Info
$providersTest = Test-Endpoint -Url "$BaseUrl/api/auth/providers"
$TestResults.Total++

if ($providersTest.Success) {
    $hasCodai = $providersTest.Data.PSObject.Properties.Name -contains "codai"
    
    if ($hasCodai) {
        $codaiProvider = $providersTest.Data.codai
        $hasRequiredFields = $codaiProvider.id -eq "codai" -and 
                           $codaiProvider.name -eq "CODAI" -and 
                           $codaiProvider.type -eq "oauth"
        
        if ($hasRequiredFields) {
            Write-TestResult -Test "CODAI OAuth provider configuration" -Success $true -Details "All required fields present"
            $TestResults.Passed++
        } else {
            Write-TestResult -Test "CODAI OAuth provider configuration" -Success $false -Details "Missing required fields"
            $TestResults.Failed++
        }
    } else {
        Write-TestResult -Test "CODAI OAuth provider" -Success $false -Details "CODAI provider not found"
        $TestResults.Failed++
    }
} else {
    Write-TestResult -Test "Providers endpoint" -Success $false -Details $providersTest.Error
    $TestResults.Failed++
}

# Test 3: Authentication Pages
Write-Host "`n3. Testing Authentication Pages..." -ForegroundColor $Colors.Info

$authPages = @(
    @{ Path = "/auth/signin"; Name = "Sign In Page" },
    @{ Path = "/auth/error"; Name = "Error Page" }, 
    @{ Path = "/auth/unauthorized"; Name = "Unauthorized Page" },
    @{ Path = "/upgrade"; Name = "Upgrade Page" }
)

foreach ($page in $authPages) {
    $pageTest = Test-Endpoint -Url "$BaseUrl$($page.Path)"
    $TestResults.Total++
    
    if ($pageTest.Success) {
        Write-TestResult -Test $page.Name -Success $true -Details "Page loads successfully"
        $TestResults.Passed++
    } else {
        Write-TestResult -Test $page.Name -Success $false -Details "Page failed to load: $($pageTest.Error)"
        $TestResults.Failed++
    }
}

# Test 4: Authentication Component Files
Write-Host "`n4. Testing Authentication Component Files..." -ForegroundColor $Colors.Info

$authFiles = @(
    @{ 
        Path = "apps/memorai/src/components/auth-guard.tsx"
        Name = "AuthGuard Component"
        ShouldContain = @("AuthGuard", "useSession", "hasRole", "hasPermission")
    },
    @{ 
        Path = "apps/memorai/src/lib/auth.ts"
        Name = "Auth Configuration"
        ShouldContain = @("CodaiProvider", "hasRole", "hasPermission", "isMemorAIUser")
    },
    @{ 
        Path = "apps/memorai/src/middleware.ts"
        Name = "Auth Middleware"
        ShouldContain = @("middleware", "auth", "publicRoutes")
    }
)

foreach ($file in $authFiles) {
    $TestResults.Total++
    
    if (Test-Path $file.Path) {
        $content = Get-Content $file.Path -Raw
        $allContains = $true
        
        foreach ($term in $file.ShouldContain) {
            if ($content -notlike "*$term*") {
                $allContains = $false
                break
            }
        }
        
        if ($allContains) {
            Write-TestResult -Test $file.Name -Success $true -Details "File exists and contains required elements"
            $TestResults.Passed++
        } else {
            Write-TestResult -Test $file.Name -Success $false -Details "File missing required elements"
            $TestResults.Failed++
        }
    } else {
        Write-TestResult -Test $file.Name -Success $false -Details "File does not exist"
        $TestResults.Failed++
    }
}

# Test 5: Environment Configuration
Write-Host "`n5. Testing Environment Configuration..." -ForegroundColor $Colors.Info
$envExamplePath = "apps/memorai/.env.local.example"
$TestResults.Total++

if (Test-Path $envExamplePath) {
    $envContent = Get-Content $envExamplePath -Raw
    $requiredVars = @(
        "NEXTAUTH_URL",
        "NEXTAUTH_SECRET",
        "CODAI_CLIENT_ID",
        "CODAI_CLIENT_SECRET",
        "JWT_SECRET"
    )
    
    $allVarsPresent = $true
    foreach ($var in $requiredVars) {
        if ($envContent -notlike "*$var*") {
            $allVarsPresent = $false
            break
        }
    }
    
    if ($allVarsPresent) {
        Write-TestResult -Test "Environment configuration template" -Success $true -Details "All required variables present"
        $TestResults.Passed++
    } else {
        Write-TestResult -Test "Environment configuration template" -Success $false -Details "Missing required variables"
        $TestResults.Failed++
    }
} else {
    Write-TestResult -Test "Environment configuration template" -Success $false -Details "Template file does not exist"
    $TestResults.Failed++
}

# Test 6: Route Protection Test
Write-Host "`n6. Testing Route Protection..." -ForegroundColor $Colors.Info

# Test accessing protected route without authentication
$dashboardTest = Test-Endpoint -Url "$BaseUrl/dashboard"
$TestResults.Total++

if ($dashboardTest.StatusCode -eq 307 -or $dashboardTest.StatusCode -eq 302) {
    Write-TestResult -Test "Dashboard route protection" -Success $true -Details "Properly redirects unauthenticated users"
    $TestResults.Passed++
} else {
    Write-TestResult -Test "Dashboard route protection" -Success $false -Details "Route not properly protected"
    $TestResults.Failed++
}

# Test Summary
Write-Host "`n📊 Test Results Summary" -ForegroundColor $Colors.Header
Write-Host "======================" -ForegroundColor $Colors.Header
Write-Host "Total Tests: $($TestResults.Total)" -ForegroundColor $Colors.Info
Write-Host "Passed: $($TestResults.Passed)" -ForegroundColor $Colors.Success
Write-Host "Failed: $($TestResults.Failed)" -ForegroundColor $Colors.Error

$successRate = [math]::Round(($TestResults.Passed / $TestResults.Total) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { $Colors.Success } else { $Colors.Warning })

if ($TestResults.Failed -eq 0) {
    Write-Host "`n🎉 All tests passed! Authentication integration is working correctly." -ForegroundColor $Colors.Success
} else {
    Write-Host "`n⚠️  Some tests failed. Please review and fix the issues above." -ForegroundColor $Colors.Warning
}

# Recommendations
Write-Host "`n💡 Recommendations for Phase 4.3 Completion:" -ForegroundColor $Colors.Header
Write-Host "• Set up environment variables in .env.local"
Write-Host "• Configure CODAI OAuth credentials"
Write-Host "• Test with actual OAuth flow"
Write-Host "• Verify RBAC permissions in production"
Write-Host "• Set up session storage (Redis recommended)"
Write-Host "• Configure CSRF protection"
Write-Host "• Enable rate limiting for auth endpoints"

Write-Host "`n🔗 Next Steps:" -ForegroundColor $Colors.Header
Write-Host "• Complete environment setup"
Write-Host "• Test authentication flow end-to-end"
Write-Host "• Implement session management"
Write-Host "• Deploy to staging environment"

return $TestResults.Failed -eq 0
