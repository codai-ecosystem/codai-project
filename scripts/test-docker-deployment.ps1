# CODAI Ecosystem Docker Deployment Test Suite
# Comprehensive validation of all Docker services
Write-Host "🚀 CODAI Docker Deployment Test Suite" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Function to test service health
function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$TimeoutSeconds = 10
    )
    
    Write-Host "🔍 Testing ${ServiceName}..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec $TimeoutSeconds
        Write-Host "✅ ${ServiceName}: HEALTHY" -ForegroundColor Green
        
        if ($response.status) {
            Write-Host "   Status: $($response.status)" -ForegroundColor White
        }
        if ($response.version) {
            Write-Host "   Version: $($response.version)" -ForegroundColor White
        }
        if ($response.uptime) {
            Write-Host "   Uptime: $([math]::Round($response.uptime, 2))s" -ForegroundColor White
        }
        return $true
    }
    catch {
        Write-Host "❌ ${ServiceName}: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

# Test Docker containers status
Write-Host "📦 Testing Docker Container Status" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

$containers = docker ps --format "{{.Names}}\t{{.Status}}\t{{.Ports}}"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker containers running:" -ForegroundColor Green
    $containers | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
} else {
    Write-Host "❌ Failed to get Docker container status" -ForegroundColor Red
}
Write-Host ""

# Test network connectivity
Write-Host "🌐 Testing Network Connectivity" -ForegroundColor Magenta
Write-Host "-------------------------------" -ForegroundColor Magenta

$networkTests = @(
    @{ Port = 5432; Service = "PostgreSQL Database" },
    @{ Port = 6379; Service = "Redis Cache" },
    @{ Port = 4180; Service = "CBD Database" },
    @{ Port = 4950; Service = "MemorAI MCP Server" }
)

foreach ($test in $networkTests) {
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connection = $tcpClient.BeginConnect("localhost", $test.Port, $null, $null)
        $wait = $connection.AsyncWaitHandle.WaitOne(3000, $false)
        
        if ($wait) {
            $tcpClient.EndConnect($connection)
            Write-Host "✅ $($test.Service) (Port $($test.Port)): REACHABLE" -ForegroundColor Green
        } else {
            Write-Host "❌ $($test.Service) (Port $($test.Port)): TIMEOUT" -ForegroundColor Red
        }
        $tcpClient.Close()
    }
    catch {
        Write-Host "❌ $($test.Service) (Port $($test.Port)): CONNECTION FAILED" -ForegroundColor Red
    }
}
Write-Host ""

# Test service health endpoints
Write-Host "🏥 Testing Service Health Endpoints" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

$healthTests = @()

# Test CBD Database health
$healthTests += Test-ServiceHealth -ServiceName "CBD Database" -Url "http://localhost:4180/health"

# Test MemorAI MCP Server health  
$healthTests += Test-ServiceHealth -ServiceName "MemorAI MCP Server" -Url "http://localhost:4950/health"

Write-Host ""

# Test database connections
Write-Host "🗃️ Testing Database Connections" -ForegroundColor Magenta
Write-Host "-------------------------------" -ForegroundColor Magenta

# Test PostgreSQL connection
try {
    $env:PGPASSWORD = "codai_dev_2025"
    $result = & psql -h localhost -p 5432 -U codai_dev -d codai_main -c "SELECT 1 as test;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL: CONNECTION SUCCESSFUL" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL: CONNECTION FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PostgreSQL: CONNECTION ERROR" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Performance metrics
Write-Host "📊 Performance Metrics" -ForegroundColor Magenta
Write-Host "----------------------" -ForegroundColor Magenta

# Container resource usage
$containerStats = docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Container Resource Usage:" -ForegroundColor Green
    $containerStats | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
} else {
    Write-Host "❌ Failed to get container statistics" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "📋 Test Summary" -ForegroundColor Magenta
Write-Host "---------------" -ForegroundColor Magenta

$passedTests = ($healthTests | Where-Object { $_ -eq $true }).Count
$totalTests = $healthTests.Count

Write-Host "Health Tests Passed: $passedTests/$totalTests" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 ALL TESTS PASSED - Docker deployment is successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed - review the results above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🏁 CODAI Docker Deployment Test Complete" -ForegroundColor Cyan