// Azure AI Services Complete Infrastructure as Code Template
// Deploys: Azure AI Foundry, AI Hub, Azure OpenAI, Azure AI Search
// For CODAI Ecosystem with comprehensive model deployments

targetScope = 'resourceGroup'

@description('Project name prefix for all resources')
param projectName string = 'codai'

@description('Location for all resources')  
param location string = resourceGroup().location

@description('Environment (dev, staging, prod)')
param environment string = 'dev'

@description('Tags to apply to all resources')
param tags object = {
  project: 'codai'
  purpose: 'ai-services'
  environment: environment
  managedBy: 'bicep'
}

// Variables
var aiFoundryName = '${projectName}-ai-foundry-${environment}'
var aiHubName = '${projectName}-ai-hub-${environment}'
var openAIName = '${projectName}-openai-${environment}'
var searchName = '${projectName}-search-${environment}'
var storageName = '${projectName}aihubst${environment}'
var keyVaultName = '${projectName}-ai-kv-${environment}'
var appInsightsName = '${projectName}-ai-insights-${environment}'
var logAnalyticsName = '${projectName}-ai-logs-${environment}'

// Azure OpenAI models to deploy
var openAIModels = [
  {
    name: 'gpt-4o'
    model: 'gpt-4o'
    version: '2024-11-20'
    capacity: 10
  }
  {
    name: 'gpt-4o-realtime'
    model: 'gpt-4o-realtime-preview'
    version: '2024-10-01'
    capacity: 10
  }
  {
    name: 'gpt-4o-mini'
    model: 'gpt-4o-mini'
    version: '2024-07-18'
    capacity: 10
  }
  {
    name: 'o1-preview'
    model: 'o1-preview'
    version: '2024-09-12'
    capacity: 10
  }
  {
    name: 'o1-mini'
    model: 'o1-mini'
    version: '2024-09-12'
    capacity: 10
  }
  {
    name: 'gpt-4-turbo'
    model: 'gpt-4'
    version: 'turbo-2024-04-09'
    capacity: 10
  }
  {
    name: 'gpt-35-turbo'
    model: 'gpt-35-turbo'
    version: '0125'
    capacity: 10
  }
  {
    name: 'text-embedding-3-large'
    model: 'text-embedding-3-large'
    version: '1'
    capacity: 10
  }
  {
    name: 'text-embedding-3-small'
    model: 'text-embedding-3-small'
    version: '1'
    capacity: 10
  }
  {
    name: 'dall-e-3'
    model: 'dall-e-3'
    version: '3.0'
    capacity: 1
  }
  {
    name: 'whisper'
    model: 'whisper'
    version: '001'
    capacity: 10
  }
  {
    name: 'tts'
    model: 'tts'
    version: '001'
    capacity: 10
  }
  {
    name: 'tts-hd'
    model: 'tts-hd'
    version: '001'
    capacity: 10
  }
]

// Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Storage Account for AI Hub
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageName
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    defaultToOAuthAuthentication: false
    minimumTlsVersion: 'TLS1_2'
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
    supportsHttpsTrafficOnly: true
  }
}

// Key Vault for AI Hub
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenant().tenantId
    accessPolicies: []
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: false
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
  }
}

// Azure AI Foundry (Primary recommended service)
resource aiFoundry 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: aiFoundryName
  location: location
  tags: union(tags, { service: 'ai-foundry' })
  sku: {
    name: 'S0'
  }
  kind: 'AIServices'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    customSubDomainName: aiFoundryName
    networkAcls: {
      defaultAction: 'Allow'
    }
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: false
  }
}

// Azure OpenAI (Specialized OpenAI-only service)
resource openAI 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: openAIName
  location: location
  tags: union(tags, { service: 'azure-openai' })
  sku: {
    name: 'S0'
  }
  kind: 'OpenAI'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    customSubDomainName: openAIName
    networkAcls: {
      defaultAction: 'Allow'
    }
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: false
  }
}

// Azure OpenAI Model Deployments
resource openAIDeployments 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01' = [for model in openAIModels: {
  name: model.name
  parent: openAI
  sku: {
    name: 'Standard'
    capacity: model.capacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: model.model
      version: model.version
    }
    versionUpgradeOption: 'OnceNewDefaultVersionAvailable'
    raiPolicyName: 'Microsoft.Default'
  }
}]

// Azure AI Search
resource aiSearch 'Microsoft.Search/searchServices@2024-06-01-preview' = {
  name: searchName
  location: location
  tags: union(tags, { service: 'ai-search' })
  sku: {
    name: 'standard'
  }
  properties: {
    replicaCount: 1
    partitionCount: 1
    hostingMode: 'default'
    publicNetworkAccess: 'enabled'
    networkRuleSet: {
      ipRules: []
    }
    disabledDataExfiltrationOptions: []
    encryptionWithCmk: {
      enforcement: 'Unspecified'
    }
    disableLocalAuth: false
    authOptions: {
      aadOrApiKey: {
        aadAuthFailureMode: 'http401WithBearerChallenge'
      }
    }
  }
}

// Azure Machine Learning Workspace (AI Hub)
resource aiHub 'Microsoft.MachineLearningServices/workspaces@2024-07-01-preview' = {
  name: aiHubName
  location: location
  tags: union(tags, { service: 'ai-hub' })
  identity: {
    type: 'SystemAssigned'
  }
  kind: 'Hub'
  properties: {
    friendlyName: aiHubName
    description: 'AI Hub for ${projectName} - Open source models and ML capabilities'
    storageAccount: storage.id
    keyVault: keyVault.id
    applicationInsights: appInsights.id
    publicNetworkAccess: 'Enabled'
    discoveryUrl: 'https://${location}.api.azureml.ms/discovery'
    serverlessComputeSettings: {
      serverlessComputeCustomSubnet: null
      serverlessComputeNoPublicIP: false
    }
  }

  // AI Hub connections
  resource aiFoundryConnection 'connections@2024-07-01-preview' = {
    name: 'aiFoundryConnection'
    properties: {
      category: 'AzureOpenAI'
      target: aiFoundry.properties.endpoint
      authType: 'ApiKey'
      isSharedToAll: true
      credentials: {
        key: aiFoundry.listKeys().key1
      }
      metadata: {
        ApiType: 'Azure'
        ApiVersion: '2024-12-01-preview'
        DeploymentApiVersion: '2024-10-01'
      }
    }
  }

  resource openAIConnection 'connections@2024-07-01-preview' = {
    name: 'openAIConnection'
    properties: {
      category: 'AzureOpenAI'
      target: openAI.properties.endpoint
      authType: 'ApiKey'
      isSharedToAll: true
      credentials: {
        key: openAI.listKeys().key1
      }
      metadata: {
        ApiType: 'Azure'
        ApiVersion: '2024-12-01-preview'
        DeploymentApiVersion: '2024-10-01'
      }
    }
  }

  resource searchConnection 'connections@2024-07-01-preview' = {
    name: 'searchConnection'
    properties: {
      category: 'CognitiveSearch'
      target: 'https://${aiSearch.name}.search.windows.net'
      authType: 'ApiKey'
      isSharedToAll: true
      credentials: {
        key: aiSearch.listAdminKeys().primaryKey
      }
    }
  }
}

// Outputs
output aiFoundryEndpoint string = aiFoundry.properties.endpoint
output aiFoundryId string = aiFoundry.id
output aiFoundryName string = aiFoundry.name

output openAIEndpoint string = openAI.properties.endpoint
output openAIId string = openAI.id
output openAIName string = openAI.name

output aiSearchEndpoint string = 'https://${aiSearch.name}.search.windows.net'
output aiSearchId string = aiSearch.id
output aiSearchName string = aiSearch.name

output aiHubName string = aiHub.name
output aiHubId string = aiHub.id

output storageAccountName string = storage.name
output keyVaultName string = keyVault.name
output appInsightsName string = appInsights.name

output deployedModels array = [for model in openAIModels: {
  name: model.name
  model: model.model
  version: model.version
}]

output resourceGroupName string = resourceGroup().name
output location string = location
output subscriptionId string = subscription().subscriptionId
