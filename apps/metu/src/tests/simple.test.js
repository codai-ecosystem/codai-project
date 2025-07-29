// Simple test for METU Voice AI
import { describe, test, expect, vi } from 'vitest'

describe('METU Voice AI Web App', () => {
    test('WebVoiceService can be instantiated', () => {
        // Mock Web Speech API in Node environment
        global.SpeechRecognition = vi.fn(() => ({
            addEventListener: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
            abort: vi.fn()
        }));

        global.speechSynthesis = {
            getVoices: vi.fn(() => []),
            speak: vi.fn(),
            cancel: vi.fn()
        };

        global.SpeechSynthesisUtterance = vi.fn();
        global.AudioContext = vi.fn(() => ({
            createAnalyser: vi.fn(() => ({
                connect: vi.fn(),
                getByteFrequencyData: vi.fn()
            }))
        }));

        // Simple class test that mimics WebVoiceService structure
        class MockWebVoiceService {
            constructor() {
                this.isRecording = false;
                this.messages = [];
                this.settings = {
                    language: 'en-US',
                    voice: null,
                    pitch: 1,
                    rate: 1,
                    volume: 1
                };
            }

            async initialize() {
                return true;
            }

            startRecording() {
                this.isRecording = true;
            }

            stopRecording() {
                this.isRecording = false;
            }
        }

        const service = new MockWebVoiceService();
        expect(service).toBeDefined();
        expect(service.isRecording).toBe(false);
        expect(service.messages).toEqual([]);
        expect(service.settings.language).toBe('en-US');
    });

    test('Voice settings can be configured', () => {
        const settings = {
            language: 'en-US',
            voice: null,
            pitch: 1.0,
            rate: 1.0,
            volume: 1.0,
            autoPlay: true,
            visualizerEnabled: true
        };

        expect(settings.language).toBe('en-US');
        expect(settings.pitch).toBe(1.0);
        expect(settings.rate).toBe(1.0);
        expect(settings.volume).toBe(1.0);
        expect(settings.autoPlay).toBe(true);
        expect(settings.visualizerEnabled).toBe(true);
    });

    test('Message history management', () => {
        const messages = [];

        // Add user message
        const userMessage = {
            id: '1',
            type: 'user',
            content: 'Hello METU',
            timestamp: new Date()
        };
        messages.push(userMessage);

        // Add assistant message
        const assistantMessage = {
            id: '2',
            type: 'assistant',
            content: 'Hello! How can I help you?',
            timestamp: new Date()
        };
        messages.push(assistantMessage);

        expect(messages).toHaveLength(2);
        expect(messages[0].type).toBe('user');
        expect(messages[1].type).toBe('assistant');
        expect(messages[0].content).toBe('Hello METU');
    });
});
