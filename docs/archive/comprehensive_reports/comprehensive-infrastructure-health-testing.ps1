# 🧪 CODAI Ecosystem - Comprehensive Infrastructure & Container Health Testing
# Based on Microsoft Testing Best Practices & Industry Standards
# Date: August 2025

param(
    [switch]$Detailed = $false,
    [switch]$ExportResults = $true,
    [string]$OutputPath = ".\test-results"
)

Write-Host "🚀 CODAI ECOSYSTEM - COMPREHENSIVE INFRASTRUCTURE TESTING" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "⏰ Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host ""

# Initialize test results
$testResults = @()
$testCategories = @(
    "Container Health & Status",
    "Port Accessibility & Networking", 
    "Resource Utilization & Performance",
    "Service Discovery & DNS Resolution",
    "Docker Orchestration & Compose",
    "Network Topology & Communication",
    "Volume Mounts & Data Persistence",
    "Container Security & Compliance"
)

function Add-TestResult {
    param($Category, $TestName, $Status, $Details, $ExpectedValue, $ActualValue, $Duration)
    
    $script:testResults += [PSCustomObject]@{
        Category = $Category
        TestName = $TestName
        Status = $Status
        Details = $Details
        Expected = $ExpectedValue
        Actual = $ActualValue
        Duration = $Duration
        Timestamp = Get-Date
    }
    
    $statusColor = switch($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "White" }
    }
    
    $statusIcon = switch($Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "WARN" { "⚠️" }
        default { "ℹ️" }
    }
    
    Write-Host "  $statusIcon $TestName" -ForegroundColor $statusColor
    if ($Detailed -and $Details) {
        Write-Host "    📋 $Details" -ForegroundColor Gray
    }
}

# =============================================================================
# 1. CONTAINER HEALTH & STATUS TESTING
# =============================================================================
Write-Host "📦 1. CONTAINER HEALTH & STATUS TESTING" -ForegroundColor Yellow
Write-Host "-" * 50

try {
    # Get all containers
    $containers = docker ps -a --format "{{.Names}},{{.Status}},{{.Ports}}" | ForEach-Object {
        $parts = $_ -split ","
        [PSCustomObject]@{
            Name = $parts[0]
            Status = $parts[1]
            Ports = if($parts[2]) { $parts[2] } else { "No ports" }
        }
    }
    
    # Test container count
    $expectedContainers = 23
    $actualContainers = $containers.Count
    $containerCountStatus = if($actualContainers -ge $expectedContainers) { "PASS" } else { "FAIL" }
    Add-TestResult "Container Health & Status" "Total Container Count" $containerCountStatus "Expected: >= $expectedContainers, Found: $actualContainers" $expectedContainers $actualContainers

    # Test individual container health
    foreach ($container in $containers) {
        $isHealthy = $container.Status -match "healthy|Up"
        $status = if($isHealthy) { "PASS" } else { "FAIL" }
        Add-TestResult "Container Health & Status" "Container: $($container.Name)" $status $container.Status "Healthy/Up" $container.Status
    }
    
    # Test for any exited containers
    $exitedContainers = $containers | Where-Object { $_.Status -match "Exited" }
    if ($exitedContainers.Count -eq 0) {
        Add-TestResult "Container Health & Status" "No Exited Containers" "PASS" "All containers running" 0 0
    } else {
        Add-TestResult "Container Health & Status" "Exited Containers Found" "FAIL" "$($exitedContainers.Count) containers exited" 0 $exitedContainers.Count
    }
    
} catch {
    Add-TestResult "Container Health & Status" "Container Status Check" "FAIL" $_.Exception.Message
}

# =============================================================================
# 2. PORT ACCESSIBILITY & NETWORKING TESTING  
# =============================================================================
Write-Host "`n🔌 2. PORT ACCESSIBILITY & NETWORKING TESTING" -ForegroundColor Yellow
Write-Host "-" * 50

$criticalPorts = @(
    @{Port=8180; Service="CBD Database"; Protocol="HTTP"},
    @{Port=4950; Service="MemorAI MCP"; Protocol="HTTP"},
    @{Port=8080; Service="Nginx Load Balancer"; Protocol="HTTP"},
    @{Port=8081; Service="SSL Proxy HTTP"; Protocol="HTTP"},
    @{Port=8443; Service="SSL Proxy HTTPS"; Protocol="HTTPS"},
    @{Port=4500; Service="GraphQL API"; Protocol="HTTP"},
    @{Port=8006; Service="MemorAI Frontend"; Protocol="HTTP"},
    @{Port=8120; Service="BancAI Frontend"; Protocol="HTTP"},
    @{Port=4300; Service="PostgreSQL"; Protocol="TCP"},
    @{Port=8020; Service="Redis Cache"; Protocol="TCP"}
)

foreach ($portTest in $criticalPorts) {
    try {
        $startTime = Get-Date
        
        if ($portTest.Protocol -eq "TCP") {
            # Test TCP connection
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $connection = $tcpClient.BeginConnect("localhost", $portTest.Port, $null, $null)
            $success = $connection.AsyncWaitHandle.WaitOne(3000, $false)
            $tcpClient.Close()
            
            $duration = (Get-Date) - $startTime
            if ($success) {
                Add-TestResult "Port Accessibility & Networking" "Port $($portTest.Port) ($($portTest.Service))" "PASS" "TCP connection successful" "Accessible" "Accessible" $duration.TotalMilliseconds
            } else {
                Add-TestResult "Port Accessibility & Networking" "Port $($portTest.Port) ($($portTest.Service))" "FAIL" "TCP connection failed" "Accessible" "Not accessible" $duration.TotalMilliseconds
            }
        } else {
            # Test HTTP/HTTPS endpoint
            $uri = "$($portTest.Protocol.ToLower())://localhost:$($portTest.Port)"
            try {
                $response = Invoke-WebRequest -Uri $uri -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
                $duration = (Get-Date) - $startTime
                Add-TestResult "Port Accessibility & Networking" "Port $($portTest.Port) ($($portTest.Service))" "PASS" "HTTP Status: $($response.StatusCode)" "200-299" $response.StatusCode $duration.TotalMilliseconds
            } catch {
                $duration = (Get-Date) - $startTime
                if ($_.Exception.Response.StatusCode) {
                    $statusCode = [int]$_.Exception.Response.StatusCode
                    if ($statusCode -ge 200 -and $statusCode -lt 400) {
                        Add-TestResult "Port Accessibility & Networking" "Port $($portTest.Port) ($($portTest.Service))" "PASS" "HTTP Status: $statusCode" "200-399" $statusCode $duration.TotalMilliseconds
                    } else {
                        Add-TestResult "Port Accessibility & Networking" "Port $($portTest.Port) ($($portTest.Service))" "WARN" "HTTP Status: $statusCode" "200-299" $statusCode $duration.TotalMilliseconds
                    }
                } else {
                    Add-TestResult "Port Accessibility & Networking" "Port $($portTest.Port) ($($portTest.Service))" "FAIL" $_.Exception.Message "Accessible" "Connection failed" $duration.TotalMilliseconds
                }
            }
        }
    } catch {
        Add-TestResult "Port Accessibility & Networking" "Port $($portTest.Port) ($($portTest.Service))" "FAIL" $_.Exception.Message
    }
}

# =============================================================================
# GENERATE COMPREHENSIVE TEST REPORT
# =============================================================================
Write-Host "`n📊 GENERATING COMPREHENSIVE TEST REPORT" -ForegroundColor Cyan
Write-Host "=" * 80

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object Status -eq "PASS").Count  
$failedTests = ($testResults | Where-Object Status -eq "FAIL").Count
$warnTests = ($testResults | Where-Object Status -eq "WARN").Count

$successRate = if($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

Write-Host "`n🎯 INFRASTRUCTURE TESTING SUMMARY:" -ForegroundColor Yellow
Write-Host "   Total Tests Executed: $totalTests" -ForegroundColor White
Write-Host "   ✅ Passed: $passedTests ($([math]::Round(($passedTests / $totalTests) * 100, 1))%)" -ForegroundColor Green
Write-Host "   ❌ Failed: $failedTests ($([math]::Round(($failedTests / $totalTests) * 100, 1))%)" -ForegroundColor Red  
Write-Host "   ⚠️  Warnings: $warnTests ($([math]::Round(($warnTests / $totalTests) * 100, 1))%)" -ForegroundColor Yellow
Write-Host "   📈 Overall Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 80) { "Green" } elseif ($successRate -gt 60) { "Yellow" } else { "Red" })

# Export results if requested
if ($ExportResults) {
    if (-not (Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $jsonFile = Join-Path $OutputPath "infrastructure-test-results-$timestamp.json"
    
    $testResults | ConvertTo-Json -Depth 3 | Out-File -FilePath $jsonFile -Encoding UTF8
    
    Write-Host "`n💾 Results exported to: $jsonFile" -ForegroundColor Green
}

# Show failed tests
if ($failedTests -gt 0) {
    Write-Host "`n❌ FAILED TESTS REQUIRING ATTENTION:" -ForegroundColor Red
    $testResults | Where-Object Status -eq "FAIL" | ForEach-Object {
        Write-Host "   • $($_.Category) - $($_.TestName): $($_.Details)" -ForegroundColor Red
    }
}

Write-Host "`n⏰ Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "🎉 Infrastructure testing complete!" -ForegroundColor Cyan