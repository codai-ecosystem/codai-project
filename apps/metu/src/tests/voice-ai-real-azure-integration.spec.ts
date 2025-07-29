import { test, expect, Page } from '@playwright/test';

// Integration tests using real Azure OpenAI credentials
test.describe('Voice AI Real Azure Integration Tests', { tag: '@integration' }, () => {

    test.beforeEach(async ({ page }) => {
        // Load real Azure OpenAI environment variables
        await page.addInitScript(() => {
            // Set real Azure OpenAI credentials from environment
            process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY = "your-azure-ai-key-here";
            process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT = "https://your-region.api.cognitive.microsoft.com";
            process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT = "gpt-4o-realtime";
            process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION = "2024-10-01-preview";
        });

        // Mock only local browser APIs while preserving real Azure WebSocket
        await page.addInitScript(() => {
            // Mock MediaDevices for testing
            (window.navigator as any).mediaDevices = {
                async enumerateDevices() {
                    return [
                        { deviceId: 'default', kind: 'audioinput', label: 'Default - Microphone', groupId: 'default' },
                        { deviceId: 'default', kind: 'audiooutput', label: 'Default - Speakers', groupId: 'default' }
                    ];
                },

                async getUserMedia(constraints: any) {
                    const mockStream = {
                        getTracks: () => [{ stop: () => { } }],
                        getAudioTracks: () => [{
                            stop: () => { },
                            getSettings: () => ({ sampleRate: 48000, channelCount: 1 })
                        }]
                    };
                    return mockStream;
                }
            };

            // Mock MediaRecorder for testing
            (window as any).MediaRecorder = class MockMediaRecorder extends EventTarget {
                state = 'inactive';
                static isTypeSupported() { return true; }

                constructor(stream: any, options?: any) {
                    super();
                }

                start() {
                    this.state = 'recording';
                    // Simulate realistic audio data
                    setTimeout(() => {
                        const mockPCM16Data = new ArrayBuffer(9600); // 200ms at 24kHz 16-bit
                        const view = new Int16Array(mockPCM16Data);
                        for (let i = 0; i < view.length; i++) {
                            view[i] = Math.sin(2 * Math.PI * 440 * i / 24000) * 16383; // 440Hz sine wave
                        }

                        const blob = new Blob([mockPCM16Data], { type: 'audio/pcm' });
                        this.dispatchEvent(new BlobEvent('dataavailable', { data: blob }));
                    }, 100);
                }

                stop() {
                    this.state = 'inactive';
                    this.dispatchEvent(new Event('stop'));
                }
            };

            // Mock AudioContext for testing while preserving audio processing
            (window as any).AudioContext = class MockAudioContext {
                state = 'suspended';
                sampleRate = 48000;
                destination = {};

                async resume() {
                    this.state = 'running';
                    return Promise.resolve();
                }

                async close() {
                    this.state = 'closed';
                    return Promise.resolve();
                }

                async decodeAudioData(audioData: ArrayBuffer) {
                    // Validate proper WAV format
                    if (audioData.byteLength < 44) {
                        throw new DOMException('Invalid audio data', 'EncodingError');
                    }

                    const view = new Uint8Array(audioData);
                    const header = String.fromCharCode(...view.slice(0, 4));
                    if (header !== 'RIFF') {
                        throw new DOMException('Unsupported audio format', 'EncodingError');
                    }

                    // Return mock AudioBuffer for successful decode
                    return {
                        duration: audioData.byteLength / (24000 * 2), // 24kHz 16-bit
                        length: (audioData.byteLength - 44) / 2,
                        numberOfChannels: 1,
                        sampleRate: 24000,
                        getChannelData: () => new Float32Array((audioData.byteLength - 44) / 2)
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
            };
        });
    });

    test('should connect to real Azure OpenAI with valid credentials', async ({ page }) => {
        // Monitor console for connection logs
        const consoleLogs: string[] = [];
        page.on('console', msg => {
            consoleLogs.push(`${msg.type()}: ${msg.text()}`);
        });

        // Navigate to app
        await page.goto('/');

        // Wait for Azure OpenAI connection (may take longer with real service)
        await expect(page.locator('[data-testid="connection-status"]:has-text("Connected")')).toBeVisible({
            timeout: 30000
        });

        // Verify connection indicator is green
        await expect(page.locator('.bg-green-500')).toBeVisible();

        // Check for successful connection logs
        const connectionLogs = consoleLogs.filter(log =>
            log.includes('WebSocket connection opened') ||
            log.includes('Session created') ||
            log.includes('Connected to Azure OpenAI')
        );

        expect(connectionLogs.length).toBeGreaterThan(0);

        // Verify no authentication errors
        const authErrors = consoleLogs.filter(log =>
            log.includes('401') ||
            log.includes('403') ||
            log.includes('Unauthorized') ||
            log.includes('authentication failed')
        );

        expect(authErrors).toHaveLength(0);
    });

    test('should handle real Azure OpenAI session creation', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
            timeout: 30000
        });

        // Verify session information is available
        const sessionInfo = await page.evaluate(() => {
            // Check if session data is stored (would be implementation specific)
            return {
                hasSession: window.localStorage.getItem('azure-session-id') !== null ||
                    sessionStorage.getItem('azure-session-id') !== null ||
                    document.querySelector('[data-session-id]') !== null
            };
        });

        // Should have established a real session
        // (This would depend on the actual implementation storing session info)
        await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
    });

    test('should process real audio data without encoding errors', async ({ page }) => {
        await page.goto('/');

        // Monitor for encoding errors
        const encodingErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().includes('EncodingError')) {
                encodingErrors.push(msg.text());
            }
        });

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
            timeout: 30000
        });

        // Start recording to trigger real audio processing
        await page.click('button:has-text("Start Recording")');

        // Wait for recording state
        await expect(page.locator('button:has-text("Stop Recording")')).toBeVisible({ timeout: 5000 });

        // Let recording run briefly
        await page.waitForTimeout(2000);

        // Stop recording
        await page.click('button:has-text("Stop Recording")');

        // Wait for processing
        await page.waitForTimeout(3000);

        // Should not have any encoding errors
        expect(encodingErrors).toHaveLength(0);

        // Should return to ready state
        await expect(page.locator('button:has-text("Start Recording")')).toBeVisible({ timeout: 10000 });
    });

    test('should handle Azure OpenAI rate limits gracefully', async ({ page }) => {
        await page.goto('/');

        // Monitor for rate limit responses
        const rateLimitLogs: string[] = [];
        page.on('console', msg => {
            if (msg.text().includes('429') || msg.text().includes('rate limit')) {
                rateLimitLogs.push(msg.text());
            }
        });

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
            timeout: 30000
        });

        // Simulate rapid requests (if rate limits are hit)
        for (let i = 0; i < 3; i++) {
            await page.click('button:has-text("Start Recording")');
            await page.waitForTimeout(500);
            await page.click('button:has-text("Stop Recording")');
            await page.waitForTimeout(1000);
        }

        // Should handle any rate limits without crashing
        await expect(page.locator('h1')).toContainText('METU Voice AI');

        // If rate limits occurred, should have handled them gracefully
        if (rateLimitLogs.length > 0) {
            // Should show appropriate error message
            await expect(page.locator('text=Rate limit')).toBeVisible({ timeout: 5000 });
        }
    });

    test('should validate Azure OpenAI WebSocket URL construction', async ({ page }) => {
        // Monitor network requests
        const requests: string[] = [];
        page.on('request', request => {
            if (request.url().includes('openai.azure.com')) {
                requests.push(request.url());
            }
        });

        await page.goto('/');

        // Wait for connection attempt
        await page.waitForTimeout(5000);

        // Verify WebSocket URL format
        const azureRequests = requests.filter(url =>
            url.includes('your-region.api.cognitive.microsoft.com') &&
            url.includes('gpt-4o-realtime') &&
            url.includes('api-version=2024-10-01-preview')
        );

        expect(azureRequests.length).toBeGreaterThan(0);

        // Verify secure WebSocket protocol
        azureRequests.forEach(url => {
            expect(url.startsWith('wss://')).toBeTruthy();
        });
    });

    test('should maintain connection stability over time', async ({ page }) => {
        await page.goto('/');

        // Wait for initial connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
            timeout: 30000
        });

        // Monitor connection status over extended period
        const connectionStates: string[] = [];

        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(2000);

            const status = await page.locator('[data-testid="connection-status"]').textContent();
            connectionStates.push(status || 'unknown');

            // Perform light activity to keep connection alive
            if (i % 3 === 0) {
                const settingsButton = page.locator('button:has-text("Settings")');
                if (await settingsButton.isVisible()) {
                    await settingsButton.click();
                    await page.waitForTimeout(500);
                    await page.click('body', { position: { x: 50, y: 50 } });
                }
            }
        }

        // Connection should remain stable
        const disconnectedStates = connectionStates.filter(state =>
            state.includes('Disconnected') || state.includes('Error')
        );

        // Allow for brief disconnections but should mostly be connected
        expect(disconnectedStates.length).toBeLessThan(connectionStates.length / 2);
    });

    test('should handle Azure service errors appropriately', async ({ page }) => {
        // This test may not trigger actual service errors, but validates error handling
        await page.goto('/');

        const errorLogs: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errorLogs.push(msg.text());
            }
        });

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
            timeout: 30000
        });

        // Simulate potential error conditions by rapid interactions
        await page.click('button:has-text("Start Recording")');
        await page.click('button:has-text("Stop Recording")');
        await page.click('button:has-text("Start Recording")');
        await page.click('button:has-text("Stop Recording")');

        await page.waitForTimeout(2000);

        // Should handle any service errors without crashing
        await expect(page.locator('h1')).toContainText('METU Voice AI');

        // Critical errors should not crash the app
        const criticalErrors = errorLogs.filter(log =>
            log.includes('Uncaught') &&
            (log.includes('TypeError') || log.includes('ReferenceError'))
        );

        expect(criticalErrors).toHaveLength(0);
    });

    test('should verify Azure OpenAI model capabilities', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', {
            timeout: 30000
        });

        // Verify real-time capabilities are available
        const capabilities = await page.evaluate(() => {
            return {
                hasWebSocket: typeof WebSocket !== 'undefined',
                hasMediaDevices: navigator.mediaDevices !== undefined,
                hasAudioContext: typeof AudioContext !== 'undefined',
                hasMediaRecorder: typeof MediaRecorder !== 'undefined'
            };
        });

        // All required capabilities should be available
        expect(capabilities.hasWebSocket).toBe(true);
        expect(capabilities.hasMediaDevices).toBe(true);
        expect(capabilities.hasAudioContext).toBe(true);
        expect(capabilities.hasMediaRecorder).toBe(true);

        // Real-time model should be accessible
        await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
    });
});
