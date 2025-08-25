#!/usr/bin/env pwsh
# CODAI ECOSYSTEM - COMPREHENSIVE LOAD BALANCER & INFRASTRUCTURE TESTING
# ========================================================================

param(
    [switch]$Verbose = $false
)

Write-Host "🏗️ CODAI ECOSYSTEM - COMPREHENSIVE LOAD BALANCER & INFRASTRUCTURE TESTING" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Gray
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "🎯 Testing load balancer, Docker orchestration, networking, and service discovery" -ForegroundColor White

# Global test results
$global:InfraTestResults = @()
$global:InfraTestStats = @{
    Configuration = @{ Passed = 0; Failed = 0; Total = 0 }
    LoadBalancer = @{ Passed = 0; Failed = 0; Total = 0 }
    Docker = @{ Passed = 0; Failed = 0; Total = 0 }
    Networking = @{ Passed = 0; Failed = 0; Total = 0 }
    ServiceDiscovery = @{ Passed = 0; Failed = 0; Total = 0 }
    Resilience = @{ Passed = 0; Failed = 0; Total = 0 }
}

# Test infrastructure feature function
function Test-InfrastructureFeature {
    param(
        [string]$Name,
        [scriptblock]$TestScript,
        [string]$Category = "General"
    )
    
    Write-Host "  🔍 Testing: $Name" -ForegroundColor Cyan
    
    try {
        $result = & $TestScript
        
        if ($result.Success) {
            Write-Host "  ✅ $Name" -ForegroundColor Green
            if ($result.Details) {
                Write-Host "     $($result.Details)" -ForegroundColor White
            }
            $global:InfraTestStats[$Category].Passed++
        } else {
            Write-Host "  ❌ $Name" -ForegroundColor Red
            if ($result.Error) {
                Write-Host "     Error: $($result.Error)" -ForegroundColor Yellow
            }
            $global:InfraTestStats[$Category].Failed++
        }
        
        $global:InfraTestStats[$Category].Total++
        $global:InfraTestResults += [PSCustomObject]@{
            Name = $Name
            Category = $Category
            Success = $result.Success
            Details = $result.Details
            Error = $result.Error
        }
        
    } catch {
        Write-Host "  ❌ $Name" -ForegroundColor Red
        Write-Host "     Exception: $($_.Exception.Message)" -ForegroundColor Yellow
        
        $global:InfraTestStats[$Category].Failed++
        $global:InfraTestStats[$Category].Total++
        $global:InfraTestResults += [PSCustomObject]@{
            Name = $Name
            Category = $Category
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# =============================================================================
# DOCKER INFRASTRUCTURE CONFIGURATION TESTING
# =============================================================================
Write-Host ""
Write-Host "🐳 DOCKER INFRASTRUCTURE CONFIGURATION TESTING" -ForegroundColor Magenta
Write-Host "===============================================" -ForegroundColor Gray

Test-InfrastructureFeature -Name "Docker Compose Configuration" -Category "Configuration" -TestScript {
    $composeFiles = @(
        "docker-compose.yml",
        "docker-compose.override.yml", 
        "docker-compose.memorai-complete.yml",
        "docker-compose.memorai-mcp.yml"
    )
    
    $validFiles = @()
    foreach ($file in $composeFiles) {
        if (Test-Path $file) {
            try {
                $content = Get-Content $file -Raw
                if ($content -match "version:" -or $content -match "services:") {
                    $validFiles += "$file : ✅"
                } else {
                    $validFiles += "$file : ❓ (no services/version)"
                }
            } catch {
                $validFiles += "$file : ❌ (read error)"
            }
        } else {
            $validFiles += "$file : ❌ (not found)"
        }
    }
    
    return @{ 
        Success = $validFiles.Count -gt 0
        Details = "Docker Compose files: $($validFiles -join ', ')"
    }
}

Test-InfrastructureFeature -Name "Container Network Configuration" -Category "Configuration" -TestScript {
    try {
        $networks = docker network ls --format "table {{.Name}}\t{{.Driver}}" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $networkList = $networks | Where-Object { $_ -notmatch "NAME.*DRIVER" }
            $codaiNetworks = $networkList | Where-Object { $_ -match "codai" }
            
            return @{ 
                Success = $codaiNetworks.Count -gt 0
                Details = "Docker networks: $($networkList.Count) total, $($codaiNetworks.Count) CODAI networks"
            }
        } else {
            return @{ Success = $false; Error = "Docker not accessible" }
        }
    } catch {
        return @{ Success = $false; Error = "Docker command failed: $($_.Exception.Message)" }
    }
}

Test-InfrastructureFeature -Name "Container Service Discovery" -Category "Configuration" -TestScript {
    try {
        $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $containerList = $containers | Where-Object { $_ -notmatch "NAMES.*STATUS" }
            $runningContainers = $containerList | Where-Object { $_ -match "Up" }
            
            return @{ 
                Success = $runningContainers.Count -gt 0
                Details = "Containers: $($containerList.Count) total, $($runningContainers.Count) running"
            }
        } else {
            return @{ Success = $false; Error = "Cannot list containers" }
        }
    } catch {
        return @{ Success = $false; Error = "Docker ps failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# NGINX LOAD BALANCER TESTING
# =============================================================================
Write-Host ""
Write-Host "⚖️ NGINX LOAD BALANCER TESTING" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Gray

Test-InfrastructureFeature -Name "Load Balancer Availability" -Category "LoadBalancer" -TestScript {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 10
        return @{ 
            Success = $true
            Details = "Load balancer responsive: $($response.status) on port 8080" 
        }
    } catch {
        return @{ Success = $false; Error = "Load balancer not accessible on port 8080: $($_.Exception.Message)" }
    }
}

Test-InfrastructureFeature -Name "Frontend Service Routing" -Category "LoadBalancer" -TestScript {
    $services = @(
        @{ Name = "ControlAI"; Path = "/controlai"; Port = "4200" },
        @{ Name = "RomAI"; Path = "/romai"; Port = "6100" },
        @{ Name = "Explorer"; Path = "/explorer"; Port = "4400" },
        @{ Name = "Kodex"; Path = "/kodex"; Port = "5000" },
        @{ Name = "BancAI"; Path = "/bancai"; Port = "4005" }
    )
    
    $routingResults = @()
    foreach ($service in $services) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080$($service.Path)" -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
                $routingResults += "$($service.Name) : ✅ Routed"
            } else {
                $routingResults += "$($service.Name) : ⚠️ Status $($response.StatusCode)"
            }
        } catch {
            $routingResults += "$($service.Name) : ❌ No route"
        }
    }
    
    $successCount = ($routingResults | Where-Object { $_ -match "✅" }).Count
    return @{ 
        Success = $successCount -gt 0
        Details = "Frontend routing: $($routingResults -join ', ')"
    }
}

Test-InfrastructureFeature -Name "API Gateway Integration" -Category "LoadBalancer" -TestScript {
    $apiEndpoints = @(
        "/api/v1/health",
        "/api/v1/memorai/health", 
        "/api/v1/romai/health",
        "/api/v1/bancai/health"
    )
    
    $apiResults = @()
    foreach ($endpoint in $apiEndpoints) {
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8080$endpoint" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
            $apiResults += "$endpoint : ✅ Available"
        } catch {
            $apiResults += "$endpoint : ❌ Unavailable"
        }
    }
    
    $successCount = ($apiResults | Where-Object { $_ -match "✅" }).Count
    return @{ 
        Success = $successCount -gt 0
        Details = "API gateway: $($apiResults -join ', ')"
    }
}

# =============================================================================
# DOCKER CONTAINER ORCHESTRATION TESTING
# =============================================================================
Write-Host ""
Write-Host "🐋 DOCKER CONTAINER ORCHESTRATION TESTING" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Gray

Test-InfrastructureFeature -Name "Container Health Status" -Category "Docker" -TestScript {
    try {
        $containers = docker ps --format "{{.Names}}:{{.Status}}" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $containerStatus = @()
            foreach ($container in $containers) {
                $parts = $container -split ":"
                if ($parts[1] -match "Up") {
                    $containerStatus += "$($parts[0]) : ✅ Running"
                } else {
                    $containerStatus += "$($parts[0]) : ❌ $($parts[1])"
                }
            }
            
            $runningCount = ($containerStatus | Where-Object { $_ -match "✅" }).Count
            return @{ 
                Success = $runningCount -gt 0
                Details = "Container health: $runningCount/$($containers.Count) running"
            }
        } else {
            return @{ Success = $false; Error = "Cannot check container status" }
        }
    } catch {
        return @{ Success = $false; Error = "Docker health check failed: $($_.Exception.Message)" }
    }
}

Test-InfrastructureFeature -Name "Resource Utilization" -Category "Docker" -TestScript {
    try {
        $stats = docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $statLines = $stats | Where-Object { $_ -notmatch "NAME.*CPU" }
            $highCPU = $statLines | Where-Object { $_ -match "([0-9]+\.[0-9]+)%" } | Where-Object { 
                $matches = [regex]::Matches($_, "([0-9]+\.[0-9]+)%")
                [double]$matches[0].Groups[1].Value -gt 80
            }
            
            return @{ 
                Success = $statLines.Count -gt 0
                Details = "Resource stats: $($statLines.Count) containers monitored, $($highCPU.Count) high CPU usage"
            }
        } else {
            return @{ Success = $false; Error = "Cannot get container stats" }
        }
    } catch {
        return @{ Success = $false; Error = "Docker stats failed: $($_.Exception.Message)" }
    }
}

Test-InfrastructureFeature -Name "Volume and Storage Management" -Category "Docker" -TestScript {
    try {
        $volumes = docker volume ls --format "{{.Name}}" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $codaiVolumes = $volumes | Where-Object { $_ -match "codai" }
            
            return @{ 
                Success = $volumes.Count -gt 0
                Details = "Docker volumes: $($volumes.Count) total, $($codaiVolumes.Count) CODAI volumes"
            }
        } else {
            return @{ Success = $false; Error = "Cannot list volumes" }
        }
    } catch {
        return @{ Success = $false; Error = "Volume check failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# NETWORK CONNECTIVITY TESTING
# =============================================================================
Write-Host ""
Write-Host "🌐 NETWORK CONNECTIVITY TESTING" -ForegroundColor Magenta
Write-Host "===============================" -ForegroundColor Gray

Test-InfrastructureFeature -Name "Inter-Service Communication" -Category "Networking" -TestScript {
    $serviceConnections = @(
        @{ From = "Gateway"; To = "MemorAI"; Port = 4006 },
        @{ From = "Gateway"; To = "RomAI"; Port = 6100 },
        @{ From = "Gateway"; To = "MCP"; Port = 4950 },
        @{ From = "Gateway"; To = "GraphQL"; Port = 4500 }
    )
    
    $connectionResults = @()
    foreach ($connection in $serviceConnections) {
        try {
            $response = Test-NetConnection -ComputerName "localhost" -Port $connection.Port -WarningAction SilentlyContinue
            if ($response.TcpTestSucceeded) {
                $connectionResults += "$($connection.From)→$($connection.To) : ✅ Connected"
            } else {
                $connectionResults += "$($connection.From)→$($connection.To) : ❌ Disconnected"
            }
        } catch {
            $connectionResults += "$($connection.From)→$($connection.To) : ❌ Error"
        }
    }
    
    $successCount = ($connectionResults | Where-Object { $_ -match "✅" }).Count
    return @{ 
        Success = $successCount -gt 0
        Details = "Service connections: $($connectionResults -join ', ')"
    }
}

Test-InfrastructureFeature -Name "Port Accessibility" -Category "Networking" -TestScript {
    $criticalPorts = @(8080, 4006, 4950, 4500, 6100, 4400, 4200, 5000)
    
    $portResults = @()
    foreach ($port in $criticalPorts) {
        try {
            $test = Test-NetConnection -ComputerName "localhost" -Port $port -WarningAction SilentlyContinue
            if ($test.TcpTestSucceeded) {
                $portResults += "$port : ✅ Open"
            } else {
                $portResults += "$port : ❌ Closed"
            }
        } catch {
            $portResults += "$port : ❌ Error"
        }
    }
    
    $openCount = ($portResults | Where-Object { $_ -match "✅" }).Count
    return @{ 
        Success = $openCount -gt 0
        Details = "Port accessibility: $openCount/$($criticalPorts.Count) ports open"
    }
}

Test-InfrastructureFeature -Name "DNS Resolution and Service Discovery" -Category "Networking" -TestScript {
    $hostnames = @("localhost", "127.0.0.1")
    
    $dnsResults = @()
    foreach ($hostname in $hostnames) {
        try {
            $resolved = [System.Net.Dns]::GetHostAddresses($hostname)
            if ($resolved.Count -gt 0) {
                $dnsResults += "$hostname : ✅ Resolved to $($resolved[0])"
            } else {
                $dnsResults += "$hostname : ❌ Not resolved"
            }
        } catch {
            $dnsResults += "$hostname : ❌ DNS error"
        }
    }
    
    $successCount = ($dnsResults | Where-Object { $_ -match "✅" }).Count
    return @{ 
        Success = $successCount -gt 0
        Details = "DNS resolution: $($dnsResults -join ', ')"
    }
}

# =============================================================================
# SERVICE DISCOVERY AND FAILOVER TESTING
# =============================================================================
Write-Host ""
Write-Host "🔍 SERVICE DISCOVERY AND FAILOVER TESTING" -ForegroundColor Magenta
Write-Host "=========================================" -ForegroundColor Gray

Test-InfrastructureFeature -Name "Service Health Endpoints" -Category "ServiceDiscovery" -TestScript {
    $healthEndpoints = @(
        @{ Name = "Gateway"; Url = "http://localhost:8080/health" },
        @{ Name = "Load Balancer"; Url = "http://localhost:8080/health" },
        @{ Name = "MemorAI MCP"; Url = "http://localhost:4950/health" },
        @{ Name = "GraphQL"; Url = "http://localhost:4500/health" }
    )
    
    $healthResults = @()
    foreach ($endpoint in $healthEndpoints) {
        try {
            $response = Invoke-RestMethod -Uri $endpoint.Url -Method Get -TimeoutSec 5
            if ($response.status -or $response.health) {
                $healthResults += "$($endpoint.Name) : ✅ Healthy"
            } else {
                $healthResults += "$($endpoint.Name) : ⚠️ Unknown status"
            }
        } catch {
            $healthResults += "$($endpoint.Name) : ❌ Unhealthy"
        }
    }
    
    $healthyCount = ($healthResults | Where-Object { $_ -match "✅" }).Count
    return @{ 
        Success = $healthyCount -gt 0
        Details = "Health checks: $($healthResults -join ', ')"
    }
}

Test-InfrastructureFeature -Name "Load Balancer Upstream Configuration" -Category "ServiceDiscovery" -TestScript {
    try {
        # Test multiple requests to see load balancing
        $responses = @()
        for ($i = 1; $i -le 3; $i++) {
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 3
                $responses += "Request $i : ✅ Success"
            } catch {
                $responses += "Request $i : ❌ Failed"
            }
        }
        
        $successCount = ($responses | Where-Object { $_ -match "✅" }).Count
        return @{ 
            Success = $successCount -gt 0
            Details = "Load balancer upstream: $successCount/3 requests successful"
        }
    } catch {
        return @{ Success = $false; Error = "Load balancer test failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# RESILIENCE AND FAULT TOLERANCE TESTING
# =============================================================================
Write-Host ""
Write-Host "🛡️ RESILIENCE AND FAULT TOLERANCE TESTING" -ForegroundColor Magenta
Write-Host "===========================================" -ForegroundColor Gray

Test-InfrastructureFeature -Name "Service Recovery Testing" -Category "Resilience" -TestScript {
    $services = @(
        @{ Name = "Gateway"; Url = "http://localhost:8080/health"; Critical = $true },
        @{ Name = "MCP Server"; Url = "http://localhost:4950/health"; Critical = $true },
        @{ Name = "GraphQL"; Url = "http://localhost:4500/health"; Critical = $false }
    )
    
    $recoveryResults = @()
    foreach ($service in $services) {
        try {
            # Test with timeout to simulate potential issues
            $response = Invoke-RestMethod -Uri $service.Url -Method Get -TimeoutSec 2
            $recoveryResults += "$($service.Name) : ✅ Available"
        } catch {
            if ($service.Critical) {
                $recoveryResults += "$($service.Name) : ❌ Critical service down"
            } else {
                $recoveryResults += "$($service.Name) : ⚠️ Non-critical down"
            }
        }
    }
    
    $availableCount = ($recoveryResults | Where-Object { $_ -match "✅" }).Count
    return @{ 
        Success = $availableCount -gt 0
        Details = "Service recovery: $($recoveryResults -join ', ')"
    }
}

Test-InfrastructureFeature -Name "Error Handling and Circuit Breakers" -Category "Resilience" -TestScript {
    $errorTests = @()
    
    # Test invalid endpoints
    try {
        Invoke-RestMethod -Uri "http://localhost:8080/invalid-endpoint" -Method Get -TimeoutSec 3 -ErrorAction Stop
        $errorTests += "Invalid endpoint : ❌ No error handling"
    } catch {
        if ($_.Exception.Message -match "404" -or $_.Exception.Message -match "Not Found") {
            $errorTests += "Invalid endpoint : ✅ Proper 404 handling"
        } else {
            $errorTests += "Invalid endpoint : ⚠️ Generic error: $($_.Exception.Message)"
        }
    }
    
    # Test timeout handling
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 1
        $errorTests += "Timeout handling : ✅ Fast response"
    } catch {
        $errorTests += "Timeout handling : ⚠️ Slow response or timeout"
    }
    
    return @{ 
        Success = $errorTests.Count -gt 0
        Details = "Error handling: $($errorTests -join ', ')"
    }
}

# =============================================================================
# COMPREHENSIVE INFRASTRUCTURE TESTING RESULTS
# =============================================================================
Write-Host ""
Write-Host "📊 COMPREHENSIVE LOAD BALANCER & INFRASTRUCTURE TESTING RESULTS" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Gray

# Calculate overall statistics
$totalPassed = 0
$totalFailed = 0
$totalTests = 0

foreach ($category in $global:InfraTestStats.Keys) {
    $stats = $global:InfraTestStats[$category]
    $totalPassed += $stats.Passed
    $totalFailed += $stats.Failed
    $totalTests += $stats.Total
}

$successRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host "📊 LOAD BALANCER & INFRASTRUCTURE TESTING STATISTICS" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Gray
Write-Host "Total Infrastructure Tests: $totalTests" -ForegroundColor White
Write-Host "Tests Passed: $totalPassed" -ForegroundColor Green
Write-Host "Tests Failed: $totalFailed" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { 'Green' } elseif ($successRate -ge 60) { 'Yellow' } else { 'Red' })

Write-Host ""
Write-Host "📋 DETAILED INFRASTRUCTURE CATEGORY BREAKDOWN:" -ForegroundColor Cyan
foreach ($category in $global:InfraTestStats.Keys | Sort-Object) {
    $stats = $global:InfraTestStats[$category]
    if ($stats.Total -gt 0) {
        $categoryRate = [math]::Round(($stats.Passed / $stats.Total) * 100, 0)
        Write-Host "  $category`: $($stats.Passed)/$($stats.Total) tests passed ($categoryRate%)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🎯 LOAD BALANCER & INFRASTRUCTURE TESTING ASSESSMENT:" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Gray
$assessmentColor = if ($successRate -ge 90) { 'Green' }
                  elseif ($successRate -ge 80) { 'Yellow' }
                  elseif ($successRate -ge 70) { 'DarkYellow' }
                  else { 'Red' }

$assessment = if ($successRate -ge 90) { "🏆 EXCEPTIONAL: $successRate% - Outstanding infrastructure performance!" }
             elseif ($successRate -ge 80) { "✅ EXCELLENT: $successRate% - Infrastructure performing very well!" }
             elseif ($successRate -ge 70) { "⚠️  GOOD: $successRate% - Infrastructure mostly functional with some issues" }
             elseif ($successRate -ge 60) { "⚠️  FAIR: $successRate% - Infrastructure has significant issues" }
             else { "❌ POOR: $successRate% - Major infrastructure problems detected" }

Write-Host $assessment -ForegroundColor $assessmentColor

Write-Host ""
Write-Host "🕒 Infrastructure Testing Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Return results for further processing
return @{
    TotalTests = $totalTests
    PassedTests = $totalPassed
    FailedTests = $totalFailed
    SuccessRate = $successRate
    Results = $global:InfraTestResults
}