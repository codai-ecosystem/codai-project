#!/usr/bin/env pwsh
# ==============================================================================
# RomAI AGI Comprehensive Health Check System
# Microsoft Azure ML Production Standards Compliance
# ==============================================================================

param(
    [Parameter(HelpMessage="Service to check: all, postgres, redis, cbd, agi, api, frontend, monitoring")]
    [ValidateSet("all", "postgres", "redis", "cbd", "agi", "api", "frontend", "monitoring")]
    [string]$Service = "all",
    
    [Parameter(HelpMessage="Output format: detailed, summary, json")]
    [ValidateSet("detailed", "summary", "json")]
    [string]$Format = "detailed",
    
    [Parameter(HelpMessage="Timeout for each health check in seconds")]
    [int]$Timeout = 10,
    
    [switch]$Continuous,
    [switch]$Alert
)

# ==============================================================================
# CONFIGURATION & GLOBALS
# ==============================================================================

$ErrorActionPreference = "Stop"

# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan
$White = [System.ConsoleColor]::White

# Service configuration
$Services = @{
    "postgres" = @{
        Name = "PostgreSQL Database"
        Port = 5432
        HealthEndpoint = $null
        DockerService = "postgres"
        Critical = $true
    }
    "redis" = @{
        Name = "Redis Cache"
        Port = 6379
        HealthEndpoint = $null
        DockerService = "redis"
        Critical = $true
    }
    "cbd" = @{
        Name = "CBD Database"
        Port = 4180
        HealthEndpoint = "http://localhost:4180/health"
        DockerService = "cbd-database"
        Critical = $true
    }
    "agi" = @{
        Name = "RomAI AGI Model Server"
        Port = 6101
        HealthEndpoint = "http://localhost:6101/health"
        DockerService = "romai-agi"
        Critical = $true
    }
    "api" = @{
        Name = "RomAI Enterprise API"
        Port = 8001
        HealthEndpoint = "http://localhost:8001/api/v1/health"
        DockerService = "romai-enterprise-api"
        Critical = $true
    }
    "frontend" = @{
        Name = "RomAI Frontend Application"
        Port = 6100
        HealthEndpoint = "http://localhost:6100/api/health"
        DockerService = "romai-frontend"
        Critical = $false
    }
    "monitoring" = @{
        Name = "Monitoring Stack"
        Port = 9090
        HealthEndpoint = "http://localhost:9090/-/healthy"
        DockerService = "prometheus"
        Critical = $false
    }
}

# Results storage
$HealthResults = @{}

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

function Write-ColorOutput {
    param($Message, $Color = [System.ConsoleColor]::White)
    Write-Host $Message -ForegroundColor $Color
}

function Write-Section {
    param($Title)
    Write-ColorOutput "`n==============================================================================`n$Title`n==============================================================================" $Cyan
}

function Get-Timestamp {
    return Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

function Test-TcpConnection {
    param($Hostname, $Port, $TimeoutSeconds = 5)
    
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $task = $tcpClient.ConnectAsync($Hostname, $Port)
        $result = $task.Wait($TimeoutSeconds * 1000)
        $tcpClient.Close()
        return $result
    }
    catch {
        return $false
    }
}

function Test-HttpEndpoint {
    param($Url, $TimeoutSeconds = 10)
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec $TimeoutSeconds -ErrorAction Stop
        return @{
            Success = $true
            StatusCode = 200
            Response = $response
            Error = $null
        }
    }
    catch {
        return @{
            Success = $false
            StatusCode = $null
            Response = $null
            Error = $_.Exception.Message
        }
    }
}

function Test-DockerService {
    param($ServiceName)
    
    try {
        $result = docker ps --filter "name=$ServiceName" --filter "status=running" --format "{{.Names}}" 2>$null
        return -not [string]::IsNullOrWhiteSpace($result)
    }
    catch {
        return $false
    }
}

function Get-ServiceMetrics {
    param($ServiceName, $ServiceConfig)
    
    $metrics = @{
        ServiceName = $ServiceName
        DisplayName = $ServiceConfig.Name
        Timestamp = Get-Timestamp
        Port = $ServiceConfig.Port
        Critical = $ServiceConfig.Critical
        DockerRunning = $false
        PortOpen = $false
        HealthEndpointHealthy = $false
        ResponseTime = $null
        HealthResponse = $null
        ErrorMessage = $null
        OverallStatus = "UNKNOWN"
    }
    
    # Check Docker container status
    Write-Verbose "Checking Docker service: $($ServiceConfig.DockerService)"
    $metrics.DockerRunning = Test-DockerService -ServiceName $ServiceConfig.DockerService
    
    # Check port connectivity
    if ($metrics.DockerRunning) {
        Write-Verbose "Testing TCP connection: localhost:$($ServiceConfig.Port)"
        $metrics.PortOpen = Test-TcpConnection -Hostname "localhost" -Port $ServiceConfig.Port -TimeoutSeconds $Timeout
    }
    
    # Check health endpoint if available
    if ($metrics.PortOpen -and $ServiceConfig.HealthEndpoint) {
        Write-Verbose "Testing health endpoint: $($ServiceConfig.HealthEndpoint)"
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $healthResult = Test-HttpEndpoint -Url $ServiceConfig.HealthEndpoint -TimeoutSeconds $Timeout
        $stopwatch.Stop()
        
        $metrics.ResponseTime = $stopwatch.ElapsedMilliseconds
        $metrics.HealthEndpointHealthy = $healthResult.Success
        $metrics.HealthResponse = $healthResult.Response
        if (-not $healthResult.Success) {
            $metrics.ErrorMessage = $healthResult.Error
        }
    }
    
    # Determine overall status
    if ($ServiceConfig.HealthEndpoint) {
        # For services with health endpoints, all checks must pass
        $metrics.OverallStatus = if ($metrics.DockerRunning -and $metrics.PortOpen -and $metrics.HealthEndpointHealthy) { "HEALTHY" } else { "UNHEALTHY" }
    }
    else {
        # For services without health endpoints, Docker + Port is sufficient
        $metrics.OverallStatus = if ($metrics.DockerRunning -and $metrics.PortOpen) { "HEALTHY" } else { "UNHEALTHY" }
    }
    
    return $metrics
}

# ==============================================================================
# SPECIALIZED HEALTH CHECKS
# ==============================================================================

function Test-PostgreSQLHealth {
    Write-Verbose "Performing PostgreSQL-specific health checks"
    
    # Test basic connection to database
    try {
        # Use docker exec to run pg_isready inside the container
        $result = docker exec postgres pg_isready -h localhost -p 5432 2>$null
        $isReady = $LASTEXITCODE -eq 0
        
        if ($isReady) {
            # Test database connectivity with sample query
            $queryResult = docker exec postgres psql -h localhost -U romai -d romai_enterprise -c "SELECT 1;" 2>$null
            $canQuery = $LASTEXITCODE -eq 0
            
            return @{
                IsReady = $isReady
                CanQuery = $canQuery
                Details = if ($canQuery) { "Database fully operational" } else { "Database accepting connections but query failed" }
            }
        }
        else {
            return @{
                IsReady = $false
                CanQuery = $false
                Details = "PostgreSQL not ready to accept connections"
            }
        }
    }
    catch {
        return @{
            IsReady = $false
            CanQuery = $false
            Details = "Error testing PostgreSQL: $($_.Exception.Message)"
        }
    }
}

function Test-RedisHealth {
    Write-Verbose "Performing Redis-specific health checks"
    
    try {
        # Use docker exec to run redis-cli ping
        $result = docker exec redis redis-cli ping 2>$null
        $isHealthy = ($LASTEXITCODE -eq 0) -and ($result -eq "PONG")
        
        if ($isHealthy) {
            # Test basic Redis operations
            docker exec redis redis-cli set health_check_test "$(Get-Date)" EX 60 2>$null | Out-Null
            $canWrite = $LASTEXITCODE -eq 0
            
            $value = docker exec redis redis-cli get health_check_test 2>$null
            $canRead = $LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($value)
            
            return @{
                Ping = $isHealthy
                CanWrite = $canWrite
                CanRead = $canRead
                Details = if ($canRead) { "Redis fully operational" } else { "Redis ping OK but operations failing" }
            }
        }
        else {
            return @{
                Ping = $false
                CanWrite = $false
                CanRead = $false
                Details = "Redis not responding to ping"
            }
        }
    }
    catch {
        return @{
            Ping = $false
            CanWrite = $false
            CanRead = $false
            Details = "Error testing Redis: $($_.Exception.Message)"
        }
    }
}

function Test-AGIModelHealth {
    Write-Verbose "Performing AGI Model Server-specific health checks"
    
    try {
        # Test basic health endpoint
        $healthResult = Test-HttpEndpoint -Url "http://localhost:6101/health" -TimeoutSeconds ($Timeout * 2)
        
        if ($healthResult.Success) {
            # Test model readiness endpoint
            $readinessResult = Test-HttpEndpoint -Url "http://localhost:6101/ready" -TimeoutSeconds ($Timeout * 2)
            
            # Test Romanian language capability
            $romanianTestPayload = @{
                text = "Salut! Cum te numesti?"
                task = "language_detection"
            } | ConvertTo-Json
            
            try {
                $romanianResult = Invoke-RestMethod -Uri "http://localhost:6101/api/v1/analyze" -Method Post -Body $romanianTestPayload -ContentType "application/json" -TimeoutSec $Timeout
                $romanianCapable = $true
            }
            catch {
                $romanianCapable = $false
            }
            
            return @{
                HealthEndpoint = $healthResult.Success
                ReadinessEndpoint = $readinessResult.Success
                RomanianCapability = $romanianCapable
                Details = "AGI Model Server operational with $(if ($romanianCapable) { 'Romanian' } else { 'limited'}) language support"
            }
        }
        else {
            return @{
                HealthEndpoint = $false
                ReadinessEndpoint = $false
                RomanianCapability = $false
                Details = "AGI Model Server health endpoint not responding: $($healthResult.Error)"
            }
        }
    }
    catch {
        return @{
            HealthEndpoint = $false
            ReadinessEndpoint = $false
            RomanianCapability = $false
            Details = "Error testing AGI Model Server: $($_.Exception.Message)"
        }
    }
}

# ==============================================================================
# MAIN HEALTH CHECK FUNCTIONS
# ==============================================================================

function Invoke-ServiceHealthCheck {
    param($ServiceName)
    
    if (-not $Services.ContainsKey($ServiceName)) {
        throw "Unknown service: $ServiceName"
    }
    
    $serviceConfig = $Services[$ServiceName]
    Write-ColorOutput "🔍 Checking $($serviceConfig.Name)..." $Yellow
    
    $metrics = Get-ServiceMetrics -ServiceName $ServiceName -ServiceConfig $serviceConfig
    
    # Add specialized health checks
    switch ($ServiceName) {
        "postgres" {
            $specializedResult = Test-PostgreSQLHealth
            $metrics.SpecializedChecks = $specializedResult
        }
        "redis" {
            $specializedResult = Test-RedisHealth
            $metrics.SpecializedChecks = $specializedResult
        }
        "agi" {
            $specializedResult = Test-AGIModelHealth
            $metrics.SpecializedChecks = $specializedResult
        }
    }
    
    $HealthResults[$ServiceName] = $metrics
    
    # Display results based on format
    if ($Format -eq "detailed") {
        Display-DetailedResults -ServiceName $ServiceName -Metrics $metrics
    }
    elseif ($Format -eq "summary") {
        Display-SummaryResults -ServiceName $ServiceName -Metrics $metrics
    }
    
    return $metrics
}

function Display-DetailedResults {
    param($ServiceName, $Metrics)
    
    $statusColor = if ($Metrics.OverallStatus -eq "HEALTHY") { $Green } else { $Red }
    $statusIcon = if ($Metrics.OverallStatus -eq "HEALTHY") { "✅" } else { "❌" }
    
    Write-ColorOutput "  $statusIcon $($Metrics.DisplayName): $($Metrics.OverallStatus)" $statusColor
    Write-ColorOutput "    🐳 Docker Container: $(if ($Metrics.DockerRunning) { "Running" } else { "Not Running" })" $(if ($Metrics.DockerRunning) { $Green } else { $Red })
    Write-ColorOutput "    🌐 Port $($Metrics.Port): $(if ($Metrics.PortOpen) { "Open" } else { "Closed" })" $(if ($Metrics.PortOpen) { $Green } else { $Red })
    
    if ($Metrics.ResponseTime) {
        Write-ColorOutput "    ⏱️  Response Time: $($Metrics.ResponseTime)ms" $(if ($Metrics.ResponseTime -lt 1000) { $Green } elseif ($Metrics.ResponseTime -lt 3000) { $Yellow } else { $Red })
    }
    
    if ($Metrics.SpecializedChecks) {
        Write-ColorOutput "    🔧 Specialized Checks:" $Cyan
        $Metrics.SpecializedChecks.GetEnumerator() | ForEach-Object {
            if ($_.Key -ne "Details") {
                $checkColor = if ($_.Value -eq $true) { $Green } else { $Red }
                $checkIcon = if ($_.Value -eq $true) { "✅" } else { "❌" }
                Write-ColorOutput "      $checkIcon $($_.Key): $($_.Value)" $checkColor
            }
        }
        if ($Metrics.SpecializedChecks.Details) {
            Write-ColorOutput "      💡 $($Metrics.SpecializedChecks.Details)" $White
        }
    }
    
    if ($Metrics.ErrorMessage) {
        Write-ColorOutput "    ⚠️  Error: $($Metrics.ErrorMessage)" $Red
    }
    
    Write-Host ""
}

function Display-SummaryResults {
    param($ServiceName, $Metrics)
    
    $statusColor = if ($Metrics.OverallStatus -eq "HEALTHY") { $Green } else { $Red }
    $statusIcon = if ($Metrics.OverallStatus -eq "HEALTHY") { "✅" } else { "❌" }
    
    Write-ColorOutput "  $statusIcon $($Metrics.DisplayName): $($Metrics.OverallStatus)" $statusColor
}

function Invoke-AllHealthChecks {
    Write-Section "🏥 RomAI AGI COMPREHENSIVE HEALTH CHECK SYSTEM"
    Write-ColorOutput "Timestamp: $(Get-Timestamp)" $White
    Write-ColorOutput "Timeout: $Timeout seconds" $White
    Write-Host ""
    
    $servicesToCheck = if ($Service -eq "all") { $Services.Keys } else { @($Service) }
    
    foreach ($serviceName in $servicesToCheck) {
        Invoke-ServiceHealthCheck -ServiceName $serviceName
    }
    
    # Generate overall summary
    Write-Section "📊 HEALTH CHECK SUMMARY"
    
    $totalServices = $HealthResults.Count
    $healthyServices = ($HealthResults.Values | Where-Object { $_.OverallStatus -eq "HEALTHY" }).Count
    $criticalUnhealthy = ($HealthResults.Values | Where-Object { $_.Critical -and $_.OverallStatus -ne "HEALTHY" }).Count
    
    Write-ColorOutput "Total Services Checked: $totalServices" $White
    Write-ColorOutput "Healthy Services: $healthyServices" $(if ($healthyServices -eq $totalServices) { $Green } else { $Yellow })
    Write-ColorOutput "Critical Services Unhealthy: $criticalUnhealthy" $(if ($criticalUnhealthy -eq 0) { $Green } else { $Red })
    
    $overallStatus = if ($criticalUnhealthy -eq 0) { "SYSTEM HEALTHY" } else { "SYSTEM DEGRADED" }
    $overallColor = if ($criticalUnhealthy -eq 0) { $Green } else { $Red }
    $overallIcon = if ($criticalUnhealthy -eq 0) { "✅" } else { "❌" }
    
    Write-ColorOutput "`n$overallIcon OVERALL STATUS: $overallStatus" $overallColor
    
    if ($Format -eq "json") {
        Write-Section "📄 JSON OUTPUT"
        $jsonOutput = @{
            Timestamp = Get-Timestamp
            OverallStatus = $overallStatus
            TotalServices = $totalServices
            HealthyServices = $healthyServices
            CriticalUnhealthy = $criticalUnhealthy
            Services = $HealthResults
        } | ConvertTo-Json -Depth 10
        
        Write-Host $jsonOutput
        
        # Save JSON to file
        $jsonFile = "health-check-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
        $jsonOutput | Out-File -FilePath $jsonFile -Encoding UTF8
        Write-ColorOutput "`n💾 Results saved to: $jsonFile" $Cyan
    }
}

# ==============================================================================
# CONTINUOUS MONITORING
# ==============================================================================

function Start-ContinuousMonitoring {
    Write-Section "🔄 CONTINUOUS HEALTH MONITORING"
    Write-ColorOutput "Press Ctrl+C to stop monitoring" $Yellow
    Write-Host ""
    
    $iteration = 0
    while ($true) {
        try {
            $iteration++
            Write-ColorOutput "=== Monitoring Iteration $iteration - $(Get-Timestamp) ===" $Cyan
            
            Invoke-AllHealthChecks
            
            Write-ColorOutput "`nWaiting 60 seconds before next check..." $White
            Start-Sleep -Seconds 60
            
            Clear-Host
        }
        catch [System.Management.Automation.HaltCommandException] {
            Write-ColorOutput "`n🛑 Monitoring stopped by user" $Yellow
            break
        }
        catch {
            Write-ColorOutput "`n❌ Error during monitoring: $($_.Exception.Message)" $Red
            Start-Sleep -Seconds 10
        }
    }
}

# ==============================================================================
# ALERTING SYSTEM
# ==============================================================================

function Send-HealthAlert {
    param($AlertType, $ServiceName, $Message)
    
    $timestamp = Get-Timestamp
    $alertMessage = "[$timestamp] $AlertType - $ServiceName: $Message"
    
    Write-ColorOutput "🚨 ALERT: $alertMessage" $Red
    
    # Log to file
    $alertLogFile = "health-alerts.log"
    Add-Content -Path $alertLogFile -Value $alertMessage
    
    # In a production environment, you would integrate with:
    # - Azure Monitor alerts
    # - Email notifications
    # - Slack/Teams notifications
    # - SMS alerts
    # - PagerDuty
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

try {
    if ($Continuous) {
        Start-ContinuousMonitoring
    }
    else {
        Invoke-AllHealthChecks
    }
    
    # Exit with appropriate code
    $criticalFailures = ($HealthResults.Values | Where-Object { $_.Critical -and $_.OverallStatus -ne "HEALTHY" }).Count
    $exitCode = if ($criticalFailures -eq 0) { 0 } else { 1 }
    
    exit $exitCode
}
catch {
    Write-ColorOutput "❌ Fatal error during health checks: $($_.Exception.Message)" $Red
    exit 2
}