# ROMAI Ultimate MCP Server - Load Balancer Testing Script
# Comprehensive validation of NGINX configuration and load balancing

Write-Host "🚀 ROMAI Ultimate MCP Server - Load Balancer Testing" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Configuration
$NGINX_CONFIG_PATH = "e:\GitHub\romai\packages\romai-mcp\infrastructure\nginx"
$DOCKER_COMPOSE_PATH = "e:\GitHub\romai\packages\romai-mcp"
$TEST_RESULTS = @()

function Test-NginxConfiguration {
    Write-Host "`n📋 Testing NGINX Configuration..." -ForegroundColor Yellow
    
    # Test 1: NGINX Configuration Syntax
    Write-Host "  ✓ Testing NGINX syntax..." -ForegroundColor Green
    $nginxTest = docker run --rm -v "${NGINX_CONFIG_PATH}:/etc/nginx" nginx:alpine nginx -t 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $TEST_RESULTS += @{
            Test = "NGINX Syntax"
            Status = "PASS"
            Details = "Configuration syntax is valid"
        }
        Write-Host "    ✅ NGINX configuration syntax: VALID" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "NGINX Syntax"
            Status = "FAIL"
            Details = $nginxTest
        }
        Write-Host "    ❌ NGINX configuration syntax: INVALID" -ForegroundColor Red
        Write-Host "    Error: $nginxTest" -ForegroundColor Red
    }
    
    # Test 2: SSL/TLS Configuration
    Write-Host "  ✓ Testing SSL/TLS configuration..." -ForegroundColor Green
    $sslConfig = Get-Content "$NGINX_CONFIG_PATH\nginx.conf" | Select-String -Pattern "ssl_"
    
    if ($sslConfig.Count -gt 0) {
        $TEST_RESULTS += @{
            Test = "SSL/TLS Config"
            Status = "PASS"
            Details = "SSL/TLS directives found: $($sslConfig.Count)"
        }
        Write-Host "    ✅ SSL/TLS configuration: PRESENT ($($sslConfig.Count) directives)" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "SSL/TLS Config"
            Status = "WARN"
            Details = "No SSL/TLS directives found"
        }
        Write-Host "    ⚠️  SSL/TLS configuration: NOT FOUND" -ForegroundColor Yellow
    }
    
    # Test 3: Security Headers
    Write-Host "  ✓ Testing security headers..." -ForegroundColor Green
    $securityHeaders = @(
        "X-Frame-Options",
        "X-Content-Type-Options",
        "X-XSS-Protection",
        "Strict-Transport-Security",
        "Content-Security-Policy"
    )
    
    $foundHeaders = 0
    foreach ($header in $securityHeaders) {
        $headerPresent = Get-Content "$NGINX_CONFIG_PATH\nginx.conf" | Select-String -Pattern $header
        if ($headerPresent) {
            $foundHeaders++
        }
    }
    
    if ($foundHeaders -ge 4) {
        $TEST_RESULTS += @{
            Test = "Security Headers"
            Status = "PASS"
            Details = "$foundHeaders/$($securityHeaders.Count) security headers configured"
        }
        Write-Host "    ✅ Security headers: $foundHeaders/$($securityHeaders.Count) configured" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "Security Headers"
            Status = "WARN"
            Details = "Only $foundHeaders/$($securityHeaders.Count) security headers configured"
        }
        Write-Host "    ⚠️  Security headers: Only $foundHeaders/$($securityHeaders.Count) configured" -ForegroundColor Yellow
    }
}

function Test-LoadBalancingConfiguration {
    Write-Host "`n⚖️  Testing Load Balancing Configuration..." -ForegroundColor Yellow
    
    # Test 1: Upstream Configuration
    Write-Host "  ✓ Testing upstream configuration..." -ForegroundColor Green
    $upstreamConfig = Get-Content "$NGINX_CONFIG_PATH\nginx.conf" | Select-String -Pattern "upstream"
    
    if ($upstreamConfig) {
        $TEST_RESULTS += @{
            Test = "Upstream Config"
            Status = "PASS"
            Details = "Upstream blocks found"
        }
        Write-Host "    ✅ Upstream configuration: FOUND" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "Upstream Config"
            Status = "FAIL"
            Details = "No upstream blocks found"
        }
        Write-Host "    ❌ Upstream configuration: NOT FOUND" -ForegroundColor Red
    }
    
    # Test 2: Health Check Configuration
    Write-Host "  ✓ Testing health check configuration..." -ForegroundColor Green
    $healthCheck = Get-Content "$NGINX_CONFIG_PATH\nginx.conf" | Select-String -Pattern "health"
    
    if ($healthCheck) {
        $TEST_RESULTS += @{
            Test = "Health Checks"
            Status = "PASS"
            Details = "Health check endpoints configured"
        }
        Write-Host "    ✅ Health checks: CONFIGURED" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "Health Checks"
            Status = "WARN"
            Details = "No health check configuration found"
        }
        Write-Host "    ⚠️  Health checks: NOT CONFIGURED" -ForegroundColor Yellow
    }
    
    # Test 3: Rate Limiting
    Write-Host "  ✓ Testing rate limiting configuration..." -ForegroundColor Green
    $rateLimit = Get-Content "$NGINX_CONFIG_PATH\nginx.conf" | Select-String -Pattern "limit_req"
    
    if ($rateLimit) {
        $TEST_RESULTS += @{
            Test = "Rate Limiting"
            Status = "PASS"
            Details = "Rate limiting configured"
        }
        Write-Host "    ✅ Rate limiting: CONFIGURED" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "Rate Limiting"
            Status = "WARN"
            Details = "No rate limiting found"
        }
        Write-Host "    ⚠️  Rate limiting: NOT CONFIGURED" -ForegroundColor Yellow
    }
}

function Test-DockerComposeConfiguration {
    Write-Host "`n🐳 Testing Docker Compose Configuration..." -ForegroundColor Yellow
    
    # Test 1: Docker Compose Syntax
    Write-Host "  ✓ Testing Docker Compose syntax..." -ForegroundColor Green
    
    try {
        Set-Location $DOCKER_COMPOSE_PATH
        $composeTest = docker-compose -f docker-compose.production.yml config 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $TEST_RESULTS += @{
                Test = "Docker Compose Syntax"
                Status = "PASS"
                Details = "Production compose file syntax is valid"
            }
            Write-Host "    ✅ Docker Compose syntax: VALID" -ForegroundColor Green
        } else {
            $TEST_RESULTS += @{
                Test = "Docker Compose Syntax"
                Status = "FAIL"
                Details = $composeTest
            }
            Write-Host "    ❌ Docker Compose syntax: INVALID" -ForegroundColor Red
        }
    } catch {
        $TEST_RESULTS += @{
            Test = "Docker Compose Syntax"
            Status = "FAIL"
            Details = $_.Exception.Message
        }
        Write-Host "    ❌ Docker Compose test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 2: Service Dependencies
    Write-Host "  ✓ Testing service dependencies..." -ForegroundColor Green
    $composeContent = Get-Content "$DOCKER_COMPOSE_PATH\docker-compose.production.yml" -Raw
    
    if ($composeContent -match "depends_on") {
        $TEST_RESULTS += @{
            Test = "Service Dependencies"
            Status = "PASS"
            Details = "Service dependencies configured"
        }
        Write-Host "    ✅ Service dependencies: CONFIGURED" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "Service Dependencies"
            Status = "WARN"
            Details = "No service dependencies found"
        }
        Write-Host "    ⚠️  Service dependencies: NOT CONFIGURED" -ForegroundColor Yellow
    }
    
    # Test 3: Network Configuration
    Write-Host "  ✓ Testing network configuration..." -ForegroundColor Green
    if ($composeContent -match "networks:") {
        $TEST_RESULTS += @{
            Test = "Network Config"
            Status = "PASS"
            Details = "Custom networks configured"
        }
        Write-Host "    ✅ Network configuration: PRESENT" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "Network Config"
            Status = "WARN"
            Details = "No custom networks configured"
        }
        Write-Host "    ⚠️  Network configuration: DEFAULT ONLY" -ForegroundColor Yellow
    }
}

function Test-ContainerHealthchecks {
    Write-Host "`n🏥 Testing Container Health Checks..." -ForegroundColor Yellow
    
    # Test if containers have health checks defined
    Write-Host "  ✓ Testing health check definitions..." -ForegroundColor Green
    $composeContent = Get-Content "$DOCKER_COMPOSE_PATH\docker-compose.production.yml" -Raw
    
    if ($composeContent -match "healthcheck:") {
        $healthCheckCount = ($composeContent | Select-String -Pattern "healthcheck:" -AllMatches).Matches.Count
        $TEST_RESULTS += @{
            Test = "Health Check Definitions"
            Status = "PASS"
            Details = "$healthCheckCount services have health checks"
        }
        Write-Host "    ✅ Health checks: $healthCheckCount services configured" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "Health Check Definitions"
            Status = "WARN"
            Details = "No health checks defined"
        }
        Write-Host "    ⚠️  Health checks: NOT DEFINED" -ForegroundColor Yellow
    }
}

function Test-SecurityConfiguration {
    Write-Host "`n🔒 Testing Security Configuration..." -ForegroundColor Yellow
    
    # Test 1: Non-root User
    Write-Host "  ✓ Testing non-root user configuration..." -ForegroundColor Green
    $dockerfileContent = Get-Content "$DOCKER_COMPOSE_PATH\Dockerfile" -Raw
    
    if ($dockerfileContent -match "USER.*[^root]") {
        $TEST_RESULTS += @{
            Test = "Non-root User"
            Status = "PASS"
            Details = "Non-root user configured in Dockerfile"
        }
        Write-Host "    ✅ Non-root user: CONFIGURED" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "Non-root User"
            Status = "WARN"
            Details = "Running as root user"
        }
        Write-Host "    ⚠️  Non-root user: NOT CONFIGURED" -ForegroundColor Yellow
    }
    
    # Test 2: Secret Management
    Write-Host "  ✓ Testing secret management..." -ForegroundColor Green
    $composeContent = Get-Content "$DOCKER_COMPOSE_PATH\docker-compose.production.yml" -Raw
    
    if ($composeContent -match "secrets:" -or $composeContent -match "_FILE") {
        $TEST_RESULTS += @{
            Test = "Secret Management"
            Status = "PASS"
            Details = "Secret management configured"
        }
        Write-Host "    ✅ Secret management: CONFIGURED" -ForegroundColor Green
    } else {
        $TEST_RESULTS += @{
            Test = "Secret Management"
            Status = "WARN"
            Details = "No secret management found"
        }
        Write-Host "    ⚠️  Secret management: NOT CONFIGURED" -ForegroundColor Yellow
    }
}

function Generate-TestReport {
    Write-Host "`n📊 Test Results Summary" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    
    $passCount = ($TEST_RESULTS | Where-Object { $_.Status -eq "PASS" }).Count
    $warnCount = ($TEST_RESULTS | Where-Object { $_.Status -eq "WARN" }).Count
    $failCount = ($TEST_RESULTS | Where-Object { $_.Status -eq "FAIL" }).Count
    $totalTests = $TEST_RESULTS.Count
    
    Write-Host "`nTotal Tests: $totalTests" -ForegroundColor White
    Write-Host "✅ Passed: $passCount" -ForegroundColor Green
    Write-Host "⚠️  Warnings: $warnCount" -ForegroundColor Yellow
    Write-Host "❌ Failed: $failCount" -ForegroundColor Red
    
    $successRate = [math]::Round(($passCount / $totalTests) * 100, 1)
    Write-Host "`nSuccess Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })
    
    Write-Host "`n📋 Detailed Results:" -ForegroundColor White
    foreach ($result in $TEST_RESULTS) {
        $statusColor = switch ($result.Status) {
            "PASS" { "Green" }
            "WARN" { "Yellow" }
            "FAIL" { "Red" }
        }
        
        $statusIcon = switch ($result.Status) {
            "PASS" { "✅" }
            "WARN" { "⚠️ " }
            "FAIL" { "❌" }
        }
        
        Write-Host "  $statusIcon $($result.Test): $($result.Details)" -ForegroundColor $statusColor
    }
    
    # Quality Assessment
    Write-Host "`n🎯 Load Balancer Quality Assessment:" -ForegroundColor Cyan
    if ($successRate -ge 90) {
        Write-Host "  🌟 EXCELLENT - Production Ready" -ForegroundColor Green
    } elseif ($successRate -ge 80) {
        Write-Host "  ✅ GOOD - Minor improvements needed" -ForegroundColor Green
    } elseif ($successRate -ge 70) {
        Write-Host "  ⚠️  FAIR - Several improvements needed" -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ POOR - Major improvements required" -ForegroundColor Red
    }
    
    # Save report to file
    $reportPath = "$DOCKER_COMPOSE_PATH\load-balancer-test-report.json"
    $reportData = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        summary = @{
            totalTests = $totalTests
            passed = $passCount
            warnings = $warnCount
            failed = $failCount
            successRate = $successRate
        }
        results = $TEST_RESULTS
    }
    
    $reportData | ConvertTo-Json -Depth 3 | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "`n💾 Test report saved to: $reportPath" -ForegroundColor Blue
    
    return $successRate
}

# Main execution
try {
    $startTime = Get-Date
    
    # Run all tests
    Test-NginxConfiguration
    Test-LoadBalancingConfiguration
    Test-DockerComposeConfiguration
    Test-ContainerHealthchecks
    Test-SecurityConfiguration
    
    # Generate report
    $successRate = Generate-TestReport
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host "`n⏱️  Test execution completed in $([math]::Round($duration.TotalSeconds, 1)) seconds" -ForegroundColor Blue
    
    # Return appropriate exit code
    if ($successRate -ge 80) {
        Write-Host "`n🎉 Load balancer testing completed successfully!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n⚠️  Load balancer testing completed with issues. Please review the results." -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host "`n❌ Error during load balancer testing: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}
