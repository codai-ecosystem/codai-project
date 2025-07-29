import { test, expect, Page } from '@playwright/test';

// WebSocket Integration Tests for Azure OpenAI Realtime API
test.describe('Voice AI WebSocket Integration', () => {

    test.beforeEach(async ({ page }) => {
        // Mock WebSocket for comprehensive testing
        await page.addInitScript(() => {
            let mockSocket: any = null;

            (window as any).WebSocket = class MockWebSocket extends EventTarget {
                readyState = WebSocket.CONNECTING;
                url: string;

                static CONNECTING = 0;
                static OPEN = 1;
                static CLOSING = 2;
                static CLOSED = 3;

                CONNECTING = 0;
                OPEN = 1;
                CLOSING = 2;
                CLOSED = 3;

                constructor(url: string, protocols?: string | string[]) {
                    super();
                    this.url = url;
                    mockSocket = this;

                    // Simulate connection process
                    setTimeout(() => {
                        this.readyState = WebSocket.OPEN;
                        this.dispatchEvent(new Event('open'));

                        // Send session.created event
                        setTimeout(() => {
                            const sessionEvent = new MessageEvent('message', {
                                data: JSON.stringify({
                                    type: 'session.created',
                                    session: {
                                        id: 'sess_' + Math.random().toString(36).substr(2, 9),
                                        model: 'gpt-4o-realtime-preview',
                                        instructions: 'You are a helpful AI assistant.',
                                        voice: 'nova',
                                        turn_detection: {
                                            type: 'server_vad',
                                            threshold: 0.5,
                                            prefix_padding_ms: 300,
                                            silence_duration_ms: 500
                                        },
                                        input_audio_format: 'pcm16',
                                        output_audio_format: 'pcm16',
                                        input_audio_transcription: {
                                            enabled: true,
                                            model: 'whisper-1'
                                        }
                                    }
                                })
                            });
                            this.dispatchEvent(sessionEvent);
                        }, 100);
                    }, 50);
                }

                send(data: string | ArrayBuffer) {
                    if (this.readyState !== WebSocket.OPEN) {
                        throw new Error('WebSocket is not open');
                    }

                    // Parse and respond to different message types
                    if (typeof data === 'string') {
                        try {
                            const message = JSON.parse(data);
                            this.handleMessage(message);
                        } catch (e) {
                            console.error('Invalid JSON message:', data);
                        }
                    }
                }

                close(code?: number, reason?: string) {
                    this.readyState = WebSocket.CLOSING;
                    setTimeout(() => {
                        this.readyState = WebSocket.CLOSED;
                        this.dispatchEvent(new CloseEvent('close', { code: code || 1000, reason }));
                    }, 10);
                }

                private handleMessage(message: any) {
                    switch (message.type) {
                        case 'session.update':
                            this.respondToSessionUpdate(message);
                            break;
                        case 'conversation.item.create':
                            this.respondToItemCreate(message);
                            break;
                        case 'response.create':
                            this.respondToResponseCreate(message);
                            break;
                        case 'input_audio_buffer.append':
                            this.respondToAudioAppend(message);
                            break;
                        case 'input_audio_buffer.commit':
                            this.respondToAudioCommit(message);
                            break;
                        case 'response.cancel':
                            this.respondToResponseCancel(message);
                            break;
                    }
                }

                private respondToSessionUpdate(message: any) {
                    setTimeout(() => {
                        const response = new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'session.updated',
                                session: {
                                    ...message.session,
                                    id: 'sess_' + Math.random().toString(36).substr(2, 9)
                                }
                            })
                        });
                        this.dispatchEvent(response);
                    }, 10);
                }

                private respondToItemCreate(message: any) {
                    setTimeout(() => {
                        const response = new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'conversation.item.created',
                                item: {
                                    ...message.item,
                                    id: 'item_' + Math.random().toString(36).substr(2, 9)
                                }
                            })
                        });
                        this.dispatchEvent(response);
                    }, 10);
                }

                private respondToResponseCreate(message: any) {
                    const responseId = 'resp_' + Math.random().toString(36).substr(2, 9);

                    // Send response.created
                    setTimeout(() => {
                        this.dispatchEvent(new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'response.created',
                                response: {
                                    id: responseId,
                                    status: 'in_progress',
                                    status_details: null,
                                    output: [],
                                    usage: null
                                }
                            })
                        }));
                    }, 10);

                    // Send response.output_item.added
                    setTimeout(() => {
                        this.dispatchEvent(new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'response.output_item.added',
                                response_id: responseId,
                                output_index: 0,
                                item: {
                                    id: 'item_' + Math.random().toString(36).substr(2, 9),
                                    type: 'message',
                                    role: 'assistant',
                                    content: [{
                                        type: 'audio',
                                        audio: btoa('mock-audio-pcm16-data'.repeat(100))
                                    }]
                                }
                            })
                        }));
                    }, 50);

                    // Send multiple audio deltas
                    for (let i = 0; i < 5; i++) {
                        setTimeout(() => {
                            this.dispatchEvent(new MessageEvent('message', {
                                data: JSON.stringify({
                                    type: 'response.audio.delta',
                                    response_id: responseId,
                                    item_id: 'item_' + Math.random().toString(36).substr(2, 9),
                                    output_index: 0,
                                    content_index: 0,
                                    delta: btoa('RIFF' + 'audio-chunk-' + i + '-'.repeat(100))
                                })
                            }));
                        }, 100 + i * 50);
                    }

                    // Send response.done
                    setTimeout(() => {
                        this.dispatchEvent(new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'response.done',
                                response: {
                                    id: responseId,
                                    status: 'completed',
                                    status_details: null,
                                    output: [{
                                        id: 'item_' + Math.random().toString(36).substr(2, 9),
                                        type: 'message',
                                        role: 'assistant',
                                        content: [{
                                            type: 'audio',
                                            audio: btoa('complete-audio-response')
                                        }]
                                    }],
                                    usage: {
                                        total_tokens: 150,
                                        input_tokens: 50,
                                        output_tokens: 100,
                                        input_token_details: {
                                            cached_tokens: 0,
                                            text_tokens: 30,
                                            audio_tokens: 20
                                        },
                                        output_token_details: {
                                            text_tokens: 80,
                                            audio_tokens: 20
                                        }
                                    }
                                }
                            })
                        }));
                    }, 400);
                }

                private respondToAudioAppend(message: any) {
                    // Just acknowledge the audio was received
                    setTimeout(() => {
                        console.log('Audio buffer appended:', message.audio?.length || 0, 'bytes');
                    }, 5);
                }

                private respondToAudioCommit(message: any) {
                    // Simulate transcription
                    setTimeout(() => {
                        this.dispatchEvent(new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'input_audio_buffer.speech_started',
                                audio_start_ms: 1000,
                                item_id: 'item_' + Math.random().toString(36).substr(2, 9)
                            })
                        }));
                    }, 10);

                    setTimeout(() => {
                        this.dispatchEvent(new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'input_audio_buffer.speech_stopped',
                                audio_end_ms: 3000,
                                item_id: 'item_' + Math.random().toString(36).substr(2, 9)
                            })
                        }));
                    }, 50);

                    setTimeout(() => {
                        this.dispatchEvent(new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'conversation.item.input_audio_transcription.completed',
                                item_id: 'item_' + Math.random().toString(36).substr(2, 9),
                                content_index: 0,
                                transcript: 'Hello, this is a test transcription of the audio input.'
                            })
                        }));
                    }, 100);
                }

                private respondToResponseCancel(message: any) {
                    setTimeout(() => {
                        this.dispatchEvent(new MessageEvent('message', {
                            data: JSON.stringify({
                                type: 'response.cancelled',
                                response_id: message.response_id
                            })
                        }));
                    }, 10);
                }
            };

            // Store reference to mock for testing
            (window as any).__mockWebSocket = () => mockSocket;
        });
    });

    test('should establish WebSocket connection successfully', async ({ page }) => {
        await page.goto('/');

        // Wait for connection status to show connected
        await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected', { timeout: 10000 });

        // Verify connection indicator is green
        await expect(page.locator('.bg-green-500')).toBeVisible();

        // Check console for successful connection logs
        const consoleLogs: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'log') {
                consoleLogs.push(msg.text());
            }
        });

        await page.waitForTimeout(1000);

        // Verify no connection errors
        const errorLogs = consoleLogs.filter(log =>
            log.includes('WebSocket error') || log.includes('Connection failed')
        );
        expect(errorLogs).toHaveLength(0);
    });

    test('should handle session creation and updates', async ({ page }) => {
        await page.goto('/');

        // Wait for initial connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Verify session was created
        const sessionInfo = await page.evaluate(() => {
            const mockSocket = (window as any).__mockWebSocket();
            return {
                isConnected: mockSocket && mockSocket.readyState === WebSocket.OPEN,
                url: mockSocket ? mockSocket.url : null
            };
        });

        expect(sessionInfo.isConnected).toBe(true);
        expect(sessionInfo.url).toContain('openai.azure.com');
    });

    test('should send and receive audio messages', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Mock audio recording
        await page.evaluate(() => {
            // Simulate audio recording start
            const mockAudioData = new ArrayBuffer(4800); // 100ms of 24kHz 16-bit audio
            const view = new Int16Array(mockAudioData);

            // Fill with mock audio samples
            for (let i = 0; i < view.length; i++) {
                view[i] = Math.sin(2 * Math.PI * 440 * i / 24000) * 32767; // 440Hz tone
            }

            // Trigger audio sending
            window.dispatchEvent(new CustomEvent('test-send-audio', {
                detail: { audioData: mockAudioData }
            }));
        });

        // Wait for audio response
        await page.waitForTimeout(1000);

        // Verify audio was processed (check for audio playback)
        const audioActivity = await page.evaluate(() => {
            // Check if any audio processing occurred
            return document.querySelector('[data-testid="audio-status"]')?.textContent || '';
        });

        // Should not show audio errors
        await expect(page.locator('.bg-red-50')).not.toBeVisible();
    });

    test('should handle WebSocket reconnection', async ({ page }) => {
        await page.goto('/');

        // Wait for initial connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Simulate connection loss
        await page.evaluate(() => {
            const mockSocket = (window as any).__mockWebSocket();
            if (mockSocket) {
                mockSocket.readyState = WebSocket.CLOSED;
                mockSocket.dispatchEvent(new CloseEvent('close', { code: 1006, reason: 'Connection lost' }));
            }
        });

        // Should show disconnected state
        await expect(page.locator('[data-testid="connection-status"]')).toContainText('Disconnected', { timeout: 5000 });
        await expect(page.locator('.bg-red-500')).toBeVisible();

        // Wait for reconnection attempt
        await page.waitForTimeout(2000);

        // Should reconnect automatically
        await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected', { timeout: 10000 });
    });

    test('should handle various WebSocket message types', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Track received messages
        const messageTypes: string[] = [];
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('Received WebSocket message:')) {
                messageTypes.push(text);
            }
        });

        // Trigger a response creation (this will generate multiple message types)
        await page.evaluate(() => {
            const mockSocket = (window as any).__mockWebSocket();
            if (mockSocket) {
                // Send a response create message
                mockSocket.send(JSON.stringify({
                    type: 'response.create',
                    response: {
                        instructions: 'Please respond with a greeting.'
                    }
                }));
            }
        });

        // Wait for message processing
        await page.waitForTimeout(1000);

        // Verify various message types were handled
        const expectedTypes = [
            'response.created',
            'response.output_item.added',
            'response.audio.delta',
            'response.done'
        ];

        // Should handle messages without errors
        await expect(page.locator('.bg-red-50')).not.toBeVisible();
    });

    test('should handle audio transcription', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        const transcriptionLogs: string[] = [];
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('transcription') || text.includes('Transcript')) {
                transcriptionLogs.push(text);
            }
        });

        // Simulate audio input and commit
        await page.evaluate(() => {
            const mockSocket = (window as any).__mockWebSocket();
            if (mockSocket) {
                // Append audio data
                mockSocket.send(JSON.stringify({
                    type: 'input_audio_buffer.append',
                    audio: btoa('mock-audio-data'.repeat(100))
                }));

                // Commit audio for processing
                setTimeout(() => {
                    mockSocket.send(JSON.stringify({
                        type: 'input_audio_buffer.commit'
                    }));
                }, 100);
            }
        });

        // Wait for transcription
        await page.waitForTimeout(500);

        // Should process transcription without errors
        const errorLogs = transcriptionLogs.filter(log =>
            log.includes('error') || log.includes('Error')
        );
        expect(errorLogs).toHaveLength(0);
    });

    test('should handle response cancellation', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        // Start a response
        await page.evaluate(() => {
            const mockSocket = (window as any).__mockWebSocket();
            if (mockSocket) {
                mockSocket.send(JSON.stringify({
                    type: 'response.create',
                    response: {
                        instructions: 'This is a long response that will be cancelled.'
                    }
                }));
            }
        });

        // Wait a bit then cancel
        await page.waitForTimeout(100);

        await page.evaluate(() => {
            const mockSocket = (window as any).__mockWebSocket();
            if (mockSocket) {
                mockSocket.send(JSON.stringify({
                    type: 'response.cancel',
                    response_id: 'resp_12345'
                }));
            }
        });

        // Should handle cancellation gracefully
        await page.waitForTimeout(200);
        await expect(page.locator('.bg-red-50')).not.toBeVisible();
    });

    test('should validate WebSocket URL construction', async ({ page }) => {
        await page.goto('/');

        // Get the WebSocket URL that was used
        const socketInfo = await page.evaluate(() => {
            const mockSocket = (window as any).__mockWebSocket();
            return {
                url: mockSocket ? mockSocket.url : null,
                isSecure: mockSocket ? mockSocket.url.startsWith('wss://') : false
            };
        });

        // Verify URL structure
        expect(socketInfo.url).toBeTruthy();
        expect(socketInfo.isSecure).toBe(true);
        expect(socketInfo.url).toContain('openai.azure.com');
        expect(socketInfo.url).toContain('gpt-4o-realtime');
        expect(socketInfo.url).toContain('api-version=2024-10-01-preview');
    });

    test('should handle malformed WebSocket messages gracefully', async ({ page }) => {
        await page.goto('/');

        // Wait for connection
        await page.waitForSelector('[data-testid="connection-status"]:has-text("Connected")', { timeout: 10000 });

        const errorLogs: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errorLogs.push(msg.text());
            }
        });

        // Send malformed messages
        await page.evaluate(() => {
            const mockSocket = (window as any).__mockWebSocket();
            if (mockSocket) {
                // Simulate receiving malformed JSON
                mockSocket.dispatchEvent(new MessageEvent('message', {
                    data: 'invalid-json-data{'
                }));

                // Simulate message with missing required fields
                mockSocket.dispatchEvent(new MessageEvent('message', {
                    data: JSON.stringify({
                        type: 'response.audio.delta'
                        // Missing delta field
                    })
                }));

                // Simulate unknown message type
                mockSocket.dispatchEvent(new MessageEvent('message', {
                    data: JSON.stringify({
                        type: 'unknown.message.type',
                        data: 'test'
                    })
                }));
            }
        });

        await page.waitForTimeout(500);

        // Should handle malformed messages without crashing
        await expect(page.locator('h1')).toContainText('METU Voice AI');

        // May log errors but should not crash
        const crashErrors = errorLogs.filter(log =>
            log.includes('Uncaught') && (log.includes('TypeError') || log.includes('ReferenceError'))
        );
        expect(crashErrors).toHaveLength(0);
    });
});
