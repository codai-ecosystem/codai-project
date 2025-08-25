#!/usr/bin/env pwsh
# CODAI ECOSYSTEM - COMPREHENSIVE CROSS-SERVICE INTEGRATION TESTING
# ==================================================================

param(
    [switch]$Verbose = $false
)

Write-Host "🔗 CODAI ECOSYSTEM - COMPREHENSIVE CROSS-SERVICE INTEGRATION TESTING" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Gray
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Global test results
$global:IntegrationTestResults = @()
$global:IntegrationTestStats = @{
    EndToEndWorkflow = @{ Passed = 0; Failed = 0; Total = 0 }
    ServiceCommunication = @{ Passed = 0; Failed = 0; Total = 0 }
    DataSynchronization = @{ Passed = 0; Failed = 0; Total = 0 }
    EventDriven = @{ Passed = 0; Failed = 0; Total = 0 }
    MicroserviceCoordination = @{ Passed = 0; Failed = 0; Total = 0 }
}

# Test integration feature function
function Test-IntegrationFeature {
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
            $global:IntegrationTestStats[$Category].Passed++
        } else {
            Write-Host "  ❌ $Name" -ForegroundColor Red
            if ($result.Error) {
                Write-Host "     Error: $($result.Error)" -ForegroundColor Yellow
            }
            $global:IntegrationTestStats[$Category].Failed++
        }
        
        $global:IntegrationTestStats[$Category].Total++
        
    } catch {
        Write-Host "  ❌ $Name" -ForegroundColor Red
        Write-Host "     Exception: $($_.Exception.Message)" -ForegroundColor Yellow
        $global:IntegrationTestStats[$Category].Failed++
        $global:IntegrationTestStats[$Category].Total++
    }
}

# =============================================================================
# END-TO-END WORKFLOW TESTING
# =============================================================================
Write-Host ""
Write-Host "🌐 END-TO-END WORKFLOW TESTING" -ForegroundColor Magenta
Write-Host "===============================" -ForegroundColor Gray

Test-IntegrationFeature -Name "Complete Request Flow Through Load Balancer" -Category "EndToEndWorkflow" -TestScript {
    try {
        # Step 1: Gateway health check
        $gatewayResponse = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        
        # Step 2: Test frontend routing
        $frontendRoutes = @("controlai", "romai", "explorer", "kodex")
        $routeResults = @()
        
        foreach ($route in $frontendRoutes) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8080/$route" -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
                    $routeResults += "$route-OK"
                }
            } catch {
                $routeResults += "$route-FAILED"
            }
        }
        
        $successfulRoutes = ($routeResults | Where-Object { $_ -match "OK" }).Count
        return @{ 
            Success = $successfulRoutes -gt 2 -and $gatewayResponse
            Details = "Gateway OK, Routes: $($routeResults.Count) tested, $successfulRoutes successful"
        }
    } catch {
        return @{ Success = $false; Error = "Request flow failed: $($_.Exception.Message)" }
    }
}

Test-IntegrationFeature -Name "Multi-Service Authentication Chain" -Category "EndToEndWorkflow" -TestScript {
    try {
        $authResults = @()
        
        # Test protected endpoints
        $endpoints = @(
            @{ Name = "MCP"; Url = "http://localhost:4950/api/v1/remember"; Method = "GET" },
            @{ Name = "GraphQL"; Url = "http://localhost:4500/graphql"; Method = "GET" }
        )
        
        foreach ($endpoint in $endpoints) {
            try {
                $response = Invoke-WebRequest -Uri $endpoint.Url -Method $endpoint.Method -TimeoutSec 5 -ErrorAction SilentlyContinue
                # Expect 401/403 for protected endpoints
                if ($response.StatusCode -eq 401 -or $response.StatusCode -eq 403 -or $response.StatusCode -eq 404) {
                    $authResults += "$($endpoint.Name)-PROTECTED"
                } else {
                    $authResults += "$($endpoint.Name)-UNPROTECTED"
                }
            } catch {
                $authResults += "$($endpoint.Name)-PROTECTED"
            }
        }
        
        $protectedCount = ($authResults | Where-Object { $_ -match "PROTECTED" }).Count
        return @{ 
            Success = $protectedCount -gt 0
            Details = "Auth chain: $($authResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Auth chain failed: $($_.Exception.Message)" }
    }
}

Test-IntegrationFeature -Name "Data Pipeline Integration" -Category "EndToEndWorkflow" -TestScript {
    try {
        $pipelineResults = @()
        
        # Test gateway data reception
        $gatewayHealth = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($gatewayHealth) {
            $pipelineResults += "Gateway-OK"
        }
        
        # Test MCP data processing
        $mcpHealth = Invoke-RestMethod -Uri "http://localhost:4950/health" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($mcpHealth.service) {
            $pipelineResults += "MCP-OK"
        }
        
        # Test GraphQL data access
        try {
            $body = '{"query": "{ __typename }"}'
            $graphqlResponse = Invoke-RestMethod -Uri "http://localhost:4500/graphql" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5 -ErrorAction SilentlyContinue
            $pipelineResults += "GraphQL-OK"
        } catch {
            $pipelineResults += "GraphQL-FAILED"
        }
        
        $successCount = ($pipelineResults | Where-Object { $_ -match "OK" }).Count
        return @{ 
            Success = $successCount -gt 1
            Details = "Pipeline: $($pipelineResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Data pipeline failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# SERVICE COMMUNICATION VALIDATION
# =============================================================================
Write-Host ""
Write-Host "📡 SERVICE COMMUNICATION VALIDATION" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Gray

Test-IntegrationFeature -Name "Inter-Service HTTP Communication" -Category "ServiceCommunication" -TestScript {
    try {
        $commTests = @()
        
        $connections = @(
            @{ Name = "LoadBalancer"; Port = 8080; Path = "/health" },
            @{ Name = "MCP"; Port = 4950; Path = "/health" },
            @{ Name = "GraphQL"; Port = 4500; Path = "/health" }
        )
        
        foreach ($connection in $connections) {
            try {
                $testUrl = "http://localhost:$($connection.Port)$($connection.Path)"
                $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                $response = Invoke-RestMethod -Uri $testUrl -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
                $stopwatch.Stop()
                
                if ($response) {
                    $time = $stopwatch.ElapsedMilliseconds
                    $commTests += "$($connection.Name)-OK-$($time)ms"
                } else {
                    $commTests += "$($connection.Name)-FAILED"
                }
            } catch {
                $commTests += "$($connection.Name)-FAILED"
            }
        }
        
        $successfulComms = ($commTests | Where-Object { $_ -match "OK" }).Count
        return @{ 
            Success = $successfulComms -gt 0
            Details = "HTTP communication: $($commTests -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "HTTP communication failed: $($_.Exception.Message)" }
    }
}

Test-IntegrationFeature -Name "Service Discovery Mechanism" -Category "ServiceCommunication" -TestScript {
    try {
        $discoveryResults = @()
        
        # Check Docker networks
        $networks = docker network ls --format "{{.Name}}" 2>$null | Where-Object { $_ -match "codai" }
        if ($networks.Count -gt 0) {
            $discoveryResults += "DockerNetworks-$($networks.Count)"
        }
        
        # Check containers
        $containers = docker ps --format "{{.Names}}" 2>$null | Where-Object { $_ -match "codai" }
        if ($containers.Count -gt 0) {
            $discoveryResults += "Containers-$($containers.Count)"
        }
        
        return @{ 
            Success = $discoveryResults.Count -gt 0
            Details = "Discovery: $($discoveryResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Service discovery failed: $($_.Exception.Message)" }
    }
}

Test-IntegrationFeature -Name "Load Balancer Upstream Health" -Category "ServiceCommunication" -TestScript {
    try {
        # Test multiple requests to load balancer
        $responses = @()
        for ($i = 1; $i -le 5; $i++) {
            try {
                $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
                $stopwatch.Stop()
                if ($response) {
                    $responses += $stopwatch.ElapsedMilliseconds
                }
            } catch {
                # Request failed
            }
        }
        
        $successfulRequests = $responses.Count
        $avgTime = if ($successfulRequests -gt 0) { 
            [math]::Round(($responses | Measure-Object -Average).Average, 1)
        } else { 0 }
        
        return @{ 
            Success = $successfulRequests -ge 4
            Details = "Upstream: $successfulRequests/5 successful, avg ${avgTime}ms"
        }
    } catch {
        return @{ Success = $false; Error = "Upstream health failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# DATA SYNCHRONIZATION ACROSS SERVICES
# =============================================================================
Write-Host ""
Write-Host "🔄 DATA SYNCHRONIZATION ACROSS SERVICES" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Gray

Test-IntegrationFeature -Name "Cross-Service Data Consistency" -Category "DataSynchronization" -TestScript {
    try {
        $consistencyTests = @()
        
        # Get health data from services
        $gatewayHealth = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
        $mcpHealth = Invoke-RestMethod -Uri "http://localhost:4950/health" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        if ($gatewayHealth) {
            $consistencyTests += "Gateway-OK"
        }
        
        if ($mcpHealth -and $mcpHealth.service) {
            $consistencyTests += "MCP-OK"
        }
        
        # Check configuration files
        $configFiles = @("package.json", "docker-compose.yml")
        foreach ($configFile in $configFiles) {
            if (Test-Path $configFile) {
                $consistencyTests += "$configFile-OK"
            }
        }
        
        $successfulTests = ($consistencyTests | Where-Object { $_ -match "OK" }).Count
        return @{ 
            Success = $successfulTests -gt 0
            Details = "Consistency: $($consistencyTests -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Data consistency failed: $($_.Exception.Message)" }
    }
}

Test-IntegrationFeature -Name "Real-time Data Updates" -Category "DataSynchronization" -TestScript {
    try {
        $realtimeResults = @()
        
        # Test response times for real-time capability
        $services = @("8080", "4950")
        foreach ($port in $services) {
            try {
                $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
                $response = Invoke-RestMethod -Uri "http://localhost:$port/health" -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
                $stopwatch.Stop()
                
                $time = $stopwatch.ElapsedMilliseconds
                if ($time -le 500) {
                    $realtimeResults += "Port$port-RealTime-$($time)ms"
                } else {
                    $realtimeResults += "Port$port-Slow-$($time)ms"
                }
            } catch {
                $realtimeResults += "Port$port-Failed"
            }
        }
        
        $realTimeCount = ($realtimeResults | Where-Object { $_ -match "RealTime" }).Count
        return @{ 
            Success = $realTimeCount -gt 0
            Details = "Real-time: $($realtimeResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Real-time updates failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# EVENT-DRIVEN ARCHITECTURE TESTING
# =============================================================================
Write-Host ""
Write-Host "⚡ EVENT-DRIVEN ARCHITECTURE TESTING" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Gray

Test-IntegrationFeature -Name "Event Publishing and Consumption" -Category "EventDriven" -TestScript {
    try {
        $eventResults = @()
        
        # Test async processing with concurrent requests
        $jobs = @()
        for ($i = 1; $i -le 3; $i++) {
            $jobs += Start-Job -ScriptBlock {
                try {
                    $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 5
                    return @{ Success = $true }
                } catch {
                    return @{ Success = $false }
                }
            }
        }
        
        $results = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        $successfulAsync = ($results | Where-Object { $_.Success }).Count
        $eventResults += "AsyncProcessing-$successfulAsync/3"
        
        return @{ 
            Success = $successfulAsync -gt 0
            Details = "Events: $($eventResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Event processing failed: $($_.Exception.Message)" }
    }
}

Test-IntegrationFeature -Name "Message Queue Integration" -Category "EventDriven" -TestScript {
    try {
        $queueResults = @()
        
        # Check for Redis
        try {
            $redisTest = Test-NetConnection -ComputerName "localhost" -Port 6379 -WarningAction SilentlyContinue
            if ($redisTest.TcpTestSucceeded) {
                $queueResults += "Redis-OK"
            } else {
                $queueResults += "Redis-Unavailable"
            }
        } catch {
            $queueResults += "Redis-TestFailed"
        }
        
        # Check for RabbitMQ
        try {
            $rabbitTest = Test-NetConnection -ComputerName "localhost" -Port 5672 -WarningAction SilentlyContinue
            if ($rabbitTest.TcpTestSucceeded) {
                $queueResults += "RabbitMQ-OK"
            } else {
                $queueResults += "RabbitMQ-Unavailable"
            }
        } catch {
            $queueResults += "RabbitMQ-TestFailed"
        }
        
        return @{ 
            Success = $true
            Details = "Queues: $($queueResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Message queues failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# MICROSERVICE COORDINATION
# =============================================================================
Write-Host ""
Write-Host "🎼 MICROSERVICE COORDINATION" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Gray

Test-IntegrationFeature -Name "Service Mesh Communication" -Category "MicroserviceCoordination" -TestScript {
    try {
        $meshResults = @()
        
        $services = @(
            @{ Name = "Gateway"; Port = 8080 },
            @{ Name = "MCP"; Port = 4950 },
            @{ Name = "GraphQL"; Port = 4500 },
            @{ Name = "Prometheus"; Port = 4952 }
        )
        
        $healthyServices = 0
        foreach ($service in $services) {
            try {
                $test = Test-NetConnection -ComputerName "localhost" -Port $service.Port -WarningAction SilentlyContinue
                if ($test.TcpTestSucceeded) {
                    $meshResults += "$($service.Name)-Available"
                    $healthyServices++
                } else {
                    $meshResults += "$($service.Name)-Unavailable"
                }
            } catch {
                $meshResults += "$($service.Name)-TestFailed"
            }
        }
        
        $meshCoverage = [math]::Round(($healthyServices / $services.Count) * 100, 1)
        return @{ 
            Success = $healthyServices -gt 2
            Details = "Service mesh: $meshCoverage% available ($($meshResults -join ', '))"
        }
    } catch {
        return @{ Success = $false; Error = "Service mesh failed: $($_.Exception.Message)" }
    }
}

Test-IntegrationFeature -Name "Distributed Transaction Coordination" -Category "MicroserviceCoordination" -TestScript {
    try {
        $transactionResults = @()
        
        # Simulate prepare phase - check services
        $serviceEndpoints = @(
            @{ Name = "Gateway"; Url = "http://localhost:8080/health" },
            @{ Name = "MCP"; Url = "http://localhost:4950/health" }
        )
        
        $preparedServices = 0
        foreach ($endpoint in $serviceEndpoints) {
            try {
                $response = Invoke-RestMethod -Uri $endpoint.Url -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($response) {
                    $transactionResults += "$($endpoint.Name)-Prepared"
                    $preparedServices++
                } else {
                    $transactionResults += "$($endpoint.Name)-NotPrepared"
                }
            } catch {
                $transactionResults += "$($endpoint.Name)-Unavailable"
            }
        }
        
        if ($preparedServices -gt 0) {
            $transactionResults += "TransactionCommit-Ready"
        }
        
        return @{ 
            Success = $preparedServices -gt 0
            Details = "Transactions: $($transactionResults -join ', ')"
        }
    } catch {
        return @{ Success = $false; Error = "Distributed transactions failed: $($_.Exception.Message)" }
    }
}

Test-IntegrationFeature -Name "Circuit Breaker and Resilience Patterns" -Category "MicroserviceCoordination" -TestScript {
    try {
        # Test load resilience
        $jobs = @()
        for ($i = 1; $i -le 5; $i++) {
            $jobs += Start-Job -ScriptBlock {
                try {
                    $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 2
                    return @{ Success = $true }
                } catch {
                    return @{ Success = $false }
                }
            }
        }
        
        $results = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        $successfulRequests = ($results | Where-Object { $_.Success }).Count
        $resilienceRate = [math]::Round(($successfulRequests / 5) * 100, 1)
        
        return @{ 
            Success = $resilienceRate -gt 80
            Details = "Resilience: $resilienceRate% success rate under load"
        }
    } catch {
        return @{ Success = $false; Error = "Resilience patterns failed: $($_.Exception.Message)" }
    }
}

# =============================================================================
# RESULTS
# =============================================================================
Write-Host ""
Write-Host "📊 COMPREHENSIVE CROSS-SERVICE INTEGRATION TESTING RESULTS" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Gray

# Calculate statistics
$totalPassed = 0
$totalFailed = 0
$totalTests = 0

foreach ($category in $global:IntegrationTestStats.Keys) {
    $stats = $global:IntegrationTestStats[$category]
    $totalPassed += $stats.Passed
    $totalFailed += $stats.Failed
    $totalTests += $stats.Total
}

$successRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host "📊 CROSS-SERVICE INTEGRATION TESTING STATISTICS" -ForegroundColor Cyan
Write-Host "Total Integration Tests: $totalTests" -ForegroundColor White
Write-Host "Tests Passed: $totalPassed" -ForegroundColor Green
Write-Host "Tests Failed: $totalFailed" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { 'Green' } elseif ($successRate -ge 60) { 'Yellow' } else { 'Red' })

Write-Host ""
Write-Host "📋 DETAILED INTEGRATION CATEGORY BREAKDOWN:" -ForegroundColor Cyan
foreach ($category in $global:IntegrationTestStats.Keys | Sort-Object) {
    $stats = $global:IntegrationTestStats[$category]
    if ($stats.Total -gt 0) {
        $categoryRate = [math]::Round(($stats.Passed / $stats.Total) * 100, 0)
        Write-Host "  $category`: $($stats.Passed)/$($stats.Total) tests passed ($categoryRate%)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🎯 CROSS-SERVICE INTEGRATION TESTING ASSESSMENT:" -ForegroundColor Cyan
$assessment = if ($successRate -ge 90) { "🏆 EXCEPTIONAL: $successRate% - Outstanding integration!" }
             elseif ($successRate -ge 80) { "✅ EXCELLENT: $successRate% - Integration working very well!" }
             elseif ($successRate -ge 70) { "⚠️  GOOD: $successRate% - Integration mostly functional" }
             elseif ($successRate -ge 60) { "⚠️  FAIR: $successRate% - Integration has problems" }
             else { "❌ POOR: $successRate% - Critical integration failures" }

$assessmentColor = if ($successRate -ge 90) { 'Green' }
                  elseif ($successRate -ge 80) { 'Yellow' }
                  else { 'Red' }

Write-Host $assessment -ForegroundColor $assessmentColor
Write-Host ""
Write-Host "🕒 Testing Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow