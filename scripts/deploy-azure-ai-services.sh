#!/bin/bash
# Azure AI Services Deployment Automation Script for CODAI Ecosystem
# This script deploys the complete Azure AI service architecture including
# Azure AI Foundry, AI Hub, Azure OpenAI, Azure AI Search, and all model deployments

set -e

# Configuration
RESOURCE_GROUP="codai-ai-services"
LOCATION="your-region"
SUBSCRIPTION_ID=""  # Will be auto-detected or set via parameter
PROJECT_NAME="codai"

# Service names
AI_FOUNDRY_NAME="${PROJECT_NAME}-ai-foundry"
AI_HUB_NAME="${PROJECT_NAME}-ai-hub"
OPENAI_NAME="${PROJECT_NAME}-openai"
SEARCH_NAME="${PROJECT_NAME}-search"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        error "Azure CLI is not installed. Please install from https://aka.ms/azure-cli"
    fi
    
    # Check if logged in
    if ! az account show &> /dev/null; then
        error "Not logged in to Azure. Run 'az login' first"
    fi
    
    # Get subscription ID if not provided
    if [ -z "$SUBSCRIPTION_ID" ]; then
        SUBSCRIPTION_ID=$(az account show --query id -o tsv)
        log "Using subscription: $SUBSCRIPTION_ID"
    fi
    
    # Install required extensions
    log "Installing required Azure CLI extensions..."
    az extension add --name ai-foundry --upgrade --yes 2>/dev/null || true
    az extension add --name ml --upgrade --yes 2>/dev/null || true
    az extension add --name search --upgrade --yes 2>/dev/null || true
    
    success "Prerequisites checked successfully"
}

# Create resource group
create_resource_group() {
    log "Creating resource group: $RESOURCE_GROUP"
    
    if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        warning "Resource group $RESOURCE_GROUP already exists"
    else
        az group create \
            --name "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --tags project="$PROJECT_NAME" purpose="ai-services"
        success "Resource group created successfully"
    fi
}

# Deploy Azure AI Foundry (Primary recommended service)
deploy_ai_foundry() {
    log "Deploying Azure AI Foundry: $AI_FOUNDRY_NAME"
    
    az cognitiveservices account create \
        --name "$AI_FOUNDRY_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --kind "AIServices" \
        --sku "S0" \
        --assign-identity \
        --tags service="ai-foundry" project="$PROJECT_NAME"
    
    success "Azure AI Foundry deployed successfully"
}

# Deploy Azure AI Hub (For open source models)
deploy_ai_hub() {
    log "Deploying Azure AI Hub: $AI_HUB_NAME"
    
    # Create storage account for AI Hub
    STORAGE_NAME="${PROJECT_NAME}aihubstorage"
    az storage account create \
        --name "$STORAGE_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku "Standard_LRS" \
        --kind "StorageV2"
    
    # Create Key Vault for AI Hub
    KEYVAULT_NAME="${PROJECT_NAME}-ai-hub-kv"
    az keyvault create \
        --name "$KEYVAULT_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku "standard"
    
    # Create Application Insights
    APPINSIGHTS_NAME="${PROJECT_NAME}-ai-hub-insights"
    az monitor app-insights component create \
        --app "$APPINSIGHTS_NAME" \
        --location "$LOCATION" \
        --resource-group "$RESOURCE_GROUP" \
        --kind "web"
    
    # Create AI Hub workspace
    az ml workspace create \
        --name "$AI_HUB_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --kind "Hub" \
        --storage-account "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_NAME" \
        --key-vault "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEYVAULT_NAME" \
        --application-insights "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Insights/components/$APPINSIGHTS_NAME"
    
    success "Azure AI Hub deployed successfully"
}

# Deploy Azure OpenAI (Specialized OpenAI-only service)
deploy_azure_openai() {
    log "Deploying Azure OpenAI: $OPENAI_NAME"
    
    az cognitiveservices account create \
        --name "$OPENAI_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --kind "OpenAI" \
        --sku "S0" \
        --assign-identity \
        --tags service="azure-openai" project="$PROJECT_NAME"
    
    success "Azure OpenAI deployed successfully"
}

# Deploy Azure AI Search (For RAG capabilities)
deploy_ai_search() {
    log "Deploying Azure AI Search: $SEARCH_NAME"
    
    az search service create \
        --name "$SEARCH_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku "Standard" \
        --partition-count 1 \
        --replica-count 1 \
        --tags service="ai-search" project="$PROJECT_NAME"
    
    success "Azure AI Search deployed successfully"
}

# Deploy Azure OpenAI models
deploy_openai_models() {
    log "Deploying Azure OpenAI models..."
    
    # Array of models to deploy
    declare -a models=(
        "gpt-4o:gpt-4o:2024-11-20"
        "gpt-4o-realtime:gpt-4o-realtime-preview:2024-10-01"
        "gpt-4o-mini:gpt-4o-mini:2024-07-18"
        "o1-preview:o1-preview:2024-09-12"
        "o1-mini:o1-mini:2024-09-12"
        "gpt-4-turbo:gpt-4:turbo-2024-04-09"
        "gpt-35-turbo:gpt-35-turbo:0125"
        "text-embedding-3-large:text-embedding-3-large:1"
        "text-embedding-3-small:text-embedding-3-small:1"
        "dall-e-3:dall-e-3:3.0"
        "whisper:whisper:001"
        "tts:tts:001"
        "tts-hd:tts-hd:001"
    )
    
    for model_info in "${models[@]}"; do
        IFS=':' read -r deployment_name model_name model_version <<< "$model_info"
        
        log "Deploying model: $deployment_name"
        
        az cognitiveservices account deployment create \
            --name "$OPENAI_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --deployment-name "$deployment_name" \
            --model-name "$model_name" \
            --model-version "$model_version" \
            --model-format "OpenAI" \
            --sku-capacity 10 \
            --sku-name "Standard" || warning "Failed to deploy $deployment_name - may not be available in $LOCATION"
    done
    
    success "Azure OpenAI models deployment completed"
}

# Deploy open source models via AI Hub
deploy_open_source_models() {
    log "Deploying open source models via AI Hub..."
    
    # Serverless API models (pay-as-you-go)
    declare -a serverless_models=(
        "Llama-3.3-70B-Instruct"
        "Llama-3.1-8B-Instruct"
        "Llama-3.1-70B-Instruct"
        "Mistral-Large"
        "Mistral-Small"
        "Cohere-Command-R-Plus"
    )
    
    for model in "${serverless_models[@]}"; do
        log "Setting up serverless deployment for: $model"
        
        # Note: Actual deployment commands would use the model catalog API
        # This is a placeholder for the actual deployment process
        az ml model create \
            --workspace-name "$AI_HUB_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --name "$model" \
            --path "azureml://registries/azureml/models/$model/versions/latest" || warning "Model $model may need manual deployment via Azure AI Foundry portal"
    done
    
    success "Open source models setup completed"
}

# Generate configuration files
generate_config() {
    log "Generating configuration files..."
    
    # Get service endpoints and keys
    AI_FOUNDRY_ENDPOINT=$(az cognitiveservices account show --name "$AI_FOUNDRY_NAME" --resource-group "$RESOURCE_GROUP" --query "properties.endpoint" -o tsv)
    AI_FOUNDRY_KEY=$(az cognitiveservices account keys list --name "$AI_FOUNDRY_NAME" --resource-group "$RESOURCE_GROUP" --query "key1" -o tsv)
    
    OPENAI_ENDPOINT=$(az cognitiveservices account show --name "$OPENAI_NAME" --resource-group "$RESOURCE_GROUP" --query "properties.endpoint" -o tsv)
    OPENAI_KEY=$(az cognitiveservices account keys list --name "$OPENAI_NAME" --resource-group "$RESOURCE_GROUP" --query "key1" -o tsv)
    
    SEARCH_ENDPOINT="https://$SEARCH_NAME.search.windows.net"
    SEARCH_KEY=$(az search admin-key show --service-name "$SEARCH_NAME" --resource-group "$RESOURCE_GROUP" --query "primaryKey" -o tsv)
    
    # Create .env file
    cat > azure-ai-services.env << EOF
# Azure AI Services Configuration - Generated $(date)
# CODAI Ecosystem AI Services

# Azure AI Foundry (Primary recommended service)
AZURE_AI_FOUNDRY_ENDPOINT="$AI_FOUNDRY_ENDPOINT"
AZURE_AI_FOUNDRY_KEY="$AI_FOUNDRY_KEY"

# Azure OpenAI (Specialized OpenAI-only service)  
AZURE_OPENAI_ENDPOINT="$OPENAI_ENDPOINT"
AZURE_OPENAI_KEY="$OPENAI_KEY"
AZURE_OPENAI_API_VERSION="2024-12-01-preview"

# Azure AI Search (RAG capabilities)
AZURE_SEARCH_ENDPOINT="$SEARCH_ENDPOINT"
AZURE_SEARCH_KEY="$SEARCH_KEY"

# Resource Information
AZURE_RESOURCE_GROUP="$RESOURCE_GROUP"
AZURE_LOCATION="$LOCATION"
AZURE_SUBSCRIPTION_ID="$SUBSCRIPTION_ID"

# Service Names
AZURE_AI_FOUNDRY_NAME="$AI_FOUNDRY_NAME"
AZURE_AI_HUB_NAME="$AI_HUB_NAME"
AZURE_OPENAI_NAME="$OPENAI_NAME"
AZURE_SEARCH_NAME="$SEARCH_NAME"
EOF
    
    success "Configuration file 'azure-ai-services.env' generated"
}

# Main deployment function
main() {
    log "Starting Azure AI Services deployment for CODAI ecosystem..."
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --subscription-id)
                SUBSCRIPTION_ID="$2"
                shift 2
                ;;
            --resource-group)
                RESOURCE_GROUP="$2"
                shift 2
                ;;
            --location)
                LOCATION="$2"
                shift 2
                ;;
            --project-name)
                PROJECT_NAME="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --subscription-id ID    Azure subscription ID"
                echo "  --resource-group NAME   Resource group name (default: codai-ai-services)"
                echo "  --location LOCATION     Azure region (default: your-region)"
                echo "  --project-name NAME     Project name prefix (default: codai)"
                echo "  --help                  Show this help message"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
    
    # Update service names with project name
    AI_FOUNDRY_NAME="${PROJECT_NAME}-ai-foundry"
    AI_HUB_NAME="${PROJECT_NAME}-ai-hub"
    OPENAI_NAME="${PROJECT_NAME}-openai"
    SEARCH_NAME="${PROJECT_NAME}-search"
    
    # Execute deployment steps
    check_prerequisites
    create_resource_group
    deploy_ai_foundry
    deploy_ai_hub
    deploy_azure_openai
    deploy_ai_search
    deploy_openai_models
    deploy_open_source_models
    generate_config
    
    success "🎉 Azure AI Services deployment completed successfully!"
    echo ""
    log "Next steps:"
    echo "1. Review the generated 'azure-ai-services.env' file"
    echo "2. Add environment variables to your application"
    echo "3. Test the deployed services"
    echo "4. Configure open source models via Azure AI Foundry portal"
    echo ""
    log "Resources deployed:"
    echo "- Azure AI Foundry: $AI_FOUNDRY_NAME"
    echo "- Azure AI Hub: $AI_HUB_NAME"
    echo "- Azure OpenAI: $OPENAI_NAME"
    echo "- Azure AI Search: $SEARCH_NAME"
    echo ""
    log "Estimated monthly cost: $50-200 USD (depending on usage)"
}

# Run main function
main "$@"
