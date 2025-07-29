/**
 * METU Desktop Client - Electron Application
 * 
 * Native desktop client for METU device server with:
 * - System tray integration
 * - Global hotkeys for voice activation
 * - Native OS integrations (notifications, file system)
 * - Always-on-top overlay mode
 * - Multi-monitor support
 * - Local audio processing with high-quality capture
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ipcRenderer } from 'electron';

// Desktop-specific interfaces
interface DesktopClientState {
    isConnected: boolean;
    isListening: boolean;
    isMinimized: boolean;
    overlayMode: boolean;
    currentServer: MetuDevice | null;
    availableServers: MetuDevice[];
    conversation: ConversationMessage[];
    systemTrayEnabled: boolean;
    globalHotkeysEnabled: boolean;
    notifications: DesktopNotification[];
    windowInfo: WindowInfo[];
    settings: DesktopSettings;
    audioLevels: {
        input: number;
        output: number;
    };
    error: string | null;
}

interface DesktopSettings {
    startOnBoot: boolean;
    minimizeToTray: boolean;
    globalHotkey: string;
    overlayTransparency: number;
    voiceThreshold: number;
    autoConnect: boolean;
    theme: 'light' | 'dark' | 'system';
    notifications: {
        enabled: boolean;
        sound: boolean;
        position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    };
    audio: {
        inputDevice: string;
        outputDevice: string;
        sampleRate: number;
        bufferSize: number;
        echoCancellation: boolean;
        noiseSuppression: boolean;
    };
}

interface DesktopNotification {
    id: string;
    title: string;
    body: string;
    timestamp: Date;
    type: 'info' | 'success' | 'warning' | 'error';
    action?: {
        label: string;
        callback: () => void;
    };
}

interface WindowInfo {
    handle: number;
    title: string;
    className: string;
    processName: string;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    isVisible: boolean;
    isMinimized: boolean;
}

interface MetuDevice {
    id: string;
    name: string;
    type: string;
    status: string;
    networkInfo: {
        ipAddress: string;
        port: number;
        hostname: string;
    };
    capabilities: string[];
    lastSeen: Date;
}

interface ConversationMessage {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    confidence?: number;
}

/**
 * Enhanced METU Desktop Client Component
 */
export const MetuDesktopClient: React.FC = () => {
    // State management
    const [state, setState] = useState<DesktopClientState>({
        isConnected: false,
        isListening: false,
        isMinimized: false,
        overlayMode: false,
        currentServer: null,
        availableServers: [],
        conversation: [],
        systemTrayEnabled: true,
        globalHotkeysEnabled: true,
        notifications: [],
        windowInfo: [],
        audioLevels: { input: 0, output: 0 },
        settings: {
            startOnBoot: false,
            minimizeToTray: true,
            globalHotkey: 'CommandOrControl+Shift+M',
            overlayTransparency: 0.9,
            voiceThreshold: 0.3,
            autoConnect: true,
            theme: 'system',
            notifications: {
                enabled: true,
                sound: true,
                position: 'top-right'
            },
            audio: {
                inputDevice: 'default',
                outputDevice: 'default',
                sampleRate: 44100,
                bufferSize: 1024,
                echoCancellation: true,
                noiseSuppression: true
            }
        },
        error: null
    });

    // Refs for audio and connection management
    const socketRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize desktop client
    useEffect(() => {
        initializeDesktopClient();
        setupElectronIPCHandlers();

        return () => {
            cleanup();
        };
    }, []);

    const initializeDesktopClient = useCallback(async () => {
        try {
            // Load settings from Electron store
            const savedSettings = await ipcRenderer.invoke('load-settings');
            if (savedSettings) {
                setState(prev => ({
                    ...prev,
                    settings: { ...prev.settings, ...savedSettings }
                }));
            }

            // Setup system tray
            await ipcRenderer.invoke('setup-system-tray');

            // Register global hotkeys
            if (state.settings.globalHotkey) {
                await ipcRenderer.invoke('register-global-hotkey', state.settings.globalHotkey);
            }

            // Auto-discover servers if enabled
            if (state.settings.autoConnect) {
                await discoverAndConnect();
            }

            // Start audio level monitoring
            startAudioLevelMonitoring();

        } catch (error) {
            console.error('Failed to initialize desktop client:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Initialization failed'
            }));
        }
    }, []);

    const setupElectronIPCHandlers = () => {
        // Handle global hotkey activation
        ipcRenderer.on('global-hotkey-pressed', () => {
            toggleListening();
        });

        // Handle system tray actions
        ipcRenderer.on('tray-action', (_, action: string) => {
            switch (action) {
                case 'toggle-listening':
                    toggleListening();
                    break;
                case 'show-window':
                    showWindow();
                    break;
                case 'hide-window':
                    hideWindow();
                    break;
                case 'toggle-overlay':
                    toggleOverlayMode();
                    break;
                case 'quit':
                    quitApplication();
                    break;
            }
        });

        // Handle window events
        ipcRenderer.on('window-will-close', () => {
            if (state.settings.minimizeToTray) {
                hideWindow();
            } else {
                quitApplication();
            }
        });

        // Handle system notifications response
        ipcRenderer.on('notification-clicked', (_, notificationId: string) => {
            const notification = state.notifications.find(n => n.id === notificationId);
            if (notification?.action) {
                notification.action.callback();
            }
        });

        // Handle window list updates
        ipcRenderer.on('window-list-updated', (_, windowList: WindowInfo[]) => {
            setState(prev => ({ ...prev, windowInfo: windowList }));
        });
    };

    const discoverAndConnect = async () => {
        try {
            setState(prev => ({ ...prev, error: null }));

            // Use Electron's network discovery capabilities
            const servers = await ipcRenderer.invoke('discover-metu-servers');

            setState(prev => ({ ...prev, availableServers: servers }));

            if (servers.length > 0) {
                await connectToServer(servers[0]);
            }

        } catch (error) {
            console.error('Discovery failed:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Discovery failed'
            }));
        }
    };

    const connectToServer = async (server: MetuDevice) => {
        try {
            // Use Electron's enhanced WebSocket with native optimizations
            const socket = await ipcRenderer.invoke('connect-to-server', {
                url: `ws://${server.networkInfo.ipAddress}:${server.networkInfo.port}`,
                options: {
                    headers: {
                        'User-Agent': 'METU-Desktop-Client/1.0'
                    }
                }
            });

            socketRef.current = socket;

            // Setup event handlers through IPC
            ipcRenderer.on('server-connected', () => {
                setState(prev => ({
                    ...prev,
                    isConnected: true,
                    currentServer: server,
                    error: null
                }));

                showNotification({
                    title: 'Connected',
                    body: `Connected to ${server.name}`,
                    type: 'success'
                });
            });

            ipcRenderer.on('server-disconnected', () => {
                setState(prev => ({
                    ...prev,
                    isConnected: false,
                    currentServer: null
                }));

                showNotification({
                    title: 'Disconnected',
                    body: 'Lost connection to METU server',
                    type: 'warning'
                });
            });

            ipcRenderer.on('conversation-message', (_, message: ConversationMessage) => {
                setState(prev => ({
                    ...prev,
                    conversation: [...prev.conversation, message]
                }));

                // Show notification for assistant messages
                if (message.type === 'assistant') {
                    showNotification({
                        title: 'METU Assistant',
                        body: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
                        type: 'info'
                    });
                }
            });

            ipcRenderer.on('automation-result', (_, result: any) => {
                showNotification({
                    title: 'Automation Complete',
                    body: `${result.action} executed successfully`,
                    type: 'success',
                    action: {
                        label: 'View Details',
                        callback: () => {
                            showWindow();
                            // Focus on automation results
                        }
                    }
                });
            });

        } catch (error) {
            console.error('Failed to connect to server:', error);
            throw error;
        }
    };

    const startAudioLevelMonitoring = () => {
        audioLevelIntervalRef.current = setInterval(async () => {
            try {
                const levels = await ipcRenderer.invoke('get-audio-levels');
                setState(prev => ({ ...prev, audioLevels: levels }));
            } catch (error) {
                console.error('Failed to get audio levels:', error);
            }
        }, 100) as unknown as NodeJS.Timeout;
    };

    const toggleListening = async () => {
        try {
            if (state.isListening) {
                await stopListening();
            } else {
                await startListening();
            }
        } catch (error) {
            console.error('Failed to toggle listening:', error);
        }
    };

    const startListening = async () => {
        try {
            setState(prev => ({ ...prev, error: null }));

            // Use Electron's native audio capture
            await ipcRenderer.invoke('start-audio-capture', {
                deviceId: state.settings.audio.inputDevice,
                sampleRate: state.settings.audio.sampleRate,
                bufferSize: state.settings.audio.bufferSize,
                echoCancellation: state.settings.audio.echoCancellation,
                noiseSuppression: state.settings.audio.noiseSuppression
            });

            setState(prev => ({ ...prev, isListening: true }));

            // Update system tray
            await ipcRenderer.invoke('update-tray-status', 'listening');

            addSystemMessage('Started listening...');

        } catch (error) {
            console.error('Failed to start listening:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to start listening'
            }));
        }
    };

    const stopListening = async () => {
        try {
            await ipcRenderer.invoke('stop-audio-capture');

            setState(prev => ({ ...prev, isListening: false }));

            // Update system tray
            await ipcRenderer.invoke('update-tray-status', 'idle');

            addSystemMessage('Stopped listening.');

        } catch (error) {
            console.error('Failed to stop listening:', error);
        }
    };

    const executeAutomation = async (action: string, parameters: any = {}) => {
        try {
            if (!state.isConnected) {
                throw new Error('Not connected to server');
            }

            // Use Electron's enhanced automation capabilities
            const result = await ipcRenderer.invoke('execute-automation', {
                action,
                parameters,
                timestamp: Date.now()
            });

            addSystemMessage(`Executed: ${action}`);

            return result;

        } catch (error) {
            console.error('Failed to execute automation:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Automation failed'
            }));
        }
    };

    const showNotification = (notification: Omit<DesktopNotification, 'id' | 'timestamp'>) => {
        const newNotification: DesktopNotification = {
            ...notification,
            id: `notification-${Date.now()}`,
            timestamp: new Date()
        };

        setState(prev => ({
            ...prev,
            notifications: [newNotification, ...prev.notifications].slice(0, 20)
        }));

        // Show native system notification
        ipcRenderer.invoke('show-system-notification', {
            title: notification.title,
            body: notification.body,
            type: notification.type,
            id: newNotification.id
        });
    };

    const toggleOverlayMode = async () => {
        try {
            const newOverlayMode = !state.overlayMode;

            await ipcRenderer.invoke('set-overlay-mode', {
                enabled: newOverlayMode,
                transparency: state.settings.overlayTransparency
            });

            setState(prev => ({ ...prev, overlayMode: newOverlayMode }));

        } catch (error) {
            console.error('Failed to toggle overlay mode:', error);
        }
    };

    const showWindow = async () => {
        await ipcRenderer.invoke('show-window');
        setState(prev => ({ ...prev, isMinimized: false }));
    };

    const hideWindow = async () => {
        await ipcRenderer.invoke('hide-window');
        setState(prev => ({ ...prev, isMinimized: true }));
    };

    const quitApplication = async () => {
        await cleanup();
        await ipcRenderer.invoke('quit-application');
    };

    const addSystemMessage = (content: string) => {
        const message: ConversationMessage = {
            id: `system-${Date.now()}`,
            type: 'system',
            content,
            timestamp: new Date()
        };

        setState(prev => ({
            ...prev,
            conversation: [...prev.conversation, message]
        }));
    };

    const saveSettings = async (newSettings: Partial<DesktopSettings>) => {
        const updatedSettings = { ...state.settings, ...newSettings };

        await ipcRenderer.invoke('save-settings', updatedSettings);

        setState(prev => ({ ...prev, settings: updatedSettings }));
    };

    const cleanup = async () => {
        if (audioLevelIntervalRef.current) {
            clearInterval(audioLevelIntervalRef.current);
        }

        if (state.isListening) {
            await stopListening();
        }

        if (socketRef.current) {
            await ipcRenderer.invoke('disconnect-from-server');
        }
    };

    // Render desktop interface
    return (
        <div className={`min-h-screen transition-all duration-300 ${state.overlayMode
                ? 'bg-black bg-opacity-10 backdrop-blur-sm'
                : 'bg-gradient-to-br from-gray-50 to-blue-50'
            }`}>
            <div className={`max-w-4xl mx-auto p-6 ${state.overlayMode ? 'opacity-90' : ''}`}>
                {/* Header */}
                <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">METU Desktop</h1>
                            <p className="text-gray-600 mt-1">
                                {state.currentServer
                                    ? `Connected to ${state.currentServer.name}`
                                    : 'Not connected'
                                }
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Connection Status */}
                            <div className={`w-3 h-3 rounded-full ${state.isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`} />

                            {/* Audio Level Indicators */}
                            <div className="flex items-center space-x-2">
                                <div className="text-xs text-gray-600">IN</div>
                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-100"
                                        style={{ width: `${state.audioLevels.input * 100}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-600">OUT</div>
                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-100"
                                        style={{ width: `${state.audioLevels.output * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Overlay Toggle */}
                            <button
                                onClick={toggleOverlayMode}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${state.overlayMode
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Overlay
                            </button>
                        </div>
                    </div>
                </header>

                {/* Error Display */}
                {state.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{state.error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Controls */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Voice Control */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Control</h2>

                            <div className="flex items-center space-x-4 mb-4">
                                <button
                                    onClick={toggleListening}
                                    disabled={!state.isConnected}
                                    className={`px-8 py-4 rounded-lg font-medium text-lg transition-all transform hover:scale-105 ${state.isListening
                                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200'
                                            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none'
                                        }`}
                                >
                                    {state.isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
                                </button>

                                <div className="text-sm text-gray-600">
                                    Hotkey: {state.settings.globalHotkey}
                                </div>
                            </div>

                            {state.isListening && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                        <span className="text-green-800">Listening for voice input...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Desktop Automation */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Desktop Automation</h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <button
                                    onClick={() => executeAutomation('focus_window', { title: 'VS Code' })}
                                    disabled={!state.isConnected}
                                    className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Focus VS Code
                                </button>

                                <button
                                    onClick={() => executeAutomation('take_screenshot')}
                                    disabled={!state.isConnected}
                                    className="px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Screenshot
                                </button>

                                <button
                                    onClick={() => executeAutomation('list_windows')}
                                    disabled={!state.isConnected}
                                    className="px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    List Windows
                                </button>

                                <button
                                    onClick={() => executeAutomation('minimize_all')}
                                    disabled={!state.isConnected}
                                    className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Minimize All
                                </button>

                                <button
                                    onClick={() => executeAutomation('lock_screen')}
                                    disabled={!state.isConnected}
                                    className="px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Lock Screen
                                </button>

                                <button
                                    onClick={() => executeAutomation('open_file_explorer')}
                                    disabled={!state.isConnected}
                                    className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    File Explorer
                                </button>
                            </div>
                        </div>

                        {/* Conversation History */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversation</h2>

                            <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-3">
                                {state.conversation.length === 0 ? (
                                    <p className="text-gray-500 text-center">No conversation yet...</p>
                                ) : (
                                    state.conversation.slice(-10).map(message => (
                                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                                            }`}>
                                            <div className={`max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                                                    ? 'bg-blue-500 text-white'
                                                    : message.type === 'assistant'
                                                        ? 'bg-gray-200 text-gray-900'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                <p className="text-sm">{message.content}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs opacity-75">
                                                        {message.timestamp.toLocaleTimeString()}
                                                    </p>
                                                    {message.confidence && (
                                                        <p className="text-xs opacity-75">
                                                            {Math.round(message.confidence * 100)}%
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* System Status */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">System Tray</span>
                                    <span className={`text-xs px-2 py-1 rounded ${state.systemTrayEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {state.systemTrayEnabled ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Global Hotkeys</span>
                                    <span className={`text-xs px-2 py-1 rounded ${state.globalHotkeysEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {state.globalHotkeysEnabled ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Overlay Mode</span>
                                    <span className={`text-xs px-2 py-1 rounded ${state.overlayMode ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {state.overlayMode ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Notifications */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>

                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {state.notifications.slice(0, 5).map(notification => (
                                    <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                                        <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                                        <p className="text-xs text-gray-600 mt-1">{notification.body}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {notification.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                ))}

                                {state.notifications.length === 0 && (
                                    <p className="text-gray-500 text-sm text-center">No notifications</p>
                                )}
                            </div>
                        </div>

                        {/* Quick Settings */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Settings</h3>

                            <div className="space-y-3">
                                <button
                                    onClick={showWindow}
                                    className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                                >
                                    Show Window
                                </button>

                                <button
                                    onClick={hideWindow}
                                    className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                                >
                                    Hide to Tray
                                </button>

                                <button
                                    onClick={() => ipcRenderer.invoke('open-settings')}
                                    className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
                                >
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetuDesktopClient;
