/**
 * Settings Hook for METU
 * React hook for managing settings state
 */

import { useState, useEffect } from 'react';
import { SettingsService, SettingsData } from '../services/SettingsService';

export function useSettings() {
    const [settings, setSettings] = useState<SettingsData>(() =>
        SettingsService.getInstance().getSettings()
    );

    const updateSettings = (updates: Partial<SettingsData>) => {
        SettingsService.getInstance().updateSettings(updates);
        setSettings(SettingsService.getInstance().getSettings());
    };

    const resetSettings = () => {
        SettingsService.getInstance().resetSettings();
        setSettings(SettingsService.getInstance().getSettings());
    };

    useEffect(() => {
        // Listen for settings changes from other parts of the app
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'metu-settings') {
                setSettings(SettingsService.getInstance().getSettings());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return {
        settings,
        updateSettings,
        resetSettings,
    };
}
