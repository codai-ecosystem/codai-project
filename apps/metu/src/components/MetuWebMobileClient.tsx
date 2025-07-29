/**
 * METU Web Mobile Client - PWA-Compatible
 * 
 * Mobile-optimized web client for METU device server with:
 * - Touch-optimized interface for mobile browsers
 * - Web Audio API for voice capture
 * - Service Worker for offline functionality
 * - Push notification support
 * - Responsive design for all screen sizes
 * - Progressive Web App features
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Web mobile-specific interfaces
interface WebMobileClientState {
    isConnected: boolean;
    isListening: boolean;
    isRecording: boolean;
    isPWAInstalled: boolean;
    currentServer: MetuDevice | null;
    availableServers: MetuDevice[];
    conversation: ConversationMessage[];
    networkInfo: WebNetworkInfo;
    permissions: WebPermissions;
    settings: WebMobileSettings;
    audioLevels: {
        input: number;
        output: number;
    };
    gestures: WebGestureState;
    notifications: WebNotification[];
    offlineQueue: OfflineAction[];
    error: string | null;
}

interface WebMobileSettings {
    pushNotifications: boolean;
    hapticFeedback: boolean;
    voiceActivation: boolean;
    autoDiscovery: boolean;
    audioQuality: 'low' | 'medium' | 'high';
    gestureControls: boolean;
    theme: 'light' | 'dark' | 'auto';
    offlineMode: boolean;
    touchSensitivity: number;
    swipeThreshold: number;
}

interface WebPermissions {
    microphone: boolean;
    notifications: boolean;
    serviceWorker: boolean;
    camera: boolean;
}

interface WebNetworkInfo {
    type: string;
    isOnline: boolean;
    effectiveType: string;
    downlink: number;
}

interface WebGestureState {
    isLongPress: boolean;
    swipeDirection: 'none' | 'up' | 'down' | 'left' | 'right';
    touchStartTime: number;
    touchStartPosition: { x: number; y: number };
}

interface WebNotification {
    id: string;
    title: string;
    body: string;
    timestamp: Date;
    type: 'automation' | 'connection' | 'system' | 'alert';
    priority: 'low' | 'normal' | 'high';
}

interface OfflineAction {
    id: string;
    type: string;
    data: any;
    timestamp: Date;
    synced: boolean;
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
    offline?: boolean;
}

/**
 * Enhanced METU Web Mobile Client Component
 */
export const MetuWebMobileClient: React.FC = () => {
    // State management
    const [state, setState] = useState<WebMobileClientState>({
        isConnected: false,
        isListening: false,
        isRecording: false,
        isPWAInstalled: false,
        currentServer: null,
        availableServers: [],
        conversation: [],
        networkInfo: {
            type: 'unknown',
            isOnline: navigator.onLine,
            effectiveType: 'unknown',
            downlink: 0
        },
        permissions: {
            microphone: false,
            notifications: false,
            serviceWorker: false,
            camera: false
        },
        settings: {
            pushNotifications: true,
            hapticFeedback: true,
            voiceActivation: false,
            autoDiscovery: true,
            audioQuality: 'medium',
            gestureControls: true,
            theme: 'auto',
            offlineMode: false,
            touchSensitivity: 0.5,
            swipeThreshold: 50
        },
        audioLevels: { input: 0, output: 0 },
        gestures: {
            isLongPress: false,
            swipeDirection: 'none',
            touchStartTime: 0,
            touchStartPosition: { x: 0, y: 0 }
        },
        notifications: [],
        offlineQueue: [],
        error: null
    });

    // Refs for audio and gesture handling
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const serviceWorkerRef = useRef<ServiceWorker | null>(null);
    const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize mobile client
    useEffect(() => {
        initializeWebMobileClient();
        setupServiceWorker();
        setupNetworkMonitoring();
        setupGestureHandlers();

        return () => {
            cleanup();
        };
    }, []);

    const initializeWebMobileClient = async () => {
        try {
            // Check if running as PWA
            const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone ||
                document.referrer.includes('android-app://');

            setState(prev => ({ ...prev, isPWAInstalled: isPWA }));

            // Load settings from localStorage
            await loadSettings();

            // Request permissions
            await requestPermissions();

            // Setup push notifications
            if (state.settings.pushNotifications) {
                await setupPushNotifications();
            }

            // Setup haptic feedback
            setupHapticFeedback();

            // Start auto-discovery if enabled
            if (state.settings.autoDiscovery) {
                await discoverDevices();
            }

            // Initialize audio context
            setupAudioContext();

        } catch (error) {
            console.error('Failed to initialize web mobile client:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Initialization failed'
            }));
        }
    };

    const requestPermissions = async () => {
        try {
            const permissions: Partial<WebPermissions> = {};

            // Microphone permission
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                permissions.microphone = true;
            } catch {
                permissions.microphone = false;
            }

            // Notification permission
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                permissions.notifications = permission === 'granted';
            }

            // Service Worker support
            permissions.serviceWorker = 'serviceWorker' in navigator;

            // Camera permission (for future use)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());
                permissions.camera = true;
            } catch {
                permissions.camera = false;
            }

            setState(prev => ({
                ...prev,
                permissions: { ...prev.permissions, ...permissions }
            }));

        } catch (error) {
            console.error('Failed to request permissions:', error);
        }
    };

    const setupServiceWorker = async () => {
        if (!('serviceWorker' in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            serviceWorkerRef.current = registration.active;

            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            showWebNotification({
                                title: 'App Updated',
                                body: 'METU has been updated to the latest version',
                                type: 'system',
                                priority: 'normal'
                            });
                        }
                    });
                }
            });

            // Handle messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                const { type, data } = event.data;

                switch (type) {
                    case 'offline-action-queued':
                        setState(prev => ({
                            ...prev,
                            offlineQueue: [...prev.offlineQueue, data]
                        }));
                        break;

                    case 'background-sync-completed':
                        syncOfflineActions();
                        break;
                }
            });

        } catch (error) {
            console.error('Failed to setup service worker:', error);
        }
    };

    const setupPushNotifications = async () => {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        try {
            // Register for push notifications if supported
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with actual VAPID key
                });

                // Send subscription to server
                console.log('Push subscription:', subscription);
            }
        } catch (error) {
            console.error('Failed to setup push notifications:', error);
        }
    };

    const setupHapticFeedback = () => {
        // Use Vibration API for haptic feedback
        if (!('vibrate' in navigator)) {
            setState(prev => ({
                ...prev,
                settings: { ...prev.settings, hapticFeedback: false }
            }));
        }
    };

    const setupAudioContext = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();

            // Setup audio level monitoring
            setInterval(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    // Simulate audio level for demo
                    const inputLevel = Math.random() * 0.8;
                    setState(prev => ({
                        ...prev,
                        audioLevels: { ...prev.audioLevels, input: inputLevel }
                    }));
                }
            }, 100);

        } catch (error) {
            console.error('Failed to setup audio context:', error);
        }
    };

    const setupNetworkMonitoring = () => {
        const updateNetworkInfo = () => {
            const connection = (navigator as any).connection ||
                (navigator as any).mozConnection ||
                (navigator as any).webkitConnection;

            const networkInfo: WebNetworkInfo = {
                type: connection?.type || 'unknown',
                isOnline: navigator.onLine,
                effectiveType: connection?.effectiveType || 'unknown',
                downlink: connection?.downlink || 0
            };

            setState(prev => ({ ...prev, networkInfo }));
        };

        window.addEventListener('online', updateNetworkInfo);
        window.addEventListener('offline', updateNetworkInfo);

        if ((navigator as any).connection) {
            (navigator as any).connection.addEventListener('change', updateNetworkInfo);
        }

        updateNetworkInfo();
    };

    const setupGestureHandlers = () => {
        const handleTouchStart = (e: TouchEvent) => {
            if (!state.settings.gestureControls) return;

            const touch = e.touches[0];
            setState(prev => ({
                ...prev,
                gestures: {
                    ...prev.gestures,
                    touchStartTime: Date.now(),
                    touchStartPosition: { x: touch.clientX, y: touch.clientY }
                }
            }));

            // Setup long press detection
            gestureTimeoutRef.current = setTimeout(() => {
                handleLongPress();
            }, 500);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (gestureTimeoutRef.current) {
                clearTimeout(gestureTimeoutRef.current);
                gestureTimeoutRef.current = null;
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!state.settings.gestureControls) return;

            if (gestureTimeoutRef.current) {
                clearTimeout(gestureTimeoutRef.current);
                gestureTimeoutRef.current = null;
            }

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - state.gestures.touchStartPosition.x;
            const deltaY = touch.clientY - state.gestures.touchStartPosition.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > state.settings.swipeThreshold) {
                let swipeDirection: 'up' | 'down' | 'left' | 'right';

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    swipeDirection = deltaX > 0 ? 'right' : 'left';
                } else {
                    swipeDirection = deltaY > 0 ? 'down' : 'up';
                }

                handleSwipeGesture(swipeDirection);
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
    };

    const discoverDevices = async () => {
        try {
            // Use fetch to discover devices on local network
            const discoveredDevices: MetuDevice[] = [];

            // This would typically scan common ports or use mDNS
            const commonPorts = [4000, 4001, 4002, 4003];
            const localIP = await getLocalIP();
            const baseIP = localIP.substring(0, localIP.lastIndexOf('.'));

            for (let i = 1; i <= 254; i++) {
                const ip = `${baseIP}.${i}`;

                for (const port of commonPorts) {
                    try {
                        const response = await fetch(`http://${ip}:${port}/api/status`, {
                            method: 'GET',
                            timeout: 1000
                        } as any);

                        if (response.ok) {
                            const deviceInfo = await response.json();
                            discoveredDevices.push({
                                id: deviceInfo.id || `${ip}:${port}`,
                                name: deviceInfo.name || `METU Device`,
                                type: deviceInfo.type || 'unknown',
                                status: 'online',
                                networkInfo: { ipAddress: ip, port, hostname: ip },
                                capabilities: deviceInfo.capabilities || [],
                                lastSeen: new Date()
                            });
                        }
                    } catch {
                        // Ignore connection errors during discovery
                    }
                }
            }

            setState(prev => ({ ...prev, availableServers: discoveredDevices }));

            // Auto-connect to first available device
            if (discoveredDevices.length > 0 && !state.currentServer) {
                await connectToServer(discoveredDevices[0]);
            }

        } catch (error) {
            console.error('Device discovery failed:', error);
        }
    };

    const getLocalIP = async (): Promise<string> => {
        return new Promise((resolve) => {
            const rtc = new RTCPeerConnection({ iceServers: [] });
            rtc.createDataChannel('');

            rtc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidate = event.candidate.candidate;
                    const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
                    if (match) {
                        resolve(match[1]);
                        rtc.close();
                    }
                }
            };

            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));

            // Fallback
            setTimeout(() => resolve('192.168.1.100'), 1000);
        });
    };

    const connectToServer = async (server: MetuDevice) => {
        try {
            setState(prev => ({ ...prev, error: null }));

            const ws = new WebSocket(`ws://${server.networkInfo.ipAddress}:${server.networkInfo.port}`);

            ws.onopen = () => {
                socketRef.current = ws;
                setState(prev => ({
                    ...prev,
                    isConnected: true,
                    currentServer: server,
                    error: null
                }));

                showWebNotification({
                    title: 'Connected',
                    body: `Connected to ${server.name}`,
                    type: 'connection',
                    priority: 'normal'
                });

                if (state.settings.hapticFeedback) {
                    navigator.vibrate?.(100);
                }
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    handleServerMessage(message);
                } catch (error) {
                    console.error('Failed to parse server message:', error);
                }
            };

            ws.onclose = () => {
                setState(prev => ({
                    ...prev,
                    isConnected: false,
                    currentServer: null
                }));

                showWebNotification({
                    title: 'Disconnected',
                    body: 'Lost connection to METU server',
                    type: 'connection',
                    priority: 'high'
                });
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setState(prev => ({
                    ...prev,
                    error: 'Connection failed'
                }));
            };

        } catch (error) {
            console.error('Failed to connect:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Connection failed'
            }));
        }
    };

    const startListening = async () => {
        if (!state.permissions.microphone) {
            alert('Microphone access is required for voice input.');
            return;
        }

        try {
            setState(prev => ({ ...prev, error: null }));

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: state.settings.audioQuality === 'high' ? 44100 :
                        state.settings.audioQuality === 'medium' ? 22050 : 11025,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            const options = {
                mimeType: 'audio/webm;codecs=opus'
            };

            mediaRecorderRef.current = new MediaRecorder(stream, options);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0 && socketRef.current) {
                    // Send audio data to server
                    socketRef.current.send(event.data);
                }
            };

            mediaRecorderRef.current.start(100); // Send data every 100ms

            setState(prev => ({
                ...prev,
                isListening: true,
                isRecording: true
            }));

            if (state.settings.hapticFeedback) {
                navigator.vibrate?.(50);
            }

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
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                mediaRecorderRef.current = null;
            }

            setState(prev => ({
                ...prev,
                isListening: false,
                isRecording: false
            }));

            if (state.settings.hapticFeedback) {
                navigator.vibrate?.(100);
            }

            addSystemMessage('Stopped listening.');

        } catch (error) {
            console.error('Failed to stop listening:', error);
        }
    };

    const executeAutomation = async (action: string, parameters: any = {}) => {
        try {
            const automationAction: OfflineAction = {
                id: `automation-${Date.now()}`,
                type: 'automation',
                data: { action, parameters },
                timestamp: new Date(),
                synced: false
            };

            if (state.isConnected && socketRef.current) {
                // Send immediately if connected
                socketRef.current.send(JSON.stringify({
                    type: 'automation',
                    action,
                    parameters,
                    timestamp: Date.now()
                }));

                automationAction.synced = true;
                addSystemMessage(`Executed: ${action}`);
            } else {
                // Queue for offline sync
                setState(prev => ({
                    ...prev,
                    offlineQueue: [...prev.offlineQueue, automationAction]
                }));

                // Store in service worker for background sync
                if (serviceWorkerRef.current) {
                    serviceWorkerRef.current.postMessage({
                        type: 'queue-offline-action',
                        data: automationAction
                    });
                }

                addSystemMessage(`Queued: ${action} (offline)`);
            }

            if (state.settings.hapticFeedback) {
                navigator.vibrate?.([50, 100, 50]);
            }

        } catch (error) {
            console.error('Failed to execute automation:', error);
        }
    };

    const handleLongPress = () => {
        if (state.settings.gestureControls) {
            if (state.isListening) {
                stopListening();
            } else {
                startListening();
            }

            setState(prev => ({
                ...prev,
                gestures: { ...prev.gestures, isLongPress: true }
            }));

            if (state.settings.hapticFeedback) {
                navigator.vibrate?.(200);
            }
        }
    };

    const handleSwipeGesture = (direction: 'up' | 'down' | 'left' | 'right') => {
        if (!state.settings.gestureControls) return;

        setState(prev => ({
            ...prev,
            gestures: { ...prev.gestures, swipeDirection: direction }
        }));

        switch (direction) {
            case 'up':
                executeAutomation('minimize_all');
                break;
            case 'down':
                executeAutomation('show_desktop');
                break;
            case 'left':
                executeAutomation('previous_window');
                break;
            case 'right':
                executeAutomation('next_window');
                break;
        }

        if (state.settings.hapticFeedback) {
            navigator.vibrate?.(100);
        }

        // Reset gesture state
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                gestures: { ...prev.gestures, swipeDirection: 'none' }
            }));
        }, 300);
    };

    const handleServerMessage = (message: any) => {
        switch (message.type) {
            case 'conversation':
                const conversationMessage: ConversationMessage = {
                    id: message.id,
                    type: message.messageType,
                    content: message.content,
                    timestamp: new Date(message.timestamp),
                    confidence: message.confidence
                };

                setState(prev => ({
                    ...prev,
                    conversation: [...prev.conversation, conversationMessage]
                }));

                // Show browser notification for assistant messages
                if (message.messageType === 'assistant' && state.permissions.notifications) {
                    new Notification('METU Assistant', {
                        body: message.content.substring(0, 100),
                        icon: '/icon-192x192.png',
                        tag: 'metu-assistant'
                    });
                }
                break;

            case 'automation_result':
                showWebNotification({
                    title: 'Automation Complete',
                    body: `${message.action} executed successfully`,
                    type: 'automation',
                    priority: 'normal'
                });

                if (state.settings.hapticFeedback) {
                    navigator.vibrate?.(200);
                }
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    };

    const syncOfflineActions = async () => {
        if (!state.isConnected || !socketRef.current) return;

        const unsyncedActions = state.offlineQueue.filter(action => !action.synced);

        for (const action of unsyncedActions) {
            try {
                socketRef.current.send(JSON.stringify({
                    type: action.type,
                    ...action.data,
                    timestamp: action.timestamp.getTime(),
                    offline: true
                }));

                // Mark as synced
                setState(prev => ({
                    ...prev,
                    offlineQueue: prev.offlineQueue.map(a =>
                        a.id === action.id ? { ...a, synced: true } : a
                    )
                }));

            } catch (error) {
                console.error('Failed to sync action:', error);
                break;
            }
        }

        // Remove synced actions older than 24 hours
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        setState(prev => ({
            ...prev,
            offlineQueue: prev.offlineQueue.filter(action =>
                !action.synced || action.timestamp > cutoff
            )
        }));
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

    const showWebNotification = (notification: Omit<WebNotification, 'id' | 'timestamp'>) => {
        const newNotification: WebNotification = {
            ...notification,
            id: `notification-${Date.now()}`,
            timestamp: new Date()
        };

        setState(prev => ({
            ...prev,
            notifications: [newNotification, ...prev.notifications].slice(0, 20)
        }));

        // Show browser notification if permitted
        if (state.permissions.notifications) {
            new Notification(notification.title, {
                body: notification.body,
                icon: '/icon-192x192.png',
                tag: newNotification.id
            });
        }
    };

    const loadSettings = async () => {
        try {
            const settingsJson = localStorage.getItem('metu-web-mobile-settings');
            if (settingsJson) {
                const savedSettings = JSON.parse(settingsJson);
                setState(prev => ({
                    ...prev,
                    settings: { ...prev.settings, ...savedSettings }
                }));
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const saveSettings = async (newSettings: Partial<WebMobileSettings>) => {
        try {
            const updatedSettings = { ...state.settings, ...newSettings };
            localStorage.setItem('metu-web-mobile-settings', JSON.stringify(updatedSettings));
            setState(prev => ({ ...prev, settings: updatedSettings }));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const cleanup = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        if (socketRef.current) {
            socketRef.current.close();
        }

        if (gestureTimeoutRef.current) {
            clearTimeout(gestureTimeoutRef.current);
        }
    };

    // Render mobile web interface
    return (
        <div className={`min-h-screen transition-all duration-300 ${state.settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
            }`}>
            <div className="max-w-md mx-auto">
                {/* Header */}
                <header className={`p-4 shadow-sm ${state.settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">METU Mobile</h1>
                            <p className="text-sm opacity-75">
                                {state.currentServer
                                    ? `Connected to ${state.currentServer.name}`
                                    : 'Not connected'
                                }
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${state.isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`} />

                            {state.isPWAInstalled && (
                                <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                                    PWA
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Error Display */}
                {state.error && (
                    <div className="m-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-red-800 text-sm">{state.error}</p>
                    </div>
                )}

                <div className="p-4 space-y-6">
                    {/* Voice Control */}
                    <section className={`p-4 rounded-lg shadow-sm ${state.settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}>
                        <h2 className="text-lg font-semibold mb-4">Voice Control</h2>

                        <div className="text-center">
                            <button
                                onClick={state.isListening ? stopListening : startListening}
                                disabled={!state.isConnected}
                                className={`w-32 h-32 rounded-full text-xl font-semibold transition-all transform active:scale-95 ${state.isListening
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 disabled:text-gray-500'
                                    }`}
                            >
                                {state.isListening ? '🛑 Stop' : '🎤 Listen'}
                            </button>

                            {state.settings.gestureControls && (
                                <p className="text-xs mt-2 opacity-75">
                                    Long press to toggle • Swipe for actions
                                </p>
                            )}
                        </div>

                        {state.isListening && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-center">
                                    <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-green-800 text-sm">Listening for voice input...</span>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Quick Actions */}
                    <section className={`p-4 rounded-lg shadow-sm ${state.settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}>
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => executeAutomation('take_screenshot')}
                                disabled={!state.isConnected}
                                className="p-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-center transition-colors active:scale-95"
                            >
                                <div className="text-2xl mb-1">📷</div>
                                <div className="text-sm font-medium">Screenshot</div>
                            </button>

                            <button
                                onClick={() => executeAutomation('list_windows')}
                                disabled={!state.isConnected}
                                className="p-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-center transition-colors active:scale-95"
                            >
                                <div className="text-2xl mb-1">🪟</div>
                                <div className="text-sm font-medium">Windows</div>
                            </button>

                            <button
                                onClick={() => executeAutomation('minimize_all')}
                                disabled={!state.isConnected}
                                className="p-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg text-center transition-colors active:scale-95"
                            >
                                <div className="text-2xl mb-1">📱</div>
                                <div className="text-sm font-medium">Minimize</div>
                            </button>

                            <button
                                onClick={() => executeAutomation('lock_screen')}
                                disabled={!state.isConnected}
                                className="p-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg text-center transition-colors active:scale-95"
                            >
                                <div className="text-2xl mb-1">🔒</div>
                                <div className="text-sm font-medium">Lock</div>
                            </button>
                        </div>
                    </section>

                    {/* Status Info */}
                    <section className={`p-4 rounded-lg shadow-sm ${state.settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}>
                        <h2 className="text-lg font-semibold mb-4">Status</h2>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm opacity-75">Network</span>
                                <span className="text-sm font-medium">
                                    {state.networkInfo.effectiveType} {state.networkInfo.isOnline ? '✅' : '❌'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm opacity-75">Offline Queue</span>
                                <span className="text-sm font-medium">
                                    {state.offlineQueue.filter(a => !a.synced).length} pending
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm opacity-75">Notifications</span>
                                <span className="text-sm font-medium">
                                    {state.permissions.notifications ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Recent Conversation */}
                    <section className={`p-4 rounded-lg shadow-sm ${state.settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}>
                        <h2 className="text-lg font-semibold mb-4">Conversation</h2>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {state.conversation.length === 0 ? (
                                <p className="text-center opacity-75 text-sm">No conversation yet...</p>
                            ) : (
                                state.conversation.slice(-5).map(message => (
                                    <div
                                        key={message.id}
                                        className={`p-3 rounded-lg ${message.type === 'user'
                                                ? 'bg-blue-500 text-white ml-8'
                                                : message.type === 'assistant'
                                                    ? 'bg-gray-200 text-gray-900 mr-8'
                                                    : 'bg-yellow-100 text-yellow-800 mx-4'
                                            }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs opacity-75">
                                                {message.timestamp.toLocaleTimeString()}
                                            </span>
                                            {message.confidence && (
                                                <span className="text-xs opacity-75">
                                                    {Math.round(message.confidence * 100)}%
                                                </span>
                                            )}
                                            {message.offline && (
                                                <span className="text-xs">📡</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Bottom Navigation */}
                <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 shadow-lg ${state.settings.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border-t`}>
                    <div className="flex justify-around">
                        <button className="p-2 text-center">
                            <div className="text-2xl">🏠</div>
                        </button>
                        <button className="p-2 text-center">
                            <div className="text-2xl">🤖</div>
                        </button>
                        <button className="p-2 text-center">
                            <div className="text-2xl">📱</div>
                        </button>
                        <button className="p-2 text-center">
                            <div className="text-2xl">⚙️</div>
                        </button>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default MetuWebMobileClient;
