#!/bin/bash

# 🚀 MemorAI Project Azure Cloud Deployment Script
# This script deploys the complete MemorAI ecosystem to Azure

set -e

echo "🚀 Starting MemorAI Project Azure Cloud Deployment..."

# Configuration
RESOURCE_GROUP="memorai-prod"
LOCATION="eastus2"
CONTAINER_REGISTRY="memorairegistry"
SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID}"

# Color coding for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Please install Azure CLI first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker first."
    exit 1
fi

# Login to Azure
print_status "Logging in to Azure..."
az login

# Set subscription
if [ ! -z "$SUBSCRIPTION_ID" ]; then
    print_status "Setting subscription to $SUBSCRIPTION_ID"
    az account set --subscription "$SUBSCRIPTION_ID"
fi

# Create Resource Group
print_status "Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
print_success "Resource group created successfully"

# Create Container Registry
print_status "Creating Azure Container Registry: $CONTAINER_REGISTRY"
az acr create --resource-group "$RESOURCE_GROUP" --name "$CONTAINER_REGISTRY" --sku Standard
print_success "Container Registry created successfully"

# Login to Container Registry
print_status "Logging in to Container Registry..."
az acr login --name "$CONTAINER_REGISTRY"

# Build and Push Docker Images
print_status "Building and pushing Docker images..."

# Build CBD Database
print_status "Building CBD Database image..."
docker build -t "${CONTAINER_REGISTRY}.azurecr.io/cbd-database:latest" ./packages/cbd/
docker push "${CONTAINER_REGISTRY}.azurecr.io/cbd-database:latest"
print_success "CBD Database image pushed"

# Build MemorAI MCP Server
print_status "Building MemorAI MCP Server image..."
docker build -t "${CONTAINER_REGISTRY}.azurecr.io/memorai-mcp:latest" ./packages/memorai-mcp/
docker push "${CONTAINER_REGISTRY}.azurecr.io/memorai-mcp:latest"
print_success "MemorAI MCP Server image pushed"

# Build MemorAI App
print_status "Building MemorAI App image..."
docker build -t "${CONTAINER_REGISTRY}.azurecr.io/memorai-app:latest" ./apps/memorai/
docker push "${CONTAINER_REGISTRY}.azurecr.io/memorai-app:latest"
print_success "MemorAI App image pushed"

# Build Gateway
print_status "Building Gateway image..."
docker build -t "${CONTAINER_REGISTRY}.azurecr.io/gateway:latest" -f ./Dockerfile.gateway .
docker push "${CONTAINER_REGISTRY}.azurecr.io/gateway:latest"
print_success "Gateway image pushed"

# Create Azure Container Instances
print_status "Creating Azure Container Instances..."

# Create CBD Database Container
print_status "Creating CBD Database container..."
az container create \
  --resource-group "$RESOURCE_GROUP" \
  --name cbd-database \
  --image "${CONTAINER_REGISTRY}.azurecr.io/cbd-database:latest" \
  --registry-login-server "${CONTAINER_REGISTRY}.azurecr.io" \
  --registry-username "$CONTAINER_REGISTRY" \
  --registry-password "$(az acr credential show --name $CONTAINER_REGISTRY --query passwords[0].value -o tsv)" \
  --dns-name-label "cbd-database-memorai" \
  --ports 4180 \
  --environment-variables NODE_ENV=production PORT=4180 CBD_LOG_LEVEL=info \
  --cpu 1 --memory 2

print_success "CBD Database container created"

# Wait for CBD Database to be ready
print_status "Waiting for CBD Database to be ready..."
sleep 60

# Create MemorAI MCP Server Container
print_status "Creating MemorAI MCP Server container..."
az container create \
  --resource-group "$RESOURCE_GROUP" \
  --name memorai-mcp-server \
  --image "${CONTAINER_REGISTRY}.azurecr.io/memorai-mcp:latest" \
  --registry-login-server "${CONTAINER_REGISTRY}.azurecr.io" \
  --registry-username "$CONTAINER_REGISTRY" \
  --registry-password "$(az acr credential show --name $CONTAINER_REGISTRY --query passwords[0].value -o tsv)" \
  --dns-name-label "memorai-mcp-server" \
  --ports 4950 \
  --environment-variables \
    NODE_ENV=production \
    MEMORAI_MCP_PORT=4950 \
    CBD_BASE_URL=http://cbd-database-memorai.eastus2.azurecontainer.io:4180 \
    MEMORAI_API_KEY="${MEMORAI_PROD_API_KEY}" \
    ENABLE_VECTOR_SEARCH=true \
    ENABLE_HYBRID_SEARCH=true \
    ENABLE_MONITORING=true \
    AZURE_OPENAI_ENDPOINT="${AZURE_OPENAI_ENDPOINT}" \
    AZURE_OPENAI_API_KEY="${AZURE_OPENAI_API_KEY}" \
  --cpu 2 --memory 4

print_success "MemorAI MCP Server container created"

# Wait for MCP Server to be ready
print_status "Waiting for MCP Server to be ready..."
sleep 60

# Create MemorAI App Container
print_status "Creating MemorAI App container..."
az container create \
  --resource-group "$RESOURCE_GROUP" \
  --name memorai-app \
  --image "${CONTAINER_REGISTRY}.azurecr.io/memorai-app:latest" \
  --registry-login-server "${CONTAINER_REGISTRY}.azurecr.io" \
  --registry-username "$CONTAINER_REGISTRY" \
  --registry-password "$(az acr credential show --name $CONTAINER_REGISTRY --query passwords[0].value -o tsv)" \
  --dns-name-label "memorai-app" \
  --ports 4006 \
  --environment-variables \
    NODE_ENV=production \
    PORT=4006 \
    MEMORAI_API_BASE_URL=http://memorai-mcp-server.eastus2.azurecontainer.io:4950 \
  --cpu 2 --memory 4

print_success "MemorAI App container created"

# Create Gateway Container
print_status "Creating Gateway container..."
az container create \
  --resource-group "$RESOURCE_GROUP" \
  --name gateway \
  --image "${CONTAINER_REGISTRY}.azurecr.io/gateway:latest" \
  --registry-login-server "${CONTAINER_REGISTRY}.azurecr.io" \
  --registry-username "$CONTAINER_REGISTRY" \
  --registry-password "$(az acr credential show --name $CONTAINER_REGISTRY --query passwords[0].value -o tsv)" \
  --dns-name-label "memorai-gateway" \
  --ports 4000 \
  --environment-variables \
    NODE_ENV=production \
    GATEWAY_PORT=4000 \
    MEMORAI_APP_URL=http://memorai-app.eastus2.azurecontainer.io:4006 \
    MEMORAI_MCP_URL=http://memorai-mcp-server.eastus2.azurecontainer.io:4950 \
  --cpu 1 --memory 2

print_success "Gateway container created"

# Validate Deployment
print_status "Validating deployment..."

print_status "Waiting for all services to be ready..."
sleep 120

# Test health endpoints
print_status "Testing health endpoints..."

CBD_URL="http://cbd-database-memorai.eastus2.azurecontainer.io:4180/health"
MCP_URL="http://memorai-mcp-server.eastus2.azurecontainer.io:4950/health"
APP_URL="http://memorai-app.eastus2.azurecontainer.io:4006/api/health"
GATEWAY_URL="http://memorai-gateway.eastus2.azurecontainer.io:4000/health"

test_endpoint() {
    local url=$1
    local service=$2
    
    if curl -f -s "$url" > /dev/null; then
        print_success "$service is healthy ✅"
        return 0
    else
        print_error "$service health check failed ❌"
        return 1
    fi
}

test_endpoint "$CBD_URL" "CBD Database"
test_endpoint "$MCP_URL" "MCP Server"
test_endpoint "$APP_URL" "MemorAI App"
test_endpoint "$GATEWAY_URL" "Gateway"

# Display deployment information
print_success "🎉 MemorAI Project deployed successfully!"

echo ""
echo "📋 Deployment Information:"
echo "=========================="
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "Container Registry: ${CONTAINER_REGISTRY}.azurecr.io"
echo ""
echo "🔗 Service URLs:"
echo "==============="
echo "CBD Database:    http://cbd-database-memorai.eastus2.azurecontainer.io:4180"
echo "MCP Server:      http://memorai-mcp-server.eastus2.azurecontainer.io:4950"
echo "MemorAI App:     http://memorai-app.eastus2.azurecontainer.io:4006"
echo "Gateway:         http://memorai-gateway.eastus2.azurecontainer.io:4000"
echo ""
echo "🔍 Health Check URLs:"
echo "===================="
echo "CBD Health:      $CBD_URL"
echo "MCP Health:      $MCP_URL"
echo "App Health:      $APP_URL"
echo "Gateway Health:  $GATEWAY_URL"
echo ""
echo "📊 Monitor Resources:"
echo "===================="
echo "az container list --resource-group $RESOURCE_GROUP --output table"
echo "az container logs --resource-group $RESOURCE_GROUP --name memorai-mcp-server"
echo ""

print_success "Deployment completed successfully! 🚀"