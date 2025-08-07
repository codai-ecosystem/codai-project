'use client';

import React from 'react'
/**
 * Settings Page - System Configuration and Preferences
 * AGI system settings and configuration management
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SystemSettings {
    server_config: {
        max_concurrent_requests: number;
        request_timeout_seconds: number;
        enable_caching: boolean;
        cache_ttl_seconds: number;
        log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
        enable_metrics: boolean;
    };
    model_config: {
        temperature: number;
        max_tokens: number;
        top_p: number;
        frequency_penalty: number;
        presence_penalty: number;
        enable_streaming: boolean;
    };
    romanian_config: {
        preferred_dialect: 'standard' | 'moldovan' | 'banat' | 'transylvanian';
        formality_level: 'formal' | 'informal' | 'mixed';
        cultural_context_weight: number;
        enable_cultural_adaptation: boolean;
    };
    training_config: {
        auto_training: boolean;
        training_schedule: string;
        backup_frequency_hours: number;
        enable_monitoring: boolean;
        max_training_epochs: number;
        early_stopping_patience: number;
    };
    security_config: {
        enable_rate_limiting: boolean;
        max_requests_per_minute: number;
        enable_authentication: boolean;
        session_timeout_minutes: number;
        enable_audit_logging: boolean;
    };
}

const SettingsPage = () => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'server' | 'model' | 'romanian' | 'training' | 'security'>('server');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('http://localhost:6101/settings');

                if (!response.ok) {
                    // Fallback to default settings if endpoint doesn't exist
                    setSettings({
                        server_config: {
                            max_concurrent_requests: 100,
                            request_timeout_seconds: 30,
                            enable_caching: true,
                            cache_ttl_seconds: 3600,
                            log_level: 'INFO',
                            enable_metrics: true
                        },
                        model_config: {
                            temperature: 0.7,
                            max_tokens: 2048,
                            top_p: 0.9,
                            frequency_penalty: 0.0,
                            presence_penalty: 0.0,
                            enable_streaming: true
                        },
                        romanian_config: {
                            preferred_dialect: 'standard',
                            formality_level: 'mixed',
                            cultural_context_weight: 0.8,
                            enable_cultural_adaptation: true
                        },
                        training_config: {
                            auto_training: false,
                            training_schedule: '0 2 * * *', // Daily at 2 AM
                            backup_frequency_hours: 24,
                            enable_monitoring: true,
                            max_training_epochs: 1000,
                            early_stopping_patience: 10
                        },
                        security_config: {
                            enable_rate_limiting: true,
                            max_requests_per_minute: 60,
                            enable_authentication: false,
                            session_timeout_minutes: 30,
                            enable_audit_logging: true
                        }
                    });
                } else {
                    const settingsData = await response.json();
                    setSettings(settingsData);
                }

                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const saveSettings = async () => {
        if (!settings) return;

        setSaving(true);
        try {
            const response = await fetch('http://localhost:6101/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            setSuccess('Settings saved successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateSettings = (section: keyof SystemSettings, key: string, value: any) => {
        if (!settings) return;

        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [key]: value
            }
        });
    };

    const tabs = [
        { id: 'server', label: 'Server', icon: '🖥️' },
        { id: 'model', label: 'Model', icon: '🧠' },
        { id: 'romanian', label: 'Romanian', icon: '🇷🇴' },
        { id: 'training', label: 'Training', icon: '🎯' },
        { id: 'security', label: 'Security', icon: '🔒' }
    ] as const;

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Loading Settings...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-3">
                        <span>⚙️</span>
                        <span>System Configuration</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Configure AGI system settings and preferences
                    </p>
                </div>

                <button
                    onClick={saveSettings}
                    disabled={saving || !settings}
                    className={`
            px-6 py-3 rounded-lg font-medium transition-all
            ${saving || !settings
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                        }
          `}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-400">{success}</p>
                </div>
            )}

            {settings && (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-slate-700">
                        <nav className="flex space-x-8 px-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }
                  `}
                                >
                                    <span className="flex items-center space-x-2">
                                        <span>{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Server Configuration */}
                        {activeTab === 'server' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Server Configuration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Concurrent Requests
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.server_config.max_concurrent_requests}
                                            onChange={(e) => updateSettings('server_config', 'max_concurrent_requests', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Request Timeout (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.server_config.request_timeout_seconds}
                                            onChange={(e) => updateSettings('server_config', 'request_timeout_seconds', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Log Level
                                        </label>
                                        <select
                                            value={settings.server_config.log_level}
                                            onChange={(e) => updateSettings('server_config', 'log_level', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="DEBUG">DEBUG</option>
                                            <option value="INFO">INFO</option>
                                            <option value="WARNING">WARNING</option>
                                            <option value="ERROR">ERROR</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Cache TTL (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.server_config.cache_ttl_seconds}
                                            onChange={(e) => updateSettings('server_config', 'cache_ttl_seconds', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.server_config.enable_caching}
                                            onChange={(e) => updateSettings('server_config', 'enable_caching', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Caching</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.server_config.enable_metrics}
                                            onChange={(e) => updateSettings('server_config', 'enable_metrics', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Metrics Collection</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* Model Configuration */}
                        {activeTab === 'model' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Model Configuration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Temperature
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={settings.model_config.temperature}
                                            onChange={(e) => updateSettings('model_config', 'temperature', parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {settings.model_config.temperature}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Tokens
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.model_config.max_tokens}
                                            onChange={(e) => updateSettings('model_config', 'max_tokens', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Top P
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={settings.model_config.top_p}
                                            onChange={(e) => updateSettings('model_config', 'top_p', parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {settings.model_config.top_p}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={settings.model_config.enable_streaming}
                                                onChange={(e) => updateSettings('model_config', 'enable_streaming', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Enable Streaming Responses</span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Romanian Configuration */}
                        {activeTab === 'romanian' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Romanian Language Configuration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Preferred Dialect
                                        </label>
                                        <select
                                            value={settings.romanian_config.preferred_dialect}
                                            onChange={(e) => updateSettings('romanian_config', 'preferred_dialect', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="standard">Standard Romanian</option>
                                            <option value="moldovan">Moldovan</option>
                                            <option value="banat">Banat</option>
                                            <option value="transylvanian">Transylvanian</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Formality Level
                                        </label>
                                        <select
                                            value={settings.romanian_config.formality_level}
                                            onChange={(e) => updateSettings('romanian_config', 'formality_level', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="formal">Formal</option>
                                            <option value="informal">Informal</option>
                                            <option value="mixed">Mixed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Cultural Context Weight
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={settings.romanian_config.cultural_context_weight}
                                            onChange={(e) => updateSettings('romanian_config', 'cultural_context_weight', parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {settings.romanian_config.cultural_context_weight}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={settings.romanian_config.enable_cultural_adaptation}
                                                onChange={(e) => updateSettings('romanian_config', 'enable_cultural_adaptation', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Enable Cultural Adaptation</span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Training Configuration */}
                        {activeTab === 'training' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Training Configuration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Training Schedule (Cron)
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.training_config.training_schedule}
                                            onChange={(e) => updateSettings('training_config', 'training_schedule', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                            placeholder="0 2 * * *"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Training Epochs
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.training_config.max_training_epochs}
                                            onChange={(e) => updateSettings('training_config', 'max_training_epochs', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Backup Frequency (hours)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.training_config.backup_frequency_hours}
                                            onChange={(e) => updateSettings('training_config', 'backup_frequency_hours', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Early Stopping Patience
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.training_config.early_stopping_patience}
                                            onChange={(e) => updateSettings('training_config', 'early_stopping_patience', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.training_config.auto_training}
                                            onChange={(e) => updateSettings('training_config', 'auto_training', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Auto Training</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.training_config.enable_monitoring}
                                            onChange={(e) => updateSettings('training_config', 'enable_monitoring', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Training Monitoring</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* Security Configuration */}
                        {activeTab === 'security' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    Security Configuration
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Requests per Minute
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.security_config.max_requests_per_minute}
                                            onChange={(e) => updateSettings('security_config', 'max_requests_per_minute', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Session Timeout (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.security_config.session_timeout_minutes}
                                            onChange={(e) => updateSettings('security_config', 'session_timeout_minutes', parseInt(e.target.value))}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.security_config.enable_rate_limiting}
                                            onChange={(e) => updateSettings('security_config', 'enable_rate_limiting', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Rate Limiting</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.security_config.enable_authentication}
                                            onChange={(e) => updateSettings('security_config', 'enable_authentication', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Authentication</span>
                                    </label>

                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={settings.security_config.enable_audit_logging}
                                            onChange={(e) => updateSettings('security_config', 'enable_audit_logging', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Enable Audit Logging</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;

