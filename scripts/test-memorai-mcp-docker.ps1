#!/usr/bin/env pwsh
# MemoraiMCP Ecosystem Docker Validation Script
# Tests all services in the MemoraiMCP Docker stack

param(
    [switch]$Verbose,
    [switch]$SkipContainerTests
)

Write-Host "🧪 MemoraiMCP Ecosystem Docker Validation" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Function to test HTTP endpoint
function Test-HttpEndpoint {
    param($Name, $Url, $ExpectedStatus = "200", $TimeoutSec = 10)
    try {
        if ($Verbose) { Write-Host "   Testing $Name at $Url..." -ForegroundColor Gray }
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec $TimeoutSec -ErrorAction Stop
        Write-Host "✅ $Name`: HEALTHY" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "❌ $Name`: FAILED" -ForegroundColor Red
        if ($Verbose) { Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow }
        return $null
    }
}

# Function to test TCP port
function Test-TcpPort {
    param($Name, $Host, $Port, $TimeoutSec = 5)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connect = $tcpClient.BeginConnect($Host, $Port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne($TimeoutSec * 1000, $false)
        if ($wait) {
            $tcpClient.EndConnect($connect)
            $tcpClient.Close()
            Write-Host "✅ $Name`: Port $Port OPEN" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Name`: Port $Port TIMEOUT" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $Name`: Port $Port CLOSED" -ForegroundColor Red
        if ($Verbose) { Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow }
        return $false
    }
}

Write-Host "`n1️⃣  Docker Container Status" -ForegroundColor White
Write-Host "───────────────────────────" -ForegroundColor Gray

if (-not $SkipContainerTests) {
    # Check if Docker is running
    try {
        docker --version | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Docker command failed" }
        Write-Host "✅ Docker: RUNNING" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker: NOT RUNNING" -ForegroundColor Red
        Write-Host "   Please start Docker Desktop and try again." -ForegroundColor Yellow
        exit 1
    }

    # Check container status
    $containers = @(
        "memorai-cbd-database",
        "memorai-redis", 
        "memorai-mcp-server",
        "memorai-dashboard",
        "memorai-prometheus", 
        "memorai-nginx"
    )

    foreach ($container in $containers) {
        try {
            $status = docker inspect $container --format '{{.State.Status}}' 2>$null
            if ($status -eq "running") {
                Write-Host "✅ $container`: RUNNING" -ForegroundColor Green
                
                # Get additional container info if verbose
                if ($Verbose) {
                    $health = docker inspect $container --format '{{.State.Health.Status}}' 2>$null
                    if ($health -and $health -ne "<no value>") {
                        $healthColor = if ($health -eq "healthy") { "Green" } else { "Yellow" }
                        Write-Host "   Health: $health" -ForegroundColor $healthColor
                    }
                }
            } else {
                Write-Host "❌ $container`: $status" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ $container`: NOT FOUND" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  Container tests skipped" -ForegroundColor Yellow
}

Write-Host "`n2️⃣  Service Connectivity" -ForegroundColor White
Write-Host "─────────────────────────" -ForegroundColor Gray

# Test port connectivity
$portTests = @(
    @{Name="CBD Database"; Host="localhost"; Port=4180},
    @{Name="Redis Cache"; Host="localhost"; Port=6379},
    @{Name="MemoraiMCP"; Host="localhost"; Port=4950},
    @{Name="Dashboard"; Host="localhost"; Port=4951},
    @{Name="Prometheus"; Host="localhost"; Port=4952},
    @{Name="Nginx Proxy"; Host="localhost"; Port=4953}
)

foreach ($test in $portTests) {
    Test-TcpPort -Name $test.Name -Host $test.Host -Port $test.Port | Out-Null
}

Write-Host "`n3️⃣  Service Health Checks" -ForegroundColor White
Write-Host "─────────────────────────" -ForegroundColor Gray

# Test CBD Database
$cbdHealth = Test-HttpEndpoint -Name "CBD Database" -Url "http://localhost:4180/health"
if ($cbdHealth -and $Verbose) {
    Write-Host "   Status: $($cbdHealth.status)" -ForegroundColor Gray
    Write-Host "   Version: $($cbdHealth.version)" -ForegroundColor Gray
}

# Test Redis through Docker
try {
    $redisResponse = docker exec memorai-redis redis-cli ping 2>$null
    if ($redisResponse -eq "PONG") {
        Write-Host "✅ Redis Cache: HEALTHY" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis Cache: NO RESPONSE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Redis Cache: CONNECTION FAILED" -ForegroundColor Red
}

# Test MemoraiMCP
$mcpHealth = Test-HttpEndpoint -Name "MemoraiMCP Server" -Url "http://localhost:4950/health"
if ($mcpHealth -and $Verbose) {
    Write-Host "   Status: $($mcpHealth.status)" -ForegroundColor Gray
    Write-Host "   Version: $($mcpHealth.version)" -ForegroundColor Gray
    Write-Host "   Features: Vector=$($mcpHealth.features.vectorSearch), Hybrid=$($mcpHealth.features.hybridSearch)" -ForegroundColor Gray
}

# Test Prometheus
$prometheusHealth = Test-HttpEndpoint -Name "Prometheus" -Url "http://localhost:4952/-/healthy"

# Test Nginx
$nginxHealth = Test-HttpEndpoint -Name "Nginx Proxy" -Url "http://localhost:4953/health"

Write-Host "`n4️⃣  MCP Protocol Validation" -ForegroundColor White
Write-Host "──────────────────────────" -ForegroundColor Gray

if ($mcpHealth) {
    try {
        # Test MCP remember operation
        $rememberPayload = @{
            agentId = "test-agent"
            content = "Docker validation test - $(Get-Date)"
            metadata = @{
                entityType = "test"
                source = "docker-validation"
                timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
            }
        } | ConvertTo-Json -Depth 3

        $headers = @{
            'Content-Type' = 'application/json'
            'Authorization' = 'Bearer memorai-dev-key-2025'
        }

        $rememberResponse = Invoke-RestMethod -Uri "http://localhost:4950/api/v1/memories" -Method Post -Body $rememberPayload -Headers $headers -TimeoutSec 15
        
        if ($rememberResponse -and $rememberResponse.success) {
            Write-Host "✅ MCP Remember: SUCCESS" -ForegroundColor Green
            $memoryId = $rememberResponse.data.id
            
            # Test MCP recall operation  
            Start-Sleep -Seconds 2
            $recallResponse = Invoke-RestMethod -Uri "http://localhost:4950/api/v1/memories/search?agentId=test-agent&query=Docker validation" -Method Get -Headers $headers -TimeoutSec 15
            
            if ($recallResponse -and $recallResponse.success -and $recallResponse.data.memories.Count -gt 0) {
                Write-Host "✅ MCP Recall: SUCCESS" -ForegroundColor Green
                if ($Verbose) {
                    Write-Host "   Found $($recallResponse.data.memories.Count) memory(ies)" -ForegroundColor Gray
                }
                
                # Cleanup test memory
                try {
                    Invoke-RestMethod -Uri "http://localhost:4950/api/v1/memories/$memoryId" -Method Delete -Headers $headers -TimeoutSec 10 | Out-Null
                    if ($Verbose) { Write-Host "   Test memory cleaned up" -ForegroundColor Gray }
                } catch {
                    if ($Verbose) { Write-Host "   Warning: Could not cleanup test memory" -ForegroundColor Yellow }
                }
            } else {
                Write-Host "❌ MCP Recall: FAILED - No memories found" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ MCP Remember: FAILED" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ MCP Protocol: FAILED" -ForegroundColor Red
        if ($Verbose) { Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow }
    }
} else {
    Write-Host "⚠️  MCP Protocol: SKIPPED (MemoraiMCP not healthy)" -ForegroundColor Yellow
}

Write-Host "`n5️⃣  Inter-Service Communication" -ForegroundColor White
Write-Host "──────────────────────────────" -ForegroundColor Gray

# Test MemoraiMCP -> CBD connectivity
try {
    $mcpConfigResponse = Invoke-RestMethod -Uri "http://localhost:4950/api/v1/config" -Method Get -Headers @{'Authorization'='Bearer memorai-dev-key-2025'} -TimeoutSec 10
    if ($mcpConfigResponse -and $mcpConfigResponse.cbd_connection -eq "healthy") {
        Write-Host "✅ MemoraiMCP → CBD: CONNECTED" -ForegroundColor Green
    } else {
        Write-Host "❌ MemoraiMCP → CBD: DISCONNECTED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ MemoraiMCP → CBD: TEST FAILED" -ForegroundColor Red
}

# Test Nginx routing
try {
    $nginxMcpProxy = Test-HttpEndpoint -Name "Nginx → MemoraiMCP" -Url "http://localhost:4953/memorai/health"
    if ($nginxMcpProxy) {
        Write-Host "✅ Nginx → MemoraiMCP: ROUTING OK" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Nginx → MemoraiMCP: ROUTING FAILED" -ForegroundColor Red
}

Write-Host "`n📊 Validation Summary" -ForegroundColor White
Write-Host "────────────────────" -ForegroundColor Gray

Write-Host "🎯 MemoraiMCP Ecosystem Docker stack configured!" -ForegroundColor Green
Write-Host "   Ready to start with: ./start-memorai-mcp-docker.ps1" -ForegroundColor White

Write-Host "`n📋 Next Steps:" -ForegroundColor White
Write-Host "   • Start stack: ./start-memorai-mcp-docker.ps1" -ForegroundColor Gray
Write-Host "   • View logs: docker-compose -f docker-compose.override.yml logs [service]" -ForegroundColor Gray
Write-Host "   • Stop stack: docker-compose -f docker-compose.override.yml down" -ForegroundColor Gray
Write-Host "   • Monitor: Open http://localhost:4952 (Prometheus) or http://localhost:4951 (Dashboard)" -ForegroundColor Gray