import { EventEmitter } from 'events';
import { IVoiceService, VoiceSettings, VoiceState, VoiceCommand, VoiceResponse } from './IVoiceService';
import { VoiceServiceFactory, VoiceServiceType } from './VoiceServiceFactory';
import { databaseService } from '../database/DatabaseService';
import { getConfig } from '../../config/app';

export interface VoiceServiceManagerEvents {
    'service:ready': (provider: string) => void;
    'service:switched': (oldProvider: string, newProvider: string) => void;
    'service:error': (error: Error) => void;
    'command:processed': (command: VoiceCommand, response?: VoiceResponse) => void;
    'settings:updated': (settings: VoiceSettings) => void;
    'state:changed': (state: VoiceState) => void;
}

export interface VoiceCommandHandler {
    pattern: RegExp | string;
    handler: (command: VoiceCommand) => Promise<VoiceResponse | string | void>;
    description: string;
    examples: string[];
    priority: number;
}

export class VoiceServiceManager extends EventEmitter {
    private currentService: IVoiceService | null = null;
    private currentProvider: VoiceServiceType = 'mock';
    private isInitialized = false;
    private commandHandlers: VoiceCommandHandler[] = [];
    private settings: VoiceSettings;
    private config: any;

    constructor() {
        super();
        this.config = getConfig();
        this.settings = {
            provider: 'mock',
            voice: 'default',
            speed: 1.0,
            pitch: 1.0,
            volume: 0.8,
            language: 'en'
        };

        this.setupDefaultHandlers();
    }

    async initialize(provider: VoiceServiceType = 'mock'): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            // Load user settings from database
            await this.loadSettings();

            // Create voice service
            await this.switchProvider(provider || this.settings.provider as VoiceServiceType);

            this.isInitialized = true;
            console.log(`VoiceServiceManager initialized with provider: ${this.currentProvider}`);
        } catch (error) {
            console.error('Failed to initialize VoiceServiceManager:', error);
            throw error;
        }
    }

    async destroy(): Promise<void> {
        if (!this.isInitialized) {
            return;
        }

        if (this.currentService) {
            await this.currentService.destroy();
            this.currentService = null;
        }

        this.commandHandlers = [];
        this.isInitialized = false;
        console.log('VoiceServiceManager destroyed');
    }

    // Provider Management
    async switchProvider(provider: VoiceServiceType): Promise<void> {
        const oldProvider = this.currentProvider;

        try {
            // Create new service
            const newService = await VoiceServiceFactory.create({
                provider,
                settings: this.settings,
                config: this.config.voice
            });

            // Set up event listeners
            this.setupServiceEvents(newService);

            // Clean up old service
            if (this.currentService) {
                await this.currentService.destroy();
            }

            // Switch to new service
            this.currentService = newService;
            this.currentProvider = provider;

            // Update settings
            this.settings.provider = provider;
            await this.saveSettings();

            this.emit('service:switched', oldProvider, provider);
            this.emit('service:ready', provider);

            console.log(`Switched voice provider from ${oldProvider} to ${provider}`);
        } catch (error) {
            this.emit('service:error', error as Error);
            throw error;
        }
    }

    async getAvailableProviders(): Promise<any[]> {
        return VoiceServiceFactory.getAvailableProviders();
    }

    getCurrentProvider(): VoiceServiceType {
        return this.currentProvider;
    }

    // Voice Control
    async startListening(): Promise<void> {
        if (!this.currentService) {
            throw new Error('Voice service not initialized');
        }

        await this.currentService.startListening();
    }

    async stopListening(): Promise<void> {
        if (!this.currentService) {
            return;
        }

        await this.currentService.stopListening();
    }

    async speak(text: string, options?: Partial<VoiceSettings>): Promise<VoiceResponse> {
        if (!this.currentService) {
            throw new Error('Voice service not initialized');
        }

        return this.currentService.speak(text, options);
    }

    async stopSpeaking(): Promise<void> {
        if (!this.currentService) {
            return;
        }

        await this.currentService.stopSpeaking();
    }

    // Settings Management
    async updateSettings(newSettings: Partial<VoiceSettings>): Promise<void> {
        this.settings = { ...this.settings, ...newSettings };

        if (this.currentService) {
            await this.currentService.updateSettings(this.settings);
        }

        await this.saveSettings();
        this.emit('settings:updated', this.settings);
    }

    getSettings(): VoiceSettings {
        return { ...this.settings };
    }

    getState(): VoiceState | null {
        return this.currentService?.getState() || null;
    }

    // Command Handling
    registerCommandHandler(handler: VoiceCommandHandler): void {
        // Insert in priority order (higher priority first)
        const insertIndex = this.commandHandlers.findIndex(h => h.priority < handler.priority);
        if (insertIndex === -1) {
            this.commandHandlers.push(handler);
        } else {
            this.commandHandlers.splice(insertIndex, 0, handler);
        }

        console.log(`Registered voice command handler: ${handler.description}`);
    }

    unregisterCommandHandler(pattern: RegExp | string): void {
        const index = this.commandHandlers.findIndex(h =>
            h.pattern.toString() === pattern.toString()
        );

        if (index !== -1) {
            this.commandHandlers.splice(index, 1);
            console.log(`Unregistered voice command handler: ${pattern}`);
        }
    }

    getRegisteredHandlers(): VoiceCommandHandler[] {
        return [...this.commandHandlers];
    }

    // Voice and Language Management
    async switchVoice(voiceId: string): Promise<void> {
        if (!this.currentService) {
            throw new Error('Voice service not initialized');
        }

        await this.currentService.switchVoice(voiceId);
        await this.updateSettings({ voice: voiceId });
    }

    async switchLanguage(language: string): Promise<void> {
        if (!this.currentService) {
            throw new Error('Voice service not initialized');
        }

        await this.currentService.switchLanguage(language);
        await this.updateSettings({ language });
    }

    async getAvailableVoices(): Promise<any[]> {
        if (!this.currentService) {
            return [];
        }

        return this.currentService.getAvailableVoices();
    }

    // Utility Methods
    isListening(): boolean {
        return this.currentService?.isListening() || false;
    }

    isSpeaking(): boolean {
        return this.currentService?.isSpeaking() || false;
    }

    isProcessing(): boolean {
        return this.currentService?.isProcessing() || false;
    }

    async getHealthStatus(): Promise<any> {
        if (!this.currentService) {
            return {
                provider: 'none',
                status: 'offline',
                latency: 0,
                errorRate: 1.0,
                lastCheck: new Date()
            };
        }

        return this.currentService.getHealthStatus();
    }

    async testVoice(voiceId?: string, testText?: string): Promise<VoiceResponse> {
        if (!this.currentService) {
            throw new Error('Voice service not initialized');
        }

        return this.currentService.testVoice(
            voiceId || this.settings.voice,
            testText
        );
    }

    // Private Methods
    private setupServiceEvents(service: IVoiceService): void {
        service.on('state:changed', (state) => {
            this.emit('state:changed', state);
        });

        service.on('command:received', async (command) => {
            try {
                await this.processCommand(command);
            } catch (error) {
                console.error('Error processing voice command:', error);
                this.emit('service:error', error as Error);
            }
        });

        service.on('error', (error) => {
            this.emit('service:error', error);
        });
    }

    private async processCommand(command: VoiceCommand): Promise<void> {
        console.log(`Processing voice command: "${command.text}"`);

        let response: VoiceResponse | string | void = undefined;
        let handled = false;

        // Try to match command with registered handlers
        for (const handler of this.commandHandlers) {
            let matches = false;

            if (handler.pattern instanceof RegExp) {
                matches = handler.pattern.test(command.text);
            } else {
                matches = command.text.toLowerCase().includes(handler.pattern.toLowerCase());
            }

            if (matches) {
                try {
                    response = await handler.handler(command);
                    handled = true;
                    console.log(`Command handled by: ${handler.description}`);
                    break;
                } catch (error) {
                    console.error(`Error in command handler ${handler.description}:`, error);
                    continue;
                }
            }
        }

        // If no handler processed the command, use default response
        if (!handled) {
            response = this.getDefaultResponse(command);
        }

        // Speak the response if it's a string
        if (typeof response === 'string') {
            const voiceResponse = await this.speak(response);
            this.emit('command:processed', command, voiceResponse);
        } else if (response) {
            this.emit('command:processed', command, response as VoiceResponse);
        } else {
            this.emit('command:processed', command);
        }
    }

    private getDefaultResponse(command: VoiceCommand): string {
        const language = command.language || this.settings.language;

        const responses = {
            'en': [
                "I'm sorry, I didn't understand that command.",
                "Could you please repeat that?",
                "I'm not sure how to help with that.",
                "Can you try asking in a different way?"
            ],
            'ro': [
                "Îmi pare rău, nu am înțeles comanda.",
                "Poți să repeți, te rog?",
                "Nu sunt sigur cum să te ajut cu asta.",
                "Poți să întrebi într-un alt fel?"
            ]
        };

        const languageResponses = responses[language as keyof typeof responses] || responses['en'];
        return languageResponses[Math.floor(Math.random() * languageResponses.length)];
    }

    private setupDefaultHandlers(): void {
        // System commands
        this.registerCommandHandler({
            pattern: /^(hello|hi|hey)\s+(metu|assistant)/i,
            handler: async (command) => {
                const language = command.language || 'en';
                const responses = {
                    'en': "Hello! I'm METU, your voice assistant. How can I help you?",
                    'ro': "Salut! Sunt METU, asistentul tău vocal. Cu ce te pot ajuta?"
                };
                return responses[language as keyof typeof responses] || responses['en'];
            },
            description: 'Greeting handler',
            examples: ['Hello METU', 'Hi assistant'],
            priority: 10
        });

        this.registerCommandHandler({
            pattern: /^(stop|quit|exit|bye)/i,
            handler: async (command) => {
                await this.stopListening();
                await this.stopSpeaking();

                const language = command.language || 'en';
                const responses = {
                    'en': "Goodbye! I'm here whenever you need me.",
                    'ro': "La revedere! Sunt aici oricând ai nevoie de mine."
                };
                return responses[language as keyof typeof responses] || responses['en'];
            },
            description: 'Stop/exit handler',
            examples: ['Stop', 'Quit', 'Exit', 'Bye'],
            priority: 20
        });

        // Language switching
        this.registerCommandHandler({
            pattern: /change language to (english|romanian|ro|en)/i,
            handler: async (command) => {
                const match = command.text.match(/change language to (english|romanian|ro|en)/i);
                if (match) {
                    const lang = match[1].toLowerCase();
                    const targetLang = (lang === 'english' || lang === 'en') ? 'en' : 'ro';

                    await this.switchLanguage(targetLang);

                    const responses = {
                        'en': "Language changed to English.",
                        'ro': "Limba schimbată în română."
                    };
                    return responses[targetLang as keyof typeof responses];
                }
            },
            description: 'Language switching',
            examples: ['Change language to English', 'Change language to Romanian'],
            priority: 15
        });

        // Status check
        this.registerCommandHandler({
            pattern: /^(status|how are you|what's your status)/i,
            handler: async (command) => {
                const health = await this.getHealthStatus();
                const language = command.language || 'en';

                const responses = {
                    'en': `I'm running on ${health.provider} with ${health.status} status. Everything looks good!`,
                    'ro': `Funcționez cu ${health.provider} cu statusul ${health.status}. Totul pare în regulă!`
                };

                return responses[language as keyof typeof responses] || responses['en'];
            },
            description: 'Status check',
            examples: ['Status', 'How are you', "What's your status"],
            priority: 5
        });
    }

    private async loadSettings(): Promise<void> {
        try {
            const userSettings = await databaseService.getUserSettings('default-user');
            if (userSettings) {
                this.settings = {
                    provider: (userSettings.voiceSettings.provider || 'mock') as VoiceServiceType,
                    voice: userSettings.voiceSettings.voiceId || 'default',
                    speed: userSettings.voiceSettings.speechRate || 1.0,
                    pitch: userSettings.voiceSettings.pitch || 1.0,
                    volume: userSettings.voiceSettings.volume || 0.8,
                    language: userSettings.language || 'en'
                };
            }
        } catch (error) {
            console.warn('Could not load voice settings from database:', error);
        }
    }

    private async saveSettings(): Promise<void> {
        try {
            await databaseService.updateUserSettings('default-user', {
                voiceSettings: {
                    speechRate: this.settings.speed,
                    pitch: this.settings.pitch,
                    volume: this.settings.volume,
                    voiceId: this.settings.voice,
                    provider: this.settings.provider as 'romai' | 'azure' | 'mock',
                },
                language: this.settings.language as 'en' | 'ro',
                voiceEnabled: true
            });
        } catch (error) {
            console.warn('Could not save voice settings to database:', error);
        }
    }

    // Event emitter type safety
    on<K extends keyof VoiceServiceManagerEvents>(
        event: K,
        listener: VoiceServiceManagerEvents[K]
    ): this {
        return super.on(event, listener);
    }

    emit<K extends keyof VoiceServiceManagerEvents>(
        event: K,
        ...args: Parameters<VoiceServiceManagerEvents[K]>
    ): boolean {
        return super.emit(event, ...args);
    }
}

// Export singleton instance
export const voiceServiceManager = new VoiceServiceManager();

export default voiceServiceManager;
