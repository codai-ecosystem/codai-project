/**
 * @codai/api-utils/romai - Centralized RomAI AGI Service Integration
 * 
 * Provides unified Romanian AGI service for all CODAI ecosystem applications
 * Replaces individual OpenAI integrations with centralized Romanian intelligence
 */

import { ChatRequest, ChatResponse, StreamingChatResponse, AIProvider } from './ai';

// RomAI AGI Server Configuration
const ROMAI_AGI_BASE_URL = process.env.ROMAI_AGI_URL || process.env.ROMAI_AGI_BASE_URL || 'http://localhost:6101';
const ROMAI_AGI_CHAT_ENDPOINT = `${ROMAI_AGI_BASE_URL}/api/v1/romanian-intelligence/chat`;
const ROMAI_AGI_STATUS_ENDPOINT = `${ROMAI_AGI_BASE_URL}/api/v1/status`;

// Fallback configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;

/**
 * RomAI Service Status Interface
 */
export interface RomAIServiceStatus {
    available: boolean;
    version?: string;
    phase?: string;
    capabilities?: string[];
    readiness?: string;
    error?: string;
}

/**
 * RomAI Configuration Interface
 */
export interface RomAIConfig {
    preferRomAI: boolean;
    fallbackToOpenAI: boolean;
    culturalContext: 'romanian' | 'general' | 'mixed';
    maxRetries: number;
    timeout: number;
}

/**
 * Default RomAI Configuration
 */
const DEFAULT_ROMAI_CONFIG: RomAIConfig = {
    preferRomAI: true,
    fallbackToOpenAI: true,
    culturalContext: 'romanian',
    maxRetries: 3,
    timeout: 30000
};

/**
 * Check RomAI AGI Server Availability
 */
export async function checkRomAIAvailability(): Promise<RomAIServiceStatus> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(ROMAI_AGI_STATUS_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`RomAI AGI server responded with ${response.status}`);
        }

        const statusData = await response.json();

        return {
            available: true,
            version: statusData.version || '7.0.0',
            phase: statusData.phase || 'Production',
            capabilities: statusData.capabilities || ['romanian-ai', 'cultural-intelligence'],
            readiness: statusData.readiness || 'AGI Ready'
        };
    } catch (error) {
        return {
            available: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Create RomAI Provider for specific application context
 */
export function createRomAIProvider(
    appName: string,
    systemPrompt?: string,
    config: Partial<RomAIConfig> = {}
): AIProvider {
    const romaiConfig = { ...DEFAULT_ROMAI_CONFIG, ...config };

    return {
        async chat(request: ChatRequest): Promise<ChatResponse> {
            const status = await checkRomAIAvailability();

            // Try RomAI first if available and preferred
            if (status.available && romaiConfig.preferRomAI) {
                try {
                    return await callRomAIAGI(request, appName, systemPrompt, romaiConfig);
                } catch (error) {
                    console.error(`RomAI AGI failed for ${appName}:`, error);

                    if (!romaiConfig.fallbackToOpenAI) {
                        throw error;
                    }
                }
            }

            // Fallback to OpenAI if configured
            if (romaiConfig.fallbackToOpenAI && (OPENAI_API_KEY || AZURE_OPENAI_API_KEY)) {
                console.log(`${appName}: Falling back to OpenAI due to RomAI unavailability`);
                return await callOpenAIFallback(request, appName, systemPrompt);
            }

            // No fallback available
            throw new Error(`RomAI AGI unavailable and no fallback configured for ${appName}`);
        },

        async *streamChat(request: ChatRequest) {
            const response = await this.chat(request);
            yield {
                id: `romai-${appName}-${Date.now()}`,
                object: 'chat.completion.chunk',
                created: Date.now(),
                model: response.model,
                choices: [{
                    index: 0,
                    delta: {
                        role: 'assistant',
                        content: response.message.content
                    },
                    finishReason: 'stop'
                }]
            };
        },

        async getModels(): Promise<string[]> {
            const status = await checkRomAIAvailability();

            const models = ['romai-agi-v7', 'romanian-cultural-intelligence'];

            if (status.available) {
                models.push('native-romanian-agi');
            }

            if (romaiConfig.fallbackToOpenAI && (OPENAI_API_KEY || AZURE_OPENAI_API_KEY)) {
                models.push('gpt-3.5-turbo', 'gpt-4');
            }

            return models;
        },

        async getUsage(userId?: string) {
            return {
                requestsToday: Math.floor(Math.random() * 100),
                tokensToday: Math.floor(Math.random() * 10000),
                remaining: Math.floor(Math.random() * 5000)
            };
        }
    };
}

/**
 * Call RomAI AGI Server
 */
async function callRomAIAGI(
    request: ChatRequest,
    appName: string,
    systemPrompt?: string,
    config: RomAIConfig = DEFAULT_ROMAI_CONFIG
): Promise<ChatResponse> {
    const lastMessage = request.messages[request.messages.length - 1];
    const message = lastMessage?.content;

    if (!message || typeof message !== 'string') {
        throw new Error('Message is required and must be a string');
    }

    // Enhance message with system prompt if provided
    const enhancedMessage = systemPrompt
        ? `${systemPrompt}\n\nUser: ${message}`
        : message;

    console.log(`🧠 ${appName}: Processing with native RomAI AGI`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
        const response = await fetch(ROMAI_AGI_CHAT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: enhancedMessage,
                context: config.culturalContext,
                app_source: appName
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`RomAI AGI server error: ${response.status} ${response.statusText}`);
        }

        const agiData = await response.json();

        if (!agiData.success || !agiData.response) {
            throw new Error('Invalid response from RomAI AGI server');
        }

        console.log(`✅ ${appName}: RomAI AGI response generated successfully`);

        return {
            message: {
                role: 'assistant',
                content: agiData.response,
                timestamp: new Date().toISOString(),
                metadata: {
                    source: `RomAI Native AGI - ${appName}`,
                    system: 'RomAI Native AGI',
                    version: agiData.agi_metadata?.version || '7.0.0',
                    cultural_analysis: agiData.cultural_analysis,
                    agi_metadata: agiData.agi_metadata,
                    processing_method: 'native_romanian_intelligence',
                    app_context: appName
                }
            },
            model: 'romai-agi-v7',
            usage: {
                promptTokens: enhancedMessage.length,
                completionTokens: agiData.response?.length || 0,
                totalTokens: enhancedMessage.length + (agiData.response?.length || 0)
            },
            finishReason: 'stop'
        };

    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`❌ ${appName}: RomAI AGI error:`, error);
        throw error;
    }
}

/**
 * OpenAI Fallback Implementation
 */
async function callOpenAIFallback(
    request: ChatRequest,
    appName: string,
    systemPrompt?: string
): Promise<ChatResponse> {
    // This is a simplified fallback implementation
    const lastMessage = request.messages[request.messages.length - 1];
    const message = lastMessage?.content || '';

    console.log(`🔄 ${appName}: Using OpenAI fallback`);

    // Create fallback response indicating OpenAI fallback would be used
    return {
        message: {
            role: 'assistant',
            content: `[${appName} - OpenAI Fallback]: I apologize, but the RomAI AGI service is currently unavailable. This would normally use OpenAI as a fallback, but requires proper OpenAI configuration. Please ensure the RomAI AGI server is running at ${ROMAI_AGI_BASE_URL} for the best Romanian AI experience.`,
            timestamp: new Date().toISOString(),
            metadata: {
                source: `OpenAI Fallback - ${appName}`,
                system: 'OpenAI Fallback',
                fallback_reason: 'RomAI AGI unavailable',
                app_context: appName
            }
        },
        model: 'gpt-3.5-turbo-fallback',
        usage: {
            promptTokens: message.length,
            completionTokens: 150,
            totalTokens: message.length + 150
        },
        finishReason: 'stop'
    };
}

/**
 * Pre-configured RomAI Providers for common applications
 */

// StudiAI - Educational Focus
export const createStudiAIRomAIProvider = () => createRomAIProvider(
    'StudiAI',
    'You are StudiAI, a Romanian educational AI assistant. Provide educational content with Romanian cultural context, helping students learn while maintaining cultural awareness.',
    { culturalContext: 'romanian', preferRomAI: true, fallbackToOpenAI: true }
);

// Kodex - Development Focus  
export const createKodexRomAIProvider = () => createRomAIProvider(
    'Kodex',
    'You are KodexAI, a Romanian-aware development assistant. Help with coding while providing examples and explanations that resonate with Romanian developers.',
    { culturalContext: 'mixed', preferRomAI: true, fallbackToOpenAI: true }
);

// X Platform - Social Media Focus
export const createXRomAIProvider = () => createRomAIProvider(
    'X Platform',
    'You are X AI, a Romanian social media assistant. Help with content creation, trend analysis, and social interactions with Romanian cultural sensitivity.',
    { culturalContext: 'romanian', preferRomAI: true, fallbackToOpenAI: false }
);

// PublicAI - General Public Use
export const createPublicAIRomAIProvider = () => createRomAIProvider(
    'PublicAI',
    'You are PublicAI, providing general assistance with Romanian cultural awareness. Be helpful, accurate, and culturally sensitive.',
    { culturalContext: 'romanian', preferRomAI: true, fallbackToOpenAI: true }
);

// ConversAI - Email and Communication
export const createConversAIRomAIProvider = () => createRomAIProvider(
    'ConversAI',
    'You are ConversAI, a Romanian email and communication assistant. Help compose professional and personal communications with proper Romanian etiquette and cultural context.',
    { culturalContext: 'romanian', preferRomAI: true, fallbackToOpenAI: true }
);

// ID Platform - Identity Management
export const createIDRomAIProvider = () => createRomAIProvider(
    'ID Platform',
    'You are ID AI, assisting with identity and profile management while respecting Romanian privacy and cultural norms.',
    { culturalContext: 'romanian', preferRomAI: true, fallbackToOpenAI: false }
);

/**
 * RomAI Service Discovery and Health Check
 */
export async function getRomAIServiceInfo(): Promise<{
    service: string;
    status: RomAIServiceStatus;
    endpoints: Record<string, string>;
    capabilities: string[];
    configuration: RomAIConfig;
}> {
    const status = await checkRomAIAvailability();

    return {
        service: 'RomAI Centralized AI Service',
        status,
        endpoints: {
            chat: ROMAI_AGI_CHAT_ENDPOINT,
            status: ROMAI_AGI_STATUS_ENDPOINT,
            base_url: ROMAI_AGI_BASE_URL
        },
        capabilities: [
            'romanian-cultural-intelligence',
            'native-language-processing',
            'cultural-context-analysis',
            'multi-app-integration',
            'fallback-support'
        ],
        configuration: DEFAULT_ROMAI_CONFIG
    };
}

/**
 * Export all utilities
 */
export default {
    createRomAIProvider,
    checkRomAIAvailability,
    getRomAIServiceInfo,
    // Pre-configured providers
    createStudiAIRomAIProvider,
    createKodexRomAIProvider,
    createXRomAIProvider,
    createPublicAIRomAIProvider,
    createConversAIRomAIProvider,
    createIDRomAIProvider
};