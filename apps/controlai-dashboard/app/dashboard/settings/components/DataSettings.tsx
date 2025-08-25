'use client'

import React from 'react'
/**
 * Data Settings Component - Data Management and Privacy Controls
 */

import { motion } from 'framer-motion'
import {
    Database, Shield, Download, Upload, Trash2,
    Clock, Archive, RotateCcw, AlertTriangle,
    CheckCircle, XCircle, FileText, HardDrive,
    Cloud, Lock, Eye, EyeOff
} from 'lucide-react'
import { useState } from 'react'

interface DataSettingsProps {
    settings: any
    onChange: (section: string, key: string, value: any) => void
}

export function DataSettings({ settings, onChange }: DataSettingsProps) {
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [exportFormat, setExportFormat] = useState('json')

    const retentionPeriods = [
        { value: '7', label: '7 Days', description: 'For testing and development' },
        { value: '30', label: '30 Days', description: 'Standard retention' },
        { value: '90', label: '90 Days', description: 'Extended retention' },
        { value: '365', label: '1 Year', description: 'Long-term storage' },
        { value: 'forever', label: 'Forever', description: 'Permanent retention' }
    ]

    const backupFrequencies = [
        { value: 'never', label: 'Never', description: 'No automatic backups' },
        { value: 'daily', label: 'Daily', description: 'Once per day' },
        { value: 'weekly', label: 'Weekly', description: 'Once per week' },
        { value: 'monthly', label: 'Monthly', description: 'Once per month' }
    ]

    const compressionLevels = [
        { value: 'none', label: 'No Compression', size: '100%' },
        { value: 'low', label: 'Low Compression', size: '~85%' },
        { value: 'medium', label: 'Medium Compression', size: '~70%' },
        { value: 'high', label: 'High Compression', size: '~50%' }
    ]

    const dataCategories = [
        {
            id: 'logs',
            label: 'Activity Logs',
            description: 'User actions, system events, and audit trails',
            size: '2.3 GB',
            count: '45,632 entries',
            lastUpdated: '2 minutes ago',
            icon: FileText,
            critical: false
        },
        {
            id: 'analytics',
            label: 'Analytics Data',
            description: 'Performance metrics, usage statistics, and insights',
            size: '1.8 GB',
            count: '128,945 records',
            lastUpdated: '5 minutes ago',
            icon: Database,
            critical: true
        },
        {
            id: 'cache',
            label: 'Cache Data',
            description: 'Temporary files and cached responses',
            size: '856 MB',
            count: '12,456 files',
            lastUpdated: '1 minute ago',
            icon: HardDrive,
            critical: false
        },
        {
            id: 'backups',
            label: 'Backup Files',
            description: 'Historical snapshots and recovery points',
            size: '4.2 GB',
            count: '24 backups',
            lastUpdated: '1 hour ago',
            icon: Archive,
            critical: true
        }
    ]

    const handleExportData = (category?: string) => {
        console.log(`Exporting data ${category ? `for ${category}` : 'all categories'} in ${exportFormat} format`)
    }

    const handleClearData = (category: string) => {
        console.log(`Clearing data for ${category}`)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Data Storage Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Database className="w-6 h-6 mr-3 text-blue-500" />
                    Data Storage Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">9.2 GB</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Used storage</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <Archive className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Backups</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Recovery points</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Retention</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">90d</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Default period</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">Security</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">AES-256</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Encryption</div>
                    </div>
                </div>

                <div className="space-y-4">
                    {dataCategories.map((category) => {
                        const Icon = category.icon
                        return (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                            >
                                <div className="flex items-center space-x-4">
                                    <Icon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {category.label}
                                            </h4>
                                            {category.critical && (
                                                <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                                                    Critical
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {category.description}
                                        </p>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            <span>{category.size}</span>
                                            <span>•</span>
                                            <span>{category.count}</span>
                                            <span>•</span>
                                            <span>Updated {category.lastUpdated}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleExportData(category.id)}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        title="Export data"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    {!category.critical && (
                                        <button
                                            onClick={() => handleClearData(category.id)}
                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Clear data"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Retention Policies */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-green-500" />
                    Data Retention Policies
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Default Retention Period
                        </label>
                        <div className="space-y-3">
                            {retentionPeriods.map((period) => (
                                <label key={period.value} className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="retentionPeriod"
                                        value={period.value}
                                        checked={settings.retentionPeriod === period.value || (period.value === '90' && !settings.retentionPeriod)}
                                        onChange={(e) => onChange('data', 'retentionPeriod', e.target.value)}
                                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                                    />
                                    <div className="ml-3">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {period.label}
                                        </span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {period.description}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-white">
                                    Auto-purge Old Data
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Automatically delete data older than retention period
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.autoPurge !== false}
                                    onChange={(e) => onChange('data', 'autoPurge', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backup Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Archive className="w-6 h-6 mr-3 text-purple-500" />
                    Backup Configuration
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Backup Frequency
                        </label>
                        <div className="space-y-3">
                            {backupFrequencies.map((frequency) => (
                                <label key={frequency.value} className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="backupFrequency"
                                        value={frequency.value}
                                        checked={settings.backupFrequency === frequency.value || (frequency.value === 'daily' && !settings.backupFrequency)}
                                        onChange={(e) => onChange('data', 'backupFrequency', e.target.value)}
                                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                                    />
                                    <div className="ml-3">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {frequency.label}
                                        </span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {frequency.description}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Compression Level
                        </label>
                        <select
                            value={settings.compressionLevel || 'medium'}
                            onChange={(e) => onChange('data', 'compressionLevel', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {compressionLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label} ({level.size})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-white">
                                    Cloud Backup
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Store backups in cloud storage
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.cloudBackup || false}
                                    onChange={(e) => onChange('data', 'cloudBackup', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-white">
                                    Encrypt Backups
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Encrypt backup files
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.encryptBackups !== false}
                                    onChange={(e) => onChange('data', 'encryptBackups', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Export & Import */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Download className="w-6 h-6 mr-3 text-orange-500" />
                    Data Export & Import
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Export Format
                        </label>
                        <select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="json">JSON Format</option>
                            <option value="csv">CSV Format</option>
                            <option value="xml">XML Format</option>
                            <option value="yaml">YAML Format</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleExportData()}
                            className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            <span>Export All Data</span>
                        </button>

                        <button className="flex items-center justify-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                            <Upload className="w-5 h-5" />
                            <span>Import Data</span>
                        </button>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-900 dark:text-white">
                                    Include Personal Data
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Include personally identifiable information in exports
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.includePersonalData || false}
                                    onChange={(e) => onChange('data', 'includePersonalData', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Data Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <Shield className="w-6 h-6 mr-3 text-red-500" />
                        Advanced Data Controls
                    </h3>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
                    </button>
                </div>

                {showAdvanced && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                                        Danger Zone
                                    </h4>
                                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                        These actions are irreversible and can result in permanent data loss.
                                    </p>

                                    <div className="space-y-3">
                                        <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                            <span>Clear All Cache Data</span>
                                        </button>

                                        <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                            <RotateCcw className="w-4 h-4" />
                                            <span>Reset All Settings</span>
                                        </button>

                                        <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors">
                                            <XCircle className="w-4 h-4" />
                                            <span>Delete All Data</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                                        Data Anonymization
                                    </label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Remove personal identifiers from data
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.dataAnonymization || false}
                                        onChange={(e) => onChange('data', 'dataAnonymization', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                                        Secure Delete
                                    </label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Overwrite deleted data multiple times
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.secureDelete !== false}
                                        onChange={(e) => onChange('data', 'secureDelete', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}


