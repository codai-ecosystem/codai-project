/**
 * CODAI Mobile Network Monitor Service
 * Simplified network monitoring for Next.js compatibility
 */

interface NetworkState {
    isConnected: boolean;
    connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
    isInternetReachable: boolean;
}

export class NetworkMonitor {
    private static instance: NetworkMonitor;
    private listeners: ((state: NetworkState) => void)[] = [];
    private currentState: NetworkState = {
        isConnected: true,
        connectionType: 'wifi',
        isInternetReachable: true,
    };

    static getInstance(): NetworkMonitor {
        if (!NetworkMonitor.instance) {
            NetworkMonitor.instance = new NetworkMonitor();
        }
        return NetworkMonitor.instance;
    }

    constructor() {
        this.initializeNetworkMonitoring();
    }

    private initializeNetworkMonitoring(): void {
        // Use browser APIs if available
        if (typeof window !== 'undefined') {
            // Monitor online/offline events
            window.addEventListener('online', () => {
                this.updateNetworkState({
                    isConnected: true,
                    connectionType: 'wifi',
                    isInternetReachable: true,
                });
            });

            window.addEventListener('offline', () => {
                this.updateNetworkState({
                    isConnected: false,
                    connectionType: 'none',
                    isInternetReachable: false,
                });
            });

            // Check navigator connection if available
            if ('connection' in navigator) {
                const connection = (navigator as any).connection;
                if (connection) {
                    connection.addEventListener('change', () => {
                        this.updateNetworkState({
                            isConnected: navigator.onLine,
                            connectionType: this.getConnectionType(connection.effectiveType),
                            isInternetReachable: navigator.onLine,
                        });
                    });
                }
            }
        }
    }

    private getConnectionType(effectiveType?: string): 'wifi' | 'cellular' | 'none' | 'unknown' {
        if (!effectiveType) return 'unknown';

        switch (effectiveType) {
            case '4g':
            case '3g':
            case '2g':
                return 'cellular';
            case 'wifi':
                return 'wifi';
            default:
                return 'unknown';
        }
    }

    private updateNetworkState(newState: NetworkState): void {
        this.currentState = newState;
        this.listeners.forEach(listener => listener(newState));
    }

    getCurrentState(): NetworkState {
        return { ...this.currentState };
    }

    addListener(listener: (state: NetworkState) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    async testConnectivity(): Promise<boolean> {
        try {
            // Simple connectivity test
            const response = await fetch('/api/test?endpoint=health', {
                method: 'HEAD',
                cache: 'no-cache',
            });
            return response.ok;
        } catch (error) {
            console.error('Connectivity test failed:', error);
            return false;
        }
    }

    getNetworkQuality(): 'excellent' | 'good' | 'poor' | 'unknown' {
        const { connectionType, isConnected, isInternetReachable } = this.currentState;

        if (!isConnected || !isInternetReachable) {
            return 'poor';
        }

        switch (connectionType) {
            case 'wifi':
                return 'excellent';
            case 'cellular':
                return 'good';
            default:
                return 'unknown';
        }
    }

    // Analytics methods
    getNetworkMetrics() {
        return {
            isOnline: this.currentState.isConnected,
            connectionType: this.currentState.connectionType,
            quality: this.getNetworkQuality(),
            timestamp: Date.now(),
        };
    }
}

export default NetworkMonitor.getInstance();
