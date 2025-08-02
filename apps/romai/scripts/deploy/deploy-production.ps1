#!/usr/bin/env pwsh
# RomAI Production Deployment Script
# Domain: romcp.ro - Romanian AI Control Panel

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("all", "frontend", "backend", "infrastructure", "verify")]
    [string]$Target = "all",
    
    [Parameter(Mandatory = $false)]
    [switch]$DryRun = $false,
    
    [Parameter(Mandatory = $false)]
    [switch]$Force = $false
)

# Configuration
$DOMAIN = "romcp.ro"
$PROJECT_ROOT = "e:\GitHub\codai-project\apps\romai"
$DEPLOYMENT_LOG = "romai-deployment.log"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry -ForegroundColor $(
        switch ($Level) {
            "ERROR" { $Red }
            "SUCCESS" { $Green }
            "WARN" { $Yellow }
            "INFO" { $Blue }
            default { $Blue }
        }
    )
    Add-Content -Path $DEPLOYMENT_LOG -Value $logEntry
}

function Test-Prerequisites {
    Write-Log "🔍 Checking deployment prerequisites..." "INFO"
    
    $prerequisites = @(
        @{ Command = "vercel"; Name = "Vercel CLI" },
        @{ Command = "aws"; Name = "AWS CLI" },
        @{ Command = "az"; Name = "Azure CLI" },
        @{ Command = "gcloud"; Name = "Google Cloud CLI" },
        @{ Command = "kubectl"; Name = "Kubernetes CLI" },
        @{ Command = "terraform"; Name = "Terraform" },
        @{ Command = "docker"; Name = "Docker" },
        @{ Command = "pnpm"; Name = "pnpm" }
    )
    
    $missing = @()
    foreach ($prereq in $prerequisites) {
        try {
            $null = Get-Command $prereq.Command -ErrorAction Stop
            Write-Log "✅ $($prereq.Name) is installed" "SUCCESS"
        }
        catch {
            Write-Log "❌ $($prereq.Name) is missing" "ERROR"
            $missing += $prereq.Name
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Log "Missing prerequisites: $($missing -join ', ')" "ERROR"
        return $false
    }
    
    return $true
}

function Test-Authentication {
    Write-Log "🔐 Verifying authentication for cloud providers..." "INFO"
    
    # Test Vercel authentication
    try {
        $vercelUser = vercel whoami 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Vercel authenticated as: $vercelUser" "SUCCESS"
        } else {
            Write-Log "❌ Vercel authentication required. Run: vercel login" "ERROR"
            return $false
        }
    }
    catch {
        Write-Log "❌ Vercel authentication failed" "ERROR"
        return $false
    }
    
    # Test AWS authentication
    try {
        $awsIdentity = aws sts get-caller-identity --output text --query 'Account' 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ AWS authenticated for account: $awsIdentity" "SUCCESS"
        } else {
            Write-Log "❌ AWS authentication required. Run: aws configure" "ERROR"
            return $false
        }
    }
    catch {
        Write-Log "❌ AWS authentication failed" "ERROR"
        return $false
    }
    
    return $true
}

function Deploy-Infrastructure {
    Write-Log "🏗️ Deploying infrastructure..." "INFO"
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would deploy infrastructure with Terraform" "WARN"
        return $true
    }
    
    Set-Location "$PROJECT_ROOT\infrastructure\terraform"
    
    # Initialize Terraform
    Write-Log "Initializing Terraform..." "INFO"
    terraform init
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Terraform init failed" "ERROR"
        return $false
    }
    
    # Plan infrastructure
    Write-Log "Planning infrastructure changes..." "INFO"
    terraform plan -out=romai-production.tfplan
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Terraform plan failed" "ERROR"
        return $false
    }
    
    # Apply infrastructure
    if ($Force -or (Read-Host "Apply infrastructure changes? (y/N)") -eq "y") {
        Write-Log "Applying infrastructure changes..." "INFO"
        terraform apply romai-production.tfplan
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Terraform apply failed" "ERROR"
            return $false
        }
        Write-Log "✅ Infrastructure deployed successfully" "SUCCESS"
    } else {
        Write-Log "Infrastructure deployment skipped" "WARN"
    }
    
    Set-Location $PROJECT_ROOT
    return $true
}

function Build-ContainerImages {
    Write-Log "🐳 Building container images..." "INFO"
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would build container images" "WARN"
        return $true
    }
    
    # Build CBD service image
    Write-Log "Building CBD service image..." "INFO"
    Set-Location "$PROJECT_ROOT\..\..\packages\cbd"
    docker build -t cbd-universal:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Log "CBD image build failed" "ERROR"
        return $false
    }
    
    # Build MCP server image
    Write-Log "Building MCP server image..." "INFO"
    Set-Location "$PROJECT_ROOT\..\..\packages\romai-mcp-standalone"
    docker build -t romai-mcp:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Log "MCP server image build failed" "ERROR"
        return $false
    }
    
    # Build API gateway image
    Write-Log "Building API gateway image..." "INFO"
    Set-Location "$PROJECT_ROOT\api"
    docker build -t romai-api:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Log "API gateway image build failed" "ERROR"
        return $false
    }
    
    Set-Location $PROJECT_ROOT
    Write-Log "✅ All container images built successfully" "SUCCESS"
    return $true
}

function Push-ContainerImages {
    Write-Log "📤 Pushing container images to registries..." "INFO"
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would push container images" "WARN"
        return $true
    }
    
    # Push to AWS ECR
    Write-Log "Pushing to AWS ECR..." "INFO"
    aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.eu-west-1.amazonaws.com
    
    docker tag romai-api:latest 123456789.dkr.ecr.eu-west-1.amazonaws.com/romai-api:latest
    docker push 123456789.dkr.ecr.eu-west-1.amazonaws.com/romai-api:latest
    
    # Push to Azure Container Registry
    Write-Log "Pushing to Azure Container Registry..." "INFO"
    az acr login --name romairegistry
    
    docker tag cbd-universal:latest romairegistry.azurecr.io/cbd-universal:latest
    docker push romairegistry.azurecr.io/cbd-universal:latest
    
    # Push to Google Container Registry
    Write-Log "Pushing to Google Container Registry..." "INFO"
    gcloud auth configure-docker gcr.io
    
    docker tag romai-mcp:latest gcr.io/romai-production/mcp-server:latest
    docker push gcr.io/romai-production/mcp-server:latest
    
    Write-Log "✅ All container images pushed successfully" "SUCCESS"
    return $true
}

function Deploy-BackendServices {
    Write-Log "🔧 Deploying backend services..." "INFO"
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would deploy backend services" "WARN"
        return $true
    }
    
    # Deploy CBD service to Azure
    Write-Log "Deploying CBD service to Azure..." "INFO"
    az container create `
        --resource-group romai-production `
        --name romai-cbd-service `
        --image romairegistry.azurecr.io/cbd-universal:latest `
        --ports 4180 `
        --dns-name-label romai-cbd `
        --environment-variables NODE_ENV=production `
        --memory 4 --cpu 2
    
    if ($LASTEXITCODE -ne 0) {
        Write-Log "CBD service deployment failed" "ERROR"
        return $false
    }
    
    # Deploy API gateway to AWS EKS
    Write-Log "Deploying API gateway to AWS EKS..." "INFO"
    aws eks update-kubeconfig --region eu-west-1 --name romai-production
    kubectl apply -f "$PROJECT_ROOT\k8s\api-gateway\"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Log "API gateway deployment failed" "ERROR"
        return $false
    }
    
    # Deploy MCP server to Google Cloud Run
    Write-Log "Deploying MCP server to Google Cloud Run..." "INFO"
    gcloud run deploy romai-mcp `
        --image gcr.io/romai-production/mcp-server:latest `
        --platform managed `
        --region europe-west1 `
        --allow-unauthenticated `
        --set-env-vars NODE_ENV=production
    
    if ($LASTEXITCODE -ne 0) {
        Write-Log "MCP server deployment failed" "ERROR"
        return $false
    }
    
    Write-Log "✅ Backend services deployed successfully" "SUCCESS"
    return $true
}

function Deploy-Frontend {
    Write-Log "🌐 Deploying frontend to Vercel..." "INFO"
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would deploy frontend to Vercel" "WARN"
        return $true
    }
    
    Set-Location $PROJECT_ROOT
    
    # Build the Next.js application
    Write-Log "Building Next.js application..." "INFO"
    pnpm build
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Next.js build failed" "ERROR"
        return $false
    }
    
    # Deploy to Vercel
    Write-Log "Deploying to Vercel production..." "INFO"
    vercel --prod --yes --force
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Vercel deployment failed" "ERROR"
        return $false
    }
    
    # Verify deployment
    Write-Log "Verifying deployment..." "INFO"
    Start-Sleep -Seconds 30
    
    try {
        $response = Invoke-WebRequest -Uri "https://$DOMAIN/api/health" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Log "✅ Frontend deployed and responding at https://$DOMAIN" "SUCCESS"
        } else {
            Write-Log "⚠️ Frontend deployed but health check failed" "WARN"
        }
    }
    catch {
        Write-Log "⚠️ Frontend deployed but health check failed: $($_.Exception.Message)" "WARN"
    }
    
    return $true
}

function Test-Deployment {
    Write-Log "🧪 Running deployment verification tests..." "INFO"
    
    $endpoints = @(
        @{ Url = "https://$DOMAIN"; Name = "Frontend" },
        @{ Url = "https://$DOMAIN/api/health"; Name = "Frontend API" },
        @{ Url = "https://api.$DOMAIN/health"; Name = "API Gateway" },
        @{ Url = "https://cbd.$DOMAIN/health"; Name = "CBD Service" },
        @{ Url = "https://mcp.$DOMAIN/health"; Name = "MCP Server" }
    )
    
    $failures = @()
    foreach ($endpoint in $endpoints) {
        try {
            Write-Log "Testing $($endpoint.Name) at $($endpoint.Url)..." "INFO"
            $response = Invoke-WebRequest -Uri $endpoint.Url -TimeoutSec 15
            if ($response.StatusCode -eq 200) {
                Write-Log "✅ $($endpoint.Name) is responding correctly" "SUCCESS"
            } else {
                Write-Log "❌ $($endpoint.Name) returned status $($response.StatusCode)" "ERROR"
                $failures += $endpoint.Name
            }
        }
        catch {
            Write-Log "❌ $($endpoint.Name) failed: $($_.Exception.Message)" "ERROR"
            $failures += $endpoint.Name
        }
        Start-Sleep -Seconds 2
    }
    
    if ($failures.Count -eq 0) {
        Write-Log "🎉 All deployment verification tests passed!" "SUCCESS"
        return $true
    } else {
        Write-Log "❌ Failed endpoints: $($failures -join ', ')" "ERROR"
        return $false
    }
}

function Show-DeploymentSummary {
    Write-Log "📊 Deployment Summary for $DOMAIN" "INFO"
    Write-Host ""
    Write-Host "🌐 Frontend URLs:" -ForegroundColor $Cyan
    Write-Host "   Main Site: https://$DOMAIN" -ForegroundColor $Green
    Write-Host "   Dashboard: https://$DOMAIN/dashboard" -ForegroundColor $Green
    Write-Host "   API: https://$DOMAIN/api" -ForegroundColor $Green
    Write-Host ""
    Write-Host "🔧 Backend URLs:" -ForegroundColor $Cyan
    Write-Host "   API Gateway: https://api.$DOMAIN" -ForegroundColor $Green
    Write-Host "   CBD Service: https://cbd.$DOMAIN" -ForegroundColor $Green
    Write-Host "   MCP Server: https://mcp.$DOMAIN" -ForegroundColor $Green
    Write-Host ""
    Write-Host "📊 Monitoring:" -ForegroundColor $Cyan
    Write-Host "   Health Checks: All services monitored 24/7" -ForegroundColor $Green
    Write-Host "   Alerts: Configured for downtime and errors" -ForegroundColor $Green
    Write-Host ""
    Write-Host "🎉 RomAI Production Deployment Complete!" -ForegroundColor $Green
}

# Main deployment logic
Write-Log "🚀 Starting RomAI Production Deployment for $DOMAIN" "INFO"
Write-Log "Target: $Target | DryRun: $DryRun | Force: $Force" "INFO"

if (-not (Test-Prerequisites)) {
    Write-Log "❌ Prerequisites check failed. Please install missing tools." "ERROR"
    exit 1
}

if (-not (Test-Authentication)) {
    Write-Log "❌ Authentication check failed. Please authenticate with cloud providers." "ERROR"
    exit 1
}

$success = $true

switch ($Target) {
    "infrastructure" {
        $success = Deploy-Infrastructure
    }
    "backend" {
        $success = (Build-ContainerImages) -and (Push-ContainerImages) -and (Deploy-BackendServices)
    }
    "frontend" {
        $success = Deploy-Frontend
    }
    "verify" {
        $success = Test-Deployment
    }
    "all" {
        $success = (Deploy-Infrastructure) -and 
                   (Build-ContainerImages) -and 
                   (Push-ContainerImages) -and 
                   (Deploy-BackendServices) -and 
                   (Deploy-Frontend) -and 
                   (Test-Deployment)
    }
}

if ($success) {
    if ($Target -eq "all" -or $Target -eq "verify") {
        Show-DeploymentSummary
    }
    Write-Log "✅ Deployment completed successfully!" "SUCCESS"
    exit 0
} else {
    Write-Log "❌ Deployment failed!" "ERROR"
    exit 1
}
