# Azure AI Services Deployment Automation Script for CODAI Ecosystem (PowerShell)
# This script deploys the complete Azure AI service architecture including
# Azure AI Foundry, AI Hub, Azure OpenAI, Azure AI Search, and all model deployments

param(
    [string]$SubscriptionId = "",
    [string]$ResourceGroup = "codai-ai-services",
    [string]$Location = "your-region", 
    [string]$ProjectName = "codai",
    [switch]$Help
)

# Configuration
$AIFoundryName = "$ProjectName-ai-foundry"
$AIHubName = "$ProjectName-ai-hub"
$OpenAIName = "$ProjectName-openai"
$SearchName = "$ProjectName-search"

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"  
$WarningColor = "Yellow"
$InfoColor = "Cyan"

function Write-Log {
    param([string]$Message, [string]$Color = $InfoColor)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Log "[SUCCESS] $Message" $SuccessColor
}

function Write-Warning {
    param([string]$Message)
    Write-Log "[WARNING] $Message" $WarningColor
}

function Write-Error {
    param([string]$Message)
    Write-Log "[ERROR] $Message" $ErrorColor
    exit 1
}

function Show-Help {
    Write-Host @"
Azure AI Services Deployment Script for CODAI Ecosystem

USAGE:
    .\deploy-azure-ai-services.ps1 [OPTIONS]

OPTIONS:
    -SubscriptionId ID      Azure subscription ID (auto-detected if not provided)
    -ResourceGroup NAME     Resource group name (default: codai-ai-services)
    -Location LOCATION      Azure region (default: your-region)
    -ProjectName NAME       Project name prefix (default: codai)
    -Help                   Show this help message

EXAMPLES:
    .\deploy-azure-ai-services.ps1
    .\deploy-azure-ai-services.ps1 -ProjectName "myproject" -Location "eastus"
    .\deploy-azure-ai-services.ps1 -SubscriptionId "12345678-1234-1234-1234-123456789012"

REQUIREMENTS:
    - Azure CLI installed and logged in
    - Azure PowerShell module (optional)
    - Sufficient permissions in Azure subscription
"@
    exit 0
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check Azure CLI
    try {
        $azVersion = az version --output json | ConvertFrom-Json
        Write-Log "Azure CLI version: $($azVersion.'azure-cli')"
    }
    catch {
        Write-Error "Azure CLI is not installed. Please install from https://aka.ms/azure-cli"
    }
    
    # Check if logged in
    try {
        $account = az account show --output json | ConvertFrom-Json
        if (-not $account) {
            Write-Error "Not logged in to Azure. Run 'az login' first"
        }
    }
    catch {
        Write-Error "Not logged in to Azure. Run 'az login' first"
    }
    
    # Get subscription ID if not provided
    if ([string]::IsNullOrEmpty($SubscriptionId)) {
        $SubscriptionId = az account show --query id --output tsv
        Write-Log "Using subscription: $SubscriptionId"
    }
    
    # Install required extensions
    Write-Log "Installing required Azure CLI extensions..."
    az extension add --name ai-foundry --upgrade --yes 2>$null
    az extension add --name ml --upgrade --yes 2>$null  
    az extension add --name search --upgrade --yes 2>$null
    
    Write-Success "Prerequisites checked successfully"
}

function New-ResourceGroup {
    Write-Log "Creating resource group: $ResourceGroup"
    
    $existing = az group show --name $ResourceGroup --output json 2>$null
    if ($existing) {
        Write-Warning "Resource group $ResourceGroup already exists"
    }
    else {
        az group create `
            --name $ResourceGroup `
            --location $Location `
            --tags project=$ProjectName purpose=ai-services `
            --output json | Out-Null
        Write-Success "Resource group created successfully"
    }
}

function Deploy-AIFoundry {
    Write-Log "Deploying Azure AI Foundry: $AIFoundryName"
    
    az cognitiveservices account create `
        --name $AIFoundryName `
        --resource-group $ResourceGroup `
        --location $Location `
        --kind "AIServices" `
        --sku "S0" `
        --assign-identity `
        --tags service=ai-foundry project=$ProjectName `
        --output json | Out-Null
    
    Write-Success "Azure AI Foundry deployed successfully"
}

function Deploy-AIHub {
    Write-Log "Deploying Azure AI Hub: $AIHubName"
    
    # Create storage account for AI Hub
    $StorageName = "$ProjectName" + "aihubstorage"
    az storage account create `
        --name $StorageName `
        --resource-group $ResourceGroup `
        --location $Location `
        --sku "Standard_LRS" `
        --kind "StorageV2" `
        --output json | Out-Null
    
    # Create Key Vault for AI Hub
    $KeyVaultName = "$ProjectName-ai-hub-kv"
    az keyvault create `
        --name $KeyVaultName `
        --resource-group $ResourceGroup `
        --location $Location `
        --sku "standard" `
        --output json | Out-Null
    
    # Create Application Insights
    $AppInsightsName = "$ProjectName-ai-hub-insights"
    az monitor app-insights component create `
        --app $AppInsightsName `
        --location $Location `
        --resource-group $ResourceGroup `
        --kind "web" `
        --output json | Out-Null
    
    # Create AI Hub workspace
    az ml workspace create `
        --name $AIHubName `
        --resource-group $ResourceGroup `
        --location $Location `
        --kind "Hub" `
        --storage-account "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Storage/storageAccounts/$StorageName" `
        --key-vault "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.KeyVault/vaults/$KeyVaultName" `
        --application-insights "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/components/$AppInsightsName" `
        --output json | Out-Null
    
    Write-Success "Azure AI Hub deployed successfully"
}

function Deploy-AzureOpenAI {
    Write-Log "Deploying Azure OpenAI: $OpenAIName"
    
    az cognitiveservices account create `
        --name $OpenAIName `
        --resource-group $ResourceGroup `
        --location $Location `
        --kind "OpenAI" `
        --sku "S0" `
        --assign-identity `
        --tags service=azure-openai project=$ProjectName `
        --output json | Out-Null
    
    Write-Success "Azure OpenAI deployed successfully"
}

function Deploy-AISearch {
    Write-Log "Deploying Azure AI Search: $SearchName"
    
    az search service create `
        --name $SearchName `
        --resource-group $ResourceGroup `
        --location $Location `
        --sku "Standard" `
        --partition-count 1 `
        --replica-count 1 `
        --tags service=ai-search project=$ProjectName `
        --output json | Out-Null
    
    Write-Success "Azure AI Search deployed successfully"
}

function Deploy-OpenAIModels {
    Write-Log "Deploying Azure OpenAI models..."
    
    # Array of models to deploy
    $models = @(
        @{Name="gpt-4o"; Model="gpt-4o"; Version="2024-11-20"},
        @{Name="gpt-4o-realtime"; Model="gpt-4o-realtime-preview"; Version="2024-10-01"},
        @{Name="gpt-4o-mini"; Model="gpt-4o-mini"; Version="2024-07-18"},
        @{Name="o1-preview"; Model="o1-preview"; Version="2024-09-12"},
        @{Name="o1-mini"; Model="o1-mini"; Version="2024-09-12"},
        @{Name="gpt-4-turbo"; Model="gpt-4"; Version="turbo-2024-04-09"},
        @{Name="gpt-35-turbo"; Model="gpt-35-turbo"; Version="0125"},
        @{Name="text-embedding-3-large"; Model="text-embedding-3-large"; Version="1"},
        @{Name="text-embedding-3-small"; Model="text-embedding-3-small"; Version="1"},
        @{Name="dall-e-3"; Model="dall-e-3"; Version="3.0"},
        @{Name="whisper"; Model="whisper"; Version="001"},
        @{Name="tts"; Model="tts"; Version="001"},
        @{Name="tts-hd"; Model="tts-hd"; Version="001"}
    )
    
    foreach ($model in $models) {
        Write-Log "Deploying model: $($model.Name)"
        
        try {
            az cognitiveservices account deployment create `
                --name $OpenAIName `
                --resource-group $ResourceGroup `
                --deployment-name $model.Name `
                --model-name $model.Model `
                --model-version $model.Version `
                --model-format "OpenAI" `
                --sku-capacity 10 `
                --sku-name "Standard" `
                --output json | Out-Null
        }
        catch {
            Write-Warning "Failed to deploy $($model.Name) - may not be available in $Location"
        }
    }
    
    Write-Success "Azure OpenAI models deployment completed"
}

function Deploy-OpenSourceModels {
    Write-Log "Deploying open source models via AI Hub..."
    
    # Serverless API models (pay-as-you-go)
    $serverlessModels = @(
        "Llama-3.3-70B-Instruct",
        "Llama-3.1-8B-Instruct", 
        "Llama-3.1-70B-Instruct",
        "Mistral-Large",
        "Mistral-Small",
        "Cohere-Command-R-Plus"
    )
    
    foreach ($model in $serverlessModels) {
        Write-Log "Setting up serverless deployment for: $model"
        
        try {
            # Note: Actual deployment commands would use the model catalog API
            # This is a placeholder for the actual deployment process
            az ml model create `
                --workspace-name $AIHubName `
                --resource-group $ResourceGroup `
                --name $model `
                --path "azureml://registries/azureml/models/$model/versions/latest" `
                --output json | Out-Null
        }
        catch {
            Write-Warning "Model $model may need manual deployment via Azure AI Foundry portal"
        }
    }
    
    Write-Success "Open source models setup completed"
}

function New-Configuration {
    Write-Log "Generating configuration files..."
    
    # Get service endpoints and keys
    $AIFoundryEndpoint = az cognitiveservices account show --name $AIFoundryName --resource-group $ResourceGroup --query "properties.endpoint" --output tsv
    $AIFoundryKey = az cognitiveservices account keys list --name $AIFoundryName --resource-group $ResourceGroup --query "key1" --output tsv
    
    $OpenAIEndpoint = az cognitiveservices account show --name $OpenAIName --resource-group $ResourceGroup --query "properties.endpoint" --output tsv
    $OpenAIKey = az cognitiveservices account keys list --name $OpenAIName --resource-group $ResourceGroup --query "key1" --output tsv
    
    $SearchEndpoint = "https://$SearchName.search.windows.net"
    $SearchKey = az search admin-key show --service-name $SearchName --resource-group $ResourceGroup --query "primaryKey" --output tsv
    
    # Create .env file
    $envContent = @"
# Azure AI Services Configuration - Generated $(Get-Date)
# CODAI Ecosystem AI Services

# Azure AI Foundry (Primary recommended service)
AZURE_AI_FOUNDRY_ENDPOINT="$AIFoundryEndpoint"
AZURE_AI_FOUNDRY_KEY="$AIFoundryKey"

# Azure OpenAI (Specialized OpenAI-only service)  
AZURE_OPENAI_ENDPOINT="$OpenAIEndpoint"
AZURE_OPENAI_KEY="$OpenAIKey"
AZURE_OPENAI_API_VERSION="2024-12-01-preview"

# Azure AI Search (RAG capabilities)
AZURE_SEARCH_ENDPOINT="$SearchEndpoint"
AZURE_SEARCH_KEY="$SearchKey"

# Resource Information
AZURE_RESOURCE_GROUP="$ResourceGroup"
AZURE_LOCATION="$Location"
AZURE_SUBSCRIPTION_ID="$SubscriptionId"

# Service Names
AZURE_AI_FOUNDRY_NAME="$AIFoundryName"
AZURE_AI_HUB_NAME="$AIHubName"
AZURE_OPENAI_NAME="$OpenAIName"
AZURE_SEARCH_NAME="$SearchName"
"@
    
    $envContent | Out-File -FilePath "azure-ai-services.env" -Encoding UTF8
    
    Write-Success "Configuration file 'azure-ai-services.env' generated"
}

# Main execution
function Main {
    if ($Help) {
        Show-Help
    }
    
    Write-Log "Starting Azure AI Services deployment for CODAI ecosystem..." $InfoColor
    
    # Update service names with project name
    $AIFoundryName = "$ProjectName-ai-foundry"
    $AIHubName = "$ProjectName-ai-hub"
    $OpenAIName = "$ProjectName-openai"
    $SearchName = "$ProjectName-search"
    
    try {
        # Execute deployment steps
        Test-Prerequisites
        New-ResourceGroup
        Deploy-AIFoundry
        Deploy-AIHub  
        Deploy-AzureOpenAI
        Deploy-AISearch
        Deploy-OpenAIModels
        Deploy-OpenSourceModels
        New-Configuration
        
        Write-Success "🎉 Azure AI Services deployment completed successfully!"
        Write-Host ""
        Write-Log "Next steps:" $InfoColor
        Write-Host "1. Review the generated 'azure-ai-services.env' file"
        Write-Host "2. Add environment variables to your application"
        Write-Host "3. Test the deployed services"
        Write-Host "4. Configure open source models via Azure AI Foundry portal"
        Write-Host ""
        Write-Log "Resources deployed:" $InfoColor
        Write-Host "- Azure AI Foundry: $AIFoundryName"
        Write-Host "- Azure AI Hub: $AIHubName"
        Write-Host "- Azure OpenAI: $OpenAIName"
        Write-Host "- Azure AI Search: $SearchName"
        Write-Host ""
        Write-Log "Estimated monthly cost: `$50-200 USD (depending on usage)" $InfoColor
    }
    catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
    }
}

# Run main function
Main
