/**
 * Settings Service for METU
 * Manages user preferences and configuration
 */

export interface SettingsData {
    language: string;
    confidenceThreshold: number;
    autoStartListening: boolean;
    enableNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    voiceSpeed: number;
    enableKeywordWakeup: boolean;
    wakeupKeyword: string;
    selectedInputDevice: string;
    selectedOutputDevice: string;
    audioGain: number;
    noiseCancellation: boolean;
    echoCancellation: boolean;
}

const DEFAULT_SETTINGS: SettingsData = {
    language: 'en-US',
    confidenceThreshold: 0.7,
    autoStartListening: true,
    enableNotifications: true,
    theme: 'dark',
    voiceSpeed: 1.0,
    enableKeywordWakeup: false,
    wakeupKeyword: 'Hey METU',
    selectedInputDevice: 'default',
    selectedOutputDevice: 'default',
    audioGain: 1.0,
    noiseCancellation: true,
    echoCancellation: true,
};

export class SettingsService {
    private static instance: SettingsService;
    private settings: SettingsData;

    private constructor() {
        this.settings = this.loadSettings();
    }

    static getInstance(): SettingsService {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
        }
        return SettingsService.instance;
    }

    getSettings(): SettingsData {
        return { ...this.settings };
    }

    updateSettings(updates: Partial<SettingsData>): void {
        this.settings = { ...this.settings, ...updates };
        this.saveSettings();
    }

    resetSettings(): void {
        this.settings = { ...DEFAULT_SETTINGS };
        this.saveSettings();
    }

    private loadSettings(): SettingsData {
        try {
            // Check if we're in browser environment
            if (typeof window !== 'undefined' && window.localStorage) {
                const saved = localStorage.getItem('metu-settings');
                if (saved) {
                    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
                }
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
        return { ...DEFAULT_SETTINGS };
    }

    private saveSettings(): void {
        try {
            // Check if we're in browser environment
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('metu-settings', JSON.stringify(this.settings));
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
}
