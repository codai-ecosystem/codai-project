/**
 * Enhanced Audio Settings Component for METU
 * 
 * Provides comprehensive audio device selection, language preferences,
 * and advanced voice configuration options.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { audioDeviceManager, AudioDevice } from '../../services/audio/AudioDeviceManager';
import { SettingsService, SettingsData } from '../../services/SettingsService';

// Supported languages for Azure OpenAI
const SUPPORTED_LANGUAGES = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
    { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch (Deutschland)', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italiano (Italia)', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
    { code: 'ro-RO', name: 'Română (România)', flag: '🇷🇴' },
    { code: 'ja-JP', name: '日本語 (日本)', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어 (대한민국)', flag: '🇰🇷' },
    { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
    { code: 'zh-TW', name: '中文 (繁體)', flag: '🇹🇼' },
    { code: 'ru-RU', name: 'Русский (Россия)', flag: '🇷🇺' },
    { code: 'ar-SA', name: 'العربية (السعودية)', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'हिन्दी (भारत)', flag: '🇮🇳' },
    { code: 'th-TH', name: 'ไทย (ประเทศไทย)', flag: '🇹🇭' },
    { code: 'vi-VN', name: 'Tiếng Việt (Việt Nam)', flag: '🇻🇳' },
    { code: 'nl-NL', name: 'Nederlands (Nederland)', flag: '🇳🇱' },
    { code: 'sv-SE', name: 'Svenska (Sverige)', flag: '🇸🇪' },
    { code: 'da-DK', name: 'Dansk (Danmark)', flag: '🇩🇰' },
    { code: 'no-NO', name: 'Norsk (Norge)', flag: '🇳🇴' },
    { code: 'fi-FI', name: 'Suomi (Suomi)', flag: '🇫🇮' },
];

interface AudioSettingsProps {
    onClose?: () => void;
    isOpen?: boolean;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ onClose, isOpen = true }) => {
    const [settings, setSettings] = useState<SettingsData>(SettingsService.getInstance().getSettings());
    const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
    const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
    const [isTestingInput, setIsTestingInput] = useState(false);
    const [inputLevel, setInputLevel] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load audio devices on component mount
    useEffect(() => {
        const loadDevices = async () => {
            try {
                const inputs = await audioDeviceManager.getInputDevices();
                const outputs = await audioDeviceManager.getOutputDevices();

                setInputDevices(inputs);
                setOutputDevices(outputs);
            } catch (err) {
                console.error('Failed to load audio devices:', err);
                setError('Failed to load audio devices. Please check your microphone permissions.');
            }
        };

        if (isOpen) {
            loadDevices();
        }

        // Listen for device changes
        const handleDevicesChanged = () => {
            loadDevices();
        };

        audioDeviceManager.on('devicesChanged', handleDevicesChanged);
        return () => {
            audioDeviceManager.off('devicesChanged');
        };
    }, [isOpen]);

    // Update settings handler
    const updateSettings = useCallback((updates: Partial<SettingsData>) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        SettingsService.getInstance().updateSettings(updates);
    }, [settings]);

    // Handle input device change
    const handleInputDeviceChange = async (deviceId: string) => {
        try {
            setError(null);
            await audioDeviceManager.setInputDevice(deviceId);
            updateSettings({ selectedInputDevice: deviceId });
        } catch (err) {
            console.error('Failed to set input device:', err);
            setError('Failed to set input device. Please try another device.');
        }
    };

    // Handle output device change
    const handleOutputDeviceChange = async (deviceId: string) => {
        try {
            setError(null);
            await audioDeviceManager.setOutputDevice(deviceId);
            updateSettings({ selectedOutputDevice: deviceId });
        } catch (err) {
            console.error('Failed to set output device:', err);
            setError('Failed to set output device. Please try another device.');
        }
    };

    // Test input device
    const testInputDevice = async () => {
        if (isTestingInput) return;

        setIsTestingInput(true);
        setError(null);

        try {
            // Create a simple input level monitor
            const stream = await audioDeviceManager.createInputStream();
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            source.connect(analyser);
            analyser.fftSize = 256;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateLevel = () => {
                if (!isTestingInput) return;

                analyser.getByteFrequencyData(dataArray);
                const level = Math.max(...dataArray) / 255;
                setInputLevel(level);

                requestAnimationFrame(updateLevel);
            };

            updateLevel();

            // Stop test after 5 seconds
            setTimeout(() => {
                setIsTestingInput(false);
                setInputLevel(0);
                stream.getTracks().forEach(track => track.stop());
                source.disconnect();
                analyser.disconnect();
                audioContext.close();
            }, 5000);

        } catch (err) {
            console.error('Failed to test input device:', err);
            setError('Failed to test microphone. Please check your device permissions.');
            setIsTestingInput(false);
        }
    };

    // Save all settings
    const saveSettings = async () => {
        setIsSaving(true);
        setError(null);

        try {
            // Apply audio device settings
            if (settings.selectedInputDevice !== audioDeviceManager.getSelectedInputDevice()) {
                await audioDeviceManager.setInputDevice(settings.selectedInputDevice);
            }

            if (settings.selectedOutputDevice !== audioDeviceManager.getSelectedOutputDevice()) {
                await audioDeviceManager.setOutputDevice(settings.selectedOutputDevice);
            }

            SettingsService.getInstance().updateSettings(settings);

            // Close settings panel after successful save
            setTimeout(() => {
                onClose?.();
            }, 500);

        } catch (err) {
            console.error('Failed to save settings:', err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="audio-settings-modal">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-white/20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-white flex items-center">
                            🎙️ Audio & Language Settings
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                            data-testid="close-settings-button"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
                        <div className="flex items-center">
                            <span className="text-lg mr-2">⚠️</span>
                            <span>{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto text-red-200 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                <div className="p-6 space-y-8">
                    {/* Language Selection */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">🌍 Language Preferences</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Primary Language for Voice Recognition
                            </label>
                            <select
                                value={settings.language}
                                onChange={(e) => updateSettings({ language: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                data-testid="language-select"
                            >
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <option key={lang.code} value={lang.code} className="bg-gray-800 text-white">
                                        {lang.flag} {lang.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-2">
                                This language will be used for speech recognition and AI responses.
                            </p>
                        </div>
                    </div>

                    {/* Audio Input Device */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">🎤 Input Device (Microphone)</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Select Microphone Device
                            </label>
                            <select
                                value={settings.selectedInputDevice}
                                onChange={(e) => handleInputDeviceChange(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                data-testid="input-device-select"
                            >
                                <option value="default" className="bg-gray-800 text-white">
                                    Default Microphone
                                </option>
                                {inputDevices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId} className="bg-gray-800 text-white">
                                        {device.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Input Level Test */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={testInputDevice}
                                disabled={isTestingInput}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${isTestingInput
                                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30'
                                    }`}
                                data-testid="test-input-button"
                            >
                                {isTestingInput ? '🎤 Testing...' : '🎤 Test Microphone'}
                            </button>

                            {isTestingInput && (
                                <div className="flex-1">
                                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-400 transition-all duration-100"
                                            style={{ width: `${inputLevel * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Speak into your microphone to test input levels
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Audio Output Device */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">🔊 Output Device (Speakers)</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Select Speaker/Headphone Device
                            </label>
                            <select
                                value={settings.selectedOutputDevice}
                                onChange={(e) => handleOutputDeviceChange(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                data-testid="output-device-select"
                            >
                                <option value="default" className="bg-gray-800 text-white">
                                    Default Speakers
                                </option>
                                {outputDevices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId} className="bg-gray-800 text-white">
                                        {device.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Voice Settings */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">🗣️ Voice Settings</h3>

                        {/* Voice Speed */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Voice Speed: {settings.voiceSpeed.toFixed(1)}x
                            </label>
                            <input
                                type="range"
                                min="0.5"
                                max="2.0"
                                step="0.1"
                                value={settings.voiceSpeed}
                                onChange={(e) => updateSettings({ voiceSpeed: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                data-testid="voice-speed-slider"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Slower</span>
                                <span>Normal</span>
                                <span>Faster</span>
                            </div>
                        </div>

                        {/* Audio Gain */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Audio Gain: {settings.audioGain.toFixed(1)}x
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="2.0"
                                step="0.1"
                                value={settings.audioGain}
                                onChange={(e) => updateSettings({ audioGain: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                data-testid="audio-gain-slider"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Quieter</span>
                                <span>Normal</span>
                                <span>Louder</span>
                            </div>
                        </div>

                        {/* Audio Processing Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div>
                                    <span className="text-sm font-medium text-gray-300">Noise Cancellation</span>
                                    <p className="text-xs text-gray-400 mt-1">Reduce background noise</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.noiseCancellation}
                                        onChange={(e) => updateSettings({ noiseCancellation: e.target.checked })}
                                        className="sr-only peer"
                                        data-testid="noise-cancellation-toggle"
                                    />
                                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div>
                                    <span className="text-sm font-medium text-gray-300">Echo Cancellation</span>
                                    <p className="text-xs text-gray-400 mt-1">Prevent audio feedback</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.echoCancellation}
                                        onChange={(e) => updateSettings({ echoCancellation: e.target.checked })}
                                        className="sr-only peer"
                                        data-testid="echo-cancellation-toggle"
                                    />
                                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white">⚙️ Advanced Settings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div>
                                    <span className="text-sm font-medium text-gray-300">Auto-Start Listening</span>
                                    <p className="text-xs text-gray-400 mt-1">Start listening when app opens</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.autoStartListening}
                                        onChange={(e) => updateSettings({ autoStartListening: e.target.checked })}
                                        className="sr-only peer"
                                        data-testid="auto-start-toggle"
                                    />
                                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                <div>
                                    <span className="text-sm font-medium text-gray-300">Enable Notifications</span>
                                    <p className="text-xs text-gray-400 mt-1">Show system notifications</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.enableNotifications}
                                        onChange={(e) => updateSettings({ enableNotifications: e.target.checked })}
                                        className="sr-only peer"
                                        data-testid="notifications-toggle"
                                    />
                                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                </label>
                            </div>
                        </div>

                        {/* Confidence Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Speech Recognition Confidence: {Math.round(settings.confidenceThreshold * 100)}%
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.05"
                                value={settings.confidenceThreshold}
                                onChange={(e) => updateSettings({ confidenceThreshold: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                data-testid="confidence-threshold-slider"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Less Accurate</span>
                                <span>Balanced</span>
                                <span>More Accurate</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/20 flex justify-between items-center">
                    <button
                        onClick={() => {
                            SettingsService.getInstance().resetSettings();
                            setSettings(SettingsService.getInstance().getSettings());
                        }}
                        className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg font-medium transition-all border border-gray-500/30"
                    >
                        Reset to Defaults
                    </button>

                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all border border-white/20"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveSettings}
                            disabled={isSaving}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${isSaving
                                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30'
                                }`}
                            data-testid="save-settings-button"
                        >
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Slider Styles */}
            <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          border: 2px solid #ffffff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          border: 2px solid #ffffff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
        }
      `}</style>
        </div>
    );
};

export default AudioSettings;
