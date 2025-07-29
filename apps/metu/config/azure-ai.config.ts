/**
 * METU Azure AI Services Configuration
 * Configuration for Azure AI services integration with METU voice assistant
 */

export interface AzureAIConfig {
    foundry: {
        endpoint: string
        key: string
        enabled: boolean
    }
    openai: {
        endpoint: string
        key: string
        apiVersion: string
        models: {
            gpt4o: string
            gpt4oMini: string
            whisper: string
            gpt35Turbo: string
        }
    }
    search: {
        endpoint: string
        key: string
        enabled: boolean
    }
    voice: {
        speechToTextModel: string
        textToSpeechProvider: string
        defaultLanguage: string
        supportedLanguages: string[]
    }
}

export const azureAIConfig: AzureAIConfig = {
    foundry: {
        endpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT || '',
        key: process.env.AZURE_AI_FOUNDRY_KEY || '',
        enabled: !!(process.env.AZURE_AI_FOUNDRY_ENDPOINT && process.env.AZURE_AI_FOUNDRY_KEY)
    },
    openai: {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
        key: process.env.AZURE_OPENAI_KEY || '',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
        models: {
            gpt4o: process.env.AZURE_OPENAI_GPT4O_DEPLOYMENT || 'gpt-4o',
            gpt4oMini: process.env.AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT || 'gpt-4o-mini',
            whisper: process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT || 'whisper',
            gpt35Turbo: process.env.AZURE_OPENAI_GPT35_DEPLOYMENT || 'gpt-35-turbo'
        }
    },
    search: {
        endpoint: process.env.AZURE_SEARCH_ENDPOINT || '',
        key: process.env.AZURE_SEARCH_KEY || '',
        enabled: !!(process.env.AZURE_SEARCH_ENDPOINT && process.env.AZURE_SEARCH_KEY)
    },
    voice: {
        speechToTextModel: process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT || 'whisper',
        textToSpeechProvider: process.env.VOICE_PROVIDER || 'azure',
        defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
        supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'en,ro').split(',')
    }
}

/**
 * Validate Azure AI configuration
 */
export function validateAzureAIConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!azureAIConfig.openai.endpoint) {
        errors.push('Azure OpenAI endpoint is required')
    }

    if (!azureAIConfig.openai.key) {
        errors.push('Azure OpenAI key is required')
    }

    if (!azureAIConfig.openai.models.whisper) {
        errors.push('Whisper model deployment is required for voice functionality')
    }

    if (!azureAIConfig.foundry.endpoint && !azureAIConfig.openai.endpoint) {
        errors.push('At least one Azure AI service endpoint must be configured')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Get the recommended model for a specific use case
 */
export function getRecommendedModel(useCase: 'conversation' | 'reasoning' | 'voice' | 'fast'): string {
    switch (useCase) {
        case 'conversation':
            return azureAIConfig.openai.models.gpt35Turbo
        case 'reasoning':
            return azureAIConfig.openai.models.gpt4o
        case 'voice':
            return azureAIConfig.openai.models.whisper
        case 'fast':
            return azureAIConfig.openai.models.gpt4oMini
        default:
            return azureAIConfig.openai.models.gpt4oMini
    }
}

export default azureAIConfig
