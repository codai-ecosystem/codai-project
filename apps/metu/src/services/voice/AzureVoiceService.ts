/// <reference path="../../types/web-speech-api.d.ts" />

import { getErrorMessage } from '../../utils/errorHandling';

export interface AzureVoiceConfig {
    apiKey: string;
    region: string;
    endpoint?: string;
    deploymentName?: string;
    apiVersion?: string;
}

export interface VoiceResponse {
    text: string;
    audioData?: ArrayBuffer;
    duration?: number;
    language?: string;
}

export interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface AzureVoiceEvents {
    connected: () => void;
    disconnected: () => void;
    error: (error: string) => void;
    responseStarted: () => void;
    responseCompleted: (response: VoiceResponse) => void;
    audioPlaybackStarted: () => void;
    audioPlaybackCompleted: () => void;
}

export class AzureVoiceService {
    private config: AzureVoiceConfig;
    private eventListeners: Partial<AzureVoiceEvents> = {};
    private conversationHistory: ConversationMessage[] = [];
    private isConnected = false;
    private audioContext: AudioContext | null = null;
    private selectedOutputDevice: string | null = null;

    constructor(config: AzureVoiceConfig) {
        this.config = {
            endpoint: `https://${config.region}.api.cognitive.microsoft.com`,
            deploymentName: 'gpt-4o-realtime',
            apiVersion: '2024-10-01-preview',
            ...config
        };
        this.initializeAudioContext();
    }

    private async initializeAudioContext(): Promise<void> {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
        } catch (error) {
            this.emit('error', `Failed to initialize audio context: ${getErrorMessage(error)}`);
        }
    }

    private emit<K extends keyof AzureVoiceEvents>(
        event: K,
        ...args: Parameters<AzureVoiceEvents[K]>
    ): void {
        const handler = this.eventListeners[event];
        if (handler) {
            (handler as any)(...args);
        }
    }

    private async makeAPIRequest(messages: ConversationMessage[]): Promise<string> {
        try {
            const response = await fetch(`${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=${this.config.apiVersion}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.config.apiKey
                },
                body: JSON.stringify({
                    messages: messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    max_tokens: 1000,
                    temperature: 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Azure API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.choices || data.choices.length === 0) {
                throw new Error('No response from Azure OpenAI');
            }

            return data.choices[0].message.content;
        } catch (error) {
            throw new Error(`Azure API error: ${getErrorMessage(error)}`);
        }
    }

    private async textToSpeech(text: string): Promise<ArrayBuffer> {
        try {
            // Use Web Speech API for text-to-speech as fallback
            return new Promise((resolve, reject) => {
                if (!('speechSynthesis' in window)) {
                    reject(new Error('Text-to-speech not supported'));
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US';
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                utterance.onend = () => {
                    // Return empty buffer since we're using browser TTS
                    resolve(new ArrayBuffer(0));
                };

                utterance.onerror = (event) => {
                    reject(new Error(`Text-to-speech error: ${event.error}`));
                };

                window.speechSynthesis.speak(utterance);
            });
        } catch (error) {
            throw new Error(`Text-to-speech failed: ${getErrorMessage(error)}`);
        }
    }

    private async playAudioBuffer(audioBuffer: ArrayBuffer): Promise<void> {
        try {
            if (!this.audioContext || audioBuffer.byteLength === 0) {
                // Audio already played via speechSynthesis
                return;
            }

            const audioData = await this.audioContext.decodeAudioData(audioBuffer);
            const source = this.audioContext.createBufferSource();
            source.buffer = audioData;

            // Connect to output device if supported
            let destination = this.audioContext.destination;

            // Try to use selected output device (if supported by browser)
            if (this.selectedOutputDevice && (this.audioContext as any).setSinkId) {
                try {
                    await (this.audioContext as any).setSinkId(this.selectedOutputDevice);
                } catch (error) {
                    console.warn('Could not set audio output device:', getErrorMessage(error));
                }
            }

            source.connect(destination);

            this.emit('audioPlaybackStarted');

            source.onended = () => {
                this.emit('audioPlaybackCompleted');
            };

            source.start();
        } catch (error) {
            this.emit('error', `Audio playback failed: ${getErrorMessage(error)}`);
        }
    }

    // Public API methods
    public async connect(): Promise<boolean> {
        try {
            // Test connection with a simple request
            const testMessages: ConversationMessage[] = [{
                role: 'user',
                content: 'Hello',
                timestamp: new Date()
            }];

            await this.makeAPIRequest(testMessages);
            this.isConnected = true;
            this.emit('connected');
            return true;
        } catch (error) {
            this.emit('error', `Failed to connect: ${getErrorMessage(error)}`);
            return false;
        }
    }

    public disconnect(): void {
        this.isConnected = false;
        this.conversationHistory = [];
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        this.emit('disconnected');
    }

    public async processVoiceInput(transcript: string): Promise<VoiceResponse> {
        try {
            if (!this.isConnected) {
                throw new Error('Service not connected');
            }

            this.emit('responseStarted');

            // Add user message to conversation history
            const userMessage: ConversationMessage = {
                role: 'user',
                content: transcript,
                timestamp: new Date()
            };
            this.conversationHistory.push(userMessage);

            // Add system message if it's the first interaction
            if (this.conversationHistory.length === 1) {
                const systemMessage: ConversationMessage = {
                    role: 'system',
                    content: 'You are METU, a helpful AI assistant focused on productivity, wellness, and personal growth. Be conversational, supportive, and concise in your responses.',
                    timestamp: new Date()
                };
                this.conversationHistory.unshift(systemMessage);
            }

            // Get AI response
            const responseText = await this.makeAPIRequest(this.conversationHistory);

            // Add assistant response to history
            const assistantMessage: ConversationMessage = {
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            };
            this.conversationHistory.push(assistantMessage);

            // Generate speech audio
            const audioData = await this.textToSpeech(responseText);

            const response: VoiceResponse = {
                text: responseText,
                audioData,
                duration: Math.ceil(responseText.length * 0.1), // Estimate duration
                language: 'en-US'
            };

            // Play audio
            await this.playAudioBuffer(audioData);

            this.emit('responseCompleted', response);
            return response;
        } catch (error) {
            const errorMessage = `Voice processing failed: ${getErrorMessage(error)}`;
            this.emit('error', errorMessage);
            throw new Error(errorMessage);
        }
    }

    public async speak(text: string): Promise<void> {
        try {
            const audioData = await this.textToSpeech(text);
            await this.playAudioBuffer(audioData);
        } catch (error) {
            this.emit('error', `Speaking failed: ${getErrorMessage(error)}`);
            throw error;
        }
    }

    public stopSpeaking(): void {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        this.emit('audioPlaybackCompleted');
    }

    public setOutputDevice(deviceId: string): void {
        this.selectedOutputDevice = deviceId;
    }

    public getConversationHistory(): ConversationMessage[] {
        return [...this.conversationHistory];
    }

    public clearConversationHistory(): void {
        this.conversationHistory = [];
    }

    public setSystemMessage(message: string): void {
        // Remove existing system message if any
        this.conversationHistory = this.conversationHistory.filter(msg => msg.role !== 'system');

        // Add new system message at the beginning
        const systemMessage: ConversationMessage = {
            role: 'system',
            content: message,
            timestamp: new Date()
        };
        this.conversationHistory.unshift(systemMessage);
    }

    public isConnectedToService(): boolean {
        return this.isConnected;
    }

    public updateConfig(newConfig: Partial<AzureVoiceConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.isConnected = false; // Force reconnection with new config
    }

    public getCapabilities(): {
        supportsRealTimeVoice: boolean;
        supportsTextToSpeech: boolean;
        supportsSpeechToText: boolean;
        supportsConversationHistory: boolean;
        supportsOutputDeviceSelection: boolean;
    } {
        return {
            supportsRealTimeVoice: true,
            supportsTextToSpeech: 'speechSynthesis' in window,
            supportsSpeechToText: true,
            supportsConversationHistory: true,
            supportsOutputDeviceSelection: 'setSinkId' in AudioContext.prototype
        };
    }

    public on<K extends keyof AzureVoiceEvents>(
        event: K,
        handler: AzureVoiceEvents[K]
    ): void {
        this.eventListeners[event] = handler;
    }

    public off<K extends keyof AzureVoiceEvents>(event: K): void {
        delete this.eventListeners[event];
    }

    public cleanup(): void {
        this.disconnect();
        this.eventListeners = {};
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Factory function to create Azure Voice Service with environment variables
export function createAzureVoiceService(): AzureVoiceService | null {
    try {
        const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;
        const region = process.env.AZURE_OPENAI_REGION || process.env.NEXT_PUBLIC_AZURE_OPENAI_REGION || 'eastus';

        if (!apiKey) {
            console.warn('Azure OpenAI API key not found in environment variables');
            return null;
        }

        return new AzureVoiceService({
            apiKey,
            region
        });
    } catch (error) {
        console.error('Failed to create Azure Voice Service:', getErrorMessage(error));
        return null;
    }
}
