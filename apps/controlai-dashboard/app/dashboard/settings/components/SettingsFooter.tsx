import React from 'react'
/**
 * Settings Footer Component - Action Buttons and Navigation
 */
'use client'

import { motion } from 'framer-motion'
import {
    Save, RotateCcw, Download, Upload, ArrowLeft,
    CheckCircle, AlertTriangle, Clock, Shield,
    HelpCircle, ExternalLink, Zap
} from 'lucide-react'

interface SettingsFooterProps {
    hasChanges: boolean
    isSaving: boolean
    lastSaved?: Date
    onSave: () => void
    onReset: () => void
    onExport: () => void
    onImport: () => void
    onBack?: () => void
}

export function SettingsFooter({
    hasChanges,
    isSaving,
    lastSaved,
    onSave,
    onReset,
    onExport,
    onImport,
    onBack
}: SettingsFooterProps) {
    const formatLastSaved = (date: Date) => {
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) {
            return 'Just saved'
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60)
            return `Saved ${minutes} minute${minutes > 1 ? 's' : ''} ago`
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600)
            return `Saved ${hours} hour${hours > 1 ? 's' : ''} ago`
        } else {
            return `Saved on ${date.toLocaleDateString()}`
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4"
        >
            <div className="max-w-7xl mx-auto">
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {hasChanges ? (
                            <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">You have unsaved changes</span>
                            </div>
                        ) : isSaving ? (
                            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Zap className="w-4 h-4" />
                                </motion.div>
                                <span className="text-sm font-medium">Saving changes...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">All changes saved</span>
                            </div>
                        )}

                        {lastSaved && !hasChanges && (
                            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
                                <Clock className="w-3 h-3" />
                                <span>{formatLastSaved(lastSaved)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Settings are encrypted and secure
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    {/* Primary Actions */}
                    <div className="flex items-center space-x-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                        )}

                        <button
                            onClick={onReset}
                            disabled={!hasChanges || isSaving}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reset</span>
                        </button>

                        <button
                            onClick={onSave}
                            disabled={!hasChanges || isSaving}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onExport}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                        </button>

                        <button
                            onClick={onImport}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Import</span>
                        </button>

                        <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <HelpCircle className="w-4 h-4" />
                            <span>Help</span>
                        </button>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                            <span>Settings are automatically backed up</span>
                            <span>•</span>
                            <span>Changes sync across all devices</span>
                            <span>•</span>
                            <span>Version 2.1.0</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                <span>Privacy Policy</span>
                                <ExternalLink className="w-3 h-3" />
                            </button>
                            <button className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                <span>Support</span>
                                <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

