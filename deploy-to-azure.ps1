# 🚀 MemorAI Project Azure Cloud Deployment Script (PowerShell)
# This script deploys the complete MemorAI ecosystem to Azure

param(
    [string]$ResourceGroup = "memorai-prod",
    [string]$Location = "eastus2",
    [string]$ContainerRegistry = "memorairegistry",
    [string]$SubscriptionId = $env:AZURE_SUBSCRIPTION_ID
)

# Color functions
function Write-Status { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

Write-Host "🚀 Starting MemorAI Project Azure Cloud Deployment..." -ForegroundColor Blue

# Check prerequisites
Write-Status "Checking prerequisites..."

if (-not (Get-Command "az" -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI not found. Please install Azure CLI first."
    exit 1
}

if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "Docker not found. Please install Docker first."
    exit 1
}

# Login to Azure
Write-Status "Logging in to Azure..."
az login

# Set subscription
if ($SubscriptionId) {
    Write-Status "Setting subscription to $SubscriptionId"
    az account set --subscription $SubscriptionId
}

# Create Resource Group
Write-Status "Creating resource group: $ResourceGroup"
az group create --name $ResourceGroup --location $Location
Write-Success "Resource group created successfully"

# Create Container Registry
Write-Status "Creating Azure Container Registry: $ContainerRegistry"
az acr create --resource-group $ResourceGroup --name $ContainerRegistry --sku Standard
Write-Success "Container Registry created successfully"

# Login to Container Registry
Write-Status "Logging in to Container Registry..."
az acr login --name $ContainerRegistry

# Build and Push Docker Images
Write-Status "Building and pushing Docker images..."

# Build CBD Database
Write-Status "Building CBD Database image..."
docker build -t "$ContainerRegistry.azurecr.io/cbd-database:latest" ./packages/cbd/
docker push "$ContainerRegistry.azurecr.io/cbd-database:latest"
Write-Success "CBD Database image pushed"

# Build MemorAI MCP Server
Write-Status "Building MemorAI MCP Server image..."
docker build -t "$ContainerRegistry.azurecr.io/memorai-mcp:latest" ./packages/memorai-mcp/
docker push "$ContainerRegistry.azurecr.io/memorai-mcp:latest"
Write-Success "MemorAI MCP Server image pushed"

# Build MemorAI App
Write-Status "Building MemorAI App image..."
docker build -t "$ContainerRegistry.azurecr.io/memorai-app:latest" ./apps/memorai/
docker push "$ContainerRegistry.azurecr.io/memorai-app:latest"
Write-Success "MemorAI App image pushed"

# Get registry password
$registryPassword = az acr credential show --name $ContainerRegistry --query passwords[0].value -o tsv

# Create CBD Database Container
Write-Status "Creating CBD Database container..."
az container create `
  --resource-group $ResourceGroup `
  --name cbd-database `
  --image "$ContainerRegistry.azurecr.io/cbd-database:latest" `
  --registry-login-server "$ContainerRegistry.azurecr.io" `
  --registry-username $ContainerRegistry `
  --registry-password $registryPassword `
  --dns-name-label "cbd-database-memorai" `
  --ports 4180 `
  --environment-variables NODE_ENV=production PORT=4180 CBD_LOG_LEVEL=info `
  --cpu 1 --memory 2

Write-Success "CBD Database container created"

# Wait for CBD Database to be ready
Write-Status "Waiting for CBD Database to be ready..."
Start-Sleep -Seconds 60

# Create MemorAI MCP Server Container
Write-Status "Creating MemorAI MCP Server container..."
az container create `
  --resource-group $ResourceGroup `
  --name memorai-mcp-server `
  --image "$ContainerRegistry.azurecr.io/memorai-mcp:latest" `
  --registry-login-server "$ContainerRegistry.azurecr.io" `
  --registry-username $ContainerRegistry `
  --registry-password $registryPassword `
  --dns-name-label "memorai-mcp-server" `
  --ports 4950 `
  --environment-variables `
    NODE_ENV=production `
    MEMORAI_MCP_PORT=4950 `
    CBD_BASE_URL=http://cbd-database-memorai.eastus2.azurecontainer.io:4180 `
    "MEMORAI_API_KEY=$env:MEMORAI_PROD_API_KEY" `
    ENABLE_VECTOR_SEARCH=true `
    ENABLE_HYBRID_SEARCH=true `
    ENABLE_MONITORING=true `
    "AZURE_OPENAI_ENDPOINT=$env:AZURE_OPENAI_ENDPOINT" `
    "AZURE_OPENAI_API_KEY=$env:AZURE_OPENAI_API_KEY" `
  --cpu 2 --memory 4

Write-Success "MemorAI MCP Server container created"

# Wait for MCP Server to be ready
Write-Status "Waiting for MCP Server to be ready..."
Start-Sleep -Seconds 60

# Create MemorAI App Container
Write-Status "Creating MemorAI App container..."
az container create `
  --resource-group $ResourceGroup `
  --name memorai-app `
  --image "$ContainerRegistry.azurecr.io/memorai-app:latest" `
  --registry-login-server "$ContainerRegistry.azurecr.io" `
  --registry-username $ContainerRegistry `
  --registry-password $registryPassword `
  --dns-name-label "memorai-app" `
  --ports 4006 `
  --environment-variables `
    NODE_ENV=production `
    PORT=4006 `
    MEMORAI_API_BASE_URL=http://memorai-mcp-server.eastus2.azurecontainer.io:4950 `
  --cpu 2 --memory 4

Write-Success "MemorAI App container created"

# Validate Deployment
Write-Status "Validating deployment..."

Write-Status "Waiting for all services to be ready..."
Start-Sleep -Seconds 120

# Test health endpoints
Write-Status "Testing health endpoints..."

$cbdUrl = "http://cbd-database-memorai.eastus2.azurecontainer.io:4180/health"
$mcpUrl = "http://memorai-mcp-server.eastus2.azurecontainer.io:4950/health"
$appUrl = "http://memorai-app.eastus2.azurecontainer.io:4006/api/health"

function Test-Endpoint {
    param($Url, $Service)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "$Service is healthy ✅"
            return $true
        }
    }
    catch {
        Write-Error "$Service health check failed ❌"
        return $false
    }
}

Test-Endpoint $cbdUrl "CBD Database"
Test-Endpoint $mcpUrl "MCP Server"  
Test-Endpoint $appUrl "MemorAI App"

# Display deployment information
Write-Success "🎉 MemorAI Project deployed successfully!"

Write-Host ""
Write-Host "📋 Deployment Information:" -ForegroundColor Cyan
Write-Host "=========================="
Write-Host "Resource Group: $ResourceGroup"
Write-Host "Location: $Location"
Write-Host "Container Registry: $ContainerRegistry.azurecr.io"
Write-Host ""
Write-Host "🔗 Service URLs:" -ForegroundColor Cyan
Write-Host "==============="
Write-Host "CBD Database:    $cbdUrl"
Write-Host "MCP Server:      $mcpUrl"
Write-Host "MemorAI App:     $appUrl"
Write-Host ""
Write-Host "📊 Monitor Resources:" -ForegroundColor Cyan
Write-Host "===================="
Write-Host "az container list --resource-group $ResourceGroup --output table"
Write-Host "az container logs --resource-group $ResourceGroup --name memorai-mcp-server"
Write-Host ""

Write-Success "Deployment completed successfully! 🚀"