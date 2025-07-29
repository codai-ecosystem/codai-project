/**
 * METU Client Router - Universal Client Selection
 * 
 * Intelligent client router that automatically detects the platform
 * and loads the appropriate METU client implementation:
 * - Desktop/Electron: MetuDesktopClient
 * - Mobile Web: MetuWebMobileClient  
 * - Web Browser: MetuWebClient
 * - Cross-platform detection and capability adaptation
 */

import React, { useState, useEffect } from 'react';
import MetuDesktopClient from './MetuDesktopClient';
import MetuWebMobileClient from './MetuWebMobileClient';

// Platform detection interfaces
interface PlatformInfo {
    type: 'desktop' | 'mobile' | 'web';
    isElectron: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isPWA: boolean;
    touchSupport: boolean;
    screenSize: 'small' | 'medium' | 'large';
    capabilities: PlatformCapabilities;
}

interface PlatformCapabilities {
    audio: boolean;
    camera: boolean;
    notifications: boolean;
    geolocation: boolean;
    deviceOrientation: boolean;
    vibration: boolean;
    bluetooth: boolean;
    nfc: boolean;
    serviceWorker: boolean;
    webGL: boolean;
    webRTC: boolean;
}

interface ClientRouterState {
    platform: PlatformInfo | null;
    selectedClient: 'desktop' | 'mobile' | 'web' | null;
    isLoading: boolean;
    error: string | null;
    userPreference: string | null;
}

/**
 * Enhanced METU Client Router Component
 */
export const MetuClientRouter: React.FC = () => {
    const [state, setState] = useState<ClientRouterState>({
        platform: null,
        selectedClient: null,
        isLoading: true,
        error: null,
        userPreference: null
    });

    useEffect(() => {
        detectPlatformAndSelectClient();
        loadUserPreferences();
    }, []);

    const detectPlatformAndSelectClient = async () => {
        try {
            const platform = await detectPlatform();
            const selectedClient = selectOptimalClient(platform);

            setState(prev => ({
                ...prev,
                platform,
                selectedClient,
                isLoading: false
            }));

        } catch (error) {
            console.error('Failed to detect platform:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Platform detection failed',
                isLoading: false,
                selectedClient: 'web' // Fallback to web client
            }));
        }
    };

    const detectPlatform = async (): Promise<PlatformInfo> => {
        // Check if running in Electron
        const isElectron = !!(window as any).require ||
            !!(window as any).process?.versions?.electron ||
            navigator.userAgent.includes('Electron');

        // Detect mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            !!(navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

        // Detect tablets specifically
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent) ||
            !!(navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && window.innerWidth > 768);

        // Check if running as PWA
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');

        // Detect touch support
        const touchSupport = 'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch;

        // Determine screen size
        const screenWidth = window.innerWidth;
        const screenSize: 'small' | 'medium' | 'large' =
            screenWidth < 768 ? 'small' :
                screenWidth < 1024 ? 'medium' : 'large';

        // Detect platform capabilities
        const capabilities = await detectCapabilities();

        // Determine platform type
        let type: 'desktop' | 'mobile' | 'web';
        if (isElectron) {
            type = 'desktop';
        } else if (isMobile && !isTablet) {
            type = 'mobile';
        } else {
            type = 'web';
        }

        return {
            type,
            isElectron,
            isMobile,
            isTablet,
            isPWA,
            touchSupport,
            screenSize,
            capabilities
        };
    };

    const detectCapabilities = async (): Promise<PlatformCapabilities> => {
        const capabilities: PlatformCapabilities = {
            audio: false,
            camera: false,
            notifications: false,
            geolocation: false,
            deviceOrientation: false,
            vibration: false,
            bluetooth: false,
            nfc: false,
            serviceWorker: false,
            webGL: false,
            webRTC: false
        };

        try {
            // Audio capability
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop());
                    capabilities.audio = true;
                } catch { }
            }

            // Camera capability
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    stream.getTracks().forEach(track => track.stop());
                    capabilities.camera = true;
                } catch { }
            }

            // Notification capability
            capabilities.notifications = 'Notification' in window && Notification.permission !== 'denied';

            // Geolocation capability
            capabilities.geolocation = 'geolocation' in navigator;

            // Device orientation capability
            capabilities.deviceOrientation = 'DeviceOrientationEvent' in window;

            // Vibration capability
            capabilities.vibration = 'vibrate' in navigator;

            // Bluetooth capability
            capabilities.bluetooth = 'bluetooth' in navigator;

            // NFC capability
            capabilities.nfc = 'nfc' in navigator;

            // Service Worker capability
            capabilities.serviceWorker = 'serviceWorker' in navigator;

            // WebGL capability
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            capabilities.webGL = !!gl;

            // WebRTC capability
            capabilities.webRTC = !!(window as any).RTCPeerConnection ||
                !!(window as any).webkitRTCPeerConnection ||
                !!(window as any).mozRTCPeerConnection;

        } catch (error) {
            console.error('Error detecting capabilities:', error);
        }

        return capabilities;
    };

    const selectOptimalClient = (platform: PlatformInfo): 'desktop' | 'mobile' | 'web' => {
        // Priority-based client selection

        // 1. Electron always gets desktop client
        if (platform.isElectron) {
            return 'desktop';
        }

        // 2. Mobile devices get mobile client
        if (platform.isMobile && !platform.isTablet) {
            return 'mobile';
        }

        // 3. Small screens get mobile client even on desktop
        if (platform.screenSize === 'small' && platform.touchSupport) {
            return 'mobile';
        }

        // 4. PWA on mobile gets mobile client
        if (platform.isPWA && (platform.isMobile || platform.touchSupport)) {
            return 'mobile';
        }

        // 5. Tablets and larger screens get web client
        if (platform.isTablet || platform.screenSize === 'medium' || platform.screenSize === 'large') {
            return 'web';
        }

        // 6. Default fallback to web client
        return 'web';
    };

    const loadUserPreferences = () => {
        try {
            const preference = localStorage.getItem('metu-client-preference');
            if (preference && ['desktop', 'mobile', 'web'].includes(preference)) {
                setState(prev => ({ ...prev, userPreference: preference }));
            }
        } catch (error) {
            console.error('Failed to load user preferences:', error);
        }
    };

    const handleClientSwitch = (clientType: 'desktop' | 'mobile' | 'web') => {
        setState(prev => ({ ...prev, selectedClient: clientType }));

        // Save user preference
        try {
            localStorage.setItem('metu-client-preference', clientType);
            setState(prev => ({ ...prev, userPreference: clientType }));
        } catch (error) {
            console.error('Failed to save user preference:', error);
        }
    };

    const renderClientSelector = () => {
        if (!state.platform) return null;

        return (
            <div className="fixed top-4 right-4 z-50">
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Client Mode</h3>

                    <div className="space-y-2">
                        {/* Desktop Client Option */}
                        {state.platform.isElectron && (
                            <button
                                onClick={() => handleClientSwitch('desktop')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${state.selectedClient === 'desktop'
                                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <span className="text-lg mr-2">🖥️</span>
                                    <div>
                                        <div className="font-medium">Desktop</div>
                                        <div className="text-xs opacity-75">System integration & hotkeys</div>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Mobile Client Option */}
                        <button
                            onClick={() => handleClientSwitch('mobile')}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${state.selectedClient === 'mobile'
                                    ? 'bg-green-100 text-green-900 border border-green-300'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <div className="flex items-center">
                                <span className="text-lg mr-2">📱</span>
                                <div>
                                    <div className="font-medium">Mobile</div>
                                    <div className="text-xs opacity-75">Touch controls & gestures</div>
                                </div>
                            </div>
                        </button>

                        {/* Web Client Option */}
                        <button
                            onClick={() => handleClientSwitch('web')}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${state.selectedClient === 'web'
                                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <div className="flex items-center">
                                <span className="text-lg mr-2">🌐</span>
                                <div>
                                    <div className="font-medium">Web</div>
                                    <div className="text-xs opacity-75">Cross-platform compatibility</div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Platform Info */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600 space-y-1">
                            <div>Platform: {state.platform.type}</div>
                            <div>Screen: {state.platform.screenSize}</div>
                            <div>Touch: {state.platform.touchSupport ? 'Yes' : 'No'}</div>
                            {state.platform.isPWA && <div>PWA: Installed</div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderLoadingScreen = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Initializing METU</h2>
                <p className="text-gray-600">Detecting your platform and capabilities...</p>
            </div>
        </div>
    );

    const renderErrorScreen = () => (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Platform Detection Failed</h2>
                <p className="text-gray-600 mb-6">{state.error}</p>
                <button
                    onClick={detectPlatformAndSelectClient}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Retry Detection
                </button>
            </div>
        </div>
    );

    const renderSelectedClient = () => {
        const effectiveClient = state.userPreference || state.selectedClient;

        switch (effectiveClient) {
            case 'desktop':
                return <MetuDesktopClient />;

            case 'mobile':
                return <MetuWebMobileClient />;

            case 'web':
            default:
                // For now, fall back to mobile client for web
                // In a real implementation, you'd have a dedicated web client
                return <MetuWebMobileClient />;
        }
    };

    const renderCapabilityBadges = () => {
        if (!state.platform?.capabilities) return null;

        const capabilities = state.platform.capabilities;
        const availableCapabilities = Object.entries(capabilities)
            .filter(([, supported]) => supported)
            .map(([name]) => name);

        if (availableCapabilities.length === 0) return null;

        return (
            <div className="fixed bottom-4 left-4 z-40">
                <div className="bg-black bg-opacity-80 text-white rounded-lg p-3 max-w-xs">
                    <div className="text-xs font-semibold mb-2">Available Features</div>
                    <div className="flex flex-wrap gap-1">
                        {availableCapabilities.map(capability => (
                            <span
                                key={capability}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                            >
                                {capability}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Render appropriate screen based on state
    if (state.isLoading) {
        return renderLoadingScreen();
    }

    if (state.error && !state.selectedClient) {
        return renderErrorScreen();
    }

    return (
        <div className="relative">
            {renderSelectedClient()}
            {renderClientSelector()}
            {renderCapabilityBadges()}

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && state.platform && (
                <div className="fixed bottom-4 right-4 z-40">
                    <details className="bg-gray-900 text-white text-xs p-3 rounded-lg max-w-xs">
                        <summary className="cursor-pointer font-semibold">Debug Info</summary>
                        <pre className="mt-2 overflow-auto max-h-40">
                            {JSON.stringify(state.platform, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
};

export default MetuClientRouter;
