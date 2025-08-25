#!/usr/bin/env pwsh
# CODAI ECOSYSTEM - SERVICE INTEGRATION DIAGNOSTICS
# =================================================

param(
    [switch]$Verbose = $false,
    [switch]$TestDatabaseConnections = $true,
    [switch]$TestAPIEndpoints = $true,
    [int]$TimeoutSeconds = 15
)

Write-Host "🔗 CODAI ECOSYSTEM - SERVICE INTEGRATION DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Gray
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "🎯 Comprehensive service-to-service communication, database connections, and API integration testing" -ForegroundColor White
Write-Host ""

# Global service integration results
$global:IntegrationDiagnostics = @{
    DatabaseConnections = @()
    APIIntegrations = @()
    ServiceMeshConnectivity = @()
    CrossServiceAuthentication = @()
    DataFlowValidation = @()
    CriticalIntegrationFailures = @()
    RecommendedActions = @()
}

function Write-IntegrationSection {
    param([string]$Title, [string]$Color = "Magenta")
    Write-Host ""
    Write-Host "🔗 $Title" -ForegroundColor $Color
    Write-Host ("=" * ($Title.Length + 3)) -ForegroundColor Gray
}

function Test-DatabaseConnection {
    param(
        [string]$ServiceContainer,
        [string]$DatabaseHost,
        [string]$DatabasePort,
        [string]$DatabaseName,
        [string]$Description
    )
    
    try {
        # Test database connectivity from within a service container
        $testCommand = "docker exec $ServiceContainer sh -c 'nc -z $DatabaseHost $DatabasePort'"
        $result = Invoke-Expression $testCommand 2>$null
        $exitCode = $LASTEXITCODE
        
        return @{
            ServiceContainer = $ServiceContainer
            DatabaseHost = $DatabaseHost
            DatabasePort = $DatabasePort
            DatabaseName = $DatabaseName
            Description = $Description
            Connected = ($exitCode -eq 0)
            ResponseTime = if ($exitCode -eq 0) { "Connected" } else { "Failed" }
            Issue = if ($exitCode -eq 0) { "" } else { "Cannot connect to database" }
        }
        
    } catch {
        return @{
            ServiceContainer = $ServiceContainer
            DatabaseHost = $DatabaseHost
            DatabasePort = $DatabasePort
            DatabaseName = $DatabaseName
            Description = $Description
            Connected = $false
            ResponseTime = "Error"
            Issue = "Database connection test failed: $($_.Exception.Message)"
        }
    }
}

function Test-ServiceAPIIntegration {
    param(
        [string]$SourceService,
        [string]$TargetServiceUrl,
        [string]$Endpoint,
        [string]$Method = "GET",
        [string]$Description,
        [hashtable]$Headers = @{}
    )
    
    try {
        $fullUrl = if ($Endpoint) { "$TargetServiceUrl$Endpoint" } else { $TargetServiceUrl }
        
        # Test API integration with proper headers and timeout
        $requestParams = @{
            Uri = $fullUrl
            Method = $Method
            TimeoutSec = $TimeoutSeconds
            UseBasicParsing = $true
            ErrorAction = 'Stop'
        }
        
        if ($Headers.Count -gt 0) {
            $requestParams.Headers = $Headers
        }
        
        $startTime = Get-Date
        $response = Invoke-WebRequest @requestParams
        $responseTime = ((Get-Date) - $startTime).TotalMilliseconds
        
        return @{
            SourceService = $SourceService
            TargetUrl = $fullUrl
            Description = $Description
            Success = $true
            StatusCode = $response.StatusCode
            ResponseTime = [math]::Round($responseTime, 0)
            ContentLength = $response.Content.Length
            ContentType = $response.Headers['Content-Type']
            Issue = ""
        }
        
    } catch {
        return @{
            SourceService = $SourceService
            TargetUrl = $fullUrl
            Description = $Description
            Success = $false
            StatusCode = "ERROR"
            ResponseTime = "N/A"
            ContentLength = 0
            ContentType = "N/A"
            Issue = $_.Exception.Message
        }
    }
}

function Test-ContainerNetworkConnectivity {
    param([string]$SourceContainer, [string]$TargetContainer, [string]$TargetPort)
    
    try {
        # Test network connectivity between containers
        $testCommand = "docker exec $SourceContainer sh -c 'nc -z $TargetContainer $TargetPort'"
        $result = Invoke-Expression $testCommand 2>$null
        $exitCode = $LASTEXITCODE
        
        return @{
            Source = $SourceContainer
            Target = $TargetContainer
            Port = $TargetPort
            Connected = ($exitCode -eq 0)
            Issue = if ($exitCode -eq 0) { "" } else { "Cannot establish network connection" }
        }
        
    } catch {
        return @{
            Source = $SourceContainer
            Target = $TargetContainer
            Port = $TargetPort
            Connected = $false
            Issue = "Network connectivity test failed: $($_.Exception.Message)"
        }
    }
}

function Test-ServiceAuthentication {
    param(
        [string]$ServiceUrl,
        [string]$AuthEndpoint,
        [string]$ServiceName,
        [hashtable]$AuthData = @{}
    )
    
    try {
        $authUrl = "$ServiceUrl$AuthEndpoint"
        
        # Test authentication endpoint
        $authResponse = Invoke-WebRequest -Uri $authUrl -Method POST -Body ($AuthData | ConvertTo-Json) -ContentType "application/json" -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        
        return @{
            Service = $ServiceName
            AuthUrl = $authUrl
            Success = $true
            StatusCode = $authResponse.StatusCode
            HasAuthToken = $authResponse.Content -like "*token*" -or $authResponse.Content -like "*jwt*"
            Issue = ""
        }
        
    } catch {
        return @{
            Service = $ServiceName
            AuthUrl = $authUrl
            Success = $false
            StatusCode = "ERROR"
            HasAuthToken = $false
            Issue = $_.Exception.Message
        }
    }
}

function Test-DataFlowIntegration {
    param(
        [string]$SourceService,
        [string]$TargetService, 
        [string]$DataEndpoint,
        [string]$Description
    )
    
    try {
        # Test data flow by creating/reading data
        $createData = @{ test = "integration_test"; timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ") }
        
        # First, try to create test data
        $createResponse = Invoke-WebRequest -Uri $DataEndpoint -Method POST -Body ($createData | ConvertTo-Json) -ContentType "application/json" -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        
        return @{
            SourceService = $SourceService
            TargetService = $TargetService
            DataEndpoint = $DataEndpoint
            Description = $Description
            Success = $true
            CreateStatusCode = $createResponse.StatusCode
            DataFlowWorking = $true
            Issue = ""
        }
        
    } catch {
        return @{
            SourceService = $SourceService
            TargetService = $TargetService
            DataEndpoint = $DataEndpoint
            Description = $Description
            Success = $false
            CreateStatusCode = "ERROR"
            DataFlowWorking = $false
            Issue = $_.Exception.Message
        }
    }
}

# =============================================================================
# PHASE 1: DATABASE CONNECTIVITY TESTING
# =============================================================================
Write-IntegrationSection "DATABASE CONNECTIVITY TESTING"

if ($TestDatabaseConnections) {
    Write-Host "Testing database connections for running services..." -ForegroundColor Yellow
    
    # Define database connection tests based on our known services
    $databaseTests = @(
        @{ Service = "codai-memorai-graphql-api"; Host = "codai-postgresql-db"; Port = "5432"; DB = "codai_ecosystem"; Desc = "GraphQL API to PostgreSQL" },
        @{ Service = "codai-memorai-mcp-api"; Host = "codai-cbd-db"; Port = "4180"; DB = "cbd"; Desc = "MCP API to CBD Database" },
        @{ Service = "codai-bancai-frontend"; Host = "codai-postgresql-db"; Port = "5432"; DB = "codai_bancai"; Desc = "BancAI to PostgreSQL" },
        @{ Service = "codai-romai-compliance-api"; Host = "codai-postgresql-db"; Port = "5432"; DB = "codai_main"; Desc = "Compliance API to PostgreSQL" },
        @{ Service = "codai-main-api-gateway"; Host = "codai-redis-cache"; Port = "6379"; DB = "redis"; Desc = "Gateway to Redis Cache" }
    )
    
    foreach ($dbTest in $databaseTests) {
        $dbResult = Test-DatabaseConnection -ServiceContainer $dbTest.Service -DatabaseHost $dbTest.Host -DatabasePort $dbTest.Port -DatabaseName $dbTest.DB -Description $dbTest.Desc
        $global:IntegrationDiagnostics.DatabaseConnections += $dbResult
        
        $statusColor = if ($dbResult.Connected) { "Green" } else { "Red" }
        
        Write-Host "  $($dbTest.Desc.PadRight(35))" -NoNewline -ForegroundColor White
        
        if ($dbResult.Connected) {
            Write-Host " ✅ CONNECTED" -ForegroundColor Green
        } else {
            Write-Host " ❌ FAILED" -ForegroundColor Red
            Write-Host "     Issue: $($dbResult.Issue)" -ForegroundColor Red
            $global:IntegrationDiagnostics.CriticalIntegrationFailures += "DATABASE: $($dbTest.Desc) - $($dbResult.Issue)"
        }
    }
} else {
    Write-Host "⏭️ Database connection testing skipped" -ForegroundColor Gray
}

# =============================================================================
# PHASE 2: API INTEGRATION TESTING
# =============================================================================
Write-IntegrationSection "API INTEGRATION TESTING"

if ($TestAPIEndpoints) {
    Write-Host "Testing critical API integrations..." -ForegroundColor Yellow
    
    # Define API integration tests based on actual service architecture
    $apiTests = @(
        @{ Source = "ControlAI Frontend"; TargetUrl = "http://localhost:4500"; Endpoint = "/health"; Desc = "ControlAI to GraphQL API" },
        @{ Source = "RomAI Frontend"; TargetUrl = "http://localhost:8001"; Endpoint = "/api/v1/health"; Desc = "RomAI to Compliance API" },
        @{ Source = "GraphQL API"; TargetUrl = "http://localhost:4950"; Endpoint = "/health"; Desc = "GraphQL to MCP Server" },
        @{ Source = "Load Balancer"; TargetUrl = "http://localhost:4200"; Endpoint = "/api/health"; Desc = "Load Balancer to ControlAI" },
        @{ Source = "Load Balancer"; TargetUrl = "http://localhost:6100"; Endpoint = "/api/health"; Desc = "Load Balancer to RomAI" },
        @{ Source = "MCP Server"; TargetUrl = "http://localhost:4180"; Endpoint = "/health"; Desc = "MCP to CBD Database" }
    )
    
    foreach ($apiTest in $apiTests) {
        $apiResult = Test-ServiceAPIIntegration -SourceService $apiTest.Source -TargetServiceUrl $apiTest.TargetUrl -Endpoint $apiTest.Endpoint -Description $apiTest.Desc
        $global:IntegrationDiagnostics.APIIntegrations += $apiResult
        
        $statusColor = if ($apiResult.Success) { "Green" } else { "Red" }
        
        Write-Host "  $($apiTest.Desc.PadRight(35))" -NoNewline -ForegroundColor White
        
        if ($apiResult.Success) {
            Write-Host " ✅ HTTP $($apiResult.StatusCode)" -NoNewline -ForegroundColor Green
            Write-Host " ($($apiResult.ResponseTime)ms)" -ForegroundColor Gray
            if ($Verbose) {
                Write-Host "     Content-Type: $($apiResult.ContentType), Size: $($apiResult.ContentLength) bytes" -ForegroundColor Gray
            }
        } else {
            Write-Host " ❌ FAILED" -ForegroundColor Red
            Write-Host "     Issue: $($apiResult.Issue)" -ForegroundColor Red
            $global:IntegrationDiagnostics.CriticalIntegrationFailures += "API: $($apiTest.Desc) - $($apiResult.Issue)"
        }
    }
} else {
    Write-Host "⏭️ API integration testing skipped" -ForegroundColor Gray
}

# =============================================================================
# PHASE 3: CONTAINER NETWORK MESH TESTING
# =============================================================================
Write-IntegrationSection "CONTAINER NETWORK MESH TESTING"

Write-Host "Testing inter-container network connectivity..." -ForegroundColor Yellow

# Define container-to-container network tests
$networkTests = @(
    @{ Source = "codai-memorai-graphql-api"; Target = "codai-memorai-mcp-api"; Port = "4950"; Desc = "GraphQL to MCP" },
    @{ Source = "codai-memorai-mcp-api"; Target = "codai-postgresql-db"; Port = "5432"; Desc = "MCP to Database" },
    @{ Source = "codai-controlai-frontend"; Target = "codai-memorai-graphql-api"; Port = "4500"; Desc = "ControlAI to GraphQL" },
    @{ Source = "codai-romai-frontend"; Target = "codai-romai-compliance-api"; Port = "8001"; Desc = "RomAI to Compliance API" },
    @{ Source = "codai-main-api-gateway"; Target = "codai-redis-cache"; Port = "6379"; Desc = "Gateway to Redis" }
)

foreach ($netTest in $networkTests) {
    $netResult = Test-ContainerNetworkConnectivity -SourceContainer $netTest.Source -TargetContainer $netTest.Target -TargetPort $netTest.Port
    $global:IntegrationDiagnostics.ServiceMeshConnectivity += $netResult
    
    Write-Host "  $($netTest.Desc.PadRight(35))" -NoNewline -ForegroundColor White
    
    if ($netResult.Connected) {
        Write-Host " ✅ NETWORK OK" -ForegroundColor Green
    } else {
        Write-Host " ❌ NO CONNECTION" -ForegroundColor Red
        Write-Host "     Issue: $($netResult.Issue)" -ForegroundColor Red
        $global:IntegrationDiagnostics.CriticalIntegrationFailures += "NETWORK: $($netTest.Desc) - $($netResult.Issue)"
    }
}

# =============================================================================
# PHASE 4: AUTHENTICATION INTEGRATION TESTING
# =============================================================================
Write-IntegrationSection "AUTHENTICATION INTEGRATION TESTING"

Write-Host "Testing service authentication mechanisms..." -ForegroundColor Yellow

# Define authentication tests for services that support it
$authTests = @(
    @{ Url = "http://localhost:4500"; Endpoint = "/auth"; Service = "GraphQL API"; Data = @{ query = "{ __schema { types { name } } }" } },
    @{ Url = "http://localhost:8001"; Endpoint = "/api/v1/auth/validate"; Service = "Compliance API"; Data = @{ token = "test" } },
    @{ Url = "http://localhost:4950"; Endpoint = "/auth"; Service = "MCP Server"; Data = @{ key = "memorai-dev-key-2025" } }
)

foreach ($authTest in $authTests) {
    $authResult = Test-ServiceAuthentication -ServiceUrl $authTest.Url -AuthEndpoint $authTest.Endpoint -ServiceName $authTest.Service -AuthData $authTest.Data
    $global:IntegrationDiagnostics.CrossServiceAuthentication += $authResult
    
    Write-Host "  $($authTest.Service.PadRight(20))" -NoNewline -ForegroundColor White
    
    if ($authResult.Success) {
        Write-Host " ✅ AUTH OK" -NoNewline -ForegroundColor Green
        if ($authResult.HasAuthToken) {
            Write-Host " (Token Present)" -ForegroundColor Gray
        } else {
            Write-Host "" -ForegroundColor Gray
        }
    } else {
        Write-Host " ❌ AUTH FAILED" -ForegroundColor Red
        Write-Host "     Issue: $($authResult.Issue)" -ForegroundColor Red
    }
}

# =============================================================================
# PHASE 5: DATA FLOW VALIDATION TESTING
# =============================================================================
Write-IntegrationSection "DATA FLOW VALIDATION TESTING"

Write-Host "Testing end-to-end data flow integrations..." -ForegroundColor Yellow

# Define data flow tests for critical paths
$dataFlowTests = @(
    @{ Source = "ControlAI"; Target = "GraphQL"; Endpoint = "http://localhost:4500/graphql"; Desc = "Frontend to API Data Flow" },
    @{ Source = "GraphQL"; Target = "MCP"; Endpoint = "http://localhost:4950/api/memories"; Desc = "API to MCP Data Flow" },
    @{ Source = "MCP"; Target = "CBD"; Endpoint = "http://localhost:4180/data"; Desc = "MCP to Database Data Flow" },
    @{ Source = "Compliance"; Target = "Database"; Endpoint = "http://localhost:8001/api/v1/compliance/test"; Desc = "Compliance Data Validation" }
)

foreach ($dataTest in $dataFlowTests) {
    $dataResult = Test-DataFlowIntegration -SourceService $dataTest.Source -TargetService $dataTest.Target -DataEndpoint $dataTest.Endpoint -Description $dataTest.Desc
    $global:IntegrationDiagnostics.DataFlowValidation += $dataResult
    
    Write-Host "  $($dataTest.Desc.PadRight(35))" -NoNewline -ForegroundColor White
    
    if ($dataResult.Success) {
        Write-Host " ✅ DATA FLOW OK" -NoNewline -ForegroundColor Green
        Write-Host " (HTTP $($dataResult.CreateStatusCode))" -ForegroundColor Gray
    } else {
        Write-Host " ❌ DATA FLOW FAILED" -ForegroundColor Red
        Write-Host "     Issue: $($dataResult.Issue)" -ForegroundColor Red
        $global:IntegrationDiagnostics.CriticalIntegrationFailures += "DATA_FLOW: $($dataTest.Desc) - $($dataResult.Issue)"
    }
}

# =============================================================================
# COMPREHENSIVE SERVICE INTEGRATION SUMMARY
# =============================================================================
Write-IntegrationSection "COMPREHENSIVE SERVICE INTEGRATION SUMMARY" "Green"

$totalDatabaseTests = $global:IntegrationDiagnostics.DatabaseConnections.Count
$successfulDbConnections = ($global:IntegrationDiagnostics.DatabaseConnections | Where-Object { $_.Connected }).Count

$totalAPITests = $global:IntegrationDiagnostics.APIIntegrations.Count
$successfulAPIIntegrations = ($global:IntegrationDiagnostics.APIIntegrations | Where-Object { $_.Success }).Count

$totalNetworkTests = $global:IntegrationDiagnostics.ServiceMeshConnectivity.Count
$successfulNetworkConnections = ($global:IntegrationDiagnostics.ServiceMeshConnectivity | Where-Object { $_.Connected }).Count

$totalAuthTests = $global:IntegrationDiagnostics.CrossServiceAuthentication.Count
$successfulAuthTests = ($global:IntegrationDiagnostics.CrossServiceAuthentication | Where-Object { $_.Success }).Count

$totalDataFlowTests = $global:IntegrationDiagnostics.DataFlowValidation.Count
$successfulDataFlows = ($global:IntegrationDiagnostics.DataFlowValidation | Where-Object { $_.Success }).Count

$totalCriticalFailures = $global:IntegrationDiagnostics.CriticalIntegrationFailures.Count

Write-Host "📊 SERVICE INTEGRATION METRICS:" -ForegroundColor Cyan
Write-Host "Database Connectivity:"
Write-Host "  • Database Tests: $successfulDbConnections/$totalDatabaseTests ($([math]::Round(($successfulDbConnections/$totalDatabaseTests)*100,1))%)"

Write-Host "API Integration:"
Write-Host "  • API Tests: $successfulAPIIntegrations/$totalAPITests ($([math]::Round(($successfulAPIIntegrations/$totalAPITests)*100,1))%)"

Write-Host "Network Mesh Connectivity:"
Write-Host "  • Network Tests: $successfulNetworkConnections/$totalNetworkTests ($([math]::Round(($successfulNetworkConnections/$totalNetworkTests)*100,1))%)"

Write-Host "Authentication Integration:"
Write-Host "  • Auth Tests: $successfulAuthTests/$totalAuthTests ($([math]::Round(($successfulAuthTests/$totalAuthTests)*100,1))%)"

Write-Host "Data Flow Validation:"
Write-Host "  • Data Flow Tests: $successfulDataFlows/$totalDataFlowTests ($([math]::Round(($successfulDataFlows/$totalDataFlowTests)*100,1))%)"

Write-Host ""
Write-Host "🎯 OVERALL INTEGRATION HEALTH:" -ForegroundColor Cyan

$totalTests = $totalDatabaseTests + $totalAPITests + $totalNetworkTests + $totalAuthTests + $totalDataFlowTests
$totalSuccessful = $successfulDbConnections + $successfulAPIIntegrations + $successfulNetworkConnections + $successfulAuthTests + $successfulDataFlows

$integrationHealthScore = if ($totalTests -gt 0) { [math]::Round(($totalSuccessful / $totalTests) * 100, 1) } else { 0 }

if ($integrationHealthScore -ge 90) {
    Write-Host "🟢 EXCELLENT ($integrationHealthScore%) - Service integration is highly reliable" -ForegroundColor Green
} elseif ($integrationHealthScore -ge 70) {
    Write-Host "🟡 GOOD ($integrationHealthScore%) - Integration mostly functional with minor issues" -ForegroundColor Yellow
} elseif ($integrationHealthScore -ge 50) {
    Write-Host "🟠 FAIR ($integrationHealthScore%) - Integration has significant communication problems" -ForegroundColor DarkYellow
} else {
    Write-Host "🔴 CRITICAL ($integrationHealthScore%) - Integration requires immediate attention" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚨 CRITICAL INTEGRATION FAILURES:" -ForegroundColor Red
if ($totalCriticalFailures -gt 0) {
    $global:IntegrationDiagnostics.CriticalIntegrationFailures | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
} else {
    Write-Host "  ✅ No critical integration failures detected" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 INTEGRATION INSIGHTS:" -ForegroundColor Cyan
if ($successfulAPIIntegrations -gt 0 -and $successfulNetworkConnections -eq 0) {
    Write-Host "  • External API access working but internal container networking has issues" -ForegroundColor Yellow
}
if ($successfulDbConnections -eq 0) {
    Write-Host "  • Database connectivity completely broken - services likely using fallback mechanisms" -ForegroundColor Red
}
if ($successfulDataFlows -gt 0 -and $successfulDbConnections -eq 0) {
    Write-Host "  • Data flow working despite database connection issues - investigate caching or alternative storage" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🕒 Service integration diagnostics completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Return comprehensive integration analysis
return @{
    IntegrationHealthScore = $integrationHealthScore
    DatabaseConnectivity = @{
        Successful = $successfulDbConnections
        Total = $totalDatabaseTests
        SuccessRate = if ($totalDatabaseTests -gt 0) { [math]::Round(($successfulDbConnections/$totalDatabaseTests)*100,1) } else { 0 }
    }
    APIIntegration = @{
        Successful = $successfulAPIIntegrations
        Total = $totalAPITests  
        SuccessRate = if ($totalAPITests -gt 0) { [math]::Round(($successfulAPIIntegrations/$totalAPITests)*100,1) } else { 0 }
    }
    NetworkConnectivity = @{
        Successful = $successfulNetworkConnections
        Total = $totalNetworkTests
        SuccessRate = if ($totalNetworkTests -gt 0) { [math]::Round(($successfulNetworkConnections/$totalNetworkTests)*100,1) } else { 0 }
    }
    CriticalFailures = $global:IntegrationDiagnostics.CriticalIntegrationFailures
    TotalTests = $totalTests
    TotalSuccessful = $totalSuccessful
}