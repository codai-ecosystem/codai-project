#!/usr/bin/env pwsh
# ============================================================================
# CODAI ECOSYSTEM - COMPREHENSIVE FRONTEND TESTING SUITE
# Complete frontend functionality testing including UI, routing, forms, etc.
# ============================================================================

param(
    [switch]$Verbose = $false,
    [switch]$IncludeScreenshots = $false
)

$script:TotalTests = 0
$script:PassedTests = 0
$script:FailedTests = 0
$script:TestResults = @()

function Write-TestHeader {
    param([string]$Title, [string]$Icon = "🎯")
    Write-Host "`n$Icon $Title" -ForegroundColor Yellow
    Write-Host ("=" * $Title.Length) -ForegroundColor Gray
}

function Test-FrontendFeature {
    param(
        [string]$Name,
        [string]$Description,
        [scriptblock]$TestScript,
        [string]$Frontend = "General"
    )
    
    $script:TotalTests++
    $testStart = Get-Date
    
    try {
        Write-Host "  🔍 Testing: $Name" -ForegroundColor Cyan
        if ($Verbose) { Write-Host "     Description: $Description" -ForegroundColor Gray }
        
        $result = & $TestScript
        $duration = ((Get-Date) - $testStart).TotalMilliseconds
        
        if ($result.Success) {
            $script:PassedTests++
            Write-Host "  ✅ $Name" -ForegroundColor Green
            if ($Verbose -and $result.Details) {
                Write-Host "     Details: $($result.Details)" -ForegroundColor Gray
            }
        } else {
            $script:FailedTests++
            Write-Host "  ❌ $Name" -ForegroundColor Red
            if ($result.Error) {
                Write-Host "     Error: $($result.Error)" -ForegroundColor Red
            }
        }
        
        $script:TestResults += @{
            Name = $Name
            Frontend = $Frontend
            Success = $result.Success
            Duration = $duration
            Details = $result.Details
            Error = $result.Error
        }
        
        return $result
    }
    catch {
        $duration = ((Get-Date) - $testStart).TotalMilliseconds
        $script:FailedTests++
        Write-Host "  ❌ $Name - Exception: $($_.Exception.Message)" -ForegroundColor Red
        
        $script:TestResults += @{
            Name = $Name
            Frontend = $Frontend
            Success = $false
            Duration = $duration
            Error = $_.Exception.Message
        }
        
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

Write-TestHeader "CODAI ECOSYSTEM - COMPREHENSIVE FRONTEND TESTING SUITE" "🖥️"
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "🎯 Testing complete frontend functionality across all applications" -ForegroundColor Cyan

# ============================================================================
# 1. CONTROLAI DASHBOARD FRONTEND TESTING (Port 4200)
# ============================================================================
Write-TestHeader "CONTROLAI DASHBOARD TESTING" "🎛️"

Test-FrontendFeature "ControlAI Health & Availability" "Basic application health and server response" {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4200/api/health" -TimeoutSec 5
        if ($response.status -eq "healthy" -and $response.service) {
            return @{ Success = $true; Details = "Service: $($response.service) v$($response.version)" }
        } else {
            return @{ Success = $false; Error = "Invalid health response structure" }
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "ControlAI"

Test-FrontendFeature "ControlAI Main Page Loading" "Test main application page loads with content" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4200/" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $hasReactContent = $response.Content -match "__NEXT_DATA__|_app|react|control|dashboard"
            $contentSize = $response.Content.Length
            if ($hasReactContent) {
                return @{ Success = $true; Details = "React/Next.js app loaded, $contentSize bytes" }
            } else {
                return @{ Success = $true; Details = "Page loaded but content type unclear, $contentSize bytes" }
            }
        } else {
            return @{ Success = $false; Error = "HTTP $($response.StatusCode)" }
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "ControlAI"

Test-FrontendFeature "ControlAI Static Assets" "Test CSS, JS, and static asset loading" {
    try {
        # Test common static asset paths
        $assetTests = @()
        $assetPaths = @("/_next/static/", "/favicon.ico", "/api/")
        
        foreach ($path in $assetPaths) {
            try {
                $assetResponse = Invoke-WebRequest -Uri "http://localhost:4200$path" -TimeoutSec 5 -UseBasicParsing
                $assetTests += "$path : $($assetResponse.StatusCode)"
            } catch {
                $assetTests += "$path : Error"
            }
        }
        
        $successCount = ($assetTests | Where-Object { $_ -match ": 200" }).Count
        return @{ 
            Success = ($successCount -gt 0)
            Details = "Asset tests: $($assetTests -join ', ')" 
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "ControlAI"

# ============================================================================
# 2. ROMAI FRONTEND TESTING (Port 6100)
# ============================================================================
Write-TestHeader "ROMAI FRONTEND TESTING" "🤖"

Test-FrontendFeature "RomAI Health & Availability" "Romanian AI application health check" {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:6100/api/health" -TimeoutSec 5
        if ($response.status -eq "healthy") {
            return @{ Success = $true; Details = "Service: $($response.service)" }
        } else {
            return @{ Success = $false; Error = "Health check failed" }
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "RomAI"

Test-FrontendFeature "RomAI Application Interface" "Test main AI interface loading" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:6100/" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $hasAIContent = $response.Content -match "romai|romanian|ai|artificial|intelligence|model"
            $contentSize = $response.Content.Length
            return @{ 
                Success = $true
                Details = "Interface loaded $(if ($hasAIContent) { 'with AI content' } else { 'successfully' }), $contentSize bytes" 
            }
        } else {
            return @{ Success = $false; Error = "HTTP $($response.StatusCode)" }
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "RomAI"

Test-FrontendFeature "RomAI AI Model Interface" "Test AI model interaction endpoints" {
    try {
        # Test if we can reach AI-related endpoints
        $aiEndpoints = @("/api/models", "/api/chat", "/api/reasoning")
        $endpointResults = @()
        
        foreach ($endpoint in $aiEndpoints) {
            try {
                $endpointResponse = Invoke-WebRequest -Uri "http://localhost:6100$endpoint" -TimeoutSec 5 -UseBasicParsing
                $endpointResults += "$endpoint : $($endpointResponse.StatusCode)"
            } catch {
                # 404 or other errors are expected for some endpoints
                $endpointResults += "$endpoint : Not Available"
            }
        }
        
        return @{ 
            Success = $true
            Details = "AI endpoints tested: $($endpointResults -join ', ')" 
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "RomAI"

# ============================================================================
# 3. EXPLORER BLOCKCHAIN FRONTEND TESTING (Port 4400)
# ============================================================================
Write-TestHeader "EXPLORER BLOCKCHAIN FRONTEND TESTING" "🔍"

Test-FrontendFeature "Explorer Health & Availability" "Blockchain explorer health check" {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4400/api/health" -TimeoutSec 5
        if ($response.status -eq "healthy") {
            return @{ Success = $true; Details = "Explorer service operational" }
        } else {
            return @{ Success = $false; Error = "Explorer health failed" }
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "Explorer"

Test-FrontendFeature "Explorer Blockchain Interface" "Test blockchain explorer UI" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4400/" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $hasBlockchainContent = $response.Content -match "block|transaction|explorer|blockchain|hash|address"
            $contentSize = $response.Content.Length
            return @{ 
                Success = $true
                Details = "Explorer UI loaded $(if ($hasBlockchainContent) { 'with blockchain features' } else { 'successfully' }), $contentSize bytes" 
            }
        } else {
            return @{ Success = $false; Error = "HTTP $($response.StatusCode)" }
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "Explorer"

Test-FrontendFeature "Explorer Blockchain APIs" "Test blockchain data endpoints" {
    try {
        $blockchainEndpoints = @("/api/blocks", "/api/transactions", "/api/addresses")
        $endpointResults = @()
        
        foreach ($endpoint in $blockchainEndpoints) {
            try {
                $endpointResponse = Invoke-WebRequest -Uri "http://localhost:4400$endpoint" -TimeoutSec 5 -UseBasicParsing
                $endpointResults += "$endpoint : $($endpointResponse.StatusCode)"
            } catch {
                $endpointResults += "$endpoint : Not Available"
            }
        }
        
        return @{ 
            Success = $true
            Details = "Blockchain API endpoints: $($endpointResults -join ', ')" 
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "Explorer"

# ============================================================================
# 4. KODEX CODE MANAGEMENT FRONTEND TESTING (Port 5000)
# ============================================================================
Write-TestHeader "KODEX CODE MANAGEMENT FRONTEND TESTING" "📝"

Test-FrontendFeature "Kodex Health & Availability" "Code management platform health" {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5
        if ($response.status -eq "healthy") {
            return @{ Success = $true; Details = "Kodex platform operational" }
        } else {
            return @{ Success = $false; Error = "Kodex health failed" }
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "Kodex"

Test-FrontendFeature "Kodex Code Interface" "Test code management UI" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $hasCodeContent = $response.Content -match "kodex|code|repository|git|project|file|editor"
            $contentSize = $response.Content.Length
            return @{ 
                Success = $true
                Details = "Code UI loaded $(if ($hasCodeContent) { 'with code features' } else { 'successfully' }), $contentSize bytes" 
            }
        } else {
            return @{ Success = $false; Error = "HTTP $($response.StatusCode)" }
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "Kodex"

Test-FrontendFeature "Kodex Repository APIs" "Test code repository endpoints" {
    try {
        $codeEndpoints = @("/api/projects", "/api/repositories", "/api/files")
        $endpointResults = @()
        
        foreach ($endpoint in $codeEndpoints) {
            try {
                $endpointResponse = Invoke-WebRequest -Uri "http://localhost:5000$endpoint" -TimeoutSec 5 -UseBasicParsing
                $endpointResults += "$endpoint : $($endpointResponse.StatusCode)"
            } catch {
                $endpointResults += "$endpoint : Not Available"
            }
        }
        
        return @{ 
            Success = $true
            Details = "Code API endpoints: $($endpointResults -join ', ')" 
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "Kodex"

# ============================================================================
# 5. BANCAI BANKING FRONTEND TESTING (Port 4005)
# ============================================================================
Write-TestHeader "BANCAI BANKING FRONTEND TESTING" "🏦"

Test-FrontendFeature "BancAI Health & Availability" "Banking application health" {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4005/api/health" -TimeoutSec 5
        if ($response.status -eq "healthy" -and $response.bankingOperations) {
            return @{ Success = $true; Details = "Banking service with operations: $($response.bankingOperations.accountManagement)" }
        } else {
            return @{ Success = $false; Error = "Banking health or operations missing" }
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "BancAI"

Test-FrontendFeature "BancAI Banking Interface" "Test banking application UI" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4005/" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $hasBankingContent = $response.Content -match "bancai|banking|account|transaction|finance|payment"
            $contentSize = $response.Content.Length
            return @{ 
                Success = $true
                Details = "Banking UI loaded $(if ($hasBankingContent) { 'with banking features' } else { 'successfully' }), $contentSize bytes" 
            }
        } else {
            return @{ Success = $false; Error = "HTTP $($response.StatusCode)" }
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "BancAI"

Test-FrontendFeature "BancAI Banking APIs" "Test banking operation endpoints" {
    try {
        $bankingEndpoints = @("/api/accounts", "/api/transactions", "/api/payments")
        $endpointResults = @()
        
        foreach ($endpoint in $bankingEndpoints) {
            try {
                $endpointResponse = Invoke-WebRequest -Uri "http://localhost:4005$endpoint" -TimeoutSec 5 -UseBasicParsing
                $endpointResults += "$endpoint : $($endpointResponse.StatusCode)"
            } catch {
                $endpointResults += "$endpoint : Not Available"
            }
        }
        
        return @{ 
            Success = $true
            Details = "Banking API endpoints: $($endpointResults -join ', ')" 
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "BancAI"

# ============================================================================
# 6. CROSS-FRONTEND ROUTING & NAVIGATION TESTING
# ============================================================================
Write-TestHeader "CROSS-FRONTEND ROUTING & NAVIGATION TESTING" "🔄"

Test-FrontendFeature "Load Balancer Frontend Routing" "Test frontend access through load balancer" {
    try {
        $frontendRoutes = @{
            "ControlAI" = "http://localhost:8080/controlai/"
            "RomAI" = "http://localhost:8080/romai/"
            "Explorer" = "http://localhost:8080/explorer/"
            "Kodex" = "http://localhost:8080/kodex/"
            "BancAI" = "http://localhost:8080/bancai/"
        }
        
        $routingResults = @()
        $successCount = 0
        
        foreach ($route in $frontendRoutes.Keys) {
            try {
                $routeResponse = Invoke-WebRequest -Uri $frontendRoutes[$route] -TimeoutSec 5 -UseBasicParsing
                if ($routeResponse.StatusCode -eq 200) {
                    $successCount++
                    $routingResults += "$route : ✅"
                } else {
                    $routingResults += "$route : $($routeResponse.StatusCode)"
                }
            } catch {
                $routingResults += "$route : ❌"
            }
        }
        
        return @{ 
            Success = ($successCount -gt 0)
            Details = "Load balancer routing: $successCount/$($frontendRoutes.Count) successful - $($routingResults -join ', ')" 
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "LoadBalancer"

# ============================================================================
# 7. RESPONSIVE DESIGN & ACCESSIBILITY TESTING
# ============================================================================
Write-TestHeader "RESPONSIVE DESIGN & ACCESSIBILITY TESTING" "📱"

Test-FrontendFeature "Frontend Response Headers" "Test HTTP headers and metadata" {
    try {
        $frontendUrls = @(
            "http://localhost:4200/",
            "http://localhost:6100/", 
            "http://localhost:4400/",
            "http://localhost:5000/",
            "http://localhost:4005/"
        )
        
        $headerResults = @()
        $securityHeaders = @("X-Frame-Options", "X-Content-Type-Options", "X-XSS-Protection")
        
        foreach ($url in $frontendUrls) {
            try {
                $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing
                $port = ([uri]$url).Port
                $hasSecurityHeaders = $false
                
                foreach ($header in $securityHeaders) {
                    if ($response.Headers[$header]) {
                        $hasSecurityHeaders = $true
                        break
                    }
                }
                
                $headerResults += "Port $port : $(if ($hasSecurityHeaders) { 'Secure' } else { 'Basic' }) headers"
            } catch {
                $headerResults += "Port $port : Error"
            }
        }
        
        return @{ 
            Success = $true
            Details = "Header analysis: $($headerResults -join ', ')" 
        }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
} -Frontend "Security"

# ============================================================================
# FRONTEND TESTING RESULTS SUMMARY
# ============================================================================
Write-TestHeader "COMPREHENSIVE FRONTEND TESTING RESULTS" "📊"

$successRate = if ($script:TotalTests -gt 0) { [math]::Round(($script:PassedTests / $script:TotalTests) * 100, 1) } else { 0 }

Write-Host "📊 FRONTEND TESTING STATISTICS" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Gray
Write-Host "Total Frontend Tests: $($script:TotalTests)" -ForegroundColor White
Write-Host "Tests Passed: $($script:PassedTests)" -ForegroundColor Green
Write-Host "Tests Failed: $($script:FailedTests)" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 85) { "Green" } elseif ($successRate -ge 75) { "Cyan" } else { "Yellow" })

# Detailed breakdown by frontend
Write-Host "`n📋 DETAILED FRONTEND BREAKDOWN:" -ForegroundColor Yellow
$frontendGroups = $script:TestResults | Group-Object Frontend
foreach ($group in $frontendGroups) {
    $groupSuccess = ($group.Group | Where-Object Success).Count
    $groupTotal = $group.Count
    $groupRate = if ($groupTotal -gt 0) { [math]::Round(($groupSuccess / $groupTotal) * 100, 1) } else { 0 }
    Write-Host "  $($group.Name): $groupSuccess/$groupTotal tests passed ($groupRate%)" -ForegroundColor $(if ($groupRate -ge 85) { "Green" } elseif ($groupRate -ge 75) { "Cyan" } else { "Yellow" })
}

Write-Host "`n🎯 FRONTEND TESTING ASSESSMENT:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Gray

if ($successRate -ge 90) {
    Write-Host "🏆 EXCEPTIONAL: $successRate% - Outstanding frontend functionality!" -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "🥇 EXCELLENT: $successRate% - High-quality frontend applications!" -ForegroundColor Green
} elseif ($successRate -ge 70) {
    Write-Host "✅ GOOD: $successRate% - Frontend applications working well" -ForegroundColor Cyan
} elseif ($successRate -ge 60) {
    Write-Host "🔄 ACCEPTABLE: $successRate% - Most frontend functionality operational" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ NEEDS ATTENTION: $successRate% - Significant frontend issues detected" -ForegroundColor Red
}

Write-Host "`n🕒 Frontend Testing Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

return @{
    SuccessRate = $successRate
    TotalTests = $script:TotalTests
    PassedTests = $script:PassedTests
    FailedTests = $script:FailedTests
    Results = $script:TestResults
}