# Complete Azure AI Services Deployment Guide for CODAI Ecosystem

## Overview

This guide provides comprehensive instructions for deploying the complete Azure AI service architecture required for the CODAI ecosystem, including access to 1900+ AI models from various providers.

## Azure AI Service Architecture

### Required Services

1. **Azure AI Foundry** (Primary - Recommended)
   - **Purpose**: Primary AI service resource for most applications
   - **Capabilities**: Agent services, serverless deployments, unified API
   - **Models**: 16 Azure OpenAI models + serverless access to open source models
   - **Pricing**: Pay-as-you-go for API calls

2. **Azure AI Hub** (Advanced)
   - **Purpose**: Advanced AI resource for open source models and ML capabilities
   - **Capabilities**: Open source model hosting, fine-tuning, managed compute
   - **Models**: 1900+ models including Meta Llama, Mistral, Cohere, Hugging Face
   - **Pricing**: Compute-based billing for managed endpoints

3. **Azure OpenAI** (Specialized)
   - **Purpose**: Specialized resource for OpenAI models only
   - **Capabilities**: Dedicated OpenAI access with fine-tuning
   - **Models**: 16 Azure OpenAI models (subset of AI Foundry)
   - **Pricing**: Token-based pricing

4. **Azure AI Search** (RAG Support)
   - **Purpose**: Intelligent search and RAG capabilities
   - **Capabilities**: Vector search, semantic search, knowledge mining
   - **Pricing**: Based on search units and storage

## Model Catalog (1900+ Models)

### Azure OpenAI Models (16 Total)

#### Tier 1: Critical Models
- **gpt-4o**: Latest GPT-4 Omni model with multimodal capabilities
- **gpt-4o-realtime**: Real-time conversation and voice capabilities
- **gpt-4o-mini**: Lightweight version for cost-effective operations
- **whisper**: Speech-to-text transcription
- **tts** & **tts-hd**: Text-to-speech (standard and HD quality)

#### Tier 2: Reasoning Models
- **o1-preview**: Advanced reasoning capabilities (preview)
- **o1-mini**: Compact reasoning model

#### Tier 3: Specialized Models
- **gpt-4-turbo**: High-performance GPT-4 variant
- **gpt-35-turbo**: Cost-effective conversational AI
- **gpt-35-turbo-instruct**: Instruction-following variant

#### Tier 4: Embedding Models
- **text-embedding-3-large**: High-dimensional embeddings (3072 dimensions)
- **text-embedding-3-small**: Compact embeddings (1536 dimensions)
- **text-embedding-ada-002**: Legacy embedding model

#### Tier 5: Creative Models
- **dall-e-3**: Advanced image generation
- **sora**: Video generation (when available)

### Open Source Models (1900+ Total)

#### Meta Llama Family
- **Llama-3.3-70B-Instruct**: Latest large model
- **Llama-3.1-8B/70B/405B-Instruct**: Various sizes for different needs
- **Llama-2 Series**: 7B, 13B, 70B parameter variants

#### Mistral AI Models
- **Premium**: Mistral Large, Mistral Small, Mistral-OCR-2503
- **Open Source**: Mistral-7B-Instruct, Mixtral-8x7B, Codestral-2501

#### Cohere Models
- **Command R+**: Advanced command-following model
- **Command R**: Standard command model
- **Cohere Embed**: Multilingual embeddings

#### Hugging Face Models
- **Hundreds of models** across categories:
  - Foundation Models
  - Small Language Models
  - Multimodal Models
  - Domain-Specific Models
  - Industry Models

#### NVIDIA NIM Models
- Enterprise-grade containerized models with security scanning
- Optimized for NVIDIA hardware

## Deployment Options

### 1. Automated CLI Deployment (Recommended)

#### Bash Script (Linux/macOS/WSL)
```bash
# Make script executable
chmod +x scripts/deploy-azure-ai-services.sh

# Deploy with default settings
./scripts/deploy-azure-ai-services.sh

# Deploy with custom parameters
./scripts/deploy-azure-ai-services.sh \
  --project-name "myproject" \
  --location "eastus" \
  --resource-group "my-ai-services"
```

#### PowerShell Script (Windows)
```powershell
# Deploy with default settings
.\scripts\deploy-azure-ai-services.ps1

# Deploy with custom parameters
.\scripts\deploy-azure-ai-services.ps1 `
  -ProjectName "myproject" `
  -Location "eastus" `
  -ResourceGroup "my-ai-services"
```

### 2. Infrastructure as Code (Bicep)

#### Single Region Deployment
```bash
# Deploy to current resource group
az deployment group create \
  --template-file infrastructure/azure-ai-services.bicep \
  --parameters projectName=codai environment=prod

# Deploy to specific resource group
az deployment group create \
  --resource-group codai-ai-services \
  --template-file infrastructure/azure-ai-services.bicep \
  --parameters projectName=codai location=your-region
```

#### Multi-Region Deployment
```bash
# Deploy to multiple regions for redundancy
for region in your-region eastus westeurope; do
  az deployment group create \
    --resource-group "codai-ai-services-$region" \
    --template-file infrastructure/azure-ai-services.bicep \
    --parameters projectName=codai location=$region environment=prod
done
```

### 3. Manual Azure Portal Deployment

1. **Create Azure AI Foundry Resource**
   - Navigate to Azure Portal → Create Resource → AI + Machine Learning → Azure AI Foundry
   - Configure: Name, Region (Sweden Central recommended), Pricing Tier (S0)

2. **Create Azure AI Hub**
   - Navigate to Azure AI Foundry Studio → Create Hub
   - This automatically creates supporting resources (Storage, Key Vault, App Insights)

3. **Deploy Models**
   - In AI Foundry Studio → Model catalog
   - Deploy required models from the catalog
   - Configure deployment settings (serverless vs managed compute)

## Regional Deployment Strategy

### Recommended Regions

1. **Primary**: Sweden Central
   - Most models available
   - GDPR compliant
   - Low latency for European users

2. **Secondary**: East US
   - Largest model selection
   - Latest features first
   - Good for North American users

3. **Tertiary**: West Europe
   - GDPR compliant
   - Good European coverage
   - Fallback for Sweden Central

### Model Availability by Region

| Model Category | Sweden Central | East US | West Europe | East US 2 |
|----------------|----------------|---------|-------------|-----------|
| Azure OpenAI | ✅ Most | ✅ All | ✅ Most | ✅ Most |
| Meta Llama | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Mistral AI | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Limited |
| Cohere | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Hugging Face | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

## Cost Optimization

### Pricing Models

1. **Serverless API** (Pay-per-call)
   - Best for: Variable workloads, experimentation
   - Models: Most open source models, premium Mistral
   - Billing: Per API call with usage-based scaling

2. **Standard Deployment** (Token-based)
   - Best for: Production Azure OpenAI workloads
   - Models: All Azure OpenAI models
   - Billing: Per token (input/output)

3. **Managed Compute** (Compute-based)
   - Best for: Consistent high-volume workloads
   - Models: Hugging Face, custom models
   - Billing: Hourly compute rates

4. **Provisioned Throughput** (Reserved capacity)
   - Best for: Predictable high-volume workloads
   - Models: Select Azure OpenAI models
   - Billing: Monthly reservation fees

### Cost Estimates

| Service | Configuration | Monthly Estimate |
|---------|---------------|------------------|
| Azure AI Foundry | Standard deployment | $50-500 |
| Azure AI Hub | With managed compute | $100-1000 |
| Azure OpenAI | Token-based usage | $50-2000 |
| Azure AI Search | Standard tier | $250-500 |
| **Total** | **Complete setup** | **$450-4000** |

*Estimates vary significantly based on usage patterns*

## Environment Configuration

### Generated Environment Variables

After deployment, the following environment variables will be available:

```bash
# Azure AI Foundry (Primary recommended service)
AZURE_AI_FOUNDRY_ENDPOINT="https://codai-ai-foundry.cognitiveservices.azure.com/"
AZURE_AI_FOUNDRY_KEY="your-foundry-key"

# Azure OpenAI (Specialized OpenAI-only service)
AZURE_OPENAI_ENDPOINT="https://codai-openai.openai.azure.com/"
AZURE_OPENAI_KEY="your-openai-key"
AZURE_OPENAI_API_VERSION="2024-12-01-preview"

# Azure AI Search (RAG capabilities)
AZURE_SEARCH_ENDPOINT="https://codai-search.search.windows.net"
AZURE_SEARCH_KEY="your-search-key"

# Resource Information
AZURE_RESOURCE_GROUP="codai-ai-services"
AZURE_LOCATION="your-region"
AZURE_SUBSCRIPTION_ID="your-subscription-id"
```

### Integration with CODAI Ecosystem

Update your application configuration:

```typescript
// config/azure-ai.ts
export const azureAIConfig = {
  // Primary service (recommended for most use cases)
  aiFoundry: {
    endpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT,
    key: process.env.AZURE_AI_FOUNDRY_KEY,
    models: {
      chat: 'gpt-4o',
      realtime: 'gpt-4o-realtime',
      embedding: 'text-embedding-3-large',
      tts: 'tts-hd',
      stt: 'whisper'
    }
  },
  
  // Specialized OpenAI service
  openAI: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    key: process.env.AZURE_OPENAI_KEY,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION
  },
  
  // Search service for RAG
  search: {
    endpoint: process.env.AZURE_SEARCH_ENDPOINT,
    key: process.env.AZURE_SEARCH_KEY,
    indexName: 'codai-knowledge-base'
  }
};
```

## Post-Deployment Steps

### 1. Verify Deployments
```bash
# Test Azure AI Foundry
curl -H "Ocp-Apim-Subscription-Key: $AZURE_AI_FOUNDRY_KEY" \
  "$AZURE_AI_FOUNDRY_ENDPOINT/openai/deployments/gpt-4o/completions?api-version=2024-12-01-preview"

# Test Azure OpenAI
curl -H "api-key: $AZURE_OPENAI_KEY" \
  "$AZURE_OPENAI_ENDPOINT/openai/deployments/gpt-4o/completions?api-version=2024-12-01-preview"
```

### 2. Configure Open Source Models

Access Azure AI Foundry Studio to:
- Browse the model catalog (1900+ models)
- Deploy serverless API models
- Configure managed compute for Hugging Face models
- Set up fine-tuning for custom models

### 3. Set Up RAG with Azure AI Search

```bash
# Create search index for knowledge base
az search index create \
  --service-name $SEARCH_NAME \
  --name "codai-knowledge-base" \
  --fields @search-index-schema.json
```

### 4. Monitor and Scale

- Set up Azure Monitor for usage tracking
- Configure auto-scaling for managed compute
- Implement cost alerts and budgets
- Monitor model performance metrics

## Troubleshooting

### Common Issues

1. **Model Not Available in Region**
   - Solution: Try different region or use AI Foundry instead of OpenAI resource

2. **Quota Exceeded**
   - Solution: Request quota increase in Azure Portal → Cognitive Services

3. **Authentication Errors**
   - Solution: Verify keys and endpoints in environment variables

4. **Network Connectivity**
   - Solution: Check firewall rules and network security groups

### Support Resources

- **Azure AI Documentation**: https://learn.microsoft.com/azure/ai-services/
- **Model Catalog**: https://ai.azure.com/explore/models
- **Pricing Calculator**: https://azure.microsoft.com/pricing/calculator/
- **Support Portal**: https://azure.microsoft.com/support/

## Next Steps

1. **Deploy the services** using your preferred method
2. **Test the deployments** with sample API calls  
3. **Integrate with METU** and other CODAI applications
4. **Configure monitoring** and cost management
5. **Explore the model catalog** for additional capabilities
6. **Set up development workflows** with CI/CD integration

This comprehensive setup provides access to cutting-edge AI capabilities including the latest GPT-4o, reasoning models (o1), real-time voice, image generation, and access to 1900+ open source models from leading providers.
