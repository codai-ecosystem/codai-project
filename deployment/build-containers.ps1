# 🐳 CODAI Container Build & Push Script
# Builds and pushes all backend service containers to ECR

param(
    [string]$Profile = "default",
    [string]$Region = "us-east-1",
    [string]$AccountId = "567877624442"
)

$ErrorActionPreference = "Stop"

Write-Host "� Starting CODAI Container Build & Push Process" -ForegroundColor Green
Write-Host "Account: $AccountId | Region: $Region" -ForegroundColor Cyan

# Service configuration
$services = @(
    @{
        name = "memorai-mcp"
        path = "packages/memorai-mcp"
        port = 8002
        description = "MemorAI MCP Service"
    },
    @{
        name = "cbd-database"
        path = "packages/cbd"
        port = 4180
        description = "CBD Universal Database"
    },
    @{
        name = "gateway"
        path = "apps/gateway"
        port = 4003
        description = "API Gateway Service"
    },
    @{
        name = "ssl-proxy"
        path = "packages/ssl-proxy"
        port = 443
        description = "SSL Proxy Service"
    },
    @{
        name = "websocket-service"
        path = "packages/websocket-service"
        port = 4900
        description = "WebSocket Service"
    }
)

function Test-DockerAvailable {
    try {
        docker --version | Out-Null
        return $true
    } catch {
        Write-Host "❌ Docker is not available. Please install Docker Desktop." -ForegroundColor Red
        return $false
    }
}

function Build-ServiceImage {
    param(
        [string]$ServiceName,
        [string]$DockerfilePath,
        [string]$ContextPath,
        [string]$ImageTag
    )
    
    Write-Host "🔨 Building $ServiceName..." -ForegroundColor Yellow
    
    $FullDockerfilePath = Join-Path (Split-Path $WorkspaceRoot -Parent) "deployment/docker/$DockerfilePath"
    $FullContextPath = Join-Path (Split-Path $WorkspaceRoot -Parent) $ContextPath
    
    if (-not (Test-Path $FullDockerfilePath)) {
        Write-Host "❌ Dockerfile not found: $FullDockerfilePath" -ForegroundColor Red
        return $false
    }
    
    if (-not (Test-Path $FullContextPath)) {
        Write-Host "❌ Context path not found: $FullContextPath" -ForegroundColor Red
        return $false
    }
    
    try {
        # Build the Docker image
        $BuildCmd = "docker build -f `"$FullDockerfilePath`" -t `"$ImageTag`" `"$FullContextPath`""
        Write-Host "Executing: $BuildCmd" -ForegroundColor Gray
        
        Invoke-Expression $BuildCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully built $ServiceName" -ForegroundColor Green
            
            # Get image details
            $ImageInfo = docker images $ImageTag --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
            Write-Host "Image Details: $ImageInfo" -ForegroundColor Cyan
            
            return $true
        } else {
            Write-Host "❌ Failed to build $ServiceName" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error building $ServiceName`: $_" -ForegroundColor Red
        return $false
    }
}

function Test-ServiceImage {
    param(
        [string]$ServiceName,
        [string]$ImageTag,
        [string]$TestPort
    )
    
    Write-Host "🧪 Testing $ServiceName image..." -ForegroundColor Yellow
    
    try {
        # Run container for testing
        $ContainerName = "$ServiceName-test"
        
        # Remove existing test container if exists
        docker rm -f $ContainerName 2>$null | Out-Null
        
        # Start container
        $RunCmd = "docker run -d --name $ContainerName -p ${TestPort}:${TestPort} $ImageTag"
        Invoke-Expression $RunCmd
        
        # Wait for startup
        Start-Sleep -Seconds 10
        
        # Test health endpoint
        $HealthUrl = "http://localhost:${TestPort}/health"
        try {
            $Response = Invoke-RestMethod -Uri $HealthUrl -Method Get -TimeoutSec 10
            Write-Host "✅ $ServiceName health check passed" -ForegroundColor Green
            Write-Host "Response: $($Response | ConvertTo-Json -Compress)" -ForegroundColor Cyan
        } catch {
            Write-Host "⚠️ $ServiceName health check failed: $_" -ForegroundColor Yellow
        }
        
        # Clean up test container
        docker rm -f $ContainerName | Out-Null
        
        return $true
    } catch {
        Write-Host "❌ Error testing $ServiceName`: $_" -ForegroundColor Red
        return $false
    }
}

function Main {
    Write-Host "Starting Docker build process..." -ForegroundColor White
    
    # Check Docker availability
    if (-not (Test-DockerAvailable)) {
        exit 1
    }
    
    # Create build summary
    $BuildResults = @()
    
    # Build each service
    foreach ($Service in $Services) {
        $ImageTag = "$DockerRegistry/$($Service.Name):$Version"
        
        Write-Host "`n📦 Processing $($Service.Name)..." -ForegroundColor Magenta
        
        $BuildSuccess = Build-ServiceImage -ServiceName $Service.Name -DockerfilePath $Service.Dockerfile -ContextPath $Service.Context -ImageTag $ImageTag
        
        if ($BuildSuccess) {
            # Test the image based on service type
            $TestPort = switch ($Service.Name) {
                "cbd" { "4180" }
                "gateway" { "3000" }
                "memorai-mcp" { "8002" }
                "websocket" { "4900" }
                "ssl-proxy" { "8080" }
                default { "8080" }
            }
            
            $TestSuccess = Test-ServiceImage -ServiceName $Service.Name -ImageTag $ImageTag -TestPort $TestPort
            
            $BuildResults += @{
                Service = $Service.Name
                Image = $ImageTag
                BuildSuccess = $BuildSuccess
                TestSuccess = $TestSuccess
            }
        } else {
            $BuildResults += @{
                Service = $Service.Name
                Image = $ImageTag
                BuildSuccess = $false
                TestSuccess = $false
            }
        }
    }
    
    # Display results summary
    Write-Host "`n🎯 Build Results Summary" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Gray
    
    foreach ($Result in $BuildResults) {
        $BuildStatus = if ($Result.BuildSuccess) { "✅ SUCCESS" } else { "❌ FAILED" }
        $TestStatus = if ($Result.TestSuccess) { "✅ PASSED" } else { "❌ FAILED" }
        
        Write-Host "$($Result.Service.PadRight(15)) | Build: $BuildStatus | Test: $TestStatus" -ForegroundColor White
        Write-Host "  Image: $($Result.Image)" -ForegroundColor Gray
    }
    
    # Overall success check
    $OverallSuccess = $BuildResults | Where-Object { $_.BuildSuccess -eq $true } | Measure-Object | Select-Object -ExpandProperty Count
    $TotalServices = $BuildResults.Count
    
    Write-Host "`n📊 Overall Status: $OverallSuccess/$TotalServices services built successfully" -ForegroundColor Cyan
    
    if ($OverallSuccess -eq $TotalServices) {
        Write-Host "🎉 All Docker images built successfully!" -ForegroundColor Green
        Write-Host "Ready for AWS ECR push and ECS deployment." -ForegroundColor Yellow
        
        # Generate next steps
        Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Tag images for AWS ECR" -ForegroundColor White
        Write-Host "2. Push images to ECR repositories" -ForegroundColor White
        Write-Host "3. Deploy ECS services using Terraform" -ForegroundColor White
        Write-Host "4. Validate production deployment" -ForegroundColor White
        
        exit 0
    } else {
        Write-Host "⚠️ Some services failed to build. Please review the errors above." -ForegroundColor Yellow
        exit 1
    }
}

# Run the main function
Main
