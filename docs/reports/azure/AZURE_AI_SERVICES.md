# Azure AI Services Configuration

This document describes the Azure AI services deployment and configuration for the CODAI ecosystem.

## 🚀 Deployed Services

### Azure AI Foundry
- **Name**: `codai-dev-ai-foundry`
- **Endpoint**: `https://your-region.api.cognitive.microsoft.com/`
- **Purpose**: Primary AI service resource - recommended for most applications
- **Capabilities**: Agent service access, serverless model deployments, unified API endpoint

### Azure OpenAI
- **Name**: `codai-dev-openai`
- **Endpoint**: `https://your-region.api.cognitive.microsoft.com/`
- **API Version**: `2024-12-01-preview`
- **Purpose**: Specialized OpenAI-only service with dedicated model deployments

### Azure AI Search
- **Name**: `your-search-service-name`
- **Endpoint**: `https://your-search-service-name.search.windows.net`
- **Purpose**: RAG and semantic search capabilities
- **Tier**: Basic

## 🤖 Deployed Models

| Model | Deployment Name | Version | Capacity | Purpose |
|-------|----------------|---------|----------|---------|
| GPT-4o | `gpt-4o` | 2024-11-20 | 10 TPM | Advanced reasoning and generation |
| GPT-4o Mini | `gpt-4o-mini` | 2024-07-18 | 10 TPM | Fast, cost-effective processing |
| Whisper | `whisper` | 001 | 10 TPM | Speech-to-text conversion |
| GPT-3.5 Turbo | `gpt-35-turbo` | 0125 | 10 TPM | Balanced performance and cost |

## 🔧 Environment Configuration

### Root `.env` File
The main environment file includes all Azure AI services configuration:

```bash
# Azure AI Foundry (Primary recommended service)
AZURE_AI_FOUNDRY_ENDPOINT="https://your-region.api.cognitive.microsoft.com/"
AZURE_AI_FOUNDRY_KEY="your_key_here"

# Azure OpenAI (Specialized OpenAI-only service)  
AZURE_OPENAI_ENDPOINT="https://your-region.api.cognitive.microsoft.com/"
AZURE_OPENAI_KEY="your_key_here"
AZURE_OPENAI_API_VERSION="2024-12-01-preview"

# Azure AI Search (RAG capabilities)
AZURE_SEARCH_ENDPOINT="https://your-search-service-name.search.windows.net"
AZURE_SEARCH_KEY="your_key_here"

# Model-specific deployments
AZURE_OPENAI_GPT4O_DEPLOYMENT="gpt-4o"
AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT="gpt-4o-mini"
AZURE_OPENAI_WHISPER_DEPLOYMENT="whisper"
AZURE_OPENAI_GPT35_DEPLOYMENT="gpt-35-turbo"
```

### METU Application Configuration
METU voice assistant has specific configuration for Azure AI services in `apps/metu/config/azure-ai.config.ts`:

```typescript
import { azureAIConfig, getRecommendedModel } from './config/azure-ai.config'

// Get recommended model for conversation
const conversationModel = getRecommendedModel('conversation')

// Get recommended model for voice processing
const voiceModel = getRecommendedModel('voice')
```

## 📁 Configuration Files

### Generated Files
- `azure-ai-services-deployed.env` - Complete deployment configuration
- `config/azure-ai-deployed.json` - Structured deployment information
- `apps/metu/config/azure-ai.config.ts` - METU-specific configuration

### Template Files Updated
- `.env.example` - Main environment template
- `apps/metu/.env.example` - METU environment template
- `types/global.d.ts` - TypeScript environment variable types

## 🎯 Usage Recommendations

### For METU Voice Assistant
- **Speech-to-Text**: Use `whisper` deployment
- **Text Generation**: Use `gpt-4o-mini` for fast responses
- **Complex Reasoning**: Use `gpt-4o` for advanced queries
- **Search**: Use Azure AI Search for RAG capabilities

### For General Applications
- **Rapid Prototyping**: Use Azure AI Foundry
- **Production**: Use Azure OpenAI with specific deployments
- **Search**: Use Azure AI Search for document retrieval
- **Open Source Models**: Use Azure AI Hub (when available)

## 🔍 Integration Examples

### Node.js/TypeScript
```typescript
import { AzureOpenAI } from 'openai'

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_GPT4O_DEPLOYMENT}`,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION
})
```

### Speech-to-Text with Whisper
```typescript
const response = await client.audio.transcriptions.create({
  file: audioFile,
  model: process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT
})
```

## 📊 Resource Information

- **Resource Group**: `your-resource-group`
- **Region**: `your-region`
- **Subscription**: `your-subscription-id-here`
- **Deployment Date**: `2025-07-25`

## ⚠️ Important Notes

1. **Quota Limitations**: TTS models have a 3 RPM limit in Sweden Central
2. **Regional Availability**: Some embedding models are not available in Sweden Central
3. **Pending Deployment**: Azure AI Hub deployment is pending KeyVault provider registration
4. **Cost Monitoring**: Estimated cost is $100-300/month based on usage

## 🔄 Next Steps

1. **METU Integration**: Update METU to use the new Azure AI endpoints
2. **API Testing**: Test connectivity with all deployed models
3. **Quota Management**: Request increases for TTS models if needed
4. **Hub Completion**: Complete Azure AI Hub deployment for open source models
5. **Cost Monitoring**: Set up Azure cost alerts and usage tracking

## 🛠️ Troubleshooting

### Connection Issues
- Verify API keys and endpoints in environment variables
- Check Azure resource status in the portal
- Ensure subscription permissions are correct

### Model Deployment Issues
- Verify model deployment names match environment variables
- Check regional availability for specific models
- Monitor quota usage and limits

### Authentication Issues
- Ensure Azure CLI is logged in with correct account
- Verify subscription access and permissions
- Check resource provider registrations
