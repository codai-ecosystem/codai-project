import React from 'react'
/**
 * Settings Header Component - Navigation and Quick Actions
 */
'use client'

import { motion } from 'framer-motion'
import {
    Settings, Save, RefreshCw, Download, Upload, Database,
    CheckCircle2, AlertTriangle, Clock, Shield, Zap, ArrowLeft
} from 'lucide-react'

interface SettingsHeaderProps {
    activeSection: string
    hasUnsavedChanges: boolean
    lastSaved: string
    onSave: () => void
    onReset: () => void
    onExport: () => void
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
    onCreateBackup: () => void
    isLoading: boolean
    backupStatus: 'none' | 'creating' | 'complete' | 'error'
}

export function SettingsHeader({
    activeSection,
    hasUnsavedChanges,
    lastSaved,
    onSave,
    onReset,
    onExport,
    onImport,
    onCreateBackup,
    isLoading,
    backupStatus
}: SettingsHeaderProps) {
    const sectionTitles = {
        general: 'General Settings',
        security: 'Security & Privacy',
        notifications: 'Notifications',
        theme: 'Appearance & Theme',
        data: 'Data Management',
        integrations: 'Integrations',
        advanced: 'Advanced Configuration'
    }

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Dashboard
                        </button>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">Settings</span>
                        <span>/</span>
                        <span className="text-blue-600 dark:text-blue-400">
                            {sectionTitles[activeSection as keyof typeof sectionTitles]}
                        </span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        {/* Header Info */}
                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                                <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Settings
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Configure your ControlAI Dashboard preferences and system settings
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onExport}
                                className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title="Export Settings"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Export</span>
                            </button>

                            <label className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                                title="Import Settings">
                                <Upload className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Import</span>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={onImport}
                                    className="hidden"
                                />
                            </label>

                            <button
                                onClick={onCreateBackup}
                                disabled={backupStatus === 'creating'}
                                className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors disabled:opacity-50"
                                title="Create Backup"
                            >
                                {backupStatus === 'creating' ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Database className="w-4 h-4 mr-2" />
                                )}
                                <span className="hidden sm:inline">
                                    {backupStatus === 'creating' ? 'Creating...' : 'Backup'}
                                </span>
                            </button>

                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

                            <button
                                onClick={onReset}
                                disabled={isLoading}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                                Reset
                            </button>

                            <button
                                onClick={onSave}
                                disabled={!hasUnsavedChanges || isLoading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-6">
                            {/* Save Status */}
                            <div className="flex items-center">
                                {hasUnsavedChanges ? (
                                    <>
                                        <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                                        <span className="text-sm text-amber-600 dark:text-amber-400">
                                            Unsaved changes
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                                        <span className="text-sm text-green-600 dark:text-green-400">
                                            All changes saved
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Last Saved */}
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Last saved: {new Date(lastSaved).toLocaleString()}</span>
                            </div>

                            {/* Security Status */}
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Shield className="w-4 h-4 mr-2" />
                                <span>Security: Active</span>
                            </div>
                        </div>

                        {/* Performance Indicator */}
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                System Online
                            </span>
                            <Zap className="w-4 h-4 text-yellow-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

