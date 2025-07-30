import { IVoiceService, VoiceSettings } from './IVoiceService';
import MockVoiceService from './MockVoiceService';
import RomAIVoiceService from './RomAIVoiceService';

export type VoiceServiceType = 'mock' | 'romai' | 'azure' | 'google' | 'openai';

export interface VoiceServiceFactoryOptions {
    provider: VoiceServiceType;
    settings?: Partial<VoiceSettings>;
    config?: Record<string, any>;
}

export class VoiceServiceFactory {
    private static instances: Map<string, IVoiceService> = new Map();

    /**
     * Create a new voice service instance
     */
    static async create(options: VoiceServiceFactoryOptions): Promise<IVoiceService> {
        const { provider, settings = {}, config = {} } = options;

        let service: IVoiceService;

        switch (provider) {
            case 'mock':
                service = new MockVoiceService(settings);
                break;

            case 'romai':
                service = new RomAIVoiceService(settings, config);
                break;

            case 'azure':
                // Future implementation
                throw new Error('Azure Speech Service not yet implemented');

            case 'google':
                // Future implementation
                throw new Error('Google Cloud Speech not yet implemented');

            case 'openai':
                // Future implementation
                throw new Error('OpenAI Speech not yet implemented');

            default:
                throw new Error(`Unsupported voice service provider: ${provider}`);
        }

        await service.initialize(settings);
        return service;
    }

    /**
     * Get or create a singleton instance for a provider
     */
    static async getInstance(options: VoiceServiceFactoryOptions): Promise<IVoiceService> {
        const key = `${options.provider}-${JSON.stringify(options.settings)}-${JSON.stringify(options.config)}`;

        if (!this.instances.has(key)) {
            const service = await this.create(options);
            this.instances.set(key, service);
        }

        return this.instances.get(key)!;
    }

    /**
     * Get the recommended voice service based on language and requirements
     */
    static async getRecommended(
        language: string = 'en',
        requirements: {
            culturalContext?: boolean;
            emotionalIntelligence?: boolean;
            realTimeProcessing?: boolean;
            highQuality?: boolean;
            offline?: boolean;
        } = {}
    ): Promise<IVoiceService> {
        // Determine the best provider based on requirements
        let provider: VoiceServiceType = 'mock';

        if (language === 'ro' && requirements.culturalContext) {
            provider = 'romai';
        } else if (requirements.highQuality && !requirements.offline) {
            // In the future, prefer cloud services for high quality
            if (language === 'ro') {
                provider = 'romai';
            } else {
                provider = 'mock'; // Will be 'azure' or 'google' when implemented
            }
        } else if (requirements.offline) {
            provider = 'mock'; // Local processing only
        }

        return this.getInstance({
            provider,
            settings: { language },
            config: requirements
        });
    }

    /**
     * Switch between voice services dynamically
     */
    static async switchService(
        currentService: IVoiceService,
        newProvider: VoiceServiceType,
        preserveSettings: boolean = true
    ): Promise<IVoiceService> {
        let settings: Partial<VoiceSettings> = {};

        if (preserveSettings) {
            settings = currentService.getSettings();
        }

        // Clean up current service
        await currentService.destroy();

        // Create new service
        return this.create({
            provider: newProvider,
            settings: { ...settings, provider: newProvider }
        });
    }

    /**
     * Get all available providers and their capabilities
     */
    static async getAvailableProviders(): Promise<Array<{
        provider: VoiceServiceType;
        displayName: string;
        description: string;
        isAvailable: boolean;
        capabilities: string[];
        supportedLanguages: string[];
        requiresNetwork: boolean;
        requiresApiKey: boolean;
    }>> {
        return [
            {
                provider: 'mock',
                displayName: 'Mock Voice Service',
                description: 'Simple simulation for development and testing',
                isAvailable: true,
                capabilities: ['Basic TTS', 'Basic STT', 'Offline'],
                supportedLanguages: ['en', 'ro', 'es', 'fr', 'de'],
                requiresNetwork: false,
                requiresApiKey: false
            },
            {
                provider: 'romai',
                displayName: 'RomAI AGI Voice',
                description: 'Advanced Romanian AI with cultural intelligence',
                isAvailable: await this.checkRomAIAvailability(),
                capabilities: [
                    'High-quality TTS',
                    'Advanced STT',
                    'Cultural Context',
                    'Emotional Intelligence',
                    'Romanian Specialization',
                    'Real-time Processing'
                ],
                supportedLanguages: ['ro', 'en', 'es', 'fr', 'de', 'it', 'pt', 'ru'],
                requiresNetwork: true,
                requiresApiKey: false
            },
            {
                provider: 'azure',
                displayName: 'Azure Cognitive Services',
                description: 'Microsoft Azure Speech Services (Coming Soon)',
                isAvailable: false,
                capabilities: ['High-quality TTS', 'Advanced STT', 'Multiple Voices'],
                supportedLanguages: ['en', 'ro', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja'],
                requiresNetwork: true,
                requiresApiKey: true
            },
            {
                provider: 'google',
                displayName: 'Google Cloud Speech',
                description: 'Google Cloud Speech-to-Text and Text-to-Speech (Coming Soon)',
                isAvailable: false,
                capabilities: ['High-quality TTS', 'Advanced STT', 'WaveNet Voices'],
                supportedLanguages: ['en', 'ro', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja'],
                requiresNetwork: true,
                requiresApiKey: true
            },
            {
                provider: 'openai',
                displayName: 'OpenAI Speech',
                description: 'OpenAI Whisper and TTS (Coming Soon)',
                isAvailable: false,
                capabilities: ['Whisper STT', 'Neural TTS', 'Multiple Languages'],
                supportedLanguages: ['en', 'ro', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja'],
                requiresNetwork: true,
                requiresApiKey: true
            }
        ];
    }

    /**
     * Validate that a provider is properly configured
     */
    static async validateProvider(
        provider: VoiceServiceType,
        config: Record<string, any> = {}
    ): Promise<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
    }> {
        const errors: string[] = [];
        const warnings: string[] = [];

        switch (provider) {
            case 'mock':
                // Mock service needs no validation
                break;

            case 'romai':
                const romaiAvailable = await this.checkRomAIAvailability();
                if (!romaiAvailable) {
                    warnings.push('RomAI AGI service may not be available - using simulation mode');
                }
                break;

            case 'azure':
                if (!config.apiKey) {
                    errors.push('Azure Speech Service requires an API key');
                }
                if (!config.region) {
                    errors.push('Azure Speech Service requires a region');
                }
                break;

            case 'google':
                if (!config.apiKey && !config.serviceAccountKey) {
                    errors.push('Google Cloud Speech requires API key or service account credentials');
                }
                break;

            case 'openai':
                if (!config.apiKey) {
                    errors.push('OpenAI Speech requires an API key');
                }
                break;

            default:
                errors.push(`Unknown provider: ${provider}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Clean up all cached instances
     */
    static async destroyAll(): Promise<void> {
        const promises = Array.from(this.instances.values()).map(service =>
            service.destroy().catch(error =>
                console.error('Error destroying voice service:', error)
            )
        );

        await Promise.all(promises);
        this.instances.clear();
    }

    /**
     * Get diagnostics information for all providers
     */
    static async getDiagnostics(): Promise<Record<string, any>> {
        const diagnostics: Record<string, any> = {};

        try {
            // Test Mock Service
            const mockService = await this.create({ provider: 'mock' });
            diagnostics.mock = await mockService.getHealthStatus();
            await mockService.destroy();
        } catch (error) {
            diagnostics.mock = { error: error instanceof Error ? error.message : String(error) };
        }

        try {
            // Test RomAI Service
            const romaiService = await this.create({ provider: 'romai' });
            diagnostics.romai = await romaiService.getHealthStatus();
            await romaiService.destroy();
        } catch (error) {
            diagnostics.romai = { error: error instanceof Error ? error.message : String(error) };
        }

        return diagnostics;
    }

    // Private helper methods
    private static async checkRomAIAvailability(): Promise<boolean> {
        try {
            // Check if RomAI AGI package is available
            await import('@codai/romai-agi');

            // Try to connect to RomAI service
            const response = await fetch('http://localhost:4008/health', {
                method: 'GET',
                timeout: 5000
            } as RequestInit).catch(() => null);

            return response?.ok ?? false;
        } catch (error) {
            return false;
        }
    }
}

// Export singleton factory instance
export const voiceServiceFactory = VoiceServiceFactory;

export default VoiceServiceFactory;
