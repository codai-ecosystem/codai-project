# CODAI Ecosystem Docker Build Script (PowerShell)
# Phase 7: Container Orchestration Implementation

Write-Host "🐳 Building CODAI Ecosystem Docker Images..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Gray

# Set variables
$REGISTRY = "codai"
$VERSION = "latest"
$BUILD_DATE = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$GIT_COMMIT = try { (git rev-parse --short HEAD 2>$null) } catch { "unknown" }

# Function to build and tag images
function Build-Image {
    param(
        [string]$ServiceName,
        [string]$DockerfilePath,
        [string]$ContextPath
    )
    
    Write-Host "🔨 Building $ServiceName..." -ForegroundColor Yellow
    
    $buildArgs = @(
        "--build-arg", "BUILD_DATE=$BUILD_DATE",
        "--build-arg", "GIT_COMMIT=$GIT_COMMIT", 
        "--build-arg", "VERSION=$VERSION",
        "-t", "$REGISTRY/${ServiceName}:$VERSION",
        "-t", "$REGISTRY/${ServiceName}:$GIT_COMMIT",
        "-f", $DockerfilePath,
        $ContextPath
    )
    
    $result = & docker build @buildArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully built $ServiceName" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to build $ServiceName" -ForegroundColor Red
        exit 1
    }
}

# Build backend services
Write-Host "🏗️ Building Backend Services..." -ForegroundColor Blue
Build-Image "cbd-database" "packages/cbd/Dockerfile" "packages/cbd"
Build-Image "gateway-service" "apps/gateway/Dockerfile" "apps/gateway"
Build-Image "websocket-service" "packages/websocket-service/Dockerfile" "packages/websocket-service"

# Build frontend applications
Write-Host "🎨 Building Frontend Applications..." -ForegroundColor Magenta
Build-Image "codai-app" "apps/codai/Dockerfile" "apps/codai"
Build-Image "id-service" "apps/id/Dockerfile" "apps/id"
Build-Image "bancai-app" "apps/bancai/Dockerfile" "apps/bancai"
Build-Image "memorai-app" "apps/memorai/Dockerfile" "apps/memorai"
Build-Image "admin-dashboard" "apps/admin/Dockerfile" "apps/admin"
Build-Image "hub-app" "apps/hub/Dockerfile" "apps/hub"
Build-Image "controlai-dashboard" "apps/controlai-dashboard/Dockerfile" "apps/controlai-dashboard"
Build-Image "romai-app" "apps/romai/Dockerfile" "apps/romai"

# List built images
Write-Host ""
Write-Host "📊 Built Images Summary:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Gray
docker images | Where-Object { $_ -match $REGISTRY } | Select-Object -First 20

Write-Host ""
Write-Host "✅ Docker Build Complete!" -ForegroundColor Green
Write-Host "🎯 Phase 7 Container Orchestration: Images Built Successfully" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy to Kubernetes: kubectl apply -f k8s/" -ForegroundColor White
Write-Host "2. Verify deployments: kubectl get pods -n codai-ecosystem" -ForegroundColor White
Write-Host "3. Check services: kubectl get svc -n codai-ecosystem" -ForegroundColor White
Write-Host "4. Monitor ingress: kubectl get ingress -n codai-ecosystem" -ForegroundColor White
