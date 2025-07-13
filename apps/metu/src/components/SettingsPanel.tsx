import React, { useState, useEffect, useCallback } from 'react';

interface AudioDevice {
    deviceId: string;
    label: string;
    kind: 'audioinput' | 'audiooutput';
}

interface MCPConfig {
    memorai: {
        enabled: boolean;
        agentId: string;
        contextSize: number;
    };
    glass: {
        enabled: boolean;
        windowManagement: boolean;
    };
    romai: {
        enabled: boolean;
        language: 'ro' | 'en';
        domain: string;
    };
    playwright: {
        enabled: boolean;
        headless: boolean;
        timeout: number;
    };
}

interface SettingsData {
    language: string;
    confidenceThreshold: number;
    autoStartListening: boolean;
    enableNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    voiceSpeed: number;
    enableKeywordWakeup: boolean;
    wakeupKeyword: string;
    // Audio Settings
    selectedInputDevice: string;
    selectedOutputDevice: string;
    audioGain: number;
    noiseCancellation: boolean;
    echoCancellation: boolean;
    // MCP Configuration
    mcpConfig: MCPConfig;
}

interface SettingsPanelProps {
    isOpen: boolean;
    onToggle: () => void;
    settings: SettingsData;
    onSettingsChange: (settings: SettingsData) => void;
    className?: string;
}

// Simple SVG icons
const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    isOpen,
    onToggle,
    settings,
    onSettingsChange,
    className = ''
}) => {
    const [localSettings, setLocalSettings] = useState<SettingsData>({
        ...settings,
        // Default audio settings if not present
        selectedInputDevice: (settings as any).selectedInputDevice || 'default',
        selectedOutputDevice: (settings as any).selectedOutputDevice || 'default',
        audioGain: (settings as any).audioGain || 1.0,
        noiseCancellation: (settings as any).noiseCancellation || true,
        echoCancellation: (settings as any).echoCancellation || true,
        // Default MCP configuration
        mcpConfig: (settings as any).mcpConfig || {
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
                language: 'en',
                domain: 'technology'
            },
            playwright: {
                enabled: true,
                headless: false,
                timeout: 30000
            }
        }
    });

    const [audioDevices, setAudioDevices] = useState<{
        input: AudioDevice[];
        output: AudioDevice[];
    }>({ input: [], output: [] });

    const [mcpConfigText, setMcpConfigText] = useState<string>('');
    const [mcpConfigError, setMcpConfigError] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'mcp'>('general');

    // Initialize audio devices
    useEffect(() => {
        const getAudioDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const inputDevices: AudioDevice[] = [];
                const outputDevices: AudioDevice[] = [];

                devices.forEach(device => {
                    if (device.kind === 'audioinput') {
                        inputDevices.push({
                            deviceId: device.deviceId,
                            label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
                            kind: 'audioinput'
                        });
                    } else if (device.kind === 'audiooutput') {
                        outputDevices.push({
                            deviceId: device.deviceId,
                            label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
                            kind: 'audiooutput'
                        });
                    }
                });

                setAudioDevices({ input: inputDevices, output: outputDevices });
            } catch (error) {
                console.error('Failed to enumerate audio devices:', error);
            }
        };

        if (isOpen) {
            getAudioDevices();
        }
    }, [isOpen]);

    // Sync MCP config with text editor
    useEffect(() => {
        setMcpConfigText(JSON.stringify(localSettings.mcpConfig, null, 2));
        setMcpConfigError('');
    }, [localSettings.mcpConfig]);

    const handleSettingChange = (key: keyof SettingsData, value: any) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);
        onSettingsChange(newSettings);
    };

    const handleMcpConfigChange = useCallback((newConfigText: string) => {
        setMcpConfigText(newConfigText);
        try {
            const parsedConfig = JSON.parse(newConfigText);
            setMcpConfigError('');
            handleSettingChange('mcpConfig', parsedConfig);
        } catch (error) {
            setMcpConfigError(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, []);

    const testAudioDevice = useCallback(async (device: AudioDevice) => {
        try {
            if (device.kind === 'audioinput') {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: device.deviceId }
                });
                // Brief test
                setTimeout(() => {
                    stream.getTracks().forEach(track => track.stop());
                }, 1000);
            } else {
                // Test output device with a brief tone
                const audioContext = new AudioContext();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            }
        } catch (error) {
            console.error('Audio device test failed:', error);
        }
    }, []);

    const languages = [
        { code: 'en-US', name: '🇺🇸 English (US)' },
        { code: 'en-GB', name: '🇬🇧 English (UK)' },
        { code: 'es-ES', name: '🇪🇸 Spanish' },
        { code: 'fr-FR', name: '🇫🇷 French' },
        { code: 'de-DE', name: '🇩🇪 German' },
        { code: 'it-IT', name: '🇮🇹 Italian' },
        { code: 'pt-BR', name: '🇧🇷 Portuguese' },
        { code: 'ru-RU', name: '🇷🇺 Russian' },
        { code: 'ja-JP', name: '🇯🇵 Japanese' },
        { code: 'ko-KR', name: '🇰🇷 Korean' },
        { code: 'zh-CN', name: '🇨🇳 Chinese' },
        { code: 'ro-RO', name: '🇷🇴 Romanian' },
    ];

    return (
        <>
            {/* Settings Button */}
            <button
                onClick={onToggle}
                className={`
          fixed top-6 right-6 z-50
          w-12 h-12 rounded-full shadow-lg
          bg-gradient-to-r from-gray-500 to-gray-600
          hover:from-gray-600 hover:to-gray-700
          text-white transition-all duration-300
          transform hover:scale-110 active:scale-95
          flex items-center justify-center
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
            >
                {isOpen ? <CloseIcon /> : <SettingsIcon />}
            </button>

            {/* Panel */}
            <div className={`
        fixed top-0 right-0 z-30 h-full w-80 max-w-sm
        bg-white/95 backdrop-blur-md border-l border-gray-200
        shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${className}
      `}>
                <div className="h-full overflow-y-auto">
                    {/* Header with Tabs */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="text-gray-600">
                                <SettingsIcon />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">METU Settings</h2>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            🔧 General
                        </button>
                        <button
                            onClick={() => setActiveTab('audio')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'audio'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            🎤 Audio
                        </button>
                        <button
                            onClick={() => setActiveTab('mcp')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'mcp'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            🔌 MCP Config
                        </button>
                    </div>

                    {/* Settings Content */}
                    <div className="p-6 space-y-6 h-full overflow-y-auto">

                        {/* General Settings Tab */}
                        {activeTab === 'general' && (
                            <div className="grid grid-cols-1 gap-6">

                                {/* Language Selection */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Voice Recognition Language
                                    </label>
                                    <select
                                        value={localSettings.language}
                                        onChange={(e) => handleSettingChange('language', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Theme Selection */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Theme
                                    </label>
                                    <select
                                        value={localSettings.theme}
                                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        <option value="light">☀️ Light</option>
                                        <option value="dark">🌙 Dark</option>
                                        <option value="auto">🌗 Auto</option>
                                    </select>
                                </div>

                                {/* Confidence Threshold */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confidence Threshold: {Math.round(localSettings.confidenceThreshold * 100)}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0.3"
                                        max="1"
                                        step="0.05"
                                        value={localSettings.confidenceThreshold}
                                        onChange={(e) => handleSettingChange('confidenceThreshold', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>More Permissive</span>
                                        <span>More Strict</span>
                                    </div>
                                </div>

                                {/* Voice Speed */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Voice Response Speed: {localSettings.voiceSpeed}x
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={localSettings.voiceSpeed}
                                        onChange={(e) => handleSettingChange('voiceSpeed', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Slow</span>
                                        <span>Fast</span>
                                    </div>
                                </div>

                                {/* Wakeup Keyword */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Wakeup Keyword
                                    </label>
                                    <input
                                        type="text"
                                        value={localSettings.wakeupKeyword}
                                        onChange={(e) => handleSettingChange('wakeupKeyword', e.target.value)}
                                        placeholder="e.g., Hey METU"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>

                                {/* Toggles */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={localSettings.autoStartListening}
                                            onChange={(e) => handleSettingChange('autoStartListening', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Auto-start listening</span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={localSettings.enableNotifications}
                                            onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Enable notifications</span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={localSettings.enableKeywordWakeup}
                                            onChange={(e) => handleSettingChange('enableKeywordWakeup', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Keyword wakeup</span>
                                    </label>

                                </div>
                            </div>
                        )}

                        {/* Audio Settings Tab */}
                        {activeTab === 'audio' && (
                            <div className="space-y-6">

                                {/* Input Device Selection */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        🎤 Microphone
                                    </label>
                                    <select
                                        value={localSettings.selectedInputDevice}
                                        onChange={(e) => handleSettingChange('selectedInputDevice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        <option value="default">System Default</option>
                                        {audioDevices.input.map((device) => (
                                            <option key={device.deviceId} value={device.deviceId}>
                                                {device.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            const device = audioDevices.input.find(d => d.deviceId === localSettings.selectedInputDevice);
                                            if (device) testAudioDevice(device);
                                        }}
                                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                    >
                                        Test Microphone
                                    </button>
                                </div>

                                {/* Output Device Selection */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        🔊 Speakers
                                    </label>
                                    <select
                                        value={localSettings.selectedOutputDevice}
                                        onChange={(e) => handleSettingChange('selectedOutputDevice', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        <option value="default">System Default</option>
                                        {audioDevices.output.map((device) => (
                                            <option key={device.deviceId} value={device.deviceId}>
                                                {device.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            const device = audioDevices.output.find(d => d.deviceId === localSettings.selectedOutputDevice);
                                            if (device) testAudioDevice(device);
                                        }}
                                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                    >
                                        Test Speakers
                                    </button>
                                </div>

                                {/* Audio Gain */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Audio Gain: {localSettings.audioGain}x
                                    </label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="3"
                                        step="0.1"
                                        value={localSettings.audioGain}
                                        onChange={(e) => handleSettingChange('audioGain', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Quiet</span>
                                        <span>Loud</span>
                                    </div>
                                </div>

                                {/* Audio Processing Options */}
                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700">Audio Processing</h4>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={localSettings.noiseCancellation}
                                            onChange={(e) => handleSettingChange('noiseCancellation', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Noise Cancellation</span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={localSettings.echoCancellation}
                                            onChange={(e) => handleSettingChange('echoCancellation', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Echo Cancellation</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* MCP Configuration Tab */}
                        {activeTab === 'mcp' && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Model Context Protocol Configuration</h4>
                                    <p className="text-xs text-blue-700">
                                        Configure MCP services: Memorai (memory), Glass (window management), Romai (Romanian AI), and Playwright (automation).
                                    </p>
                                </div>

                                {/* JSON Editor */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        MCP Services Configuration (JSON)
                                    </label>
                                    <textarea
                                        value={mcpConfigText}
                                        onChange={(e) => handleMcpConfigChange(e.target.value)}
                                        className={`w-full h-80 px-3 py-2 font-mono text-xs border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${mcpConfigError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter MCP configuration as JSON..."
                                    />
                                    {mcpConfigError && (
                                        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                            {mcpConfigError}
                                        </div>
                                    )}
                                </div>

                                {/* Quick MCP Service Controls */}
                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700">Quick Controls</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={localSettings.mcpConfig.memorai.enabled}
                                                onChange={(e) => handleSettingChange('mcpConfig', {
                                                    ...localSettings.mcpConfig,
                                                    memorai: { ...localSettings.mcpConfig.memorai, enabled: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">🧠 Memorai</span>
                                        </label>

                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={localSettings.mcpConfig.glass.enabled}
                                                onChange={(e) => handleSettingChange('mcpConfig', {
                                                    ...localSettings.mcpConfig,
                                                    glass: { ...localSettings.mcpConfig.glass, enabled: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">🪟 Glass</span>
                                        </label>

                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={localSettings.mcpConfig.romai.enabled}
                                                onChange={(e) => handleSettingChange('mcpConfig', {
                                                    ...localSettings.mcpConfig,
                                                    romai: { ...localSettings.mcpConfig.romai, enabled: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">🇷🇴 Romai</span>
                                        </label>

                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={localSettings.mcpConfig.playwright.enabled}
                                                onChange={(e) => handleSettingChange('mcpConfig', {
                                                    ...localSettings.mcpConfig,
                                                    playwright: { ...localSettings.mcpConfig.playwright, enabled: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">🎭 Playwright</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                    onClick={onToggle}
                />
            )}
        </>
    );
};

export default SettingsPanel;
