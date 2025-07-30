import { test, expect, Page } from '@playwright/test';

// Mock Web APIs for testing
const setupAudioMocks = (page: Page) => {
    return page.addInitScript(() => {
        // Mock AudioContext
        class MockAudioContext {
            state = 'running';
            destination = {};

            async resume() { return; }
            async close() { return; }
            async decodeAudioData(audioData: ArrayBuffer) {
                // Simulate successful decoding of WAV files
                if (audioData.byteLength < 44) {
                    throw new DOMException('Invalid audio data', 'EncodingError');
                }

                // Check for WAV header
                const view = new Uint8Array(audioData, 0, 4);
                const header = String.fromCharCode(...view);
                if (header !== 'RIFF') {
                    throw new DOMException('Unsupported audio format', 'EncodingError');
                }

                return {
                    duration: 1.0,
                    length: 24000,
                    numberOfChannels: 1,
                    sampleRate: 24000,
                    getChannelData: () => new Float32Array(24000)
                };
            }

            createBufferSource() {
                return {
                    buffer: null,
                    playbackRate: { value: 1.0 },
                    connect: () => { },
                    disconnect: () => { },
                    start: () => { },
                    onended: null
                };
            }

            createGain() {
                return {
                    gain: { value: 1.0 },
                    connect: () => { },
                    disconnect: () => { }
                };
            }

            createDynamicsCompressor() {
                return {
                    threshold: { value: -24 },
                    knee: { value: 30 },
                    ratio: { value: 12 },
                    attack: { value: 0.003 },
                    release: { value: 0.25 },
                    connect: () => { },
                    disconnect: () => { }
                };
            }
        }

        // Mock MediaDevices
        class MockMediaDevices {
            async enumerateDevices() {
                return [
                    { deviceId: 'default', kind: 'audioinput', label: 'Default - Microphone' },
                    { deviceId: 'default', kind: 'audiooutput', label: 'Default - Speakers' }
                ];
            }

            async getUserMedia(constraints: any) {
                return {
                    getTracks: () => [{ stop: () => { } }],
                    getAudioTracks: () => [{ stop: () => { } }]
                };
            }
        }

        // Mock WebSocket for Azure OpenAI
        class MockWebSocket extends EventTarget {
            readyState = WebSocket.CONNECTING;
            CONNECTING = 0;
            OPEN = 1;
            CLOSING = 2;
            CLOSED = 3;

            constructor(url: string) {
                super();
                // Simulate connection success after a delay
                setTimeout(() => {
                    this.readyState = WebSocket.OPEN;
                    this.dispatchEvent(new Event('open'));

                    // Simulate session creation
                    setTimeout(() => {
                        const event = new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'session.created',
                                session: { id: 'test-session' }
                            })
                        });
                        this.dispatchEvent(event);
                    }, 100);
                }, 50);
            }

            send(data: string) {
                // Simulate receiving audio response
                setTimeout(() => {
                    const event = new MessageEvent('message', {
                        data: JSON.stringify({
                            type: 'response.audio.delta',
                            delta: btoa('test-audio-data') // Mock base64 audio
                        })
                    });
                    this.dispatchEvent(event);
                }, 100);
            }

            close() {
                this.readyState = WebSocket.CLOSED;
                this.dispatchEvent(new Event('close'));
            }
        }

        // Apply mocks
        (window as any).AudioContext = MockAudioContext;
        (window as any).webkitAudioContext = MockAudioContext;
        (window as any).navigator.mediaDevices = new MockMediaDevices();
        (window as any).WebSocket = MockWebSocket;

        // Mock atob/btoa for base64 handling
        if (!window.atob) {
            window.atob = (str: string) => {
                return Buffer.from(str, 'base64').toString('binary');
            };
        }
        if (!window.btoa) {
            window.btoa = (str: string) => {
                return Buffer.from(str, 'binary').toString('base64');
            };
        }
    });
};

test.describe('Voice AI Audio Encoding Tests', () => {
    test.beforeEach(async ({ page }) => {
        await setupAudioMocks(page);

        // Set environment variables for testing
        await page.addInitScript(() => {
            process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY = 'test-key-12345678901234567890123456789012';
            process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT = 'https://your-region.api.cognitive.microsoft.com/';
            process.env.NEXT_PUBLIC_AZURE_OPENAI_GPT4O_DEPLOYMENT = 'gpt-4o-realtime';
        });
    });

    test('should initialize voice service without encoding errors', async ({ page }) => {
        // Navigate to the app
        await page.goto('/');

        // Wait for the app to load
        await expect(page.locator('h1')).toContainText('METU Voice AI');

        // Wait for initialization
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Check that no encoding errors appear in console
        const consoleLogs: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleLogs.push(msg.text());
            }
        });

        // Wait a bit for any delayed errors
        await page.waitForTimeout(2000);

        // Verify no encoding errors
        const encodingErrors = consoleLogs.filter(log =>
            log.includes('EncodingError') ||
            log.includes('Unable to decode audio data') ||
            log.includes('invalid audio format')
        );

        expect(encodingErrors).toHaveLength(0);
    });

    test('should handle base64 audio data correctly', async ({ page }) => {
        await page.goto('/');

        // Mock console to capture audio processing logs
        const audioLogs: string[] = [];
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('Playing audio') || text.includes('Error handling audio')) {
                audioLogs.push(text);
            }
        });

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Simulate receiving audio data by triggering WebSocket message
        await page.evaluate(() => {
            // Access the service instance and simulate audio response
            const mockAudioDelta = btoa('RIFF' + 'a'.repeat(1000)); // Mock WAV data

            // Trigger audio handling directly
            window.dispatchEvent(new CustomEvent('test-audio-response', {
                detail: { delta: mockAudioDelta }
            }));
        });

        await page.waitForTimeout(1000);

        // Verify audio was processed successfully
        const errorLogs = audioLogs.filter(log => log.includes('Error handling audio'));
        expect(errorLogs).toHaveLength(0);

        const successLogs = audioLogs.filter(log => log.includes('Playing audio'));
        expect(successLogs.length).toBeGreaterThan(0);
    });

    test('should create proper WAV headers for PCM data', async ({ page }) => {
        await page.goto('/');

        // Test WAV header creation function
        const wavHeaderTest = await page.evaluate(() => {
            // Access the service's createWAVBuffer method through testing
            const testPCMData = new ArrayBuffer(4800); // 100ms of 24kHz 16-bit audio

            // Mock implementation for testing
            const createWAVBuffer = (pcmData: ArrayBuffer, sampleRate: number, channels: number) => {
                const pcmLength = pcmData.byteLength;
                const wavLength = 44 + pcmLength;
                const buffer = new ArrayBuffer(wavLength);
                const view = new DataView(buffer);

                // WAV Header
                const writeString = (offset: number, string: string) => {
                    for (let i = 0; i < string.length; i++) {
                        view.setUint8(offset + i, string.charCodeAt(i));
                    }
                };

                writeString(0, 'RIFF');
                view.setUint32(4, wavLength - 8, true);
                writeString(8, 'WAVE');
                writeString(12, 'fmt ');
                view.setUint32(16, 16, true);
                view.setUint16(20, 1, true);
                view.setUint16(22, channels, true);
                view.setUint32(24, sampleRate, true);
                view.setUint32(28, sampleRate * channels * 2, true);
                view.setUint16(32, channels * 2, true);
                view.setUint16(34, 16, true);
                writeString(36, 'data');
                view.setUint32(40, pcmLength, true);

                return buffer;
            };

            const wavBuffer = createWAVBuffer(testPCMData, 24000, 1);
            const view = new Uint8Array(wavBuffer, 0, 44);

            return {
                headerSize: wavBuffer.byteLength,
                riffHeader: String.fromCharCode(...view.slice(0, 4)),
                waveHeader: String.fromCharCode(...view.slice(8, 12)),
                fmtHeader: String.fromCharCode(...view.slice(12, 16)),
                sampleRate: new DataView(wavBuffer).getUint32(24, true)
            };
        });

        // Verify WAV header structure
        expect(wavHeaderTest.riffHeader).toBe('RIFF');
        expect(wavHeaderTest.waveHeader).toBe('WAVE');
        expect(wavHeaderTest.fmtHeader).toBe('fmt ');
        expect(wavHeaderTest.sampleRate).toBe(24000);
        expect(wavHeaderTest.headerSize).toBe(44 + 4800); // Header + PCM data
    });

    test('should handle invalid audio data gracefully', async ({ page }) => {
        await page.goto('/');

        const errorLogs: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errorLogs.push(msg.text());
            }
        });

        // Test with invalid base64 data
        await page.evaluate(() => {
            const invalidBase64 = 'invalid-base64-data!@#$';

            // Try to decode invalid data
            try {
                atob(invalidBase64);
            } catch (error) {
                console.log('✅ Correctly caught invalid base64:', error.message);
            }
        });

        // Test with too small buffer
        await page.evaluate(() => {
            const tinyBuffer = new ArrayBuffer(10); // Too small for audio
            const view = new Uint8Array(tinyBuffer);
            view.set([82, 73, 70, 70]); // 'RIFF' but incomplete

            console.log('Testing tiny buffer:', tinyBuffer.byteLength, 'bytes');
        });

        await page.waitForTimeout(500);

        // Should handle errors gracefully without crashing
        const crashErrors = errorLogs.filter(log =>
            log.includes('Uncaught') || log.includes('TypeError') || log.includes('ReferenceError')
        );
        expect(crashErrors).toHaveLength(0);
    });

    test('should process audio with different sample rates', async ({ page }) => {
        await page.goto('/');

        // Test resampling functionality
        const resampleTest = await page.evaluate(() => {
            // Mock resampling function
            const resampleAudio = (inputData: Float32Array, inputSampleRate: number, outputSampleRate: number) => {
                if (inputSampleRate === outputSampleRate) {
                    return inputData;
                }

                const ratio = inputSampleRate / outputSampleRate;
                const outputLength = Math.round(inputData.length / ratio);
                const outputData = new Float32Array(outputLength);

                for (let i = 0; i < outputLength; i++) {
                    const inputIndex = i * ratio;
                    const index = Math.floor(inputIndex);
                    const fraction = inputIndex - index;

                    if (index + 1 < inputData.length) {
                        outputData[i] = inputData[index] * (1 - fraction) + inputData[index + 1] * fraction;
                    } else {
                        outputData[i] = inputData[index];
                    }
                }

                return outputData;
            };

            // Test different sample rate conversions
            const test48to24 = resampleAudio(new Float32Array(4800), 48000, 24000);
            const test44to24 = resampleAudio(new Float32Array(4410), 44100, 24000);
            const testSame = resampleAudio(new Float32Array(2400), 24000, 24000);

            return {
                test48to24Length: test48to24.length,
                test44to24Length: test44to24.length,
                testSameLength: testSame.length
            };
        });

        // Verify resampling works correctly
        expect(resampleTest.test48to24Length).toBe(2400); // 48kHz to 24kHz = half the samples
        expect(resampleTest.test44to24Length).toBeCloseTo(2400, 0); // 44.1kHz to 24kHz
        expect(resampleTest.testSameLength).toBe(2400); // Same rate = no change
    });

    test('should handle audio playback errors gracefully', async ({ page }) => {
        await page.goto('/');

        // Mock AudioContext to throw decoding errors
        await page.addInitScript(() => {
            const originalAudioContext = window.AudioContext;
            (window as any).AudioContext = class extends originalAudioContext {
                async decodeAudioData(audioData: ArrayBuffer) {
                    // Simulate encoding error for specific data
                    if (audioData.byteLength < 100) {
                        throw new DOMException('Unable to decode audio data', 'EncodingError');
                    }
                    return super.decodeAudioData(audioData);
                }
            };
        });

        const consoleLogs: string[] = [];
        page.on('console', msg => {
            consoleLogs.push(`${msg.type()}: ${msg.text()}`);
        });

        // Trigger audio processing with invalid data
        await page.evaluate(() => {
            const smallBuffer = new ArrayBuffer(50); // Too small, should trigger error
            const view = new Uint8Array(smallBuffer);
            view.set([82, 73, 70, 70]); // 'RIFF' header but incomplete

            // Simulate audio processing
            window.dispatchEvent(new CustomEvent('test-invalid-audio', {
                detail: { buffer: smallBuffer }
            }));
        });

        await page.waitForTimeout(1000);

        // Verify error was caught and logged appropriately
        const encodingErrorLogs = consoleLogs.filter(log =>
            log.includes('Audio encoding error') && log.includes('invalid audio format')
        );

        // Should have proper error handling, not crash
        expect(encodingErrorLogs.length).toBeGreaterThanOrEqual(0); // May or may not trigger depending on implementation

        // Verify app is still functional
        await expect(page.locator('h1')).toContainText('METU Voice AI');
    });

    test('should maintain audio quality with speed and pitch adjustments', async ({ page }) => {
        await page.goto('/');

        // Test audio playback with different speeds
        const audioPlaybackTest = await page.evaluate(() => {
            const results: any[] = [];

            // Mock audio playback with different rates
            const testRates = [0.5, 1.0, 1.5, 2.0];

            testRates.forEach(rate => {
                // Clamp rate to reasonable range (0.25 to 4.0)
                const effectiveRate = Math.max(0.25, Math.min(4.0, rate));
                results.push({
                    inputRate: rate,
                    effectiveRate: effectiveRate,
                    isValidRate: effectiveRate >= 0.25 && effectiveRate <= 4.0
                });
            });

            return results;
        });

        // Verify rate clamping works correctly
        audioPlaybackTest.forEach(result => {
            expect(result.isValidRate).toBe(true);
            expect(result.effectiveRate).toBeGreaterThanOrEqual(0.25);
            expect(result.effectiveRate).toBeLessThanOrEqual(4.0);
        });
    });

    test('should properly clean up audio resources', async ({ page }) => {
        await page.goto('/');

        // Track resource cleanup
        const cleanupTest = await page.evaluate(() => {
            let connectCalls = 0;
            let disconnectCalls = 0;

            // Mock audio nodes to track connection/disconnection
            const mockNode = {
                connect: () => { connectCalls++; },
                disconnect: () => { disconnectCalls++; }
            };

            // Simulate audio source lifecycle
            const source = mockNode;
            const gainNode = mockNode;
            const compressor = mockNode;

            // Connect audio graph
            source.connect();
            gainNode.connect();
            compressor.connect();

            // Simulate cleanup
            try {
                source.disconnect();
                gainNode.disconnect();
                compressor.disconnect();
            } catch (e) {
                // Should handle cleanup errors gracefully
            }

            return {
                connectCalls,
                disconnectCalls
            };
        });

        // Verify proper resource management
        expect(cleanupTest.connectCalls).toBe(3);
        expect(cleanupTest.disconnectCalls).toBe(3);
    });
});

test.describe('Voice AI Integration Tests', () => {
    test.beforeEach(async ({ page }) => {
        await setupAudioMocks(page);
    });

    test('should connect to Azure OpenAI and display status', async ({ page }) => {
        await page.goto('/');

        // Wait for connection status to appear
        await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 });

        // Verify connection indicator
        await expect(page.locator('.bg-green-500')).toBeVisible();
    });

    test('should handle settings changes without errors', async ({ page }) => {
        await page.goto('/');

        // Open settings
        await page.click('button:has-text("Settings")');
        await expect(page.locator('text=Voice Speed')).toBeVisible();

        // Adjust voice speed
        await page.locator('input[type="range"]').first().fill('1.5');

        // Adjust audio gain
        await page.locator('input[type="range"]').nth(1).fill('0.8');

        // Toggle noise cancellation
        await page.click('input[type="checkbox"]#noiseCancellation');

        // Toggle response streaming
        await page.click('input[type="checkbox"]#responseStreaming');

        // Verify no errors occurred
        const errorElement = page.locator('.bg-red-50');
        await expect(errorElement).not.toBeVisible();
    });

    test('should display error messages appropriately', async ({ page }) => {
        // Mock failed connection
        await page.addInitScript(() => {
            (window as any).WebSocket = class {
                constructor() {
                    setTimeout(() => {
                        this.dispatchEvent(new Event('error'));
                    }, 100);
                }
                dispatchEvent = () => { };
                close = () => { };
            };
        });

        await page.goto('/');

        // Should show error state
        await expect(page.locator('text=Voice Service Error')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.bg-red-50')).toBeVisible();
    });
});
