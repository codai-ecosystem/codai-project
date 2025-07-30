/// <reference path="../../types/web-speech-api.d.ts" />

import { getErrorMessage } from '../../utils/errorHandling';

export type SpeechRecognitionLanguage =
    | 'en-US' | 'en-GB' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ja-JP' | 'zh-CN' | 'ro-RO';

export interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
    alternatives?: {
        transcript: string;
        confidence: number;
    }[];
}

export interface SpeechRecognitionEvents {
    start: () => void;
    end: () => void;
    result: (result: SpeechRecognitionResult) => void;
    error: (error: string) => void;
    noSpeech: () => void;
    audioStart: () => void;
    audioEnd: () => void;
    soundStart: () => void;
    soundEnd: () => void;
}

export class SpeechRecognitionService {
    private recognition: SpeechRecognition | null = null;
    private isListening = false;
    private eventListeners: Partial<SpeechRecognitionEvents> = {};
    private language: SpeechRecognitionLanguage = 'en-US';
    private continuous = false;
    private interimResults = true;
    private maxAlternatives = 3;

    constructor() {
        this.initializeRecognition();
    }

    private initializeRecognition(): void {
        if (!this.isSupported()) {
            return;
        }

        try {
            // Create speech recognition instance
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            // Configure recognition if recognition is available
            if (this.recognition) {
                this.recognition.continuous = this.continuous;
                this.recognition.interimResults = this.interimResults;
                this.recognition.maxAlternatives = this.maxAlternatives;
                this.recognition.lang = this.language;

                // Set up event handlers
                this.recognition.onstart = () => {
                    this.isListening = true;
                    this.emit('start');
                };

                this.recognition.onend = () => {
                    this.isListening = false;
                    this.emit('end');
                };

                this.recognition.onresult = (event: SpeechRecognitionEvent) => {
                    try {
                        const lastResult = event.results[event.results.length - 1];

                        const result: SpeechRecognitionResult = {
                            transcript: lastResult[0].transcript,
                            confidence: lastResult[0].confidence,
                            isFinal: lastResult.isFinal,
                            alternatives: []
                        };

                        // Add alternatives if available
                        for (let i = 1; i < lastResult.length && i < this.maxAlternatives; i++) {
                            result.alternatives!.push({
                                transcript: lastResult[i].transcript,
                                confidence: lastResult[i].confidence
                            });
                        }

                        this.emit('result', result);
                    } catch (error) {
                        this.emit('error', `Error processing speech result: ${getErrorMessage(error)}`);
                    }
                };

                this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                    const errorMessage = this.getErrorMessage(event.error);
                    this.emit('error', errorMessage);
                };

                this.recognition.onnomatch = () => {
                    this.emit('noSpeech');
                };

                this.recognition.onaudiostart = () => {
                    this.emit('audioStart');
                };

                this.recognition.onaudioend = () => {
                    this.emit('audioEnd');
                };

                this.recognition.onsoundstart = () => {
                    this.emit('soundStart');
                };

                this.recognition.onsoundend = () => {
                    this.emit('soundEnd');
                };
            }

        } catch (error) {
            this.emit('error', `Failed to initialize speech recognition: ${getErrorMessage(error)}`);
        }
    }

    private getErrorMessage(errorCode: string): string {
        switch (errorCode) {
            case 'no-speech':
                return 'No speech was detected. Please try again.';
            case 'aborted':
                return 'Speech recognition was aborted.';
            case 'audio-capture':
                return 'Audio capture failed. Please check your microphone.';
            case 'network':
                return 'Network error occurred during speech recognition.';
            case 'not-allowed':
                return 'Microphone access not allowed. Please grant permission.';
            case 'service-not-allowed':
                return 'Speech recognition service not allowed.';
            case 'bad-grammar':
                return 'Speech recognition grammar error.';
            case 'language-not-supported':
                return 'Language not supported for speech recognition.';
            default:
                return `Speech recognition error: ${errorCode}`;
        }
    }

    private emit<K extends keyof SpeechRecognitionEvents>(
        event: K,
        ...args: Parameters<SpeechRecognitionEvents[K]>
    ): void {
        const handler = this.eventListeners[event];
        if (handler) {
            (handler as any)(...args);
        }
    }

    // Public API methods
    public async startListening(): Promise<boolean> {
        try {
            if (!this.recognition) {
                throw new Error('Speech recognition not available');
            }

            if (this.isListening) {
                return true;
            }

            this.recognition.start();
            return true;
        } catch (error) {
            this.emit('error', `Failed to start listening: ${getErrorMessage(error)}`);
            return false;
        }
    }

    public stopListening(): void {
        try {
            if (this.recognition && this.isListening) {
                this.recognition.stop();
            }
        } catch (error) {
            this.emit('error', `Failed to stop listening: ${getErrorMessage(error)}`);
        }
    }

    public abortListening(): void {
        try {
            if (this.recognition && this.isListening) {
                this.recognition.abort();
            }
        } catch (error) {
            this.emit('error', `Failed to abort listening: ${getErrorMessage(error)}`);
        }
    }

    public setLanguage(language: SpeechRecognitionLanguage): void {
        this.language = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
    }

    public getLanguage(): SpeechRecognitionLanguage {
        return this.language;
    }

    public setContinuous(continuous: boolean): void {
        this.continuous = continuous;
        if (this.recognition) {
            this.recognition.continuous = continuous;
        }
    }

    public isContinuous(): boolean {
        return this.continuous;
    }

    public setInterimResults(interimResults: boolean): void {
        this.interimResults = interimResults;
        if (this.recognition) {
            this.recognition.interimResults = interimResults;
        }
    }

    public hasInterimResults(): boolean {
        return this.interimResults;
    }

    public setMaxAlternatives(maxAlternatives: number): void {
        this.maxAlternatives = Math.max(1, Math.min(maxAlternatives, 10));
        if (this.recognition) {
            this.recognition.maxAlternatives = this.maxAlternatives;
        }
    }

    public getMaxAlternatives(): number {
        return this.maxAlternatives;
    }

    public isCurrentlyListening(): boolean {
        return this.isListening;
    }

    public getSupportedLanguages(): SpeechRecognitionLanguage[] {
        return ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN', 'ro-RO'];
    }

    public on<K extends keyof SpeechRecognitionEvents>(
        event: K,
        handler: SpeechRecognitionEvents[K]
    ): void {
        this.eventListeners[event] = handler;
    }

    public off<K extends keyof SpeechRecognitionEvents>(event: K): void {
        delete this.eventListeners[event];
    }

    public cleanup(): void {
        this.stopListening();
        this.eventListeners = {};
    }

    public isSupported(): boolean {
        return typeof window !== 'undefined' &&
            ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    }

    public getCapabilities(): {
        isSupported: boolean;
        supportedLanguages: SpeechRecognitionLanguage[];
        supportsContinuous: boolean;
        supportsInterimResults: boolean;
        supportsMaxAlternatives: boolean;
    } {
        return {
            isSupported: this.isSupported(),
            supportedLanguages: this.getSupportedLanguages(),
            supportsContinuous: true,
            supportsInterimResults: true,
            supportsMaxAlternatives: true
        };
    }
}

// Singleton instance
export const speechRecognitionService = new SpeechRecognitionService();
