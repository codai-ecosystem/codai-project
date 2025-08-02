#!/usr/bin/env pwsh
# RomAI Production Deployment Verification Script
# Comprehensive testing for romcp.ro deployment

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("quick", "full", "performance", "security")]
    [string]$TestSuite = "quick",
    
    [Parameter(Mandatory = $false)]
    [string]$Domain = "romcp.ro",
    
    [Parameter(Mandatory = $false)]
    [switch]$Verbose = $false
)

# Configuration
$ENDPOINTS = @{
    "Frontend"    = @{ Url = "https://$Domain"; ExpectedStatus = 200; Type = "UI" }
    "API Health"  = @{ Url = "https://$Domain/api/health"; ExpectedStatus = 200; Type = "API" }
    "API Gateway" = @{ Url = "https://api.$Domain/health"; ExpectedStatus = 200; Type = "API" }
    "CBD Service" = @{ Url = "https://cbd.$Domain/health"; ExpectedStatus = 200; Type = "API" }
    "MCP Server"  = @{ Url = "https://mcp.$Domain/health"; ExpectedStatus = 200; Type = "API" }
    "Dashboard"   = @{ Url = "https://$Domain/dashboard"; ExpectedStatus = 200; Type = "UI" }
    "MCP Interface" = @{ Url = "https://$Domain/mcp"; ExpectedStatus = 200; Type = "UI" }
}

$PERFORMANCE_TESTS = @{
    "Frontend Load Time" = @{ Url = "https://$Domain"; MaxTime = 3000 }
    "API Response Time"  = @{ Url = "https://$Domain/api/health"; MaxTime = 500 }
    "Gateway Response"   = @{ Url = "https://api.$Domain/health"; MaxTime = 1000 }
}

$SECURITY_TESTS = @{
    "SSL Certificate" = "https://$Domain"
    "Security Headers" = "https://$Domain"
    "API Security"    = "https://api.$Domain"
}

# Colors
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"
$Magenta = "Magenta"

function Write-TestResult {
    param(
        [string]$Test,
        [bool]$Success,
        [string]$Message = "",
        [string]$Details = ""
    )
    
    $status = if ($Success) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($Success) { $Green } else { $Red }
    
    Write-Host "[$status] $Test" -ForegroundColor $color
    if ($Message) {
        Write-Host "    $Message" -ForegroundColor $(if ($Success) { $Blue } else { $Yellow })
    }
    if ($Details -and $Verbose) {
        Write-Host "    Details: $Details" -ForegroundColor $Cyan
    }
}

function Test-Endpoint {
    param(
        [string]$Name,
        [hashtable]$Config
    )
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Config.Url -TimeoutSec 15 -UseBasicParsing
        $stopwatch.Stop()
        
        $responseTime = $stopwatch.ElapsedMilliseconds
        $success = $response.StatusCode -eq $Config.ExpectedStatus
        
        if ($success) {
            Write-TestResult -Test $Name -Success $true -Message "Status: $($response.StatusCode) | Time: ${responseTime}ms"
        } else {
            Write-TestResult -Test $Name -Success $false -Message "Expected: $($Config.ExpectedStatus), Got: $($response.StatusCode)"
        }
        
        return @{
            Success = $success
            StatusCode = $response.StatusCode
            ResponseTime = $responseTime
            Headers = $response.Headers
        }
    }
    catch {
        Write-TestResult -Test $Name -Success $false -Message "Error: $($_.Exception.Message)"
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

function Test-Performance {
    param(
        [string]$Name,
        [hashtable]$Config
    )
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Config.Url -TimeoutSec 30 -UseBasicParsing
        $stopwatch.Stop()
        
        $responseTime = $stopwatch.ElapsedMilliseconds
        $success = $responseTime -le $Config.MaxTime
        
        if ($success) {
            Write-TestResult -Test $Name -Success $true -Message "Response time: ${responseTime}ms (limit: $($Config.MaxTime)ms)"
        } else {
            Write-TestResult -Test $Name -Success $false -Message "Response time: ${responseTime}ms exceeds limit: $($Config.MaxTime)ms"
        }
        
        return @{
            Success = $success
            ResponseTime = $responseTime
        }
    }
    catch {
        Write-TestResult -Test $Name -Success $false -Message "Error: $($_.Exception.Message)"
        return @{ Success = $false }
    }
}

function Test-SSLCertificate {
    param([string]$Url)
    
    try {
        $uri = [System.Uri]$Url
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($uri.Host, 443)
        
        $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream())
        $sslStream.AuthenticateAsClient($uri.Host)
        
        $cert = $sslStream.RemoteCertificate
        $certExpiry = [DateTime]::Parse($cert.GetExpirationDateString())
        $daysUntilExpiry = ($certExpiry - (Get-Date)).Days
        
        $sslStream.Close()
        $tcpClient.Close()
        
        $success = $daysUntilExpiry -gt 30
        
        if ($success) {
            Write-TestResult -Test "SSL Certificate" -Success $true -Message "Valid until: $($certExpiry.ToString('yyyy-MM-dd')) ($daysUntilExpiry days)"
        } else {
            Write-TestResult -Test "SSL Certificate" -Success $false -Message "Expires soon: $($certExpiry.ToString('yyyy-MM-dd')) ($daysUntilExpiry days)"
        }
        
        return @{
            Success = $success
            Expiry = $certExpiry
            DaysUntilExpiry = $daysUntilExpiry
        }
    }
    catch {
        Write-TestResult -Test "SSL Certificate" -Success $false -Message "Error: $($_.Exception.Message)"
        return @{ Success = $false }
    }
}

function Test-SecurityHeaders {
    param([string]$Url)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing
        
        $requiredHeaders = @(
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Strict-Transport-Security"
        )
        
        $missingHeaders = @()
        foreach ($header in $requiredHeaders) {
            if (-not $response.Headers.ContainsKey($header)) {
                $missingHeaders += $header
            }
        }
        
        $success = $missingHeaders.Count -eq 0
        
        if ($success) {
            Write-TestResult -Test "Security Headers" -Success $true -Message "All required headers present"
        } else {
            Write-TestResult -Test "Security Headers" -Success $false -Message "Missing: $($missingHeaders -join ', ')"
        }
        
        return @{
            Success = $success
            MissingHeaders = $missingHeaders
            Headers = $response.Headers
        }
    }
    catch {
        Write-TestResult -Test "Security Headers" -Success $false -Message "Error: $($_.Exception.Message)"
        return @{ Success = $false }
    }
}

function Test-APIFunctionality {
    Write-Host "`n🔧 Testing API Functionality..." -ForegroundColor $Cyan
    
    # Test Romanian text analysis
    try {
        $body = @{
            text = "Salut! Cum te numești?"
            analysis_type = "sentiment"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "https://api.$Domain/analyze" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
        Write-TestResult -Test "Romanian Text Analysis" -Success $true -Message "API responding correctly"
    }
    catch {
        Write-TestResult -Test "Romanian Text Analysis" -Success $false -Message "Error: $($_.Exception.Message)"
    }
    
    # Test MCP endpoints
    try {
        $response = Invoke-RestMethod -Uri "https://mcp.$Domain/tools" -Method Get -TimeoutSec 10
        Write-TestResult -Test "MCP Tools Endpoint" -Success $true -Message "MCP server responding"
    }
    catch {
        Write-TestResult -Test "MCP Tools Endpoint" -Success $false -Message "Error: $($_.Exception.Message)"
    }
    
    # Test CBD database
    try {
        $response = Invoke-RestMethod -Uri "https://cbd.$Domain/stats" -Method Get -TimeoutSec 10
        Write-TestResult -Test "CBD Database Stats" -Success $true -Message "CBD service operational"
    }
    catch {
        Write-TestResult -Test "CBD Database Stats" -Success $false -Message "Error: $($_.Exception.Message)"
    }
}

function Show-TestSummary {
    param(
        [hashtable]$Results
    )
    
    Write-Host "`n📊 Test Summary" -ForegroundColor $Cyan
    Write-Host "================" -ForegroundColor $Cyan
    
    $totalTests = $Results.Keys.Count
    $passedTests = ($Results.Values | Where-Object { $_.Success -eq $true }).Count
    $failedTests = $totalTests - $passedTests
    
    Write-Host "Total Tests: $totalTests" -ForegroundColor $Blue
    Write-Host "Passed: $passedTests" -ForegroundColor $Green
    Write-Host "Failed: $failedTests" -ForegroundColor $(if ($failedTests -eq 0) { $Green } else { $Red })
    
    $successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { $Green } else { if ($successRate -ge 80) { $Yellow } else { $Red } })
    
    if ($failedTests -eq 0) {
        Write-Host "`n🎉 All tests passed! RomAI deployment is healthy." -ForegroundColor $Green
    } else {
        Write-Host "`n⚠️ Some tests failed. Please review the issues above." -ForegroundColor $Yellow
    }
}

# Main execution
Write-Host "🧪 RomAI Production Deployment Verification" -ForegroundColor $Magenta
Write-Host "Domain: $Domain | Test Suite: $TestSuite" -ForegroundColor $Blue
Write-Host "=============================================" -ForegroundColor $Magenta

$results = @{}

# Basic endpoint tests
Write-Host "`n🌐 Testing Endpoints..." -ForegroundColor $Cyan
foreach ($endpoint in $ENDPOINTS.GetEnumerator()) {
    $result = Test-Endpoint -Name $endpoint.Key -Config $endpoint.Value
    $results[$endpoint.Key] = $result
}

# Performance tests
if ($TestSuite -eq "full" -or $TestSuite -eq "performance") {
    Write-Host "`n⚡ Performance Testing..." -ForegroundColor $Cyan
    foreach ($test in $PERFORMANCE_TESTS.GetEnumerator()) {
        $result = Test-Performance -Name $test.Key -Config $test.Value
        $results["Perf: $($test.Key)"] = $result
    }
}

# Security tests
if ($TestSuite -eq "full" -or $TestSuite -eq "security") {
    Write-Host "`n🔒 Security Testing..." -ForegroundColor $Cyan
    
    $sslResult = Test-SSLCertificate -Url "https://$Domain"
    $results["SSL Certificate"] = $sslResult
    
    $headersResult = Test-SecurityHeaders -Url "https://$Domain"
    $results["Security Headers"] = $headersResult
}

# API functionality tests
if ($TestSuite -eq "full") {
    Test-APIFunctionality
}

# Show summary
Show-TestSummary -Results $results

# Generate report file
$reportFile = "romai-deployment-verification-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$reportData = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    domain = $Domain
    testSuite = $TestSuite
    results = $results
    summary = @{
        totalTests = $results.Keys.Count
        passedTests = ($results.Values | Where-Object { $_.Success -eq $true }).Count
        failedTests = ($results.Values | Where-Object { $_.Success -eq $false }).Count
    }
}

$reportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportFile -Encoding UTF8
Write-Host "`n📄 Report saved to: $reportFile" -ForegroundColor $Blue

# Exit with appropriate code
$exitCode = if (($results.Values | Where-Object { $_.Success -eq $false }).Count -eq 0) { 0 } else { 1 }
exit $exitCode
