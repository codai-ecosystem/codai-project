/**
 * Advanced Voice Features Service
 * Phase 5.1: Multi-language support, voice commands, conversation management
 */

import { EventEmitter } from 'events';
import type {
    VoiceCommand,
    ConversationContext,
    LanguageSettings,
    VoiceMacro,
    InterruptionHandler
} from '../../types/voice-types';

export interface AdvancedVoiceConfig {
    defaultLanguage: string;
    supportedLanguages: string[];
    commandTimeout: number;
    contextHistorySize: number;
    macroStorage: boolean;
    interruptionSensitivity: number;
}

export interface VoiceSession {
    id: string;
    userId: string;
    language: string;
    startTime: number;
    contextHistory: ConversationContext[];
    activeMacros: VoiceMacro[];
    settings: LanguageSettings;
}

export class AdvancedVoiceFeatures extends EventEmitter {
    private sessions: Map<string, VoiceSession> = new Map();
    private commands: Map<string, VoiceCommand> = new Map();
    private macros: Map<string, VoiceMacro> = new Map();
    private config: AdvancedVoiceConfig;
    private isActive: boolean = false;

    constructor(config: AdvancedVoiceConfig) {
        super();
        this.config = config;
        this.initializeCommands();
        this.initializeMacros();
    }

    // Multi-language Support
    async switchLanguage(sessionId: string, language: string): Promise<boolean> {
        try {
            const session = this.sessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            if (!this.config.supportedLanguages.includes(language)) {
                throw new Error(`Language ${language} not supported`);
            }

            session.language = language;
            session.settings = await this.getLanguageSettings(language);

            this.emit('languageChanged', {
                sessionId,
                language,
                settings: session.settings,
                timestamp: Date.now()
            });

            return true;
        } catch (error) {
            console.error('Error switching language:', error);
            return false;
        }
    }

    // Voice Command System
    async registerCommand(command: VoiceCommand): Promise<void> {
        this.commands.set(command.id, command);

        this.emit('commandRegistered', {
            commandId: command.id,
            trigger: command.trigger,
            category: command.category,
            timestamp: Date.now()
        });
    }

    async processVoiceCommand(
        sessionId: string,
        transcript: string
    ): Promise<{ command?: VoiceCommand; executed: boolean; result?: any }> {
        try {
            const session = this.sessions.get(sessionId);
            if (!session) {
                return { executed: false };
            }

            // Find matching command
            const matchedCommand = this.findMatchingCommand(transcript, session.language);
            if (!matchedCommand) {
                return { executed: false };
            }

            // Execute command
            const result = await this.executeCommand(matchedCommand, transcript, session);

            // Update context
            this.updateConversationContext(sessionId, {
                type: 'command',
                command: matchedCommand.id,
                transcript,
                result,
                timestamp: Date.now()
            });

            return {
                command: matchedCommand,
                executed: true,
                result
            };
        } catch (error) {
            console.error('Error processing voice command:', error);
            return { executed: false };
        }
    }

    // Voice Macros System
    async createMacro(
        sessionId: string,
        name: string,
        commands: string[]
    ): Promise<VoiceMacro> {
        const macro: VoiceMacro = {
            id: `macro_${Date.now()}`,
            name,
            commands,
            createdBy: sessionId,
            createdAt: Date.now(),
            usage: 0,
            enabled: true
        };

        this.macros.set(macro.id, macro);

        const session = this.sessions.get(sessionId);
        if (session) {
            session.activeMacros.push(macro);
        }

        this.emit('macroCreated', {
            macroId: macro.id,
            name,
            commands: commands.length,
            timestamp: Date.now()
        });

        return macro;
    }

    async executeMacro(sessionId: string, macroId: string): Promise<any[]> {
        try {
            const macro = this.macros.get(macroId);
            if (!macro || !macro.enabled) {
                throw new Error('Macro not found or disabled');
            }

            const results = [];
            for (const command of macro.commands) {
                const result = await this.processVoiceCommand(sessionId, command);
                results.push(result);
            }

            macro.usage++;

            this.emit('macroExecuted', {
                macroId,
                commandsExecuted: results.length,
                timestamp: Date.now()
            });

            return results;
        } catch (error) {
            console.error('Error executing macro:', error);
            throw error;
        }
    }

    // Conversation Context Management
    async createSession(userId: string, language?: string): Promise<string> {
        const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const session: VoiceSession = {
            id: sessionId,
            userId,
            language: language || this.config.defaultLanguage,
            startTime: Date.now(),
            contextHistory: [],
            activeMacros: [],
            settings: await this.getLanguageSettings(language || this.config.defaultLanguage)
        };

        this.sessions.set(sessionId, session);

        this.emit('sessionCreated', {
            sessionId,
            userId,
            language: session.language,
            timestamp: Date.now()
        });

        return sessionId;
    }

    async getConversationHistory(
        sessionId: string,
        limit: number = 50
    ): Promise<ConversationContext[]> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return [];
        }

        return session.contextHistory
            .slice(-limit)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    // Intelligent Interruption Handling
    async handleInterruption(
        sessionId: string,
        interruptionData: any
    ): Promise<InterruptionHandler> {
        try {
            const session = this.sessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            const handler: InterruptionHandler = {
                id: `int_${Date.now()}`,
                sessionId,
                type: this.classifyInterruption(interruptionData),
                priority: this.calculateInterruptionPriority(interruptionData),
                pauseCurrentOperation: false,
                resumeAfter: false,
                timestamp: Date.now()
            };

            // Handle based on priority and type
            if (handler.priority >= this.config.interruptionSensitivity) {
                handler.pauseCurrentOperation = true;

                this.emit('conversationInterrupted', {
                    sessionId,
                    interruptionId: handler.id,
                    type: handler.type,
                    priority: handler.priority,
                    timestamp: Date.now()
                });
            }

            return handler;
        } catch (error) {
            console.error('Error handling interruption:', error);
            throw error;
        }
    }

    // Voice Training and Adaptation
    async adaptToUser(
        sessionId: string,
        feedback: {
            accuracy: number;
            speed: number;
            understanding: number;
            preferences: any;
        }
    ): Promise<void> {
        try {
            const session = this.sessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            // Update language settings based on feedback
            if (feedback.accuracy < 0.8) {
                session.settings.speechRecognitionSensitivity += 0.1;
            }

            if (feedback.speed < 0.7) {
                session.settings.responseSpeed = Math.max(0.5, session.settings.responseSpeed - 0.1);
            }

            // Store user preferences
            session.settings.userPreferences = {
                ...session.settings.userPreferences,
                ...feedback.preferences
            };

            this.emit('voiceAdapted', {
                sessionId,
                adaptations: Object.keys(feedback),
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error adapting voice:', error);
        }
    }

    // Performance and Status
    async startAdvancedFeatures(): Promise<void> {
        if (this.isActive) {
            return;
        }

        try {
            this.isActive = true;

            // Initialize all voice features
            await this.initializeLanguageSupport();
            await this.initializeCommandSystem();
            await this.loadStoredMacros();

            this.emit('advancedFeaturesStarted', {
                supportedLanguages: this.config.supportedLanguages.length,
                registeredCommands: this.commands.size,
                storedMacros: this.macros.size,
                timestamp: Date.now()
            });

            console.log('✅ Advanced Voice Features started successfully');
        } catch (error) {
            console.error('❌ Error starting Advanced Voice Features:', error);
            this.isActive = false;
            throw error;
        }
    }

    async stopAdvancedFeatures(): Promise<void> {
        if (!this.isActive) {
            return;
        }

        try {
            this.isActive = false;

            // Close all sessions
            for (const session of this.sessions.values()) {
                await this.closeSession(session.id);
            }

            this.sessions.clear();

            this.emit('advancedFeaturesStopped', {
                timestamp: Date.now()
            });

            console.log('✅ Advanced Voice Features stopped successfully');
        } catch (error) {
            console.error('❌ Error stopping Advanced Voice Features:', error);
            throw error;
        }
    }

    getStatus(): {
        isActive: boolean;
        activeSessions: number;
        supportedLanguages: number;
        registeredCommands: number;
        storedMacros: number;
        uptime: number;
    } {
        return {
            isActive: this.isActive,
            activeSessions: this.sessions.size,
            supportedLanguages: this.config.supportedLanguages.length,
            registeredCommands: this.commands.size,
            storedMacros: this.macros.size,
            uptime: this.isActive ? Date.now() - (this.sessions.values().next().value?.startTime || Date.now()) : 0
        };
    }

    // Private Helper Methods
    private initializeCommands(): void {
        const defaultCommands: VoiceCommand[] = [
            {
                id: 'switch_language',
                trigger: ['switch to', 'change language to', 'use language'],
                category: 'system',
                description: 'Switch conversation language',
                parameters: ['language'],
                handler: 'switchLanguage'
            },
            {
                id: 'create_macro',
                trigger: ['create macro', 'new macro', 'save as macro'],
                category: 'automation',
                description: 'Create voice command macro',
                parameters: ['name', 'commands'],
                handler: 'createMacro'
            },
            {
                id: 'run_macro',
                trigger: ['run macro', 'execute macro', 'use macro'],
                category: 'automation',
                description: 'Execute saved macro',
                parameters: ['macroName'],
                handler: 'executeMacro'
            }
        ];

        defaultCommands.forEach(command => {
            this.commands.set(command.id, command);
        });
    }

    private initializeMacros(): void {
        // Initialize with common macro patterns
        const defaultMacros: VoiceMacro[] = [
            {
                id: 'daily_startup',
                name: 'Daily Startup',
                commands: [
                    'check calendar for today',
                    'show unread emails',
                    'get weather forecast',
                    'list priority tasks'
                ],
                createdBy: 'system',
                createdAt: Date.now(),
                usage: 0,
                enabled: true
            }
        ];

        defaultMacros.forEach(macro => {
            this.macros.set(macro.id, macro);
        });
    }

    private findMatchingCommand(transcript: string, language: string): VoiceCommand | null {
        const normalizedTranscript = transcript.toLowerCase().trim();

        for (const command of this.commands.values()) {
            for (const trigger of command.trigger) {
                if (normalizedTranscript.includes(trigger.toLowerCase())) {
                    return command;
                }
            }
        }

        return null;
    }

    private async executeCommand(
        command: VoiceCommand,
        transcript: string,
        session: VoiceSession
    ): Promise<any> {
        // Extract parameters from transcript
        const parameters = this.extractParameters(transcript, command.parameters);

        // Execute based on handler
        switch (command.handler) {
            case 'switchLanguage':
                return this.switchLanguage(session.id, parameters.language);
            case 'createMacro':
                return this.createMacro(session.id, parameters.name, parameters.commands);
            case 'executeMacro':
                const macro = Array.from(this.macros.values())
                    .find(m => m.name.toLowerCase() === parameters.macroName.toLowerCase());
                if (macro) {
                    return this.executeMacro(session.id, macro.id);
                }
                break;
            default:
                return { error: 'Unknown command handler' };
        }
    }

    private extractParameters(transcript: string, parameterNames: string[]): any {
        const parameters: any = {};
        // Simple parameter extraction logic
        // In a real implementation, this would use NLP

        for (const param of parameterNames) {
            // Extract parameter values from transcript
            parameters[param] = this.extractParameterValue(transcript, param);
        }

        return parameters;
    }

    private extractParameterValue(transcript: string, parameterName: string): string {
        // Simplified parameter extraction
        // Real implementation would use proper NLP parsing
        const words = transcript.split(' ');
        const paramIndex = words.findIndex(word =>
            word.toLowerCase().includes(parameterName.toLowerCase())
        );

        if (paramIndex !== -1 && paramIndex < words.length - 1) {
            return words[paramIndex + 1];
        }

        return '';
    }

    private async getLanguageSettings(language: string): Promise<LanguageSettings> {
        // Return language-specific settings
        return {
            locale: language,
            speechRecognitionSensitivity: 0.8,
            responseSpeed: 1.0,
            culturalAdaptation: language.startsWith('ro'),
            userPreferences: {}
        };
    }

    private updateConversationContext(sessionId: string, context: ConversationContext): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        session.contextHistory.push(context);

        // Maintain history size limit
        if (session.contextHistory.length > this.config.contextHistorySize) {
            session.contextHistory = session.contextHistory.slice(-this.config.contextHistorySize);
        }
    }

    private classifyInterruption(data: any): 'user_interrupt' | 'system_interrupt' | 'priority_interrupt' | 'emergency' {
        // Classify interruption type based on audio data
        // This would analyze audio patterns, urgency, etc.

        // Simple classification logic for now
        if (data?.urgent) {
            return 'emergency';
        } else if (data?.priority) {
            return 'priority_interrupt';
        } else if (data?.system) {
            return 'system_interrupt';
        } else {
            return 'user_interrupt';
        }
    }

    private calculateInterruptionPriority(data: any): number {
        // Calculate priority score (0-1)
        // Based on urgency indicators in the audio
        return 0.7;
    }

    private async initializeLanguageSupport(): Promise<void> {
        // Initialize language support systems
        console.log(`🌐 Initialized support for ${this.config.supportedLanguages.length} languages`);
    }

    private async initializeCommandSystem(): Promise<void> {
        // Initialize voice command recognition system
        console.log(`🎤 Initialized ${this.commands.size} voice commands`);
    }

    private async loadStoredMacros(): Promise<void> {
        // Load previously saved macros from storage
        console.log(`⚡ Loaded ${this.macros.size} voice macros`);
    }

    private async closeSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (session) {
            this.emit('sessionClosed', {
                sessionId,
                duration: Date.now() - session.startTime,
                contextEntries: session.contextHistory.length,
                timestamp: Date.now()
            });

            this.sessions.delete(sessionId);
        }
    }
}

// Export default configuration
export const defaultAdvancedVoiceConfig: AdvancedVoiceConfig = {
    defaultLanguage: 'en-US',
    supportedLanguages: [
        'en-US', 'en-GB', 'ro-RO', 'es-ES', 'fr-FR',
        'de-DE', 'it-IT', 'pt-PT', 'nl-NL', 'sv-SE'
    ],
    commandTimeout: 30000,
    contextHistorySize: 100,
    macroStorage: true,
    interruptionSensitivity: 0.7
};
