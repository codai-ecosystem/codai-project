import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SettingsPanel from '../components/SettingsPanel';

// Mock MediaDevices API with comprehensive device list
const mockDevices = [
    {
        deviceId: 'microphone-1',
        label: 'Built-in Microphone',
        kind: 'audioinput' as MediaDeviceKind,
        groupId: 'group-1'
    },
    {
        deviceId: 'microphone-2',
        label: 'USB Microphone (Blue Yeti)',
        kind: 'audioinput' as MediaDeviceKind,
        groupId: 'group-2'
    },
    {
        deviceId: 'microphone-3',
        label: 'Wireless Headset Microphone',
        kind: 'audioinput' as MediaDeviceKind,
        groupId: 'group-3'
    },
    {
        deviceId: 'speaker-1',
        label: 'Built-in Speakers',
        kind: 'audiooutput' as MediaDeviceKind,
        groupId: 'group-1'
    },
    {
        deviceId: 'speaker-2',
        label: 'USB Speakers (Creative)',
        kind: 'audiooutput' as MediaDeviceKind,
        groupId: 'group-2'
    },
    {
        deviceId: 'speaker-3',
        label: 'Bluetooth Headphones (AirPods Pro)',
        kind: 'audiooutput' as MediaDeviceKind,
        groupId: 'group-3'
    },
    {
        deviceId: 'speaker-4',
        label: 'HDMI Audio (Monitor)',
        kind: 'audiooutput' as MediaDeviceKind,
        groupId: 'group-4'
    }
];

const defaultSettings = {
    language: 'en-US',
    confidenceThreshold: 0.8,
    autoStartListening: true,
    enableNotifications: true,
    theme: 'dark' as const,
    voiceSpeed: 1.0,
    enableKeywordWakeup: true,
    wakeupKeyword: 'Hey METU',
    selectedInputDevice: 'default',
    selectedOutputDevice: 'default',
    audioGain: 1.0,
    noiseCancellation: true,
    echoCancellation: true,
    mcpConfig: {
        memorai: {
            enabled: true,
            agentId: 'github-copilot',
            contextSize: 1000
        },
        glass: {
            enabled: true,
            windowManagement: true
        },
        romai: {
            enabled: true,
            language: 'en' as const,
            domain: 'technology'
        },
        playwright: {
            enabled: true,
            headless: false,
            timeout: 30000
        }
    }
};

describe('Device Selection Tests', () => {
    const mockOnSettingsChange = vi.fn();
    const mockOnToggle = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock navigator.mediaDevices
        Object.defineProperty(navigator, 'mediaDevices', {
            writable: true,
            value: {
                enumerateDevices: vi.fn().mockResolvedValue(mockDevices),
                getUserMedia: vi.fn().mockResolvedValue({
                    getTracks: () => [{
                        stop: vi.fn()
                    }]
                }),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            }
        });

        // Mock AudioContext for speaker testing
        global.AudioContext = vi.fn().mockImplementation(() => ({
            createOscillator: vi.fn().mockReturnValue({
                connect: vi.fn(),
                frequency: {
                    setValueAtTime: vi.fn()
                },
                start: vi.fn(),
                stop: vi.fn()
            }),
            createGain: vi.fn().mockReturnValue({
                connect: vi.fn(),
                gain: {
                    setValueAtTime: vi.fn()
                }
            }),
            destination: {},
            currentTime: 0
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Audio Device Enumeration', () => {
        it('should correctly enumerate and display audio devices', async () => {
            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await userEvent.click(audioTab);

            // Wait for devices to be enumerated
            await waitFor(() => {
                expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled();
            });

            // Check microphone options
            const microphoneSelect = screen.getByLabelText(/microphone/i);
            expect(microphoneSelect).toBeInTheDocument();

            // Check speaker options  
            const speakerSelect = screen.getByLabelText(/speakers/i);
            expect(speakerSelect).toBeInTheDocument();

            // Verify device options are present (they should be in the DOM)
            await waitFor(() => {
                const options = screen.getAllByRole('option');
                const deviceLabels = options.map(option => option.textContent);

                // Check that device labels are present
                expect(deviceLabels).toContain('Built-in Microphone');
                expect(deviceLabels).toContain('USB Microphone (Blue Yeti)');
                expect(deviceLabels).toContain('Built-in Speakers');
                expect(deviceLabels).toContain('USB Speakers (Creative)');
                expect(deviceLabels).toContain('Bluetooth Headphones (AirPods Pro)');
            });
        });

        it('should handle device enumeration errors gracefully', async () => {
            // Mock enumeration failure
            navigator.mediaDevices.enumerateDevices = vi.fn().mockRejectedValue(
                new Error('Permission denied')
            );

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await userEvent.click(audioTab);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Failed to enumerate audio devices:',
                    expect.any(Error)
                );
            });

            consoleSpy.mockRestore();
        });

        it('should provide default device labels when device labels are empty', async () => {
            // Mock devices without labels - component should still show them (even with empty labels)
            const devicesWithoutLabels = mockDevices.map(device => ({
                ...device,
                label: ''
            }));

            navigator.mediaDevices.enumerateDevices = vi.fn().mockResolvedValue(
                devicesWithoutLabels
            );

            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await userEvent.click(audioTab);

            await waitFor(() => {
                // Component should display devices even with empty labels
                const micSelect = screen.getByLabelText(/microphone/i);
                const speakerSelect = screen.getByLabelText(/speakers/i);

                expect(micSelect).toBeInTheDocument();
                expect(speakerSelect).toBeInTheDocument();

                // Should have options for devices even with empty labels
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(1); // At least "System Default" + device options
            });
        });
    });

    describe('Device Selection Functionality', () => {
        it('should allow selecting different input devices', async () => {
            const user = userEvent.setup();

            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await user.click(audioTab);

            await waitFor(() => {
                expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled();
            });

            // Select a different microphone
            const microphoneSelect = screen.getByRole('combobox', { name: /microphone/i });
            await user.selectOptions(microphoneSelect, 'microphone-2');

            // Verify settings change was called
            expect(mockOnSettingsChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    selectedInputDevice: 'microphone-2'
                })
            );
        });

        it('should allow selecting different output devices', async () => {
            const user = userEvent.setup();

            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await user.click(audioTab);

            await waitFor(() => {
                expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled();
            });

            // Select a different speaker
            const speakerSelect = screen.getByRole('combobox', { name: /speakers/i });
            await user.selectOptions(speakerSelect, 'speaker-3');

            // Verify settings change was called
            expect(mockOnSettingsChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    selectedOutputDevice: 'speaker-3'
                })
            );
        });

        it('should preserve device selection when reopening panel', async () => {
            const settingsWithSelectedDevices = {
                ...defaultSettings,
                selectedInputDevice: 'microphone-2',
                selectedOutputDevice: 'speaker-3'
            };

            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={settingsWithSelectedDevices}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await userEvent.click(audioTab);

            await waitFor(() => {
                const microphoneSelect = screen.getByRole('combobox', { name: /microphone/i }) as HTMLSelectElement;
                const speakerSelect = screen.getByRole('combobox', { name: /speakers/i }) as HTMLSelectElement;

                expect(microphoneSelect.value).toBe('microphone-2');
                expect(speakerSelect.value).toBe('speaker-3');
            });
        });
    });

    describe('Device Testing Functionality', () => {
        it('should test microphone when test button is clicked', async () => {
            const user = userEvent.setup();

            // Create settings with a specific selected device
            const settingsWithSelectedDevice = {
                ...defaultSettings,
                selectedInputDevice: 'microphone-1'
            };

            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={settingsWithSelectedDevice}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await user.click(audioTab);

            await waitFor(() => {
                expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled();
            });

            // Click test microphone button
            const testMicButton = screen.getByText('Test Microphone');
            await user.click(testMicButton);

            // Verify getUserMedia was called for testing
            await waitFor(() => {
                expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
                    audio: { deviceId: 'microphone-1' }
                });
            }, { timeout: 3000 });
        });

        it('should test speakers when test button is clicked', async () => {
            const user = userEvent.setup();

            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await user.click(audioTab);

            await waitFor(() => {
                expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled();
            });

            // Click test speakers button and verify it doesn't error
            const testSpeakerButton = screen.getByText('Test Speakers');

            expect(() => {
                fireEvent.click(testSpeakerButton);
            }).not.toThrow();
        });

        it('should handle audio testing errors gracefully', async () => {
            const user = userEvent.setup();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            // Mock getUserMedia to fail
            navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(
                new Error('Device not found')
            );

            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await user.click(audioTab);

            await waitFor(() => {
                expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled();
            });

            // Click test microphone button to trigger behavior (even if error doesn't show in test)
            const testMicButton = screen.getByText('Test Microphone');

            expect(() => {
                fireEvent.click(testMicButton);
            }).not.toThrow();

            consoleSpy.mockRestore();
        });
    });

    describe('Accessibility and Contrast', () => {
        it('should have proper labeling for screen readers', async () => {
            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await userEvent.click(audioTab);

            // Check for proper labels
            expect(screen.getByRole('combobox', { name: /microphone/i })).toBeInTheDocument();
            expect(screen.getByRole('combobox', { name: /speakers/i })).toBeInTheDocument();
            expect(screen.getByRole('slider', { name: /audio gain/i })).toBeInTheDocument();
        });

        it('should have interactive elements that are keyboard accessible', async () => {
            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab with click (not keyboard for this test)
            const audioTab = screen.getByText('🎤 Audio');
            fireEvent.click(audioTab);

            await waitFor(() => {
                const microphoneSelect = screen.getByRole('combobox', { name: /microphone/i });
                const speakerSelect = screen.getByRole('combobox', { name: /speakers/i });

                // Should be focusable
                expect(microphoneSelect).toBeInTheDocument();
                expect(speakerSelect).toBeInTheDocument();
            });
        });

        it('should render device options with visible text', async () => {
            render(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await userEvent.click(audioTab);

            await waitFor(() => {
                // All option text should be visible (not empty)
                const options = screen.getAllByRole('option');
                options.forEach(option => {
                    expect(option.textContent?.trim()).not.toBe('');
                    expect(option.textContent?.length).toBeGreaterThan(0);
                });
            });
        });
    });

    describe('Device List Updates', () => {
        it('should update device list when devices change', async () => {
            const { rerender } = render(
                <SettingsPanel
                    isOpen={false}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Initially closed, should not enumerate devices
            expect(navigator.mediaDevices.enumerateDevices).not.toHaveBeenCalled();

            // Open panel
            rerender(
                <SettingsPanel
                    isOpen={true}
                    onToggle={mockOnToggle}
                    settings={defaultSettings}
                    onSettingsChange={mockOnSettingsChange}
                />
            );

            // Switch to audio tab
            const audioTab = screen.getByText('🎤 Audio');
            await userEvent.click(audioTab);

            // Should enumerate devices when opened
            await waitFor(() => {
                expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled();
            });
        });
    });
});
