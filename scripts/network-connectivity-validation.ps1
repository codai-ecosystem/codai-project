#!/usr/bin/env pwsh
# CODAI ECOSYSTEM - COMPREHENSIVE NETWORK CONNECTIVITY VALIDATION
# ================================================================

param(
    [switch]$Verbose = $false,
    [switch]$TestInternal = $true,
    [int]$TimeoutSeconds = 10
)

Write-Host "🌐 CODAI ECOSYSTEM - NETWORK CONNECTIVITY VALIDATION" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Gray
Write-Host "🕒 Started at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "🎯 Comprehensive network analysis, port validation, and service connectivity testing" -ForegroundColor White
Write-Host ""

# Global network diagnostic results
$global:NetworkDiagnostics = @{
    PortTests = @()
    ServiceTests = @()
    DockerNetworks = @()
    InternalConnectivity = @()
    LoadBalancerAnalysis = @()
    CriticalConnectivityIssues = @()
}

function Write-NetworkSection {
    param([string]$Title, [string]$Color = "Magenta")
    Write-Host ""
    Write-Host "🔗 $Title" -ForegroundColor $Color
    Write-Host ("=" * ($Title.Length + 3)) -ForegroundColor Gray
}

function Test-ServiceEndpoint {
    param(
        [string]$Url,
        [string]$ServiceName,
        [bool]$IsCritical = $false,
        [int]$TimeoutSec = 10
    )
    
    try {
        $startTime = Get-Date
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
        $responseTime = ((Get-Date) - $startTime).TotalMilliseconds
        
        return @{
            Url = $Url
            ServiceName = $ServiceName
            IsCritical = $IsCritical
            Success = $true
            StatusCode = $response.StatusCode
            ResponseTime = [math]::Round($responseTime, 0)
            ContentLength = $response.Content.Length
            Headers = $response.Headers
            Issue = ""
        }
        
    } catch {
        return @{
            Url = $Url
            ServiceName = $ServiceName
            IsCritical = $IsCritical
            Success = $false
            StatusCode = "N/A"
            ResponseTime = "N/A"
            ContentLength = 0
            Headers = @{}
            Issue = $_.Exception.Message
        }
    }
}

function Test-ContainerPortBinding {
    param([string]$ContainerName)
    
    try {
        $portInfo = docker port $ContainerName 2>$null
        if ($LASTEXITCODE -eq 0 -and $portInfo) {
            $bindings = @()
            $portInfo | ForEach-Object {
                if ($_ -match '(\d+)/tcp -> (.+):(\d+)') {
                    $bindings += @{
                        ContainerPort = $matches[1]
                        HostInterface = $matches[2]
                        HostPort = $matches[3]
                        Protocol = "tcp"
                    }
                }
            }
            
            return @{
                Container = $ContainerName
                HasBindings = $bindings.Count -gt 0
                Bindings = $bindings
                Issue = ""
            }
        } else {
            return @{
                Container = $ContainerName
                HasBindings = $false
                Bindings = @()
                Issue = "No port bindings found or container not running"
            }
        }
        
    } catch {
        return @{
            Container = $ContainerName
            HasBindings = $false
            Bindings = @()
            Issue = "Failed to get port information: $($_.Exception.Message)"
        }
    }
}

function Get-DockerNetworkInfo {
    try {
        $networks = docker network ls --format "{{.Name}}|{{.Driver}}|{{.Scope}}" 2>$null
        $networkDetails = @()
        
        if ($LASTEXITCODE -eq 0) {
            $networks | ForEach-Object {
                $parts = $_ -split '\|'
                $networkDetails += @{
                    Name = $parts[0]
                    Driver = $parts[1]
                    Scope = $parts[2]
                }
            }
        }
        
        return $networkDetails
        
    } catch {
        return @()
    }
}

function Test-ServiceToServiceConnectivity {
    param([string]$SourceContainer, [string]$TargetUrl, [string]$Description)
    
    try {
        # Test connectivity from within a container
        $testCommand = "docker exec $SourceContainer curl -s -o /dev/null -w '%{http_code}' --connect-timeout 5 '$TargetUrl'"
        $result = Invoke-Expression $testCommand 2>$null
        
        return @{
            Source = $SourceContainer
            Target = $TargetUrl
            Description = $Description
            Success = ($result -match '^[2-3]\d{2}$')
            HttpCode = $result
            Issue = if ($result -match '^[2-3]\d{2}$') { "" } else { "HTTP $result or connection failed" }
        }
        
    } catch {
        return @{
            Source = $SourceContainer
            Target = $TargetUrl
            Description = $Description
            Success = $false
            HttpCode = "ERROR"
            Issue = "Connectivity test failed: $($_.Exception.Message)"
        }
    }
}

# =============================================================================
# PHASE 1: DETAILED PORT AND SERVICE ENDPOINT TESTING
# =============================================================================
Write-NetworkSection "DETAILED PORT AND SERVICE ENDPOINT TESTING"

# Comprehensive service endpoint definitions
$serviceEndpoints = @(
    @{ Url = "http://localhost:8080"; Name = "Load Balancer"; Critical = $true },
    @{ Url = "http://localhost:8080/health"; Name = "Load Balancer Health"; Critical = $true },
    @{ Url = "http://localhost:4200"; Name = "ControlAI Frontend"; Critical = $true },
    @{ Url = "http://localhost:4200/api/health"; Name = "ControlAI Health API"; Critical = $true },
    @{ Url = "http://localhost:6100"; Name = "RomAI Frontend"; Critical = $true },
    @{ Url = "http://localhost:6100/api/health"; Name = "RomAI Health API"; Critical = $true },
    @{ Url = "http://localhost:4400"; Name = "Explorer Frontend"; Critical = $false },
    @{ Url = "http://localhost:5000"; Name = "Kodex Frontend"; Critical = $false },
    @{ Url = "http://localhost:4005"; Name = "BancAI Frontend"; Critical = $true },
    @{ Url = "http://localhost:4005/api/health"; Name = "BancAI Health API"; Critical = $true },
    @{ Url = "http://localhost:4500/health"; Name = "GraphQL API Health"; Critical = $true },
    @{ Url = "http://localhost:4950/health"; Name = "MemorAI MCP Health"; Critical = $true },
    @{ Url = "http://localhost:8001/api/v1/health"; Name = "Compliance API Health"; Critical = $true },
    @{ Url = "http://localhost:4951"; Name = "Grafana Dashboard"; Critical = $false },
    @{ Url = "http://localhost:4952"; Name = "Prometheus Metrics"; Critical = $false }
)

Write-Host "Testing $($serviceEndpoints.Count) service endpoints with HTTP validation..." -ForegroundColor Yellow

foreach ($endpoint in $serviceEndpoints) {
    $test = Test-ServiceEndpoint -Url $endpoint.Url -ServiceName $endpoint.Name -IsCritical $endpoint.Critical -TimeoutSec $TimeoutSeconds
    $global:NetworkDiagnostics.ServiceTests += $test
    
    $statusColor = if ($test.Success) { "Green" } else { "Red" }
    $criticalMark = if ($endpoint.Critical) { "🔴" } else { "🟡" }
    
    Write-Host "  $criticalMark $($endpoint.Name.PadRight(25))" -NoNewline -ForegroundColor White
    
    if ($test.Success) {
        Write-Host " ✅ HTTP $($test.StatusCode)" -NoNewline -ForegroundColor Green
        Write-Host " ($($test.ResponseTime)ms)" -ForegroundColor Gray
        if ($Verbose -and $test.ContentLength -gt 0) {
            Write-Host "     Content: $($test.ContentLength) bytes" -ForegroundColor Gray
        }
    } else {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "     Error: $($test.Issue)" -ForegroundColor Red
        
        if ($endpoint.Critical) {
            $global:NetworkDiagnostics.CriticalConnectivityIssues += "SERVICE: $($endpoint.Name) - $($test.Issue)"
        }
    }
}

# =============================================================================
# PHASE 2: DOCKER PORT BINDING ANALYSIS
# =============================================================================
Write-NetworkSection "DOCKER PORT BINDING ANALYSIS"

# Get running containers from our previous diagnostics
$runningContainers = @(
    "codai-postgresql-db", "memorai-grafana", "memorai-prometheus",
    "codai-controlai-frontend", "codai-romai-frontend", "codai-explorer-frontend",
    "codai-kodex-frontend", "codai-bancai-frontend", "codai-memorai-graphql-api",
    "codai-memorai-mcp-api", "codai-romai-compliance-api", "codai-main-api-gateway",
    "codai-secure-api-gateway"
)

Write-Host "Analyzing Docker port bindings for $($runningContainers.Count) running containers..." -ForegroundColor Yellow

foreach ($container in $runningContainers) {
    $portInfo = Test-ContainerPortBinding -ContainerName $container
    
    Write-Host "  $($container.PadRight(35))" -NoNewline -ForegroundColor White
    
    if ($portInfo.HasBindings) {
        Write-Host " ✅ Bound" -NoNewline -ForegroundColor Green
        $portInfo.Bindings | ForEach-Object {
            Write-Host " $($_.HostInterface):$($_.HostPort)->$($_.ContainerPort)" -NoNewline -ForegroundColor Cyan
        }
        Write-Host ""
    } else {
        Write-Host " ⚠️  No bindings" -ForegroundColor Yellow
        if ($portInfo.Issue) {
            Write-Host "     Issue: $($portInfo.Issue)" -ForegroundColor Red
        }
    }
}

# =============================================================================
# PHASE 3: DOCKER NETWORK ARCHITECTURE ANALYSIS  
# =============================================================================
Write-NetworkSection "DOCKER NETWORK ARCHITECTURE ANALYSIS"

$dockerNetworks = Get-DockerNetworkInfo
Write-Host "Discovered $($dockerNetworks.Count) Docker networks:" -ForegroundColor Yellow

foreach ($network in $dockerNetworks) {
    Write-Host "  📡 $($network.Name.PadRight(25))" -NoNewline -ForegroundColor White
    Write-Host " Driver: $($network.Driver.PadRight(10))" -NoNewline -ForegroundColor Cyan
    Write-Host " Scope: $($network.Scope)" -ForegroundColor Gray
}

$global:NetworkDiagnostics.DockerNetworks = $dockerNetworks

# Check for expected CODAI networks
$expectedNetworks = @("codai-ecosystem", "codai-backend", "codai-monitoring")
$missingNetworks = $expectedNetworks | Where-Object { $_ -notin $dockerNetworks.Name }

if ($missingNetworks.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Missing expected networks:" -ForegroundColor Red
    $missingNetworks | ForEach-Object { 
        Write-Host "  • $_" -ForegroundColor Red 
        $global:NetworkDiagnostics.CriticalConnectivityIssues += "NETWORK: Missing Docker network '$_'"
    }
}

# =============================================================================
# PHASE 4: LOAD BALANCER INVESTIGATION
# =============================================================================
Write-NetworkSection "LOAD BALANCER INVESTIGATION"

Write-Host "Investigating missing load balancer (codai-nginx-load-balancer)..." -ForegroundColor Yellow

# Check if load balancer container exists in any state
try {
    $lbContainerSearch = docker ps -a --filter "name=codai-nginx-load-balancer" --format "{{.Names}}|{{.Status}}|{{.Image}}" 2>$null
    
    if ($LASTEXITCODE -eq 0 -and $lbContainerSearch) {
        $parts = $lbContainerSearch -split '\|'
        Write-Host "  📦 Container found: $($parts[0])" -ForegroundColor Yellow
        Write-Host "     Status: $($parts[1])" -ForegroundColor Yellow
        Write-Host "     Image: $($parts[2])" -ForegroundColor Gray
        
        # Get more details about why it's not running
        $lbDetails = docker inspect codai-nginx-load-balancer --format "{{.State.Status}}|{{.State.ExitCode}}|{{.State.Error}}" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $detailParts = $lbDetails -split '\|'
            Write-Host "     Exit Code: $($detailParts[1])" -ForegroundColor Gray
            if ($detailParts[2]) {
                Write-Host "     Error: $($detailParts[2])" -ForegroundColor Red
            }
        }
        
    } else {
        Write-Host "  ❌ Load balancer container not found in any state" -ForegroundColor Red
        $global:NetworkDiagnostics.CriticalConnectivityIssues += "LOAD_BALANCER: Container 'codai-nginx-load-balancer' does not exist"
    }
    
} catch {
    Write-Host "  ❌ Failed to search for load balancer container: $($_.Exception.Message)" -ForegroundColor Red
}

# Check if port 8080 is bound by another process
try {
    $port8080Usage = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
    if ($port8080Usage) {
        Write-Host "  🔍 Port 8080 is in use by:" -ForegroundColor Yellow
        $port8080Usage | ForEach-Object {
            $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "     Process: $($process.Name) (PID: $($_.OwningProcess))" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "  ℹ️  Port 8080 is available" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Could not check port 8080 usage" -ForegroundColor Yellow
}

# =============================================================================
# PHASE 5: SERVICE-TO-SERVICE CONNECTIVITY (if TestInternal enabled)
# =============================================================================
if ($TestInternal) {
    Write-NetworkSection "SERVICE-TO-SERVICE CONNECTIVITY TESTING"
    
    # Test critical internal connectivity paths
    $internalTests = @(
        @{ Source = "codai-memorai-graphql-api"; Target = "http://codai-memorai-mcp-api:4950/health"; Desc = "GraphQL to MCP" },
        @{ Source = "codai-controlai-frontend"; Target = "http://codai-memorai-graphql-api:4500/health"; Desc = "ControlAI to GraphQL" },
        @{ Source = "codai-romai-frontend"; Target = "http://codai-romai-compliance-api:8001/api/v1/health"; Desc = "RomAI to Compliance" },
        @{ Source = "codai-memorai-mcp-api"; Target = "http://codai-postgresql-db:5432"; Desc = "MCP to Database" }
    )
    
    Write-Host "Testing $($internalTests.Count) internal service connections..." -ForegroundColor Yellow
    
    foreach ($test in $internalTests) {
        $result = Test-ServiceToServiceConnectivity -SourceContainer $test.Source -TargetUrl $test.Target -Description $test.Desc
        $global:NetworkDiagnostics.InternalConnectivity += $result
        
        $statusColor = if ($result.Success) { "Green" } else { "Red" }
        
        Write-Host "  $($test.Desc.PadRight(25))" -NoNewline -ForegroundColor White
        
        if ($result.Success) {
            Write-Host " ✅ Connected (HTTP $($result.HttpCode))" -ForegroundColor Green
        } else {
            Write-Host " ❌ Failed" -ForegroundColor Red
            Write-Host "     Issue: $($result.Issue)" -ForegroundColor Red
        }
    }
}

# =============================================================================
# COMPREHENSIVE NETWORK CONNECTIVITY SUMMARY  
# =============================================================================
Write-NetworkSection "COMPREHENSIVE NETWORK CONNECTIVITY SUMMARY" "Green"

$totalServiceTests = $global:NetworkDiagnostics.ServiceTests.Count
$successfulServices = ($global:NetworkDiagnostics.ServiceTests | Where-Object { $_.Success }).Count
$criticalServicesFailed = ($global:NetworkDiagnostics.ServiceTests | Where-Object { $_.IsCritical -and -not $_.Success }).Count

$internalTestsCount = $global:NetworkDiagnostics.InternalConnectivity.Count
$successfulInternal = ($global:NetworkDiagnostics.InternalConnectivity | Where-Object { $_.Success }).Count

Write-Host "📊 NETWORK CONNECTIVITY METRICS:" -ForegroundColor Cyan
Write-Host "External Service Accessibility:"
Write-Host "  • Total Services Tested: $totalServiceTests"
Write-Host "  • Successful Connections: $successfulServices ($([math]::Round(($successfulServices/$totalServiceTests)*100,1))%)"
Write-Host "  • Critical Services Failed: $criticalServicesFailed"

if ($TestInternal -and $internalTestsCount -gt 0) {
    Write-Host "Internal Service Communication:"
    Write-Host "  • Internal Tests: $internalTestsCount"  
    Write-Host "  • Successful Internal: $successfulInternal ($([math]::Round(($successfulInternal/$internalTestsCount)*100,1))%)"
}

Write-Host "Docker Network Status:"
Write-Host "  • Networks Discovered: $($dockerNetworks.Count)"
Write-Host "  • Missing Expected Networks: $($missingNetworks.Count)"

Write-Host ""
Write-Host "🎯 OVERALL NETWORK HEALTH:" -ForegroundColor Cyan

$networkHealthScore = [math]::Round((($successfulServices + $successfulInternal) / ($totalServiceTests + $internalTestsCount)) * 100, 1)

if ($networkHealthScore -ge 90) {
    Write-Host "🟢 EXCELLENT ($networkHealthScore%) - Network connectivity is highly reliable" -ForegroundColor Green
} elseif ($networkHealthScore -ge 70) {
    Write-Host "🟡 GOOD ($networkHealthScore%) - Network mostly functional with minor issues" -ForegroundColor Yellow
} elseif ($networkHealthScore -ge 50) {
    Write-Host "🟠 FAIR ($networkHealthScore%) - Network has significant connectivity problems" -ForegroundColor DarkYellow
} else {
    Write-Host "🔴 CRITICAL ($networkHealthScore%) - Network requires immediate attention" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚨 CRITICAL CONNECTIVITY ISSUES:" -ForegroundColor Red
if ($global:NetworkDiagnostics.CriticalConnectivityIssues.Count -gt 0) {
    $global:NetworkDiagnostics.CriticalConnectivityIssues | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
} else {
    Write-Host "  ✅ No critical network connectivity issues detected" -ForegroundColor Green
}

Write-Host ""
Write-Host "🕒 Network connectivity validation completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow

# Return detailed network analysis
return @{
    NetworkHealthScore = $networkHealthScore
    SuccessfulServices = $successfulServices
    TotalServices = $totalServiceTests
    CriticalServicesFailed = $criticalServicesFailed
    InternalConnectivity = @{
        Successful = $successfulInternal
        Total = $internalTestsCount
    }
    CriticalIssues = $global:NetworkDiagnostics.CriticalConnectivityIssues
    LoadBalancerStatus = "MISSING"
    DockerNetworks = $dockerNetworks.Count
}