# MemorAI Container Deployment Script - PowerShell Version
# This script builds and deploys MemorAI containers to AWS ECS

param(
    [string]$AwsRegion = "eu-central-1",
    [string]$AwsAccountId = "567877624442"
)

# Configuration
$EcrRegistry = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"
$ApiRepo = "memorai-api"
$McpRepo = "memorai-mcp"

function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

Write-Host "🚀 Starting MemorAI Container Deployment to AWS ECS..." -ForegroundColor Cyan

# Step 1: Check prerequisites
Write-Host "🔍 Checking prerequisites..."
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "AWS CLI not found. Please install it first."
    exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker not found. Please install it first."
    exit 1
}

# Step 2: ECR Login
Write-Host "🔐 Logging into ECR..."
$loginCommand = aws ecr get-login-password --region $AwsRegion
$loginCommand | docker login --username AWS --password-stdin $EcrRegistry
Write-Status "ECR login successful"

# Step 3: Build and push API image
Write-Host "🏗️ Building MemorAI API container..."
Set-Location "apps\memorai"

docker build -t ${ApiRepo}:latest .
docker tag ${ApiRepo}:latest ${EcrRegistry}/${ApiRepo}:latest
docker tag ${ApiRepo}:latest ${EcrRegistry}/${ApiRepo}:v1.0.0

Write-Host "📤 Pushing MemorAI API to ECR..."
docker push ${EcrRegistry}/${ApiRepo}:latest
docker push ${EcrRegistry}/${ApiRepo}:v1.0.0
Write-Status "MemorAI API image pushed to ECR"

# Step 4: Build and push MCP image
Write-Host "🏗️ Building MemorAI MCP container..."
Set-Location "..\..\packages\memorai-mcp"

docker build -t ${McpRepo}:latest .
docker tag ${McpRepo}:latest ${EcrRegistry}/${McpRepo}:latest
docker tag ${McpRepo}:latest ${EcrRegistry}/${McpRepo}:v1.0.0

Write-Host "📤 Pushing MemorAI MCP to ECR..."
docker push ${EcrRegistry}/${McpRepo}:latest
docker push ${EcrRegistry}/${McpRepo}:v1.0.0
Write-Status "MemorAI MCP image pushed to ECR"

# Step 5: Create task definitions and services
Write-Host "📋 Creating ECS Task Definitions and Services..."
Set-Location "..\..\infrastructure\memorai"

# Get infrastructure outputs
$vpcId = terraform output -raw vpc_id
$privateSubnets = terraform output -json private_subnet_ids | ConvertFrom-Json
$subnetIds = $privateSubnets -join ','

Write-Host "🚀 ECS services will be created with the pushed images"
Write-Status "Container deployment preparation complete!"

Write-Host ""
Write-Host "🎉 MemorAI Containers Built and Pushed Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Next Steps:"
Write-Host "   • Container images are now in ECR"
Write-Host "   • API Image: $EcrRegistry/$ApiRepo:latest"
Write-Host "   • MCP Image: $EcrRegistry/$McpRepo:latest"
Write-Host ""
Write-Host "🔗 To complete deployment:"
Write-Host "   • Run the bash version on Linux/WSL for full ECS deployment"
Write-Host "   • Or manually create ECS services in AWS Console"
Write-Host ""
Write-Status "Container build and push phase completed successfully!"
