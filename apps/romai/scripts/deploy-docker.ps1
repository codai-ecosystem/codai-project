# 🐳 RomAI Enterprise Docker Compose Deployment Script
# PowerShell script for Windows on-premise deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [switch]$Build,
    
    [Parameter(Mandatory=$false)]
    [switch]$Pull,
    
    [Parameter(Mandatory=$false)]
    [switch]$Down,
    
    [Parameter(Mandatory=$false)]
    [switch]$Logs,
    
    [Parameter(Mandatory=$false)]
    [switch]$Status
)

# Configuration
$ComposeFile = "docker-compose.production.yml"
$ProjectName = "romai-enterprise"
$LogLevel = "INFO"

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "${Blue}[INFO]${Reset} $Message"
}

function Write-Success {
    param([string]$Message)
    Write-Host "${Green}[SUCCESS]${Reset} $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "${Yellow}[WARNING]${Reset} $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "${Red}[ERROR]${Reset} $Message"
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }
    
    # Check Docker Compose
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not installed or not in PATH"
        exit 1
    }
    
    # Check if Docker is running
    try {
        docker info | Out-Null
    }
    catch {
        Write-Error "Docker daemon is not running"
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Build images
function Build-Images {
    Write-Info "Building Docker images..."
    
    try {
        # Build AGI model server
        Write-Info "Building RomAI AGI model server..."
        docker build -t romai/agi:latest -f apps/romai/Dockerfile.agi .
        
        # Build Enterprise API
        Write-Info "Building RomAI Enterprise API..."
        docker build -t romai/enterprise-api:latest -f apps/romai/Dockerfile.enterprise .
        
        # Build Frontend
        Write-Info "Building RomAI Frontend..."
        docker build -t romai/frontend:latest -f apps/romai/Dockerfile apps/romai/
        
        Write-Success "Docker images built successfully"
    }
    catch {
        Write-Error "Failed to build Docker images: $_"
        exit 1
    }
}

# Pull latest images
function Pull-Images {
    Write-Info "Pulling latest images..."
    
    try {
        docker-compose -f $ComposeFile -p $ProjectName pull
        Write-Success "Images pulled successfully"
    }
    catch {
        Write-Error "Failed to pull images: $_"
        exit 1
    }
}

# Deploy services
function Deploy-Services {
    Write-Info "Deploying RomAI Enterprise services..."
    
    try {
        # Create necessary directories
        $Directories = @(
            "config/postgres",
            "config/redis", 
            "config/nginx/conf.d",
            "config/prometheus",
            "config/grafana/dashboards",
            "config/grafana/datasources",
            "ssl"
        )
        
        foreach ($Dir in $Directories) {
            if (-not (Test-Path $Dir)) {
                New-Item -ItemType Directory -Path $Dir -Force | Out-Null
                Write-Info "Created directory: $Dir"
            }
        }
        
        # Generate environment file if it doesn't exist
        if (-not (Test-Path ".env")) {
            Write-Info "Creating .env file..."
            @"
# RomAI Enterprise Environment Configuration
POSTGRES_PASSWORD=romai_secure_enterprise_2025
REDIS_PASSWORD=romai_cache_enterprise_2025
API_SECRET_KEY=romai_enterprise_api_secret_2025
JWT_SECRET_KEY=romai_jwt_enterprise_secret_2025
GRAFANA_PASSWORD=romai_admin_enterprise_2025
AZURE_OPENAI_API_KEY=your-azure-openai-key-here
AZURE_OPENAI_ENDPOINT=https://swedencentral.api.cognitive.microsoft.com/
"@ | Out-File -FilePath ".env" -Encoding UTF8
            Write-Warning "Please update the .env file with your actual configuration"
        }
        
        # Start services
        docker-compose -f $ComposeFile -p $ProjectName up -d
        
        Write-Success "Services deployed successfully"
        
        # Wait for services to be healthy
        Write-Info "Waiting for services to be healthy..."
        Start-Sleep -Seconds 30
        
        # Check service health
        $Services = @("postgres", "redis", "cbd-database", "romai-agi", "romai-enterprise-api")
        foreach ($Service in $Services) {
            $ContainerName = "$ProjectName-$Service-1"
            Write-Info "Checking health of $Service..."
            
            $HealthCheck = docker inspect --format='{{.State.Health.Status}}' $ContainerName 2>$null
            if ($HealthCheck -eq "healthy") {
                Write-Success "$Service is healthy"
            } else {
                Write-Warning "$Service health status: $HealthCheck"
            }
        }
    }
    catch {
        Write-Error "Failed to deploy services: $_"
        exit 1
    }
}

# Stop services
function Stop-Services {
    Write-Info "Stopping RomAI Enterprise services..."
    
    try {
        docker-compose -f $ComposeFile -p $ProjectName down
        Write-Success "Services stopped successfully"
    }
    catch {
        Write-Error "Failed to stop services: $_"
    }
}

# Show logs
function Show-Logs {
    Write-Info "Showing service logs..."
    docker-compose -f $ComposeFile -p $ProjectName logs -f
}

# Show status
function Show-Status {
    Write-Info "RomAI Enterprise Service Status:"
    Write-Host ""
    
    # Docker containers status
    docker-compose -f $ComposeFile -p $ProjectName ps
    
    Write-Host ""
    Write-Info "Service URLs:"
    Write-Host "  📱 RomAI Frontend:     http://localhost:6100"
    Write-Host "  🏢 Enterprise API:     http://localhost:8001"
    Write-Host "  🧠 AGI Model Server:   http://localhost:6101"
    Write-Host "  🗃️ CBD Database:       http://localhost:4180"
    Write-Host "  📊 Grafana:           http://localhost:3000"
    Write-Host "  📈 Prometheus:        http://localhost:9090"
    Write-Host ""
    
    # Test connectivity
    Write-Info "Testing service connectivity..."
    
    $Services = @(
        @{Name="CBD Database"; URL="http://localhost:4180/health"},
        @{Name="AGI Model Server"; URL="http://localhost:6101/health"},
        @{Name="Enterprise API"; URL="http://localhost:8001/api/v1/health"}
    )
    
    foreach ($Service in $Services) {
        try {
            $Response = Invoke-RestMethod -Uri $Service.URL -Method Get -TimeoutSec 5
            Write-Success "$($Service.Name): HEALTHY"
        }
        catch {
            Write-Warning "$($Service.Name): NOT RESPONDING"
        }
    }
}

# Main execution
function Main {
    Write-Info "🚀 RomAI Enterprise Docker Deployment"
    Write-Info "Environment: $Environment"
    Write-Info "Project: $ProjectName"
    Write-Host ""
    
    Test-Prerequisites
    
    if ($Down) {
        Stop-Services
        return
    }
    
    if ($Logs) {
        Show-Logs
        return
    }
    
    if ($Status) {
        Show-Status
        return
    }
    
    if ($Build) {
        Build-Images
    }
    
    if ($Pull) {
        Pull-Images
    }
    
    Deploy-Services
    Start-Sleep -Seconds 5
    Show-Status
    
    Write-Host ""
    Write-Success "🎉 RomAI Enterprise deployment completed!"
    Write-Warning "Next steps:"
    Write-Warning "  1. Update .env file with your configuration"
    Write-Warning "  2. Configure SSL certificates"
    Write-Warning "  3. Set up monitoring alerts"
    Write-Warning "  4. Configure backup procedures"
    Write-Host ""
    Write-Info "Use the following commands to manage your deployment:"
    Write-Host "  ./deploy-docker.ps1 -Status    # Check service status"
    Write-Host "  ./deploy-docker.ps1 -Logs      # View service logs"
    Write-Host "  ./deploy-docker.ps1 -Down      # Stop all services"
}

# Execute main function
Main
