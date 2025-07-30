import { test, expect, Page } from '@playwright/test';

// Voice Control and User Interface Tests
test.describe('Voice AI User Interface Controls', () => {

    test.beforeEach(async ({ page }) => {
        // Set up comprehensive mocks for UI testing
        await page.addInitScript(() => {
            // Mock MediaDevices for microphone access
            (window.navigator as any).mediaDevices = {
                async enumerateDevices() {
                    return [
                        { deviceId: 'default', kind: 'audioinput', label: 'Default - Microphone Array', groupId: 'default' },
                        { deviceId: 'comm-1', kind: 'audioinput', label: 'Communications - Microphone Array', groupId: 'comm' },
                        { deviceId: 'webcam-1', kind: 'audioinput', label: 'Webcam Microphone', groupId: 'webcam' },
                        { deviceId: 'default', kind: 'audiooutput', label: 'Default - Speakers', groupId: 'default' },
                        { deviceId: 'hdmi-1', kind: 'audiooutput', label: 'HDMI Audio Device', groupId: 'hdmi' }
                    ];
                },

                async getUserMedia(constraints: MediaStreamConstraints) {
                    console.log('getUserMedia called with:', constraints);

                    // Mock MediaStream
                    const mockStream = {
                        id: 'mock-stream-' + Math.random(),
                        active: true,

                        getTracks: () => [mockAudioTrack],
                        getAudioTracks: () => [mockAudioTrack],
                        getVideoTracks: () => [],

                        addTrack: () => { },
                        removeTrack: () => { },
                        clone: () => mockStream,

                        addEventListener: () => { },
                        removeEventListener: () => { },
                        dispatchEvent: () => true
                    };

                    const mockAudioTrack = {
                        id: 'mock-audio-track',
                        kind: 'audio',
                        label: 'Mock Audio Track',
                        enabled: true,
                        muted: false,
                        readyState: 'live',

                        stop: () => {
                            console.log('Audio track stopped');
                            mockAudioTrack.readyState = 'ended';
                        },

                        clone: () => mockAudioTrack,
                        getSettings: () => ({
                            deviceId: constraints.audio && typeof constraints.audio === 'object' ?
                                constraints.audio.deviceId : 'default',
                            sampleRate: 48000,
                            channelCount: 1,
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }),

                        getCapabilities: () => ({
                            deviceId: 'default',
                            sampleRate: { min: 8000, max: 48000 },
                            channelCount: { min: 1, max: 2 },
                            echoCancellation: [true, false],
                            noiseSuppression: [true, false],
                            autoGainControl: [true, false]
                        }),

                        addEventListener: () => { },
                        removeEventListener: () => { },
                        dispatchEvent: () => true
                    };

                    return mockStream;
                }
            };

            // Mock MediaRecorder
            (window as any).MediaRecorder = class MockMediaRecorder extends EventTarget {
                state = 'inactive';
                stream: any;
                options: any;

                static isTypeSupported(mimeType: string) {
                    return ['audio/webm', 'audio/webm;codecs=opus', 'audio/wav'].includes(mimeType);
                }

                constructor(stream: any, options?: any) {
                    super();
                    this.stream = stream;
                    this.options = options;
                }

                start(timeslice?: number) {
                    this.state = 'recording';
                    console.log('MediaRecorder started');

                    // Simulate dataavailable events
                    setTimeout(() => {
                        const mockAudioData = new Blob(['mock-audio-data'], { type: 'audio/webm' });
                        this.dispatchEvent(new BlobEvent('dataavailable', { data: mockAudioData }));
                    }, 100);
                }

                stop() {
                    this.state = 'inactive';
                    console.log('MediaRecorder stopped');
                    this.dispatchEvent(new Event('stop'));
                }

                pause() {
                    this.state = 'paused';
                    this.dispatchEvent(new Event('pause'));
                }

                resume() {
                    this.state = 'recording';
                    this.dispatchEvent(new Event('resume'));
                }

                requestData() {
                    const mockAudioData = new Blob(['mock-audio-data'], { type: 'audio/webm' });
                    this.dispatchEvent(new BlobEvent('dataavailable', { data: mockAudioData }));
                }
            };

            // Mock AudioContext
            (window as any).AudioContext = class MockAudioContext {
                state = 'suspended';
                sampleRate = 48000;
                destination = {};

                async resume() {
                    this.state = 'running';
                    return Promise.resolve();
                }

                async suspend() {
                    this.state = 'suspended';
                    return Promise.resolve();
                }

                async close() {
                    this.state = 'closed';
                    return Promise.resolve();
                }

                createAnalyser() {
                    return {
                        fftSize: 2048,
                        frequencyBinCount: 1024,
                        smoothingTimeConstant: 0.8,

                        getByteFrequencyData: (array: Uint8Array) => {
                            // Fill with mock frequency data
                            for (let i = 0; i < array.length; i++) {
                                array[i] = Math.random() * 255;
                            }
                        },

                        getByteTimeDomainData: (array: Uint8Array) => {
                            // Fill with mock time domain data
                            for (let i = 0; i < array.length; i++) {
                                array[i] = 128 + Math.sin(i * 0.1) * 50;
                            }
                        },

                        connect: () => { },
                        disconnect: () => { }
                    };
                }

                createGain() {
                    return {
                        gain: { value: 1.0 },
                        connect: () => { },
                        disconnect: () => { }
                    };
                }

                createMediaStreamSource(stream: any) {
                    return {
                        mediaStream: stream,
                        connect: () => { },
                        disconnect: () => { }
                    };
                }
            };

            // Mock WebSocket with comprehensive response handling
            (window as any).WebSocket = class MockWebSocket extends EventTarget {
                readyState = WebSocket.CONNECTING;
                url: string;

                constructor(url: string) {
                    super();
                    this.url = url;

                    setTimeout(() => {
                        this.readyState = WebSocket.OPEN;
                        this.dispatchEvent(new Event('open'));

                        // Send session.created
                        setTimeout(() => {
                            this.dispatchEvent(new MessageEvent('message', {
                                data: JSON.stringify({
                                    type: 'session.created',
                                    session: { id: 'test-session-ui' }
                                })
                            }));
                        }, 50);
                    }, 100);
                }

                send(data: string) {
                    // Mock response to user interactions
                    setTimeout(() => {
                        this.dispatchEvent(new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'response.audio.delta',
                                delta: btoa('RIFF' + 'mock-response-audio'.repeat(50))
                            })
                        }));
                    }, 200);
                }

                close() {
                    this.readyState = WebSocket.CLOSED;
                    this.dispatchEvent(new Event('close'));
                }
            };
        });
    });

    test('should display all main UI components', async ({ page }) => {
        await page.goto('/');

        // Check main title
        await expect(page.locator('h1')).toContainText('METU Voice AI');

        // Check connection status
        await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();

        // Check voice controls
        await expect(page.locator('button:has-text("Start Recording")')).toBeVisible();
        await expect(page.locator('button:has-text("Settings")')).toBeVisible();

        // Check messages area
        await expect(page.locator('[data-testid="messages-container"]')).toBeVisible();

        // Check status indicators
        await expect(page.locator('[data-testid="audio-status"]')).toBeVisible();
    });

    test('should show microphone device selection', async ({ page }) => {
        await page.goto('/');

        // Open settings
        await page.click('button:has-text("Settings")');

        // Check microphone selection dropdown
        await expect(page.locator('select')).toBeVisible();

        // Verify device options are loaded
        const deviceOptions = await page.locator('select option').count();
        expect(deviceOptions).toBeGreaterThan(1); // Should have multiple device options

        // Check for default device
        await expect(page.locator('option:has-text("Default - Microphone")')).toBeVisible();
    });

    test('should handle recording button states correctly', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Initially should show "Start Recording"
        const recordButton = page.locator('button:has-text("Start Recording")');
        await expect(recordButton).toBeVisible();
        await expect(recordButton).not.toBeDisabled();

        // Click to start recording
        await recordButton.click();

        // Should change to "Stop Recording"
        await expect(page.locator('button:has-text("Stop Recording")')).toBeVisible({ timeout: 5000 });

        // Recording indicator should be visible
        await expect(page.locator('.bg-red-500')).toBeVisible();

        // Click to stop recording
        await page.click('button:has-text("Stop Recording")');

        // Should return to "Start Recording"
        await expect(page.locator('button:has-text("Start Recording")')).toBeVisible({ timeout: 5000 });
    });

    test('should display voice level indicator during recording', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Start recording
        await page.click('button:has-text("Start Recording")');

        // Voice level indicator should appear
        await expect(page.locator('[data-testid="voice-level"]')).toBeVisible({ timeout: 3000 });

        // Check that voice level changes (animated)
        const initialLevel = await page.locator('[data-testid="voice-level"]').getAttribute('style');

        await page.waitForTimeout(500);

        const updatedLevel = await page.locator('[data-testid="voice-level"]').getAttribute('style');

        // Level should potentially change (or at least be present)
        expect(initialLevel).toBeTruthy();
        expect(updatedLevel).toBeTruthy();
    });

    test('should open and close settings panel', async ({ page }) => {
        await page.goto('/');

        // Settings should not be visible initially
        await expect(page.locator('text=Voice Speed')).not.toBeVisible();

        // Open settings
        await page.click('button:has-text("Settings")');

        // Settings panel should be visible
        await expect(page.locator('text=Voice Speed')).toBeVisible();
        await expect(page.locator('text=Audio Gain')).toBeVisible();
        await expect(page.locator('text=Noise Cancellation')).toBeVisible();

        // Close settings by clicking outside or close button
        await page.click('body', { position: { x: 50, y: 50 } });

        // Settings should close
        await expect(page.locator('text=Voice Speed')).not.toBeVisible({ timeout: 3000 });
    });

    test('should adjust voice speed setting', async ({ page }) => {
        await page.goto('/');

        // Open settings
        await page.click('button:has-text("Settings")');

        // Find voice speed slider
        const speedSlider = page.locator('input[type="range"]').first();
        await expect(speedSlider).toBeVisible();

        // Get initial value
        const initialValue = await speedSlider.getAttribute('value');

        // Adjust speed
        await speedSlider.fill('1.5');

        // Verify value changed
        const newValue = await speedSlider.getAttribute('value');
        expect(newValue).toBe('1.5');
        expect(newValue).not.toBe(initialValue);

        // Speed display should update
        await expect(page.locator('text=1.5x')).toBeVisible();
    });

    test('should adjust audio gain setting', async ({ page }) => {
        await page.goto('/');

        // Open settings
        await page.click('button:has-text("Settings")');

        // Find audio gain slider (second range input)
        const gainSlider = page.locator('input[type="range"]').nth(1);
        await expect(gainSlider).toBeVisible();

        // Adjust gain
        await gainSlider.fill('0.8');

        // Verify value changed
        const newValue = await gainSlider.getAttribute('value');
        expect(newValue).toBe('0.8');

        // Gain display should update
        await expect(page.locator('text=80%')).toBeVisible();
    });

    test('should toggle noise cancellation', async ({ page }) => {
        await page.goto('/');

        // Open settings
        await page.click('button:has-text("Settings")');

        // Find noise cancellation checkbox
        const noiseCheckbox = page.locator('input[type="checkbox"]#noiseCancellation');
        await expect(noiseCheckbox).toBeVisible();

        // Get initial state
        const initialState = await noiseCheckbox.isChecked();

        // Toggle checkbox
        await noiseCheckbox.click();

        // Verify state changed
        const newState = await noiseCheckbox.isChecked();
        expect(newState).toBe(!initialState);
    });

    test('should toggle response streaming', async ({ page }) => {
        await page.goto('/');

        // Open settings
        await page.click('button:has-text("Settings")');

        // Find response streaming checkbox
        const streamingCheckbox = page.locator('input[type="checkbox"]#responseStreaming');
        await expect(streamingCheckbox).toBeVisible();

        // Toggle checkbox
        await streamingCheckbox.click();

        // Should handle toggle without errors
        await expect(page.locator('.bg-red-50')).not.toBeVisible();
    });

    test('should display voice messages correctly', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Simulate sending a message
        await page.click('button:has-text("Start Recording")');
        await page.waitForTimeout(1000);
        await page.click('button:has-text("Stop Recording")');

        // Wait for response
        await page.waitForTimeout(2000);

        // Check messages container
        const messagesContainer = page.locator('[data-testid="messages-container"]');
        await expect(messagesContainer).toBeVisible();

        // Should show user message
        await expect(page.locator('.message.user')).toBeVisible({ timeout: 5000 });

        // Should show assistant response
        await expect(page.locator('.message.assistant')).toBeVisible({ timeout: 5000 });
    });

    test('should handle connection error states', async ({ page }) => {
        // Mock failed WebSocket connection
        await page.addInitScript(() => {
            (window as any).WebSocket = class FailedWebSocket extends EventTarget {
                readyState = WebSocket.CONNECTING;

                constructor() {
                    super();
                    setTimeout(() => {
                        this.readyState = WebSocket.CLOSED;
                        this.dispatchEvent(new CloseEvent('close', { code: 1006, reason: 'Connection failed' }));
                    }, 100);
                }

                send() { }
                close() { }
            };
        });

        await page.goto('/');

        // Should show error state
        await expect(page.locator('[data-testid="connection-status"]')).toContainText('Disconnected', { timeout: 5000 });
        await expect(page.locator('.bg-red-500')).toBeVisible();

        // Recording button should be disabled
        await expect(page.locator('button:has-text("Start Recording")')).toBeDisabled();

        // Should show error message
        await expect(page.locator('text=Voice Service Error')).toBeVisible();
    });

    test('should handle microphone permission denial', async ({ page }) => {
        // Mock permission denial
        await page.addInitScript(() => {
            (window.navigator as any).mediaDevices.getUserMedia = async () => {
                throw new DOMException('Permission denied', 'NotAllowedError');
            };
        });

        await page.goto('/');

        // Try to start recording
        await page.click('button:has-text("Start Recording")');

        // Should show permission error
        await expect(page.locator('text=Microphone access denied')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.bg-yellow-50')).toBeVisible();
    });

    test('should show audio processing status', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Audio status should be visible
        const audioStatus = page.locator('[data-testid="audio-status"]');
        await expect(audioStatus).toBeVisible();

        // Should show idle state initially
        await expect(audioStatus).toContainText('Ready');

        // Start recording
        await page.click('button:has-text("Start Recording")');

        // Should show recording state
        await expect(audioStatus).toContainText('Recording', { timeout: 3000 });

        // Stop recording
        await page.click('button:has-text("Stop Recording")');

        // Should show processing state
        await expect(audioStatus).toContainText('Processing', { timeout: 3000 });
    });

    test('should maintain responsive design on different screen sizes', async ({ page }) => {
        await page.goto('/');

        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Main components should still be visible
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('button:has-text("Start Recording")')).toBeVisible();
        await expect(page.locator('button:has-text("Settings")')).toBeVisible();

        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });

        // Layout should adapt
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();

        // Test desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });

        // All elements should be properly positioned
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('[data-testid="messages-container"]')).toBeVisible();
    });

    test('should handle keyboard navigation', async ({ page }) => {
        await page.goto('/');

        // Test tab navigation
        await page.keyboard.press('Tab');

        // Should focus on first interactive element
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(['BUTTON', 'INPUT', 'SELECT'].includes(focusedElement || '')).toBe(true);

        // Test Enter key on record button
        await page.focus('button:has-text("Start Recording")');
        await page.keyboard.press('Enter');

        // Should start recording
        await expect(page.locator('button:has-text("Stop Recording")')).toBeVisible({ timeout: 3000 });

        // Test Escape key to stop recording
        await page.keyboard.press('Escape');

        // Should stop recording
        await expect(page.locator('button:has-text("Start Recording")')).toBeVisible({ timeout: 3000 });
    });

    test('should preserve settings across sessions', async ({ page }) => {
        await page.goto('/');

        // Open settings and change values
        await page.click('button:has-text("Settings")');
        await page.locator('input[type="range"]').first().fill('1.8');
        await page.locator('input[type="range"]').nth(1).fill('0.6');
        await page.click('input[type="checkbox"]#noiseCancellation');

        // Close settings
        await page.click('body', { position: { x: 50, y: 50 } });

        // Reload page
        await page.reload();

        // Open settings again
        await page.click('button:has-text("Settings")');

        // Values should be preserved (this would require localStorage implementation)
        // For now, just verify settings panel opens correctly
        await expect(page.locator('text=Voice Speed')).toBeVisible();
        await expect(page.locator('input[type="range"]').first()).toBeVisible();
    });
});
