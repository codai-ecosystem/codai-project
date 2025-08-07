import React from 'react'
/**
 * Advanced Settings Component - Developer Options and Experimental Features
 */
'use client'

import { motion } from 'framer-motion'
import {
    Code, Zap, Beaker, Bug, Terminal, Database,
    Cpu, Gauge, FileCode, Globe, Shield, AlertTriangle,
    Settings, Monitor, Layers, Wrench, Sparkles,
    Eye, EyeOff, Download, Upload, RotateCcw
} from 'lucide-react'
import { useState } from 'react'

interface AdvancedSettingsProps {
    settings: any
    onChange: (section: string, key: string, value: any) => void
}

export function AdvancedSettings({ settings, onChange }: AdvancedSettingsProps) {
    const [showDangerZone, setShowDangerZone] = useState(false)
    const [customCss, setCustomCss] = useState(settings.customCss || '')

    const performanceSettings = [
        {
            key: 'enableCaching',
            label: 'Enable Caching',
            description: 'Cache API responses and computed data',
            icon: Database,
            default: true
        },
        {
            key: 'lazyLoading',
            label: 'Lazy Loading',
            description: 'Load components and data on demand',
            icon: Layers,
            default: true
        },
        {
            key: 'compressionEnabled',
            label: 'Data Compression',
            description: 'Compress data transfers to reduce bandwidth',
            icon: Gauge,
            default: true
        },
        {
            key: 'prefetchEnabled',
            label: 'Resource Prefetching',
            description: 'Preload critical resources for better performance',
            icon: Zap,
            default: false
        }
    ]

    const developerOptions = [
        {
            key: 'debugMode',
            label: 'Debug Mode',
            description: 'Enable detailed logging and debugging information',
            icon: Bug,
            default: false,
            warning: true
        },
        {
            key: 'devTools',
            label: 'Development Tools',
            description: 'Show developer tools and debugging panels',
            icon: Terminal,
            default: false,
            warning: true
        },
        {
            key: 'sourceMapEnabled',
            label: 'Source Maps',
            description: 'Generate source maps for debugging',
            icon: FileCode,
            default: false
        },
        {
            key: 'verboseLogging',
            label: 'Verbose Logging',
            description: 'Log detailed information about system operations',
            icon: Monitor,
            default: false
        }
    ]

    const experimentalFeatures = [
        {
            key: 'quantumProcessing',
            label: 'Quantum Processing',
            description: 'Enable quantum-inspired algorithms for complex computations',
            icon: Sparkles,
            default: false,
            experimental: true
        },
        {
            key: 'aiOptimization',
            label: 'AI-Powered Optimization',
            description: 'Use machine learning to optimize system performance',
            icon: Cpu,
            default: false,
            experimental: true
        },
        {
            key: 'webGpuAcceleration',
            label: 'WebGPU Acceleration',
            description: 'Use WebGPU for hardware-accelerated computations',
            icon: Zap,
            default: false,
            experimental: true
        },
        {
            key: 'predictivePreloading',
            label: 'Predictive Preloading',
            description: 'Predict and preload resources based on user behavior',
            icon: Gauge,
            default: false,
            experimental: true
        }
    ]

    const logLevels = [
        { value: 'error', label: 'Error Only' },
        { value: 'warn', label: 'Warnings and Errors' },
        { value: 'info', label: 'Info, Warnings, and Errors' },
        { value: 'debug', label: 'All Logs (Debug Mode)' },
        { value: 'trace', label: 'Trace Level (Maximum Detail)' }
    ]

    const renderSettingToggle = (setting: any, section: string) => {
        const Icon = setting.icon
        const isEnabled = settings[setting.key] ?? setting.default

        return (
            <div
                key={setting.key}
                className={`p-4 rounded-xl border transition-all duration-200 ${setting.warning
                        ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                        : setting.experimental
                            ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                    }`}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <Icon className={`w-6 h-6 mt-0.5 ${setting.warning
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : setting.experimental
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`} />
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    {setting.label}
                                </h4>
                                {setting.experimental && (
                                    <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                        Experimental
                                    </span>
                                )}
                                {setting.warning && (
                                    <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                                        Advanced
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {setting.description}
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => onChange(section, setting.key, e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${setting.warning
                                ? 'peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 peer-checked:bg-yellow-600'
                                : setting.experimental
                                    ? 'peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:bg-purple-600'
                                    : 'peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:bg-blue-600'
                            }`}></div>
                    </label>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Performance Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Gauge className="w-6 h-6 mr-3 text-blue-500" />
                    Performance Optimization
                </h3>

                <div className="space-y-4">
                    {performanceSettings.map((setting) => renderSettingToggle(setting, 'advanced'))}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cache Size Limit (MB)
                        </label>
                        <input
                            type="number"
                            value={settings.cacheSizeLimit || 100}
                            onChange={(e) => onChange('advanced', 'cacheSizeLimit', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="10"
                            max="1000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Request Timeout (seconds)
                        </label>
                        <input
                            type="number"
                            value={settings.requestTimeout || 30}
                            onChange={(e) => onChange('advanced', 'requestTimeout', parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="5"
                            max="300"
                        />
                    </div>
                </div>
            </div>

            {/* Developer Options */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Code className="w-6 h-6 mr-3 text-green-500" />
                    Developer Options
                </h3>

                <div className="space-y-4">
                    {developerOptions.map((setting) => renderSettingToggle(setting, 'advanced'))}
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Log Level
                    </label>
                    <select
                        value={settings.logLevel || 'info'}
                        onChange={(e) => onChange('advanced', 'logLevel', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        {logLevels.map(level => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Experimental Features */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Beaker className="w-6 h-6 mr-3 text-purple-500" />
                    Experimental Features
                </h3>

                <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                            <strong>Warning:</strong> Experimental features are under active development and may be unstable.
                            Use at your own risk in production environments.
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {experimentalFeatures.map((setting) => renderSettingToggle(setting, 'advanced'))}
                </div>
            </div>

            {/* Custom CSS */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <FileCode className="w-6 h-6 mr-3 text-orange-500" />
                    Custom CSS
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional CSS Rules
                        </label>
                        <textarea
                            value={customCss}
                            onChange={(e) => {
                                setCustomCss(e.target.value)
                                onChange('advanced', 'customCss', e.target.value)
                            }}
                            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                            placeholder="/* Enter your custom CSS here */
.custom-class {
  /* Your styles */
}"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                Enable Custom CSS
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Apply custom CSS rules to the interface
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.enableCustomCss || false}
                                onChange={(e) => onChange('advanced', 'enableCustomCss', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* System Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Monitor className="w-6 h-6 mr-3 text-gray-500" />
                    System Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Version:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">v2.1.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Build:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">#1234</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Environment:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Production</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Node.js:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">v18.17.0</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">142 MB</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Uptime:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">4d 12h 30m</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">API Calls:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">2,847</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Update:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">2 hours ago</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Export System Info</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        <RotateCcw className="w-4 h-4" />
                        <span>Refresh Info</span>
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 flex items-center">
                        <AlertTriangle className="w-6 h-6 mr-3 text-red-500" />
                        Danger Zone
                    </h3>
                    <button
                        onClick={() => setShowDangerZone(!showDangerZone)}
                        className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-100"
                    >
                        {showDangerZone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showDangerZone ? 'Hide' : 'Show'} Danger Zone</span>
                    </button>
                </div>

                {showDangerZone && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                <strong>Warning:</strong> These actions are irreversible and can cause data loss or system instability.
                            </p>

                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                    <RotateCcw className="w-4 h-4" />
                                    <span>Reset All Advanced Settings</span>
                                </button>

                                <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                    <Database className="w-4 h-4" />
                                    <span>Clear All Cache Data</span>
                                </button>

                                <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors">
                                    <Wrench className="w-4 h-4" />
                                    <span>Factory Reset System</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

